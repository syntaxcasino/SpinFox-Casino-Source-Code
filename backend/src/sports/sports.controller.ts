import { Body, Controller, Get, Param, Post, Query, UseGuards, Req, Patch } from '@nestjs/common';

import { SportsService } from './sports.service';
import { Network } from 'src/types/web3';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { PlaceBetDto } from './dto/place-bet.dto';
import { GetBetsDto } from './dto/get-bets.dto';
import { BetStatus } from './entities/sports-bet.entity';

@Controller('sports')
export class SportsController {
  constructor(
    private readonly sportsService: SportsService,
  ) { }

  @Get('sports')
  async fetchSports() {
    return await this.sportsService.fetchSportsMapper();
  }

  @Get('market-types')
  async fetchMarketTypes() {
    return await this.sportsService.fetchMarketTypesMapper();
  }

  @Get('networks/:network/markets')
  async fetchMarkets(@Param('network') network: number,
    @Query() query: Record<string, any>
  ) {
    return await this.sportsService.fetchMarketsMapper(
      network, query
    );
  }

  // @Post('markets-light')
  // async fetchLightMarkets(
  //   @Body('networkId') networkId: Network = 10,
  //   @Body('ids') gameIds: string[] = [],
  // ) {
  //   return await this.sportsService.fetchLightMarketsMapper(
  //     Number(networkId),
  //     gameIds,
  //   );
  // }

  @Get('networks/:network/markets/:gameId')
  async getMarket(
    @Param('network') network: string,
    @Param('gameId') gameId: string,
  ) {
    const data = await this.sportsService.getMarket(+network, gameId);
    return data;
  }

  // ============= BETTING ENDPOINTS =============

  /**
   * Place a bet
   */
  @UseGuards(JwtAuthGuard)
  @Post('bets')
  async placeBet(@Req() req: any, @Body() placeBetDto: PlaceBetDto) {
    const userId = req.user.userId;
    return await this.sportsService.placeBet(userId, placeBetDto);
  }

  /**
   * Get user bets with optional status filter
   */
  @UseGuards(JwtAuthGuard)
  @Get('bets')
  async getUserBets(@Req() req: any, @Query() getBetsDto: GetBetsDto) {
    const userId = req.user.userId;
    return await this.sportsService.getUserBets(userId, getBetsDto);
  }

  /**
   * Get a specific bet
   */
  @UseGuards(JwtAuthGuard)
  @Get('bets/:id')
  async getBet(@Req() req: any, @Param('id') betId: string) {
    const userId = req.user.userId;
    return await this.sportsService.getBetById(+betId, userId);
  }

  /**
   * Claim winnings for a bet
   */
  @UseGuards(JwtAuthGuard)
  @Post('bets/:id/claim')
  async claimWinnings(@Req() req: any, @Param('id') betId: string) {
    const userId = req.user.userId;
    return await this.sportsService.claimWinnings(+betId, userId);
  }

  /**
   * Update bet status (admin/automated)
   */
  @Patch('bets/:id/status')
  async updateBetStatus(
    @Param('id') betId: string,
    @Body('status') status: BetStatus,
  ) {
    return await this.sportsService.updateBetStatus(+betId, status);
  }
}
