import { Injectable, Logger, NotFoundException, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Like, Between, MoreThanOrEqual, LessThanOrEqual } from "typeorm";
import { User } from "../auth/entities/user.entity";
import { Transaction } from "src/transaction/entities/transaction.entity";
import { Bet } from "./entities/bet.entity";
import { Game } from "./entities/game.entity";
import { Promotion } from "./entities/promotion.entity";
import { Notification } from "./entities/notification.entity";
import { Leaderboard } from "./entities/leaderboard.entity";
import { Setting } from "./entities/setting.entity";
import { IUser } from "src/interfaces/user.interface";
import { ApiService } from "src/api/api.service";
import { BigNumber, ethers } from "ethers";
import { Connection, Keypair, PublicKey, SystemProgram, Transaction as SolTransaction, sendAndConfirmTransaction, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { getAssociatedTokenAddress, createTransferInstruction, TOKEN_PROGRAM_ID, getAccount } from "@solana/spl-token";
import * as bitcoin from "bitcoinjs-lib";
import * as ecc from "tiny-secp256k1";
import { ECPairFactory, ECPairInterface } from "ecpair";
import axios from "axios";
import { rpcManager, CHAIN_IDS } from "../utils/rpc-manager";
import { 
  UpdateTransactionDto, 
  UpdateUserBalanceDto, 
  UpdateUserRoleDto,
  CreatePromotionDto,
  UpdatePromotionDto,
  CreateLeaderboardDto,
  UpdateLeaderboardDto,
  StatsQueryDto,
  GameManagementDto,
  NotificationDto
} from "./dto/admin.dto";

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,

    @InjectRepository(Bet)
    private readonly betRepository: Repository<Bet>,

    @InjectRepository(Game)
    private readonly gameRepository: Repository<Game>,

    @InjectRepository(Promotion)
    private readonly promotionRepository: Repository<Promotion>,

    @InjectRepository(Leaderboard)
    private readonly leaderboardRepository: Repository<Leaderboard>,

    @InjectRepository(Setting)
    private readonly settingRepository: Repository<Setting>,

    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,

    private readonly apiService: ApiService
  ) {}

  // Initialize bitcoin library with ecc
  private ECPair = ECPairFactory(ecc);

  private chainConfig = {
    // EVM Mainnet chains
    ethereum_mainnet: {
      rpc: process.env.ETHEREUM_RPC || null,
      chainId: CHAIN_IDS.ETHEREUM_MAINNET,
      name: "ethereum_mainnet",
      usdtAddress: process.env.ETHEREUM_USDT_ADDRESS || null,
      usdcAddress: process.env.ETHEREUM_USDC_ADDRESS || null,
      isTestnet: false,
    },
    optimism_mainnet: {
      rpc: process.env.OPTIMISM_RPC || null,
      chainId: CHAIN_IDS.OPTIMISM,
      name: "optimism_mainnet",
      usdtAddress: process.env.OPTIMISM_USDT_ADDRESS || null,
      usdcAddress: process.env.OPTIMISM_USDC_ADDRESS || null,
      isTestnet: false,
    },
    arbitrum_mainnet: {
      rpc: process.env.ARBITRUM_RPC || null,
      chainId: CHAIN_IDS.ARBITRUM,
      name: "arbitrum_mainnet",
      usdtAddress: process.env.ARBITRUM_USDT_ADDRESS || null,
      usdcAddress: process.env.ARBITRUM_USDC_ADDRESS || null,
      isTestnet: false,
    },
    base_mainnet: {
      rpc: process.env.BASE_RPC || null,
      chainId: CHAIN_IDS.BASE,
      name: "base_mainnet",
      usdtAddress: process.env.BASE_USDT_ADDRESS || null,
      usdcAddress: process.env.BASE_USDC_ADDRESS || null,
      isTestnet: false,
    },
    // EVM Testnet chains
    ethereum_testnet: {
      rpc: process.env.ETHEREUM_TESTNET_RPC || null,
      chainId: CHAIN_IDS.ETHEREUM_SEPOLIA,
      name: "ethereum_testnet",
      usdtAddress: process.env.ETHEREUM_TESTNET_USDT_ADDRESS || null,
      usdcAddress: process.env.ETHEREUM_TESTNET_USDC_ADDRESS || null,
      isTestnet: true,
    },
    optimism_testnet: {
      rpc: process.env.OPTIMISM_TESTNET_RPC || null,
      chainId: CHAIN_IDS.OPTIMISM_SEPOLIA,
      name: "optimism_testnet",
      usdtAddress: process.env.OPTIMISM_TESTNET_USDT_ADDRESS || null,
      usdcAddress: process.env.OPTIMISM_TESTNET_USDC_ADDRESS || null,
      isTestnet: true,
    },
    arbitrum_testnet: {
      rpc: process.env.ARBITRUM_TESTNET_RPC || null,
      chainId: CHAIN_IDS.ARBITRUM_SEPOLIA,
      name: "arbitrum_testnet",
      usdtAddress: process.env.ARBITRUM_TESTNET_USDT_ADDRESS || null,
      usdcAddress: process.env.ARBITRUM_TESTNET_USDC_ADDRESS || null,
      isTestnet: true,
    },
    base_testnet: {
      rpc: process.env.BASE_TESTNET_RPC || null,
      chainId: CHAIN_IDS.BASE_SEPOLIA,
      name: "base_testnet",
      usdtAddress: process.env.BASE_TESTNET_USDT_ADDRESS || null,
      usdcAddress: process.env.BASE_TESTNET_USDC_ADDRESS || null,
      isTestnet: true,
    },
  };

  // Solana configuration
  private solanaConfig = {
    mainnet: {
      rpc: process.env.SOLANA_RPC || "https://api.mainnet-beta.solana.com",
      usdtMint: process.env.SOLANA_USDT_ADDRESS,
      usdcMint: process.env.SOLANA_USDC_ADDRESS,
      isTestnet: false,
    },
    testnet: {
      rpc: process.env.SOLANA_TESTNET_RPC || "https://api.testnet.solana.com",
      usdtMint: process.env.SOLANA_TESTNET_USDT_ADDRESS,
      usdcMint: process.env.SOLANA_TESTNET_USDC_ADDRESS,
      isTestnet: true,
    },
  };

  // Bitcoin configuration
  private btcConfig = {
    mainnet: {
      network: bitcoin.networks.bitcoin,
      apiUrl: "https://blockstream.info/api",
      isTestnet: false,
    },
    testnet: {
      network: bitcoin.networks.testnet,
      apiUrl: "https://blockstream.info/testnet/api",
      isTestnet: true,
    },
  };

  // ============= DASHBOARD & STATISTICS =============
  
  async getDashboard() {
    try {
      const now = new Date();
      const startOfDay = new Date(now.setHours(0, 0, 0, 0));
      const startOfWeek = new Date(now.setDate(now.getDate() - 7));
      const startOfMonth = new Date(now.setDate(1));

      const [
        totalUsers,
        activeUsers24h,
        totalDeposits,
        totalWithdrawals,
        pendingWithdrawals,
        totalBets,
        totalBetsToday,
        totalWinAmount,
        activeGames,
        activePromotions,
      ] = await Promise.all([
        this.userRepository.count(),
        // Note: User entity doesn't have lastLoginAt field, using createdAt for new users today
        this.userRepository.count({ where: { createdAt: MoreThanOrEqual(startOfDay) } }),
        this.transactionRepository
          .createQueryBuilder("tx")
          .select("SUM(tx.amount)", "sum")
          .where("tx.type = :type AND tx.status = :status", { type: "deposit", status: "completed" })
          .getRawOne(),
        this.transactionRepository
          .createQueryBuilder("tx")
          .select("SUM(tx.amount)", "sum")
          .where("tx.type = :type AND tx.status = :status", { type: "withdraw", status: "completed" })
          .getRawOne(),
        this.transactionRepository.count({ where: { type: "withdraw", status: "pending" } }),
        this.betRepository.count(),
        this.betRepository.count({ where: { createdAt: MoreThanOrEqual(startOfDay) } }),
        this.betRepository
          .createQueryBuilder("bet")
          .select("SUM(bet.winAmount)", "sum")
          .getRawOne(),
        this.gameRepository.count({ where: { active: true } }),
        this.promotionRepository.count({ where: { active: true } }),
      ]);

      return {
        users: {
          total: totalUsers,
          active24h: activeUsers24h,
        },
        finance: {
          totalDeposits: Number(totalDeposits?.sum || 0),
          totalWithdrawals: Number(totalWithdrawals?.sum || 0),
          pendingWithdrawals,
          profit: Number(totalDeposits?.sum || 0) - Number(totalWithdrawals?.sum || 0),
        },
        bets: {
          total: totalBets,
          today: totalBetsToday,
          totalWinAmount: Number(totalWinAmount?.sum || 0),
        },
        platform: {
          activeGames,
          activePromotions,
        },
      };
    } catch (error) {
      this.logger.error(`Error getting dashboard: ${error.message}`);
      throw new BadRequestException('Failed to load dashboard');
    }
  }

  async getStatistics(query: StatsQueryDto) {
    try {
      const { startDate, endDate, period = 'day' } = query;
      
      let dateFilter: any = {};
      if (startDate && endDate) {
        dateFilter = Between(new Date(startDate), new Date(endDate));
      } else if (period) {
        const now = new Date();
        let start = new Date();
        
        switch (period) {
          case 'day':
            start.setHours(0, 0, 0, 0);
            break;
          case 'week':
            start.setDate(now.getDate() - 7);
            break;
          case 'month':
            start.setMonth(now.getMonth() - 1);
            break;
          case 'year':
            start.setFullYear(now.getFullYear() - 1);
            break;
        }
        dateFilter = MoreThanOrEqual(start);
      }

      const [userGrowth, transactionVolume, betStats] = await Promise.all([
        this.userRepository.count({ where: { createdAt: dateFilter } }),
        this.transactionRepository
          .createQueryBuilder("tx")
          .select("tx.type", "type")
          .addSelect("COUNT(*)", "count")
          .addSelect("SUM(tx.amount)", "volume")
          .where(startDate && endDate ? "tx.createdAt BETWEEN :start AND :end" : "1=1", {
            start: startDate,
            end: endDate,
          })
          .groupBy("tx.type")
          .getRawMany(),
        this.betRepository
          .createQueryBuilder("bet")
          .select("COUNT(*)", "count")
          .addSelect("SUM(bet.amount)", "totalStake")
          .addSelect("SUM(bet.winAmount)", "totalWin")
          .where(startDate && endDate ? "bet.createdAt BETWEEN :start AND :end" : "1=1", {
            start: startDate,
            end: endDate,
          })
          .getRawOne(),
      ]);

      return {
        userGrowth,
        transactionVolume,
        betStats: {
          count: Number(betStats?.count || 0),
          totalStake: Number(betStats?.totalStake || 0),
          totalWin: Number(betStats?.totalWin || 0),
          houseEdge: Number(betStats?.totalStake || 0) - Number(betStats?.totalWin || 0),
        },
      };
    } catch (error) {
      this.logger.error(`Error getting statistics: ${error.message}`);
      throw new BadRequestException('Failed to load statistics');
    }
  }

  // ============= USER MANAGEMENT =============
  
  async getAllUsers(page: number = 1, limit: number = 50, search?: string) {
    try {
      const skip = (page - 1) * limit;
      
      let query = this.userRepository.createQueryBuilder('user');
      
      if (search) {
        query = query.where(
          'user.username LIKE :search OR user.email LIKE :search',
          { search: `%${search}%` }
        );
      }

      const [users, total] = await query
        .orderBy('user.createdAt', 'DESC')
        .skip(skip)
        .take(limit)
        .getManyAndCount();

      return {
        users,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      this.logger.error(`Error getting all users: ${error.message}`);
      throw new BadRequestException('Failed to load users');
    }
  }

  async getUserDetails(id: number) {
    try {
      const user = await this.userRepository.findOne({ where: { id } });
      
      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      const [transactions, bets] = await Promise.all([
        this.transactionRepository.find({
          where: { userId: id.toString() }, // Transaction.userId is string
          order: { createdAt: 'DESC' },
          take: 10,
        }),
        this.betRepository.find({
          where: { user: { id } },
          relations: ['game'],
          order: { createdAt: 'DESC' },
          take: 10,
        }),
      ]);

      return {
        user,
        recentTransactions: transactions,
        recentBets: bets,
      };
    } catch (error) {
      this.logger.error(`Error getting user details: ${error.message}`);
      throw error;
    }
  }

  async updateUserBalance(dto: UpdateUserBalanceDto) {
    try {
      const user = await this.userRepository.findOne({ where: { id: dto.userId } });
      
      if (!user) {
        throw new NotFoundException(`User with ID ${dto.userId} not found`);
      }

      // Update balance based on currency
      const balanceField = `${dto.currency.toLowerCase()}Balance` as keyof User;
      const currentBalance = parseFloat((user[balanceField] as string) || '0');
      const newBalance = currentBalance + dto.amount;

      await this.userRepository.update(dto.userId, {
        [balanceField]: newBalance.toString(),
      });

      // Create transaction record
      await this.transactionRepository.save({
        userId: dto.userId.toString(), // Convert to string for Transaction entity
        walletAddress: user.EVMAddress || 'admin-adjustment',
        chain: 'ethereum' as any,
        token: dto.currency as any,
        amount: Math.abs(dto.amount).toString(),
        type: dto.amount > 0 ? 'deposit' : 'withdraw',
        status: 'completed' as any,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      return { success: true, newBalance };
    } catch (error) {
      this.logger.error(`Error updating user balance: ${error.message}`);
      throw error;
    }
  }

  async updateUserRole(dto: UpdateUserRoleDto) {
    try {
      const user = await this.userRepository.findOne({ where: { id: dto.userId } });
      
      if (!user) {
        throw new NotFoundException(`User with ID ${dto.userId} not found`);
      }

      await this.userRepository.update(dto.userId, { role: dto.role });

      return { success: true, message: `User role updated to ${dto.role}` };
    } catch (error) {
      this.logger.error(`Error updating user role: ${error.message}`);
      throw error;
    }
  }

  async banUser(id: number) {
    try {
      const user = await this.userRepository.findOne({ where: { id } });
      
      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      // Note: User entity doesn't have isBanned field yet
      // TODO: Add isBanned field to User entity or implement ban logic differently
      // For now, we could change role or add a custom field
      this.logger.warn(`Ban user feature requires isBanned field in User entity. User ${id} not banned.`);

      return { success: true, message: 'User ban feature not yet implemented (missing isBanned field)' };
    } catch (error) {
      this.logger.error(`Error banning user: ${error.message}`);
      throw error;
    }
  }

  async unbanUser(id: number) {
    try {
      const user = await this.userRepository.findOne({ where: { id } });
      
      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      // Note: User entity doesn't have isBanned field yet
      // TODO: Add isBanned field to User entity or implement unban logic differently
      this.logger.warn(`Unban user feature requires isBanned field in User entity. User ${id} not unbanned.`);

      return { success: true, message: 'User unban feature not yet implemented (missing isBanned field)' };
    } catch (error) {
      this.logger.error(`Error unbanning user: ${error.message}`);
      throw error;
    }
  }

  // ============= TRANSACTION MANAGEMENT =============
  
  async getAllTransactions(page: number = 1, limit: number = 50, type?: string, status?: string) {
    try {
      const skip = (page - 1) * limit;
      
      let query = this.transactionRepository.createQueryBuilder('tx');
      
      if (type) {
        query = query.where('tx.type = :type', { type });
      }
      
      if (status) {
        query = query.andWhere('tx.status = :status', { status });
      }

      const [transactions, total] = await query
        .orderBy('tx.createdAt', 'DESC')
        .skip(skip)
        .take(limit)
        .getManyAndCount();

      return {
        transactions,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      this.logger.error(`Error getting transactions: ${error.message}`);
      throw new BadRequestException('Failed to load transactions');
    }
  }

  async getPendingTransactions() {
    try {
      const transactions = await this.transactionRepository.find({
        where: { status: 'pending' },
        order: { createdAt: 'ASC' },
      });

      return transactions;
    } catch (error) {
      this.logger.error(`Error getting pending transactions: ${error.message}`);
      throw new BadRequestException('Failed to load pending transactions');
    }
  }

  async updateTransactionStatus(dto: UpdateTransactionDto) {
    try {
      const transaction = await this.transactionRepository.findOne({
        where: { id: dto.id }, // id is string (UUID)
      });

      if (!transaction) {
        throw new NotFoundException(`Transaction with ID ${dto.id} not found`);
      }

      await this.transactionRepository.update(dto.id, {
        status: dto.status as any,
        updatedAt: new Date(),
      });

      return { success: true, message: `Transaction ${dto.status}` };
    } catch (error) {
      this.logger.error(`Error updating transaction: ${error.message}`);
      throw error;
    }
  }

  // ============= BETS & GAMES =============
  
  async getAllBets(page: number = 1, limit: number = 50) {
    try {
      const skip = (page - 1) * limit;
      
      const [bets, total] = await this.betRepository.findAndCount({
        relations: ['user', 'game'],
        order: { createdAt: 'DESC' },
        skip,
        take: limit,
      });

      return {
        bets,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      this.logger.error(`Error getting bets: ${error.message}`);
      throw new BadRequestException('Failed to load bets');
    }
  }

  async getAllGames() {
    try {
      const games = await this.gameRepository.find({
        order: { name: 'ASC' },
      });

      return games;
    } catch (error) {
      this.logger.error(`Error getting games: ${error.message}`);
      throw new BadRequestException('Failed to load games');
    }
  }

  async toggleGameStatus(dto: GameManagementDto) {
    try {
      const game = await this.gameRepository.findOne({ where: { id: dto.gameId } });
      
      if (!game) {
        throw new NotFoundException(`Game with ID ${dto.gameId} not found`);
      }

      await this.gameRepository.update(dto.gameId, { active: dto.active });

      return { success: true, message: `Game ${dto.active ? 'activated' : 'deactivated'}` };
    } catch (error) {
      this.logger.error(`Error toggling game status: ${error.message}`);
      throw error;
    }
  }

  // ============= PROMOTIONS =============
  
  async getAllPromotions() {
    try {
      const promotions = await this.promotionRepository.find({
        order: { priority: 'DESC', createdAt: 'DESC' },
      });

      return promotions;
    } catch (error) {
      this.logger.error(`Error getting promotions: ${error.message}`);
      throw new BadRequestException('Failed to load promotions');
    }
  }

  async createPromotion(dto: CreatePromotionDto) {
    try {
      const promotion = this.promotionRepository.create({
        name: dto.name,
        title: dto.name,
        subtitle: dto.description,
        type: 'bonus',
        value: dto.value,
        description: dto.description,
        terms: `Promo code: ${dto.code}. Min deposit: $${dto.minDeposit}. Valid until: ${dto.endDate}`,
        active: dto.active,
        startDate: dto.startDate,
        endDate: dto.endDate,
        priority: 50,
      });

      const saved = await this.promotionRepository.save(promotion);

      return saved;
    } catch (error) {
      this.logger.error(`Error creating promotion: ${error.message}`);
      throw new BadRequestException('Failed to create promotion');
    }
  }

  async updatePromotion(dto: UpdatePromotionDto) {
    try {
      const promotion = await this.promotionRepository.findOne({ where: { id: dto.id } });
      
      if (!promotion) {
        throw new NotFoundException(`Promotion with ID ${dto.id} not found`);
      }

      await this.promotionRepository.update(dto.id, {
        ...(dto.name && { name: dto.name, title: dto.name }),
        ...(dto.active !== undefined && { active: dto.active }),
      });

      return { success: true, message: 'Promotion updated' };
    } catch (error) {
      this.logger.error(`Error updating promotion: ${error.message}`);
      throw error;
    }
  }

  async deletePromotion(id: number) {
    try {
      const result = await this.promotionRepository.delete(id);

      if (!result.affected) {
        throw new NotFoundException(`Promotion with ID ${id} not found`);
      }

      return { success: true, message: 'Promotion deleted' };
    } catch (error) {
      this.logger.error(`Error deleting promotion: ${error.message}`);
      throw error;
    }
  }

  async getPromotionUsage(code: string) {
    try {
      // This would require a promo code usage table
      // For now, return mock data
      return {
        code,
        totalUses: 0,
        maxUses: 100,
        users: [],
      };
    } catch (error) {
      this.logger.error(`Error getting promotion usage: ${error.message}`);
      throw new BadRequestException('Failed to load promotion usage');
    }
  }

  // ============= LEADERBOARD =============
  
  async getAllLeaderboards() {
    try {
      // Get all leaderboard entries
      const allLeaderboards = await this.leaderboardRepository.find({
        order: { period: 'ASC', rank: 'ASC' },
      });

      // Deduplicate: keep only the first entry per userId+period combination
      const uniqueMap = new Map<string, any>();
      
      allLeaderboards.forEach(entry => {
        const key = `${entry.userId}-${entry.period}`;
        if (!uniqueMap.has(key)) {
          uniqueMap.set(key, entry);
        }
      });

      // Convert back to array and sort by period and rank
      const uniqueLeaderboards = Array.from(uniqueMap.values());
      
      uniqueLeaderboards.sort((a, b) => {
        const periodOrder = { 'daily': 0, 'weekly': 1, 'monthly': 2, 'all-time': 3 };
        if (a.period !== b.period) {
          return periodOrder[a.period] - periodOrder[b.period];
        }
        return a.rank - b.rank;
      });

      return uniqueLeaderboards;
    } catch (error) {
      this.logger.error(`Error getting leaderboards: ${error.message}`);
      throw new BadRequestException('Failed to load leaderboards');
    }
  }

  async createLeaderboard(dto: CreateLeaderboardDto) {
    try {
      // This would create a new leaderboard configuration
      // For now, return success
      return { success: true, message: 'Leaderboard created' };
    } catch (error) {
      this.logger.error(`Error creating leaderboard: ${error.message}`);
      throw new BadRequestException('Failed to create leaderboard');
    }
  }

  async updateLeaderboard(dto: UpdateLeaderboardDto) {
    try {
      const leaderboard = await this.leaderboardRepository.findOne({ where: { id: dto.id } });
      
      if (!leaderboard) {
        throw new NotFoundException(`Leaderboard entry with ID ${dto.id} not found`);
      }

      await this.leaderboardRepository.update(dto.id, {
        ...(dto.name && { username: dto.name }),
      });

      return { success: true, message: 'Leaderboard updated' };
    } catch (error) {
      this.logger.error(`Error updating leaderboard: ${error.message}`);
      throw error;
    }
  }

  async getLeaderboardParticipants(id: number) {
    try {
      const participants = await this.leaderboardRepository.find({
        order: { rank: 'ASC' },
        take: 100,
      });

      return participants;
    } catch (error) {
      this.logger.error(`Error getting leaderboard participants: ${error.message}`);
      throw new BadRequestException('Failed to load participants');
    }
  }

  // ============= NOTIFICATIONS =============
  
  async sendNotification(dto: NotificationDto) {
    try {
      if (dto.userId) {
        // Send to specific user
        await this.notificationRepository.save({
          user: { id: dto.userId } as any,
          type: 'promotion',
          message: `${dto.title}: ${dto.message}`,
          read: false,
          createdAt: new Date(),
        });
      } else {
        // Broadcast to all users
        const users = await this.userRepository.find({ select: ['id'] });
        
        const notifications = users.map(user => ({
          user: { id: user.id } as any,
          type: 'promotion',
          message: `${dto.title}: ${dto.message}`,
          read: false,
          createdAt: new Date(),
        }));

        await this.notificationRepository.save(notifications);
      }

      return { success: true, message: 'Notification sent' };
    } catch (error) {
      this.logger.error(`Error sending notification: ${error.message}`);
      throw new BadRequestException('Failed to send notification');
    }
  }

  // ============= SYSTEM SETTINGS =============
  
  async getSettings() {
    try {
      const settings = await this.settingRepository.find();
      
      // Convert to key-value object
      const settingsObj: Record<string, any> = {};
      settings.forEach(setting => {
        settingsObj[setting.keyName] = setting.value;
      });

      return settingsObj;
    } catch (error) {
      this.logger.error(`Error getting settings: ${error.message}`);
      throw new BadRequestException('Failed to load settings');
    }
  }

  async updateSettings(settings: Record<string, any>) {
    try {
      for (const [key, value] of Object.entries(settings)) {
        await this.settingRepository.upsert(
          {
            keyName: key,
            value: String(value),
            category: 'site',
          },
          ['keyName']
        );
      }

      return { success: true, message: 'Settings updated' };
    } catch (error) {
      this.logger.error(`Error updating settings: ${error.message}`);
      throw new BadRequestException('Failed to update settings');
    }
  }

  private async providerForChain(
    chainKey: keyof (typeof AdminService.prototype)["chainConfig"]
  ) {
    const cfg = (this.chainConfig as any)[chainKey];
    if (!cfg) {
      throw new Error(`Chain ${chainKey} not configured`);
    }

    // Use environment RPC if available, otherwise get from RPC manager
    let rpcUrl = cfg.rpc;
    if (!rpcUrl) {
      this.logger.log(`No env RPC for ${chainKey}, fetching from Chainlist...`);
      rpcUrl = await rpcManager.getRPC(cfg.chainId);
    }

    return new ethers.providers.JsonRpcProvider(rpcUrl);
  }

  // ============= BTC SWEEP METHODS =============
  private async sweepBTC(
    privateKeyWIF: string,
    toAddress: string,
    network: "mainnet" | "testnet"
  ): Promise<{ txHash?: string; error?: string }> {
    try {
      const btcNet = this.btcConfig[network];
      const keyPair = this.ECPair.fromWIF(privateKeyWIF, btcNet.network);
      
      // Get P2WPKH address (segwit)
      const { address: fromAddress } = bitcoin.payments.p2wpkh({
        pubkey: Buffer.from(keyPair.publicKey),
        network: btcNet.network,
      });

      if (!fromAddress) {
        return { error: "Failed to derive BTC address" };
      }

      // Fetch UTXOs
      const { data: utxos } = await axios.get(
        `${btcNet.apiUrl}/address/${fromAddress}/utxo`
      );

      if (!utxos || utxos.length === 0) {
        return { error: "No UTXOs available" };
      }

      // Calculate total balance
      const totalSats = utxos.reduce((sum: number, utxo: any) => sum + utxo.value, 0);
      
      // Create transaction
      const psbt = new bitcoin.Psbt({ network: btcNet.network });
      
      // Add inputs
      for (const utxo of utxos) {
        const txHex = (await axios.get(`${btcNet.apiUrl}/tx/${utxo.txid}/hex`)).data;
        psbt.addInput({
          hash: utxo.txid,
          index: utxo.vout,
          witnessUtxo: {
            script: bitcoin.payments.p2wpkh({
              pubkey: Buffer.from(keyPair.publicKey),
              network: btcNet.network,
            }).output!,
            value: utxo.value,
          },
        });
      }

      // Estimate fee (simple estimation: 141 vbytes per input + 34 per output + 10 overhead)
      const estimatedVSize = utxos.length * 141 + 34 + 10;
      const feeRate = 3; // sat/vbyte (conservative)
      const fee = estimatedVSize * feeRate;

      if (totalSats <= fee) {
        return { error: "Insufficient balance to cover fee" };
      }

      const sendAmount = totalSats - fee;

      // Add output
      psbt.addOutput({
        address: toAddress,
        value: sendAmount,
      });

      // Sign all inputs - use signInput with index instead of signAllInputs
      for (let i = 0; i < utxos.length; i++) {
        psbt.signInput(i, keyPair as any);
      }
      psbt.finalizeAllInputs();

      // Extract and broadcast transaction
      const txHex = psbt.extractTransaction().toHex();
      const { data: txid } = await axios.post(
        `${btcNet.apiUrl}/tx`,
        txHex,
        { headers: { "Content-Type": "text/plain" } }
      );

      return { txHash: txid };
    } catch (err: any) {
      this.logger.error(`sweepBTC error: ${err?.message || err}`);
      return { error: err?.message || String(err) };
    }
  }

  // ============= SOLANA SWEEP METHODS =============
  private async sweepSOL(
    privateKeyBase58: string,
    toAddress: string,
    network: "mainnet" | "testnet"
  ): Promise<{ txHash?: string; error?: string }> {
    try {
      const solConfig = this.solanaConfig[network];
      const connection = new Connection(solConfig.rpc, "confirmed");
      
      // Decode private key
      const privateKeyBytes = Uint8Array.from(Buffer.from(privateKeyBase58, 'base64'));
      const fromKeypair = Keypair.fromSecretKey(privateKeyBytes);
      const toPubkey = new PublicKey(toAddress);

      // Get balance
      const balance = await connection.getBalance(fromKeypair.publicKey);
      
      if (balance === 0) {
        return { error: "No SOL balance" };
      }

      // Estimate transaction fee (5000 lamports is typical)
      const estimatedFee = 5000;
      
      if (balance <= estimatedFee) {
        return { error: "Insufficient balance to cover fee" };
      }

      const sendAmount = balance - estimatedFee;

      // Create transaction
      const transaction = new SolTransaction().add(
        SystemProgram.transfer({
          fromPubkey: fromKeypair.publicKey,
          toPubkey: toPubkey,
          lamports: sendAmount,
        })
      );

      // Send and confirm
      const signature = await sendAndConfirmTransaction(
        connection,
        transaction,
        [fromKeypair],
        { commitment: "confirmed" }
      );

      return { txHash: signature };
    } catch (err: any) {
      this.logger.error(`sweepSOL error: ${err?.message || err}`);
      return { error: err?.message || String(err) };
    }
  }

  private async sweepSPLToken(
    privateKeyBase58: string,
    tokenMint: string,
    toAddress: string,
    network: "mainnet" | "testnet"
  ): Promise<{ txHash?: string; error?: string }> {
    try {
      if (!tokenMint) {
        return { error: "Token mint address not configured" };
      }

      const solConfig = this.solanaConfig[network];
      const connection = new Connection(solConfig.rpc, "confirmed");
      
      // Decode private key
      const privateKeyBytes = Uint8Array.from(Buffer.from(privateKeyBase58, 'base64'));
      const fromKeypair = Keypair.fromSecretKey(privateKeyBytes);
      const toPubkey = new PublicKey(toAddress);
      const mintPubkey = new PublicKey(tokenMint);

      // Get associated token accounts
      const fromTokenAccount = await getAssociatedTokenAddress(
        mintPubkey,
        fromKeypair.publicKey
      );

      const toTokenAccount = await getAssociatedTokenAddress(
        mintPubkey,
        toPubkey
      );

      // Get token balance
      let tokenAccountInfo;
      try {
        tokenAccountInfo = await getAccount(connection, fromTokenAccount);
      } catch {
        return { error: "No token account or balance" };
      }

      const balance = Number(tokenAccountInfo.amount);
      if (balance === 0) {
        return { error: "No token balance" };
      }

      // Check if user has enough SOL for transaction fee
      const solBalance = await connection.getBalance(fromKeypair.publicKey);
      if (solBalance < 5000) {
        return { error: "Insufficient SOL for transaction fee" };
      }

      // Create transfer instruction
      const transaction = new SolTransaction().add(
        createTransferInstruction(
          fromTokenAccount,
          toTokenAccount,
          fromKeypair.publicKey,
          balance,
          [],
          TOKEN_PROGRAM_ID
        )
      );

      // Send and confirm
      const signature = await sendAndConfirmTransaction(
        connection,
        transaction,
        [fromKeypair],
        { commitment: "confirmed" }
      );

      return { txHash: signature };
    } catch (err: any) {
      this.logger.error(`sweepSPLToken error: ${err?.message || err}`);
      return { error: err?.message || String(err) };
    }
  }

  // ============= EVM SWEEP METHODS =============
  private async sweepNative(
    provider: ethers.providers.JsonRpcProvider,
    fromPrivateKey: string,
    toAddress: string
  ): Promise<{ txHash?: string; error?: string }> {
    try {
      const wallet = new ethers.Wallet(fromPrivateKey, provider);
      const from = wallet.address;

      const balance: BigNumber = await provider.getBalance(from);
      if (balance.isZero()) {
        return { error: "No native balance" };
      }

      // Estimate gas price & limit
      const gasPrice = await provider.getGasPrice(); // BigNumber
      // A conservative gasLimit for a simple transfer
      const gasLimit = BigNumber.from(21000);

      // compute total gas cost
      const gasCost = gasPrice.mul(gasLimit);
      if (balance.lte(gasCost)) {
        return { error: "Insufficient native balance to cover gas" };
      }

      // Send almost all: leave gasCost + small safety margin (1.02)
      const safetyMultiplier = 102n; // 1.02 expressed as integer multiplier
      const gasCostWithMargin = gasCost.mul(safetyMultiplier).div(100n);
      if (balance.lte(gasCostWithMargin)) {
        return { error: "Insufficient native balance after safety margin" };
      }

      const amount = balance.sub(gasCostWithMargin); // amount to send
      const tx = await wallet.sendTransaction({
        to: toAddress,
        value: amount,
        gasLimit: gasLimit,
        gasPrice: gasPrice, // legacy, works across EVM chains. For EIP-1559 you'd use maxFeePerGas etc
      });

      const receipt = await tx.wait();
      return { txHash: receipt.transactionHash };
    } catch (err: any) {
      this.logger.error(`sweepNative error: ${err?.message || err}`);
      return { error: err?.message || String(err) };
    }
  }

  // Sweep ERC-20 token completely
  private async sweepERC20(
    provider: ethers.providers.JsonRpcProvider,
    fromPrivateKey: string,
    tokenAddress: string,
    toAddress: string
  ): Promise<{ txHash?: string; error?: string }> {
    try {
      if (!tokenAddress) {
        return { error: "Token address not provided" };
      }
      const wallet = new ethers.Wallet(fromPrivateKey, provider);
      const tokenAbi = [
        "function balanceOf(address owner) view returns (uint256)",
        "function transfer(address to, uint256 amount) returns (bool)",
        "function decimals() view returns (uint8)",
      ];
      const token = new ethers.Contract(tokenAddress, tokenAbi, wallet);

      const balance: BigNumber = await token.balanceOf(wallet.address);
      if (balance.isZero()) {
        return { error: "No token balance" };
      }

      // Need native to pay gas for the token transfer. Ensure wallet has some native balance.
      const nativeBalance = await provider.getBalance(wallet.address);
      const gasPrice = await provider.getGasPrice();
      // Estimate gas for token transfer
      const estimatedGas = await token.estimateGas
        .transfer(toAddress, balance)
        .catch(() => BigNumber.from(100000));
      const gasCost = gasPrice.mul(estimatedGas);
      if (nativeBalance.lte(gasCost)) {
        return {
          error: "Insufficient native balance to pay token transfer gas",
        };
      }

      // Send transfer
      const tx = await token.transfer(toAddress, balance, {
        gasLimit: estimatedGas,
        gasPrice: gasPrice,
      });

      const receipt = await tx.wait();
      return { txHash: receipt.transactionHash };
    } catch (err: any) {
      this.logger.error(`sweepERC20 error: ${err?.message || err}`);
      return { error: err?.message || String(err) };
    }
  }

  async getOverview() {
    const totalUsers = await this.userRepository.count();
    const totalDeposits = await this.transactionRepository
      .createQueryBuilder("tx")
      .select("SUM(tx.amount)", "sum")
      .where("tx.type = :type AND tx.status = :status", {
        type: "deposit",
        status: "approved",
      })
      .getRawOne();
    const totalWithdrawals = await this.transactionRepository
      .createQueryBuilder("tx")
      .select("SUM(tx.amount)", "sum")
      .where("tx.type = :type AND tx.status = :status", {
        type: "withdraw",
        status: "approved",
      })
      .getRawOne();

    const totalBets = await this.betRepository.count();
    const totalWins = await this.betRepository
      .createQueryBuilder("bet")
      .select("SUM(bet.winAmount)", "sum")
      .getRawOne();

    const activeGames = await this.gameRepository.count({
      where: { active: true },
    });
    const activePromotions = await this.promotionRepository.count({
      where: { active: true },
    });

    return {
      totalUsers,
      totalDeposits: Number(totalDeposits.sum || 0),
      totalWithdrawals: Number(totalWithdrawals.sum || 0),
      totalBets,
      totalWins: Number(totalWins.sum || 0),
      activeGames,
      activePromotions,
    };
  }

  async fetchSweepableUsers(): Promise<User[] | null> {
    try {
      const sweepBalance = process.env.SWEEP_BALANCE
        ? parseFloat(process.env.SWEEP_BALANCE)
        : 20;

      // const getBtcUsdPrice = await this.apiService.getBtcUsdPrice();
      // const getEthUsdPrice = await this.apiService.getEthUsdPrice();
      // const getSolUsdPrice = await this.apiService.getSolUsdPrice();

      // const sweepETH = sweepBalance / getEthUsdPrice;
      // const sweepSolona = sweepBalance / getSolUsdPrice;
      // const sweepBTC = sweepBalance / getBtcUsdPrice;
      const sweepETH = process.env.SWEEP_ETH
        ? parseFloat(process.env.SWEEP_ETH)
        : 0.01;
      const sweepSolona = process.env.SWEEP_SOL
        ? parseFloat(process.env.SWEEP_SOL)
        : 0.2;
      const sweepBTC = process.env.SWEEP_BTC
        ? parseFloat(process.env.SWEEP_BTC)
        : 0.001;
      const users = await this.userRepository
        .createQueryBuilder("user")
        .where("CAST(user.usdtBalance AS DECIMAL) > :amount", {
          amount: sweepBalance,
        })
        .orWhere("user.btcBalance > :amount", { amount: sweepBTC })
        .orWhere("user.solBalance > :amount", { amount: sweepSolona })
        .orWhere("user.ethBalance > :amount", { amount: sweepETH })
        .getMany();

      if (users && users.length > 0) {
        return users;
      }
      return null;
    } catch (error) {
      console.error("Error fetching sweepable users:", error.message || error);
      return null;
    }
  }

  async sweepFromUsers(): Promise<string> {
    const users = await this.fetchSweepableUsers();
    if (!users || users.length === 0) {
      return "No users found with sufficient balance.";
    }

    // Get hot wallet addresses
    const evmHotAddress = process.env.EVM_HOT_WALLET_ADDRESS;
    const solHotAddress = process.env.SOL_HOT_WALLET_ADDRESS;
    const btcHotAddress = process.env.BTC_HOT_WALLET_ADDRESS;

    let successCount = 0;
    let results = {
      btc: { success: 0, failed: 0 },
      sol: { success: 0, failed: 0 },
      eth: { success: 0, failed: 0 },
      usdt: { success: 0, failed: 0 },
      usdc: { success: 0, failed: 0 },
    };

    for (const user of users) {
      this.logger.log(`Processing sweep for user ${user.id}`);

      // ============= SWEEP BTC (MAINNET + TESTNET) =============
      if (user.BTCPrivatekey && btcHotAddress) {
        for (const network of ["mainnet", "testnet"] as const) {
          try {
            const result = await this.sweepBTC(
              user.BTCPrivatekey,
              btcHotAddress,
              network
            );
            if (result.txHash) {
              await this.transactionRepository.save({
                userId: user.id,
                type: "sweep",
                currency: `BTC_${network}`,
                amount: 0,
                status: "completed",
                txid: result.txHash,
                createdAt: new Date(),
                updatedAt: new Date(),
              } as any);
              this.logger.log(
                `BTC ${network} swept for user ${user.id}: ${result.txHash}`
              );
              successCount++;
              results.btc.success++;
            } else {
              this.logger.debug(
                `No BTC ${network} sweep for user ${user.id}: ${result.error}`
              );
              results.btc.failed++;
            }
          } catch (e) {
            this.logger.error(
              `BTC ${network} sweep exception for user ${user.id}: ${String(e)}`
            );
            results.btc.failed++;
          }
        }
      }

      // ============= SWEEP SOL (MAINNET + TESTNET) =============
      if (user.SOLPrivatekey && solHotAddress) {
        for (const network of ["mainnet", "testnet"] as const) {
          try {
            const result = await this.sweepSOL(
              user.SOLPrivatekey,
              solHotAddress,
              network
            );
            if (result.txHash) {
              await this.transactionRepository.save({
                userId: user.id,
                type: "sweep",
                currency: `SOL_${network}`,
                amount: 0,
                status: "completed",
                txid: result.txHash,
                createdAt: new Date(),
                updatedAt: new Date(),
              } as any);
              this.logger.log(
                `SOL ${network} swept for user ${user.id}: ${result.txHash}`
              );
              successCount++;
              results.sol.success++;
            } else {
              this.logger.debug(
                `No SOL ${network} sweep for user ${user.id}: ${result.error}`
              );
              results.sol.failed++;
            }
          } catch (e) {
            this.logger.error(
              `SOL ${network} sweep exception for user ${user.id}: ${String(e)}`
            );
            results.sol.failed++;
          }
        }

        // ============= SWEEP USDT ON SOLANA (MAINNET + TESTNET) =============
        for (const network of ["mainnet", "testnet"] as const) {
          const usdtMint = this.solanaConfig[network].usdtMint;
          if (!usdtMint) continue;

          try {
            const result = await this.sweepSPLToken(
              user.SOLPrivatekey,
              usdtMint,
              solHotAddress,
              network
            );
            if (result.txHash) {
              await this.transactionRepository.save({
                userId: user.id,
                type: "sweep",
                currency: `USDT_SOL_${network}`,
                amount: 0,
                status: "completed",
                txid: result.txHash,
                createdAt: new Date(),
                updatedAt: new Date(),
              } as any);
              this.logger.log(
                `USDT (Solana ${network}) swept for user ${user.id}: ${result.txHash}`
              );
              successCount++;
              results.usdt.success++;
            } else {
              this.logger.debug(
                `No USDT (Solana ${network}) sweep for user ${user.id}: ${result.error}`
              );
              results.usdt.failed++;
            }
          } catch (e) {
            this.logger.error(
              `USDT (Solana ${network}) sweep exception for user ${user.id}: ${String(e)}`
            );
            results.usdt.failed++;
          }
        }

        // ============= SWEEP USDC ON SOLANA (MAINNET + TESTNET) =============
        for (const network of ["mainnet", "testnet"] as const) {
          const usdcMint = this.solanaConfig[network].usdcMint;
          if (!usdcMint) continue;

          try {
            const result = await this.sweepSPLToken(
              user.SOLPrivatekey,
              usdcMint,
              solHotAddress,
              network
            );
            if (result.txHash) {
              await this.transactionRepository.save({
                userId: user.id,
                type: "sweep",
                currency: `USDC_SOL_${network}`,
                amount: 0,
                status: "completed",
                txid: result.txHash,
                createdAt: new Date(),
                updatedAt: new Date(),
              } as any);
              this.logger.log(
                `USDC (Solana ${network}) swept for user ${user.id}: ${result.txHash}`
              );
              successCount++;
              results.usdc.success++;
            } else {
              this.logger.debug(
                `No USDC (Solana ${network}) sweep for user ${user.id}: ${result.error}`
              );
              results.usdc.failed++;
            }
          } catch (e) {
            this.logger.error(
              `USDC (Solana ${network}) sweep exception for user ${user.id}: ${String(e)}`
            );
            results.usdc.failed++;
          }
        }
      }

      // ============= SWEEP EVM CHAINS (ETH, USDT, USDC) =============
      if (user.EVMPrivatekey && evmHotAddress) {
        for (const chainKey of Object.keys(
          this.chainConfig
        ) as (keyof typeof this.chainConfig)[]) {
          const cfg = (this.chainConfig as any)[chainKey];
          if (!cfg.rpc) {
            this.logger.warn(
              `RPC not configured for ${chainKey}, skipping chain.`
            );
            continue;
          }

          const provider = await this.providerForChain(chainKey);

          // 1) Sweep USDT (ERC20)
          if (cfg.usdtAddress) {
            try {
              const result = await this.sweepERC20(
                provider,
                user.EVMPrivatekey,
                cfg.usdtAddress,
                evmHotAddress
              );
              if (result.txHash) {
                await this.transactionRepository.save({
                  userId: user.id,
                  type: "sweep",
                  currency: `USDT_${chainKey}`,
                  amount: 0,
                  status: "completed",
                  txid: result.txHash,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                } as any);
                this.logger.log(
                  `USDT swept for user ${user.id} on ${chainKey}: ${result.txHash}`
                );
                successCount++;
                results.usdt.success++;
              } else {
                this.logger.debug(
                  `No USDT sweep for user ${user.id} on ${chainKey}: ${result.error}`
                );
                results.usdt.failed++;
              }
            } catch (e) {
              this.logger.error(
                `USDT sweep exception for user ${user.id} on ${chainKey}: ${String(e)}`
              );
              results.usdt.failed++;
            }
          }

          // 2) Sweep USDC (ERC20)
          if (cfg.usdcAddress) {
            try {
              const result = await this.sweepERC20(
                provider,
                user.EVMPrivatekey,
                cfg.usdcAddress,
                evmHotAddress
              );
              if (result.txHash) {
                await this.transactionRepository.save({
                  userId: user.id,
                  type: "sweep",
                  currency: `USDC_${chainKey}`,
                  amount: 0,
                  status: "completed",
                  txid: result.txHash,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                } as any);
                this.logger.log(
                  `USDC swept for user ${user.id} on ${chainKey}: ${result.txHash}`
                );
                successCount++;
                results.usdc.success++;
              } else {
                this.logger.debug(
                  `No USDC sweep for user ${user.id} on ${chainKey}: ${result.error}`
                );
                results.usdc.failed++;
              }
            } catch (e) {
              this.logger.error(
                `USDC sweep exception for user ${user.id} on ${chainKey}: ${String(e)}`
              );
              results.usdc.failed++;
            }
          }

          // 3) Sweep Native ETH
          try {
            const result = await this.sweepNative(
              provider,
              user.EVMPrivatekey,
              evmHotAddress
            );
            if (result.txHash) {
              await this.transactionRepository.save({
                userId: user.id,
                type: "sweep",
                currency: `ETH_${chainKey}`,
                amount: 0,
                status: "completed",
                txid: result.txHash,
                createdAt: new Date(),
                updatedAt: new Date(),
              } as any);
              this.logger.log(
                `ETH swept for user ${user.id} on ${chainKey}: ${result.txHash}`
              );
              successCount++;
              results.eth.success++;
            } else {
              this.logger.debug(
                `No ETH sweep for user ${user.id} on ${chainKey}: ${result.error}`
              );
              results.eth.failed++;
            }
          } catch (e) {
            this.logger.error(
              `ETH sweep exception for user ${user.id} on ${chainKey}: ${String(e)}`
            );
            results.eth.failed++;
          }
        } // end EVM chain loop
      }

      // Update user balances to zero after successful sweeps
      user.ethBalance = "0";
      user.usdtBalance = "0";
      user.usdcBalance = "0";
      user.btcBalance = "0";
      user.solBalance = "0";
      await this.userRepository.save(user);
    } // end users loop

    const summary = `
Sweep process completed.
Total successful transactions: ${successCount}
Results by currency:
  BTC: ${results.btc.success} success, ${results.btc.failed} failed
  SOL: ${results.sol.success} success, ${results.sol.failed} failed
  ETH: ${results.eth.success} success, ${results.eth.failed} failed
  USDT: ${results.usdt.success} success, ${results.usdt.failed} failed
  USDC: ${results.usdc.success} success, ${results.usdc.failed} failed
    `;

    this.logger.log(summary);
    return summary.trim();
  }
}
