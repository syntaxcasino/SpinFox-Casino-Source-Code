import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Transaction, TokenType, ChainType } from '../transaction/entities/transaction.entity';
import { User } from '../auth/entities/user.entity';
import Decimal from 'decimal.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { DepositGateway } from '../deposit/deposit.gateway';

// Chain-specific withdrawal fees (in USD)
const WITHDRAWAL_FEES: Record<ChainType, number> = {
  ethereum: 5.0, // Higher gas fees
  optimism: 0.5, // Lower L2 fees
  arbitrum: 0.5,
  base: 0.5,
  'ethereum-sepolia': 1.0, // Lower testnet fees
  'optimism-sepolia': 0.25,
  'arbitrum-sepolia': 0.25,
  'base-sepolia': 0.25,
  solana: 0.1, // Very low fees
  segwit: 1.0, // BTC network fee
};

// Minimum withdrawal amounts (in USD)
const MIN_WITHDRAWAL: Record<TokenType, number> = {
  USDC: 10,
  USDT: 10,
  ETH: 0.01,
  BTC: 0.001,
  SOL: 0.1,
};

@Injectable()
export class WithdrawalService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepo: Repository<Transaction>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectQueue('withdrawals') private readonly withdrawalQueue: Queue,
    private readonly dataSource: DataSource,
    private readonly depositGateway: DepositGateway,
  ) {}

  /**
   * Get withdrawal fee for a specific chain
   */
  getWithdrawalFee(chain: ChainType): number {
    return WITHDRAWAL_FEES[chain] || 1.0;
  }

  /**
   * Create a withdrawal transaction and queue it for processing
   */
  async createWithdrawal(
    userId: number,
    token: TokenType,
    amount: string,
    walletAddress: string,
    chain: ChainType,
  ) {
    return await this.dataSource.transaction(async (manager) => {
      // 1️⃣ Validate amount
      const amountDecimal = new Decimal(amount);
      if (amountDecimal.lte(0)) {
        throw new BadRequestException('Amount must be greater than 0');
      }

      // 2️⃣ Validate supported chain + token combination
      this.validateChainTokenPair(chain, token);

      // 3️⃣ Check minimum withdrawal
      const minAmount = MIN_WITHDRAWAL[token];
      if (minAmount && amountDecimal.lt(minAmount)) {
        throw new BadRequestException(`Minimum withdrawal for ${token} is ${minAmount}`);
      }

      // 4️⃣ Get user with lock
      const user = await manager.findOne(User, {
        where: { id: userId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // 5️⃣ Calculate fee and total amount needed
      const fee = this.getWithdrawalFee(chain);
      const totalAmount = amountDecimal.plus(fee);

      // 6️⃣ Check user balance
      const balanceField = this.getBalanceField(token);
      const currentBalance = new Decimal((user[balanceField] as string) || '0');

      if (currentBalance.lt(totalAmount)) {
        throw new BadRequestException(
          `Insufficient balance. You need $${totalAmount.toFixed(2)} (including $${fee.toFixed(2)} fee), but you have $${currentBalance.toFixed(2)}`,
        );
      }

      // 7️⃣ Deduct from user balance (amount + fee)
      (user[balanceField] as string) = currentBalance.minus(totalAmount).toFixed();
      
      // ✅ Update USD balance (realBalance for mainnet, testBalance for testnet)
      if (token === 'USDC' || token === 'USDT') {
        const usdBalanceField = await this.getUSDBalanceField(chain);
        user[usdBalanceField] = parseFloat((user[balanceField] as string));
      }
      
      await manager.save(user);

      // 8️⃣ Create withdrawal transaction (store the withdrawal amount, not including fee)
      const tx = this.transactionRepo.create({
        userId: userId.toString(),
        walletAddress,
        token,
        amount: amount, // The amount user will receive
        chain,
        type: 'withdraw',
        status: 'pending',
        notes: `Fee: $${fee.toFixed(2)} (withdrawn from real balance)`,
      });

      const savedTx = await manager.save(Transaction, tx);

      // 9️⃣ Queue withdrawal job for worker processing
      await this.withdrawalQueue.add('new-withdrawal', { txId: savedTx.id }, {
        jobId: savedTx.id,
        removeOnComplete: false,
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
      });

      // ✅ Emit real-time balance update to frontend
      this.depositGateway.sendWithdrawalUpdate(userId, {
        amount: parseFloat(amount),
        fee,
        token,
        chain,
        newRealBalance: user.realBalance,
        newTestBalance: user.testBalance,
        balanceType: token === 'USDC' || token === 'USDT' ? await this.getUSDBalanceField(chain) : undefined,
        withdrawalId: Number(savedTx.id),
      });

      return savedTx;
    });
  }

  /**
   * Get user's balance field for a token and chain
   * Use realBalance for mainnet, testBalance for testnet
   */
  private async getUSDBalanceField(chain: ChainType): Promise<'realBalance' | 'testBalance'> {
    const { getBalanceFieldByChain } = await import('../utils/network.utils');
    return getBalanceFieldByChain(chain);
  }
  
  /**
   * Get user's crypto balance field for a token (ETH, BTC, etc.)
   */
  private getBalanceField(token: TokenType): keyof User {
    const tokenMap: Record<TokenType, keyof User> = {
      USDT: 'usdtBalance',
      USDC: 'usdcBalance',
      ETH: 'ethBalance',
      BTC: 'btcBalance',
      SOL: 'solBalance',
    };
    return tokenMap[token] || 'realBalance';
  }

  /**
   * Validate whether the chain supports the given token
   * Only allow USDC and USDT for specified chains
   */
  private validateChainTokenPair(chain: ChainType, token: TokenType): void {
    // Only allow USDC and USDT withdrawals for these chains
    const supportedMap: Record<ChainType, TokenType[]> = {
      ethereum: ['USDC', 'USDT'],
      optimism: ['USDC', 'USDT'],
      arbitrum: ['USDC', 'USDT'],
      base: ['USDC', 'USDT'],
      'ethereum-sepolia': ['USDC', 'USDT'],
      'optimism-sepolia': ['USDC', 'USDT'],
      'arbitrum-sepolia': ['USDC', 'USDT'],
      'base-sepolia': ['USDC', 'USDT'],
      solana: ['USDC', 'USDT'],
      segwit: [], // No withdrawals for BTC in this implementation
    };

    const supportedTokens = supportedMap[chain];

    if (!supportedTokens || supportedTokens.length === 0) {
      throw new BadRequestException(`Withdrawals not supported for chain: ${chain}`);
    }

    if (!supportedTokens.includes(token)) {
      throw new BadRequestException(`Token ${token} not supported on chain ${chain}. Supported tokens: ${supportedTokens.join(', ')}`);
    }
  }
}
