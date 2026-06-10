import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { HttpException, HttpStatus, Inject, Injectable, Logger } from "@nestjs/common";
import {
  fetchMarketTypesWithRetry,
  fetchSportsWithRetry,
} from "src/api/overtime";
import { Market, MarketType, Sport } from "src/types/overtime";
import { Network } from "src/types/web3";
import { CACHE_TOKEN_OVERTIME_V2_MARKETS } from "src/constants/config";
import type { Cache } from "cache-manager";
import axios, { AxiosResponse } from "axios";
import { get } from "http";
import { getMinMaturity } from "src/utils/general";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { SportsBet, BetStatus } from "./entities/sports-bet.entity";
import { User } from "src/auth/entities/user.entity";
import { PlaceBetDto } from "./dto/place-bet.dto";
import { GetBetsDto } from "./dto/get-bets.dto";
import { calculatePotentialPayout } from "src/utils/odds-calculator";
import { DepositGateway } from "../deposit/deposit.gateway";

@Injectable()
export class SportsService {
  private readonly logger = new Logger(SportsService.name);

  private readonly REMOTE_API_BASE = "https://api.overtime.io/overtime-v2";
  private cachedData: any = null;
  private cachedHash: string | null = null;

  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    @InjectRepository(SportsBet)
    private sportsBetRepository: Repository<SportsBet>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private depositGateway: DepositGateway,
  ) { }

  async fetchSportsMapper() {
    const overtimeV2SportsCache = `overtime-v2-sports`;
    const cachedData = await this.cacheManager.get<{
      [id: string]: Sport;
    }>(overtimeV2SportsCache);

    if (cachedData) {
      return cachedData;
    }

    const sports = await fetchSportsWithRetry();

    await this.cacheManager.set(overtimeV2SportsCache, sports, 86400 * 1000);

    return sports;
  }

  async fetchMarketTypesMapper() {
    const overtimeV2MarketTypesCache = `overtime-v2-marketTypes`;
    const cachedData = await this.cacheManager.get<{
      [id: string]: MarketType;
    }>(overtimeV2MarketTypesCache);

    if (cachedData) {
      return cachedData;
    }

    const marketTypes = await fetchMarketTypesWithRetry();

    await this.cacheManager.set(
      overtimeV2MarketTypesCache,
      marketTypes,
      86400 * 1000
    );

    return marketTypes;
  }

  async fetchMarketsMapper(network: number, query: Record<string, any>): Promise<any> {
    try {
      // Default params — allow frontend overrides via query
      const params = {
        ungroup: true,
        onlyBasicProperties: true,
        includeHashInResponse: true,
        status: 'open',
        onlyMainMarkets: true,
        includeProofs: false,
        minMaturity: getMinMaturity(),
        ...(this.cachedHash ? { responseHash: this.cachedHash } : {}),
        ...query, // allow frontend to override
      };

      const headers = { 'x-api-key': process.env.X_API_KEY };

      const url = `${this.REMOTE_API_BASE}/networks/${network}/markets`;

      const response = await axios.get(url, { params, headers });

      if (response.data === 'no change') {
        this.logger.log('No change in sports data, using cached version.');
        return this.cachedData || { message: 'No cached data available' };
      }

      // Update cache and hash
      if (response.data.responseHash) {
        this.cachedHash = response.data.responseHash;
      }

      this.cachedData = response.data;

      return this.cachedData;
    } catch (error: any) {
      this.logger.error(`Failed to fetch sports data: ${error.message}`);
      throw new Error('Failed to fetch sports data');
    }
  }

  async getMarket(networkId: Network = 10, gameId: string): Promise<Market> {
    try {
      if (!gameId) {
        throw new HttpException('gameId is required', HttpStatus.BAD_REQUEST);
      }

      const url = `${this.REMOTE_API_BASE}/networks/${networkId}/markets/${gameId}`;

      const response: AxiosResponse<Market> = await axios.get(url, {
        headers: {
          Accept: 'application/json',
          'x-api-key': process.env.X_API_KEY, // ✅ Secure header
        },
        timeout: 8000,
      });

      const market = response.data;

      if (!market || !market.gameId) {
        throw new HttpException(
          'Invalid market data received from Overtime API',
          HttpStatus.BAD_GATEWAY,
        );
      }

      return market;
    } catch (error: any) {
      console.error(`❌ Failed to fetch market ${gameId}:`, error.message);

      if (error.response) {
        throw new HttpException(
          error.response.data || 'Overtime API error',
          error.response.status || HttpStatus.BAD_GATEWAY,
        );
      }

      throw new HttpException(
        'Failed to fetch market data',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  /**
   * Place a sports bet (single or parlay)
   */
  async placeBet(userId: number, placeBetDto: PlaceBetDto): Promise<SportsBet> {
    try {
      // Find user
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      // ✅ Determine which balance to use based on network
      const { getBalanceField } = await import('../utils/network.utils');
      const networkId = placeBetDto.networkId || 10; // Default to Optimism mainnet
      const balanceField = getBalanceField(networkId);

      // Check if user has sufficient balance
      const userBalance = user[balanceField];
      if (userBalance < placeBetDto.amount) {
        throw new HttpException(
          `Insufficient ${balanceField === 'realBalance' ? 'real' : 'test'} balance`,
          HttpStatus.BAD_REQUEST,
        );
      }

      const betType: 'single' | 'parlay' = (placeBetDto.betType as 'single' | 'parlay') || 'single';
      let odds: number;
      let oddsType: string;
      let potentialPayout: number;

      if (betType === 'parlay') {
        // Parlay bet validation
        if (!placeBetDto.parlaySelections || placeBetDto.parlaySelections.length < 2) {
          throw new HttpException(
            'Parlay bets must have at least 2 selections',
            HttpStatus.BAD_REQUEST,
          );
        }

        // Calculate combined odds for parlay (multiply all odds together)
        // Use first selection's odds type or default
        oddsType = placeBetDto.parlaySelections[0].oddsType || 'normalizedImplied';
        
        // For normalizedImplied odds, multiply them
        // For decimal odds, multiply (odds - 1) then add 1 back
        // For american odds, convert to decimal first
        let combinedOdds = 1;
        
        for (const selection of placeBetDto.parlaySelections) {
          const selectionOddsType = selection.oddsType || 'normalizedImplied';
          let decimalOdd: number;
          
          // Convert to decimal odds for calculation
          if (selectionOddsType === 'decimal') {
            decimalOdd = selection.odds;
          } else if (selectionOddsType === 'american') {
            decimalOdd = selection.odds > 0 
              ? (selection.odds / 100) + 1 
              : (100 / Math.abs(selection.odds)) + 1;
          } else { // normalizedImplied
            decimalOdd = 1 / selection.odds;
          }
          
          combinedOdds *= decimalOdd;
        }
        
        // Convert back to the target odds type
        if (oddsType === 'decimal') {
          odds = combinedOdds;
        } else if (oddsType === 'american') {
          odds = combinedOdds >= 2 
            ? (combinedOdds - 1) * 100 
            : -100 / (combinedOdds - 1);
        } else { // normalizedImplied
          odds = 1 / combinedOdds;
        }
        
        potentialPayout = placeBetDto.amount * combinedOdds;
      } else {
        // Single bet
        if (!placeBetDto.gameId || placeBetDto.odds === undefined) {
          throw new HttpException(
            'Single bets must have gameId and odds',
            HttpStatus.BAD_REQUEST,
          );
        }
        
        oddsType = placeBetDto.oddsType || 'normalizedImplied';
        odds = placeBetDto.odds;
        potentialPayout = calculatePotentialPayout(
          placeBetDto.amount,
          odds,
          oddsType
        );
      }

      // Create bet
      const betData: any = {
        userId,
        user,
        betType,
        // Single bet fields (nullable for parlay)
        gameId: betType === 'single' ? placeBetDto.gameId : null,
        sportId: betType === 'single' ? placeBetDto.sportId : null,
        typeId: betType === 'single' ? placeBetDto.typeId : null,
        maturity: betType === 'single' ? placeBetDto.maturity : null,
        line: betType === 'single' ? placeBetDto.line : null,
        playerId: betType === 'single' ? placeBetDto.playerId : null,
        position: betType === 'single' ? placeBetDto.position : null,
        homeTeam: betType === 'single' ? placeBetDto.homeTeam : null,
        awayTeam: betType === 'single' ? placeBetDto.awayTeam : null,
        tournamentName: betType === 'single' ? placeBetDto.tournamentName : null,
        positionLabel: betType === 'single' ? placeBetDto.positionLabel : null,
        marketType: betType === 'single' ? placeBetDto.marketType : null,
        // Parlay selections
        parlaySelections: betType === 'parlay' ? placeBetDto.parlaySelections : null,
        // Common fields
        odds,
        oddsType,
        amount: placeBetDto.amount,
        potentialPayout,
        actualPayout: 0,
        status: BetStatus.OPEN,
        claimed: false,
        combinedPositions: placeBetDto.combinedPositions,
        merkleProof: placeBetDto.merkleProof,
        live: placeBetDto.live || false,
        networkId: placeBetDto.networkId || 10,
        balanceType: balanceField, // Track which balance was used
      };
      
      const bet = this.sportsBetRepository.create(betData) as unknown as SportsBet;

      // Deduct balance from correct balance field
      user[balanceField] = userBalance - placeBetDto.amount;
      await this.userRepository.save(user);

      // Save bet
      const savedBet = await this.sportsBetRepository.save(bet) as SportsBet;

      this.logger.log(`${betType} bet placed: ${savedBet.id} for user ${userId} on ${balanceField}`);

      // ✅ Emit real-time balance update to frontend
      this.depositGateway.sendSportsBetUpdate(userId, {
        betAmount: placeBetDto.amount,
        potentialPayout,
        newRealBalance: user.realBalance,
        newTestBalance: user.testBalance,
        balanceType: balanceField,
        betType,
        betId: savedBet.id,
      });

      return savedBet;
    } catch (error: any) {
      this.logger.error(`Failed to place bet: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get user bets with optional filtering
   */
  async getUserBets(userId: number, getBetsDto?: GetBetsDto): Promise<SportsBet[]> {
    try {
      const query = this.sportsBetRepository
        .createQueryBuilder('bet')
        .where('bet.userId = :userId', { userId })
        .orderBy('bet.createdAt', 'DESC');

      if (getBetsDto?.status) {
        query.andWhere('bet.status = :status', { status: getBetsDto.status });
      }

      const bets = await query.getMany();
      
      // Remove gameId from parlay selections to avoid frontend confusion
      const sanitizedBets = bets.map(bet => {
        if (bet.betType === 'parlay' && bet.parlaySelections) {
          return {
            ...bet,
            parlaySelections: bet.parlaySelections.map(({ gameId, ...selection }) => selection)
          };
        }
        return bet;
      });
      
      return sanitizedBets;
    } catch (error: any) {
      this.logger.error(`Failed to fetch user bets: ${error.message}`);
      throw new HttpException(
        'Failed to fetch bets',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get a specific bet by ID
   */
  async getBetById(betId: number, userId: number): Promise<SportsBet> {
    try {
      const bet = await this.sportsBetRepository.findOne({
        where: { id: betId, userId },
      });

      if (!bet) {
        throw new HttpException('Bet not found', HttpStatus.NOT_FOUND);
      }

      // Remove gameId from parlay selections to avoid frontend confusion
      if (bet.betType === 'parlay' && bet.parlaySelections) {
        return {
          ...bet,
          parlaySelections: bet.parlaySelections.map(({ gameId, ...selection }) => selection)
        } as SportsBet;
      }

      return bet;
    } catch (error: any) {
      this.logger.error(`Failed to fetch bet: ${error.message}`);
      throw error;
    }
  }

  /**
   * Claim winnings for a bet
   */
  async claimWinnings(betId: number, userId: number): Promise<SportsBet> {
    try {
      const bet = await this.getBetById(betId, userId);

      // Validate bet status
      if (bet.status !== BetStatus.WON) {
        throw new HttpException(
          'Only won bets can be claimed',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (bet.claimed) {
        throw new HttpException(
          'Winnings already claimed',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Get user
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      // ✅ Determine which balance to credit based on bet's network
      const { getBalanceField } = await import('../utils/network.utils');
      const networkId = bet.networkId || 10; // Default to Optimism mainnet
      const balanceField = getBalanceField(networkId);

      // Recalculate potential payout to ensure it's correct
      // (in case it was calculated incorrectly for old bets)
      const correctPayout = calculatePotentialPayout(
        bet.amount,
        bet.odds,
        bet.oddsType || 'normalizedImplied'
      );

      // Add winnings to user's correct balance
      const currentBalance = user[balanceField];
      const newBalance = currentBalance + correctPayout;
      user[balanceField] = newBalance;
      await this.userRepository.save(user);

      // Mark bet as claimed and update both payouts
      bet.claimed = true;
      bet.potentialPayout = correctPayout;
      bet.actualPayout = correctPayout;
      await this.sportsBetRepository.save(bet);

      this.logger.log(`Winnings claimed for bet ${betId} by user ${userId} to ${balanceField}`);

      return bet;
    } catch (error: any) {
      this.logger.error(`Failed to claim winnings: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update bet status (for admin or automated resolution)
   * This would typically be called by a cron job or webhook
   */
  async updateBetStatus(
    betId: number,
    status: BetStatus,
  ): Promise<SportsBet> {
    try {
      const bet = await this.sportsBetRepository.findOne({
        where: { id: betId },
      });

      if (!bet) {
        throw new HttpException('Bet not found', HttpStatus.NOT_FOUND);
      }

      bet.status = status;
      
      // If lost, set actual payout to 0
      if (status === BetStatus.LOST) {
        bet.actualPayout = 0;
      }

      await this.sportsBetRepository.save(bet);

      this.logger.log(`Bet ${betId} status updated to ${status}`);

      return bet;
    } catch (error: any) {
      this.logger.error(`Failed to update bet status: ${error.message}`);
      throw error;
    }
  }
}
