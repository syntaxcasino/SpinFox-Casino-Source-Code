import { Injectable, Logger, UnauthorizedException, BadRequestException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { CasinoTransaction } from './entities/casino-transaction.entity';
import { DepositGateway } from '../deposit/deposit.gateway';
import Redis from 'ioredis';

interface UserBalanceRequest {
  agent_code: string;
  agent_secret: string;
  user_code: string;
}

interface GameCallbackRequest {
  agent_code: string;
  agent_secret: string;
  agent_balance: number;
  user_code: string;
  user_balance: number;
  user_total_credit: number;
  user_total_debit: number;
  game_type: string;
  slot: {
    provider_code: string;
    game_code: string;
    round_id: string;
    type: string;
    bet: number;
    win: number;
    txn_id: string;
    txn_type: 'debit' | 'credit' | 'debit_credit';
    user_before_balance: number;
    user_after_balance: number;
    agent_before_balance: number;
    agent_after_balance: number;
    created_at: string;
  };
}

interface MoneyCallbackRequest {
  agent_code: string;
  agent_secret: string;
  agent_type: string;
  user_code: string;
  provider_code: string;
  game_code: string;
  type: 'debit' | 'deposit' | 'withdraw' | 'credit' | 'debit_credit';
  agent_before_balance: number;
  agent_after_balance: number;
  user_before_balance: number;
  user_after_balance: number;
  amount: number;
  msg: string;
}

@Injectable()
export class SeamlessCallbackService {
  private readonly logger = new Logger(SeamlessCallbackService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(CasinoTransaction)
    private casinoTransactionRepository: Repository<CasinoTransaction>,
    private dataSource: DataSource,
    private depositGateway: DepositGateway,
    @Inject('REDIS_CLIENT') private redis: Redis,
  ) {}

  /**
   * Verify the agent credentials
   */
  private verifyAgent(agentCode: string, agentSecret: string): void {
    const expectedAgentCode = process.env.AGENT_CODE;
    const expectedAgentSecret = process.env.AGENT_SECRET;

    if (!expectedAgentCode || !expectedAgentSecret) {
      this.logger.error('AGENT_CODE or AGENT_SECRET not configured');
      throw new UnauthorizedException('Server configuration error');
    }

    if (agentCode !== expectedAgentCode || agentSecret !== expectedAgentSecret) {
      this.logger.warn(`Invalid agent credentials: ${agentCode}`);
      throw new UnauthorizedException('Invalid agent credentials');
    }
  }

  /**
   * Get user balance
   */
  async getUserBalance(request: UserBalanceRequest): Promise<any> {
    try {
      this.verifyAgent(request.agent_code, request.agent_secret);

      const user = await this.userRepository.findOne({
        where: { usercode: request.user_code },
      });

      if (!user) {
        this.logger.warn(`User not found: ${request.user_code}`);
        return {
          status: 0,
          user_balance: 0,
          msg: 'USER_NOT_FOUND',
        };
      }

      // Get balance type from Redis (set during game launch)
      const cacheKey = `casino_balance_type:${request.user_code}`;
      const balanceType = (await this.redis.get(cacheKey)) as 'realBalance' | 'testBalance' || 'realBalance';
      const userBalance = user[balanceType] || 0;

      // Check if user has sufficient funds
      if (userBalance <= 0) {
        return {
          status: 0,
          user_balance: 0,
          msg: 'INSUFFICIENT_USER_FUNDS',
        };
      }

      return {
        status: 1,
        user_balance: userBalance,
      };
    } catch (error) {
      this.logger.error('Error in getUserBalance:', error);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      return {
        status: 0,
        user_balance: 0,
        msg: 'INTERNAL_ERROR',
      };
    }
  }

  /**
   * Handle game callback (transaction)
   */
  async handleGameCallback(request: GameCallbackRequest): Promise<any> {
    try {
      this.verifyAgent(request.agent_code, request.agent_secret);

      const { slot, user_code } = request;

      // Get balance type from Redis (set during game launch)
      const cacheKey = `casino_balance_type:${user_code}`;
      const balanceType = (await this.redis.get(cacheKey)) as 'realBalance' | 'testBalance' || 'realBalance';

      // Use transaction to ensure data consistency
      return await this.dataSource.transaction(async (manager) => {
        // Lock user record for update
        const user = await manager.findOne(User, {
          where: { usercode: user_code },
          lock: { mode: 'pessimistic_write' },
        });

        if (!user) {
          this.logger.warn(`User not found: ${user_code}`);
          return {
            status: 0,
            user_balance: 0,
            msg: 'USER_NOT_FOUND',
          };
        }

        // Check for duplicate transaction (check both txn_id AND txn_type)
        // Some providers use the same txn_id for debit and credit of the same round
        const existingTxn = await manager.findOne(CasinoTransaction, {
          where: { 
            txnId: slot.txn_id,
            txnType: slot.txn_type,
          },
        });

        if (existingTxn) {
          this.logger.warn(`Duplicate transaction: ${slot.txn_id} (${slot.txn_type})`);
          return {
            status: 1,
            user_balance: user[balanceType],
          };
        }

        // Calculate new balance based on transaction type
        let currentBalance = user[balanceType];
        let newBalance = currentBalance;

        switch (slot.txn_type) {
          case 'debit':
            // Only deduct bet amount
            if (currentBalance < slot.bet) {
              return {
                status: 0,
                user_balance: currentBalance,
                msg: 'INSUFFICIENT_USER_FUNDS',
              };
            }
            newBalance = currentBalance - slot.bet;
            break;

          case 'credit':
            // Only add win amount
            console.log("slot win:", slot.win);
            newBalance = currentBalance + slot.win;
            break;

          case 'debit_credit':
            // Deduct bet and add win
            if (currentBalance < slot.bet) {
              return {
                status: 0,
                user_balance: currentBalance,
                msg: 'INSUFFICIENT_USER_FUNDS',
              };
            }
            newBalance = currentBalance - slot.bet + slot.win;
            break;

          default:
            throw new BadRequestException('Invalid transaction type');
        }

        // Update user balance
        user[balanceType] = newBalance;
        await manager.save(User, user);

        // Create transaction record
        const casinoTxn = manager.create(CasinoTransaction, {
          userId: user.id,
          userCode: user_code,
          providerCode: slot.provider_code,
          gameCode: slot.game_code,
          gameType: request.game_type,
          roundId: slot.round_id,
          roundType: slot.type,
          txnId: slot.txn_id,
          txnType: slot.txn_type,
          betAmount: slot.bet || 0,
          winAmount: slot.win || 0,
          userBeforeBalance: slot.user_before_balance,
          userAfterBalance: newBalance,
          balanceType: balanceType, // Track which balance was used
          agentBeforeBalance: slot.agent_before_balance,
          agentAfterBalance: slot.agent_after_balance,
          userTotalDebit: request.user_total_debit,
          userTotalCredit: request.user_total_credit,
        });

        await manager.save(CasinoTransaction, casinoTxn);

        this.logger.log(
          `Transaction processed: ${slot.txn_id} | User: ${user_code} | Type: ${slot.txn_type} | Bet: ${slot.bet} | Win: ${slot.win} | New Balance: ${newBalance}`,
        );

        // ✅ Emit real-time balance update to frontend
        this.depositGateway.sendCasinoBalanceUpdate(user.id, {
          transactionType: slot.txn_type,
          betAmount: slot.bet || 0,
          winAmount: slot.win || 0,
          newBalance: newBalance,
          providerCode: slot.provider_code,
          gameCode: slot.game_code,
          txnId: slot.txn_id,
          balanceType: balanceType,
        });

        return {
          status: 1,
          user_balance: newBalance,
        };
      });
    } catch (error) {
      this.logger.error('Error in handleGameCallback:', error);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      return {
        status: 0,
        user_balance: 0,
        msg: 'INTERNAL_ERROR',
      };
    }
  }

  /**
   * Handle money callback (deposits/withdrawals)
   */
  async handleMoneyCallback(request: MoneyCallbackRequest): Promise<any> {
    try {
      this.verifyAgent(request.agent_code, request.agent_secret);

      this.logger.log(
        `Money callback received: User: ${request.user_code} | Type: ${request.type} | Amount: ${request.amount}`,
      );
      
      // Uncomment below for debugging if needed:
      // this.logger.debug(`Full money_callback request:`, JSON.stringify(request, null, 2));

      // Handle credit/debit transactions from money_callback
      // NOTE: If provider_code and game_code are present, this is a game transaction
      // that was already (or will be) processed by game_callback.
      // We just acknowledge it to avoid double processing.
      if (request.type === 'credit' || request.type === 'debit' || request.type === 'debit_credit') {
        const user = await this.userRepository.findOne({
          where: { usercode: request.user_code },
        });

        if (!user) {
          this.logger.warn(`User not found in money_callback: ${request.user_code}`);
          return {
            status: 0,
            user_balance: 0,
            msg: 'USER_NOT_FOUND',
          };
        }

        // Check if this is a game-related transaction (has provider and game code)
        // If yes, it's already processed by game_callback, so just return current balance
        if (request.provider_code && request.game_code) {
          this.logger.log(
            `ℹ️  Money callback acknowledged (game transaction, no balance change): User ${request.user_code} | Type: ${request.type} | Current Balance: ${user.realBalance}`,
          );

          return {
            status: 1,
            user_balance: user.realBalance,
            msg: 'SUCCESS',
          };
        }

        // If no provider/game code, this is a standalone money transaction
        // Process it normally
        let newBalance = user.realBalance;

        switch (request.type) {
          case 'credit':
            this.logger.log(`💰 Credit: Adding ${request.amount} to user ${request.user_code}`);
            newBalance = user.realBalance + Math.abs(request.amount);
            break;
          
          case 'debit':
            this.logger.log(`💸 Debit: Deducting ${request.amount} from user ${request.user_code}`);
            const debitAmount = Math.abs(request.amount);
            if (user.realBalance < debitAmount) {
              return {
                status: 0,
                user_balance: user.realBalance,
                msg: 'INSUFFICIENT_USER_FUNDS',
              };
            }
            newBalance = user.realBalance - debitAmount;
            break;
          
          case 'debit_credit':
            this.logger.warn(`⚠️ Received debit_credit in money_callback for user ${request.user_code}`);
            break;
        }

        // Update user balance
        user.realBalance = newBalance;
        await this.userRepository.save(user);

        this.logger.log(
          `✅ Money callback processed: User ${request.user_code} | Type: ${request.type} | Old: ${request.user_before_balance} | New: ${newBalance}`,
        );

        // ✅ Emit real-time balance update to frontend
        if (request.type === 'credit' || request.type === 'debit') {
          this.depositGateway.sendCasinoBalanceUpdate(user.id, {
            transactionType: request.type === 'credit' ? 'credit' : 'debit',
            betAmount: request.type === 'debit' ? Math.abs(request.amount) : 0,
            winAmount: request.type === 'credit' ? Math.abs(request.amount) : 0,
            newBalance: newBalance,
            providerCode: request.provider_code || 'unknown',
            gameCode: request.game_code || 'unknown',
            txnId: `money_${Date.now()}`,
            balanceType: 'realBalance', // Money callbacks always use realBalance
          });
        }

        return {
          status: 1,
          user_balance: newBalance,
          msg: 'SUCCESS',
        };
      }

      // For other types (deposit, withdraw), just acknowledge
      return {
        status: 1,
        msg: 'SUCCESS',
      };
    } catch (error) {
      this.logger.error('Error in handleMoneyCallback:', error);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      return {
        status: 0,
        msg: 'INTERNAL_ERROR',
      };
    }
  }
}

