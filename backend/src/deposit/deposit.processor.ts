import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TransactionService } from 'src/transaction/transaction.service';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';
import { User } from 'src/auth/entities/user.entity';
import { Transaction, ChainType, TokenType } from '../transaction/entities/transaction.entity';
import { Connection } from '@solana/web3.js';
import axios from 'axios';
import Decimal from 'decimal.js';
import { DepositGateway } from './deposit.gateway';
import { ApiService } from 'src/api/api.service';
import { rpcManager, CHAIN_IDS } from '../utils/rpc-manager';

type BalanceField = 'ethBalance' | 'usdtBalance' | 'btcBalance' | 'solBalance' | 'usdcBalance';

@Processor('deposits')
@Injectable()
export class DepositProcessor extends WorkerHost {
  private readonly logger = new Logger(DepositProcessor.name);
  private providers: Record<string, ethers.providers.JsonRpcProvider> = {};

  constructor(
    private config: ConfigService,
    private transactionService: TransactionService,
    private dataSource: DataSource,
    private depositGateway: DepositGateway,
    private readonly apiService: ApiService
  ) {
    super();

    // Initialize providers asynchronously
    this.initializeProviders();
  }

  private async initializeProviders() {
    const chainMap = {
      ethereum: CHAIN_IDS.ETHEREUM_MAINNET,
      optimism: CHAIN_IDS.OPTIMISM,
      arbitrum: CHAIN_IDS.ARBITRUM,
      base: CHAIN_IDS.BASE,
      'ethereum-sepolia': CHAIN_IDS.ETHEREUM_SEPOLIA,
      'optimism-sepolia': CHAIN_IDS.OPTIMISM_SEPOLIA,
      'arbitrum-sepolia': CHAIN_IDS.ARBITRUM_SEPOLIA,
      'base-sepolia': CHAIN_IDS.BASE_SEPOLIA,
    };

    for (const [chainName, chainId] of Object.entries(chainMap)) {
      try {
        // Check if env var exists first
        const envRpc = this.config.get(`${chainName.toUpperCase()}_RPC`);
        let rpcUrl: string;
        
        if (envRpc) {
          rpcUrl = envRpc;
        } else {
          // Fetch from RPC manager
          rpcUrl = await rpcManager.getRPC(chainId);
        }
        
        this.providers[chainName] = new ethers.providers.JsonRpcProvider(rpcUrl);
        this.logger.debug(`Initialized provider for ${chainName}: ${rpcUrl}`);
      } catch (error) {
        this.logger.error(`Failed to initialize provider for ${chainName}:`, error);
      }
    }
  }

  async process(job: Job) {
    const payload = job.data as {
      chain: string;
      token: string;
      txHash: string;
      to: string;
      from: string;
      amount: string;
      blockNumber?: number;
    };

    const chain = payload.chain as ChainType;

    try {
      switch (chain) {
        case 'ethereum':
        case 'optimism':
        case 'arbitrum':
        case 'base':
        case 'ethereum-sepolia':
        case 'optimism-sepolia':
        case 'arbitrum-sepolia':
        case 'base-sepolia':
          await this.handleEvmDeposit(payload, chain);
          break;
        case 'solana':
          await this.handleSolanaDeposit(payload);
          break;
        case 'segwit':
          await this.handleBtcDeposit(payload);
          break;
        default:
          throw new Error(`Unsupported chain: ${chain}`);
      }
    } catch (err) {
      this.logger.warn(`Deposit failed for ${payload.txHash}@${chain}: ${err.message}`);
      await this.requeueJob(job);
    }
  }

  // ------------------- EVM -------------------
  private async handleEvmDeposit(payload: any, chain: ChainType) {
    const provider = this.providers[chain];
    if (!provider) throw new Error(`No provider for ${chain}`);

    const userId = await this.lookupUserIdByAddress(payload.to);

    // Reuse or create a pending transaction
    let tx = await this.transactionService.findByTxHash(payload.txHash);
    if (!tx) {
      // Format amount from base units to human-readable format
      const formattedAmount = this.formatTokenAmount(payload.amount, payload.token);
      
      tx = await this.transactionService.createTransaction({
        userId: userId.toString(),
        walletAddress: payload.to,
        txHash: payload.txHash,
        chain,
        token: payload.token as TokenType,
        amount: formattedAmount,
        blockNumber: payload.blockNumber,
        status: 'pending',
        type: 'deposit',
        confirmations: 0,
      });
    }

    const receipt = await provider.getTransactionReceipt(payload.txHash);
    if (!receipt) throw new Error('Transaction receipt not found');

    const latestBlock = await provider.getBlockNumber();
    const confirmations = Math.max(0, latestBlock - receipt.blockNumber + 1);
    const requiredConfirmations = +this.config.get(`CONFIRMATIONS_${chain.toUpperCase()}`, 3);

    if (confirmations >= requiredConfirmations) {
      if (receipt.status === 1 && tx.status !== 'confirmed') {
        await this.creditUser(userId, payload.token, payload.amount, tx, confirmations, chain);
        this.logger.debug(`✅ EVM deposit confirmed: ${payload.txHash}@${chain}`);
      } else if (receipt.status !== 1 && tx.status !== 'failed') {
        await this.transactionService.updateTransactionStatus(tx.txHash, 'failed');
      }
    } else {
      throw new Error(`Waiting for confirmations (${confirmations}/${requiredConfirmations})`);
    }
  }

  // ------------------- Solana -------------------
  private async handleSolanaDeposit(payload: any) {
    const DEFAULT_SOLANA_RPC = 'https://api.mainnet-beta.solana.com';
    const rawRpc = this.config.get<string>('SOLANA_RPC');
    const rpcUrl = rawRpc && /^https?:\/\//i.test(rawRpc) ? rawRpc : DEFAULT_SOLANA_RPC;
    if (rawRpc && !/^https?:\/\//i.test(rawRpc)) {
      this.logger?.warn?.(`Invalid SOLANA_RPC "${rawRpc}", falling back to ${DEFAULT_SOLANA_RPC}`);
    }
    const connection = new Connection(rpcUrl, 'confirmed');

    const userId = await this.lookupUserIdByAddress(payload.to);
    let tx = await this.transactionService.findByTxHash(payload.txHash);
    if (!tx) {
      // Format amount from base units to human-readable format
      const formattedAmount = this.formatTokenAmount(payload.amount, payload.token);
      
      tx = await this.transactionService.createTransaction({
        userId: userId.toString(),
        walletAddress: payload.to,
        txHash: payload.txHash,
        chain: 'solana',
        token: payload.token as TokenType,
        amount: formattedAmount,
        status: 'pending',
        type: 'deposit',
        confirmations: 0,
      });
    }
    // Fetch transaction info
    const txInfo = await connection.getTransaction(payload.txHash, { commitment: 'confirmed' });
    if (!txInfo || !txInfo.meta) throw new Error('Transaction not found or metadata missing');
    if (txInfo.meta.err) throw new Error('Transaction failed');

    // Use commitment=confirmed: treat as 1 confirmation
    const confirmations = 1;
    if (tx.status !== 'confirmed') {
      await this.creditUser(userId, payload.token, payload.amount, tx, confirmations, 'solana');
      this.logger.debug(`✅ Solana deposit confirmed: ${payload.txHash}`);
    }
  }

  // ------------------- Bitcoin -------------------
  private async handleBtcDeposit(payload: any) {
    const network = this.config.get('BTC_NETWORK') || 'mainnet';
    const baseUrl = network === 'testnet'
      ? 'https://blockstream.info/testnet/api'
      : 'https://blockstream.info/api';

    const userId = await this.lookupUserIdByAddress(payload.to);

    let tx = await this.transactionService.findByTxHash(payload.txHash);
    if (!tx) {
      // Format amount from base units to human-readable format
      const formattedAmount = this.formatTokenAmount(payload.amount, 'BTC');
      
      tx = await this.transactionService.createTransaction({
        userId: userId.toString(),
        walletAddress: payload.to,
        txHash: payload.txHash,
        chain: 'segwit',
        token: 'BTC',
        amount: formattedAmount,
        status: 'pending',
        type: 'deposit',
        confirmations: 0,
      });
    }

    const { data } = await axios.get(`${baseUrl}/tx/${payload.txHash}`);
    const confirmations = data.status?.confirmed ? data.status.confirmations : 0;

    if (confirmations >= +this.config.get('CONFIRMATIONS_BTC', 3) && tx.status !== 'confirmed') {
      await this.creditUser(userId, 'BTC', payload.amount, tx, confirmations, 'segwit');
      this.logger.debug(`✅ BTC deposit confirmed: ${payload.txHash}`);
    }
  }

  // ------------------- Helpers -------------------
  private async lookupUserIdByAddress(address: string): Promise<number> {
    // Try exact match first for case-sensitive addresses (BTC, SOL)
    let user = await this.dataSource.getRepository(User).findOne({
      where: [
        { EVMAddress: address },
        { SOLAddress: address },
        { BTCAddress: address },
        { SOLUSDCAddress: address },
        { SOLUSDTAddress: address },
      ],
    });

    // If not found, try lowercase for EVM addresses
    if (!user) {
      const normalized = address.toLowerCase();
      user = await this.dataSource.getRepository(User).findOne({
        where: [
          { EVMAddress: normalized },
          { SOLAddress: normalized },
          { BTCAddress: normalized },
          { SOLUSDCAddress: normalized },
          { SOLUSDTAddress: normalized },
        ],
      });
    }

    if (!user) throw new Error(`No user found for ${address}`);
    return user.id;
  }

  // ------------------- Helper to format token amounts -------------------
  private formatTokenAmount(amount: string, token: string): string {
    const tokenUpper = token.toUpperCase();
    
    // Check if amount already has a decimal point (already formatted)
    // This handles cases where Solana scanner pre-formats amounts
    if (amount.includes('.')) {
      return amount;
    }
    
    if (tokenUpper === 'USDT' || tokenUpper === 'USDC') {
      return ethers.utils.formatUnits(amount, 6);
    } else if (tokenUpper === 'ETH') {
      return ethers.utils.formatUnits(amount, 18);
    } else if (tokenUpper === 'BTC') {
      // Convert satoshis to BTC (1 BTC = 100,000,000 satoshis)
      return new Decimal(amount).div(1e8).toFixed(8);
    } else if (tokenUpper === 'SOL') {
      // SOL has 9 decimals
      return new Decimal(amount).div(1e9).toFixed(9);
    }
    
    return amount;
  }

  // ------------------- Helper to get USD price -------------------
  private async getUsdPrice(token: string): Promise<number> {
    switch (token.toUpperCase()) {
      case 'USDT':
      case 'USDC':
        return 1; // stablecoin
      case 'ETH':
        return await this.apiService.getEthUsdPrice(); // implement API call
      case 'BTC':
        return await this.apiService.getBtcUsdPrice();
      case 'SOL':
        return await this.apiService.getSolUsdPrice();
      default:
        throw new Error(`No USD price configured for token ${token}`);
    }
  }

  // ------------------- Credit User -------------------
  private async creditUser(
    userId: number,
    token: string,
    amount: string,
    transaction: Transaction,
    confirmations: number,
    chain: string,
  ) {
    const tokenMap: Record<string, BalanceField> = {
      USDT: 'usdtBalance',
      USDC: 'usdcBalance',
      ETH: 'ethBalance',
      BTC: 'btcBalance',
      SOL: 'solBalance',
    };
    const balanceField = tokenMap[token.toUpperCase()];
    if (!balanceField) throw new Error(`Unsupported token: ${token}`);

    // Convert from smallest units if necessary (e.g., wei → ETH, satoshis → BTC)
    const formattedAmount = this.formatTokenAmount(amount, token);

    // ✅ Get USD price for token
    const usdPrice = await this.getUsdPrice(token); // Implemented separately
    const usdAmount = new Decimal(formattedAmount).mul(usdPrice).toNumber();
    
    // ✅ Determine which balance to credit based on chain (mainnet vs testnet)
    const { getBalanceFieldByChain } = await import('../utils/network.utils');
    const usdBalanceField = getBalanceFieldByChain(chain);
    
    await this.dataSource.transaction(async manager => {
      const dep = await manager.findOne(Transaction, {
        where: { id: transaction.id },
        lock: { mode: 'pessimistic_write' },
      });
      if (!dep || dep.status === 'confirmed') {
        this.logger.warn(`⚠️ Transaction ${transaction.id} already confirmed, skipping`);
        return;
      }

      const user = await manager.findOne(User, {
        where: { id: userId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!user) throw new Error(`User ${userId} not found`);

      // Seamless mode: We manage balance locally, no need to sync with aggregator
      // Aggregator will call our user_balance callback when needed
      
      // Update USD balance (realBalance for mainnet, testBalance for testnet)
      user[usdBalanceField] = (user[usdBalanceField] || 0) + usdAmount;
      
      // Update token balance
      const currentBalance = new Decimal(user[balanceField] ?? '0');
      user[balanceField] = currentBalance.plus(formattedAmount).toFixed();

      dep.status = 'confirmed';
      dep.confirmations = confirmations;
      
      await manager.save([user, dep]);

      // ✅ Emit real-time event to frontend
      this.depositGateway.sendDepositConfirmed(userId, {
        // txHash: transaction.txHash,
        // chain,
        token,
        amount: formattedAmount,
        newRealBalance: user.realBalance,
        newTestBalance: user.testBalance,
        balanceType: usdBalanceField,
      });

      this.logger.debug(
        `💰 Credited ${formattedAmount} ${token} to user ${userId}. New ${usdBalanceField}: ${user[usdBalanceField]}`,
      );
    });
  }

  private async requeueJob(job: Job) {
    const delayMs = +this.config.get('CONFIRMATION_RECHECK_MS', '60000');
    try {
      await job.updateProgress(10);
      await job.moveToDelayed(delayMs);
    } catch (err) {
      this.logger.warn(`Requeue failed for job ${job.id}: ${err.message}`);
    }
  }
}
