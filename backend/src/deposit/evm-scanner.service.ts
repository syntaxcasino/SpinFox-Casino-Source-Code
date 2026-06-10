import { Injectable, OnModuleInit, OnModuleDestroy, Logger, Inject } from '@nestjs/common';
import { ethers } from 'ethers';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Repository, Not } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ChainState } from './entities/chain-state.entity';
import { User } from '../auth/entities/user.entity';
import Redis from 'ioredis';
import { chains, getRPCUrl } from 'src/config';
import { ChainConfig } from 'src/config';
import { rpcManager } from 'src/utils/rpc-manager';

const TRANSFER_TOPIC = ethers.utils.id('Transfer(address,address,uint256)');
@Injectable()
export class EvmScannerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(EvmScannerService.name);
  private providers: Record<string, ethers.providers.FallbackProvider | ethers.providers.JsonRpcProvider> = {};
  private pollIntervalMs: number;
  private readonly iface = new ethers.utils.Interface([
    'event Transfer(address indexed from, address indexed to, uint256 value)',
  ]);
  
  // In-memory cache for deposit addresses (refreshed periodically)
  private depositAddressesCache: Set<string> = new Set();
  private lastCacheRefresh: number = 0;
  private readonly CACHE_REFRESH_INTERVAL = 60000; // 1 minute

  constructor(
    private config: ConfigService,
    @InjectQueue('deposits') private depositQueue: Queue,
    @InjectRepository(ChainState) private chainStateRepo: Repository<ChainState>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @Inject('REDIS_CLIENT') private redis: Redis,
  ) {
    this.pollIntervalMs = +this.config.get('SCANNER_POLL_MS', '5000');
  }

  async onModuleInit() {
    if (this.config.get('DEV', 'AnyDev') !== "thomasken900125")
      return;
    
    // Initialize Redis with all existing deposit addresses from database
    await this.initializeDepositAddresses();
    
    for (const chain of chains) {
      try {
        // Get multiple working RPCs for fallback
        this.logger.log(`Initializing provider for ${chain.name}...`);
        const workingRPCs = await rpcManager.getWorkingRPCs(chain.chainId, 3);
        
        if (workingRPCs.length === 0) {
          this.logger.error(`No working RPCs found for ${chain.name}, skipping...`);
          continue;
        }

        // Create providers with priority and weight
        const providers = workingRPCs.map((rpc, index) => ({
          provider: new ethers.providers.JsonRpcProvider(rpc),
          priority: index + 1, // Lower number = higher priority
          weight: 1,
          stallTimeout: 2000, // 2 second timeout before trying next provider
        }));

        // Use FallbackProvider for automatic retry and rotation
        if (providers.length > 1) {
          this.providers[chain.name] = new ethers.providers.FallbackProvider(providers);
          this.logger.debug(`✅ Created FallbackProvider for ${chain.name} with ${providers.length} RPCs`);
        } else {
          this.providers[chain.name] = providers[0].provider;
          this.logger.debug(`✅ Created single provider for ${chain.name}`);
        }

        // Always start from the latest block when service initializes
        const latestBlock = await this.providers[chain.name].getBlockNumber();
        
        let chainState = await this.chainStateRepo.findOne({
          where: { chain: chain.name },
        });

        if (!chainState) {
          chainState = this.chainStateRepo.create({
            chain: chain.name,
            lastProcessedBlock: latestBlock,
          });
          this.logger.log(`✅ Initialized chain state for ${chain.name} at block ${latestBlock}`);
        } else {
          chainState.lastProcessedBlock = latestBlock;
          this.logger.log(`✅ Reset chain state for ${chain.name} to latest block ${latestBlock} (was ${chainState.lastProcessedBlock})`);
        }
        
        await this.chainStateRepo.save(chainState);

        this.pollChain(chain).catch((err) =>
          this.logger.error(
            `❌ Polling error on ${chain.name}: ${err.message}`,
            err.stack,
          ),
        );
      } catch (err) {
        this.logger.error(
          `❌ Failed to initialize ${chain.name}: ${err instanceof Error ? err.message : String(err)}`,
          err instanceof Error ? err.stack : undefined,
        );
      }
    }
  }


  async onModuleDestroy() {
    await this.redis.quit();
  }

  // Initialize Redis with all deposit addresses from database on startup
  private async initializeDepositAddresses() {
    try {
      this.logger.log('Initializing deposit addresses from database...');
      
      // Fetch all users with EVM addresses
      const users = await this.userRepo.find({
        select: ['EVMAddress'],
        where: { EVMAddress: Not('') },
      });

      if (users.length === 0) {
        this.logger.warn('No users with EVM addresses found in database');
        return;
      }

      // Populate Redis with all EVM addresses
      const ADDRESS_SET_KEY = 'deposit_addresses_set';
      const addresses = users
        .map(user => user.EVMAddress?.toLowerCase())
        .filter(addr => addr); // Filter out any null/undefined

      if (addresses.length > 0) {
        await this.redis.sadd(ADDRESS_SET_KEY, ...addresses);
        this.logger.log(`✅ Loaded ${addresses.length} deposit addresses into Redis`);
      }
    } catch (error) {
      this.logger.error(`Failed to initialize deposit addresses: ${error.message}`, error.stack);
    }
  }

  // Refresh deposit addresses cache from Redis
  private async refreshAddressCache() {
    const now = Date.now();
    if (now - this.lastCacheRefresh < this.CACHE_REFRESH_INTERVAL) {
      return; // Cache still fresh
    }
    
    try {
      const ADDRESS_SET_KEY = `deposit_addresses_set`;
      const addresses = await this.redis.smembers(ADDRESS_SET_KEY);
      this.depositAddressesCache = new Set(addresses.map(addr => addr.toLowerCase()));
      this.lastCacheRefresh = now;
      this.logger.debug(`Refreshed address cache: ${this.depositAddressesCache.size} addresses`);
    } catch (error) {
      this.logger.error(`Failed to refresh address cache: ${error.message}`);
    }
  }

  // Check if address is a deposit address (uses in-memory cache)
  private isDepositAddress(address: string): boolean {
    return this.depositAddressesCache.has(address.toLowerCase());
  }

  // Calculate dynamic batch size based on lag
  private calculateBatchSize(lag: number, baseBatchSize: number): number {
    if (lag < 10) return baseBatchSize; // No lag, use base size
    if (lag < 100) return baseBatchSize * 2; // Small lag, double batch size
    if (lag < 1000) return baseBatchSize * 5; // Medium lag, 5x batch size
    return baseBatchSize * 10; // Heavy lag, 10x batch size (max)
  }

  private async pollChain(chain: ChainConfig) {
    let provider = this.providers[chain.name];
    const BASE_BATCH_SIZE = +this.config.get('SCAN_BATCH_BLOCKS', '10');
    const MAX_BATCH_SIZE = +this.config.get('SCAN_MAX_BATCH_BLOCKS', '100');
    let consecutiveErrors = 0;
    const MAX_CONSECUTIVE_ERRORS = 5;

    while (true) {
      try {
        // Refresh address cache periodically
        await this.refreshAddressCache();

        const cs = await this.chainStateRepo.findOne({ where: { chain: chain.name } });
        if (!cs) {
          this.logger.warn(`No chain state found for ${chain.name}, skipping...`);
          await this.sleep(this.pollIntervalMs);
          continue;
        }

        const last = cs.lastProcessedBlock;
        const latest = await provider.getBlockNumber();
        const safeBlock = latest - chain.confirmations;
        const lag = safeBlock - last;
        
        // Dynamic batch sizing based on lag
        const dynamicBatchSize = Math.min(
          this.calculateBatchSize(lag, BASE_BATCH_SIZE),
          MAX_BATCH_SIZE
        );
        
        const maxBlockToProcess = Math.max(last, Math.min(safeBlock, last + dynamicBatchSize));

        // Reset error counter on successful RPC call
        consecutiveErrors = 0;

        if (maxBlockToProcess <= last) {
          await this.sleep(this.pollIntervalMs);
          continue;
        }

        // Log lag if significant
        if (lag > 50) {
          this.logger.warn(`${chain.name} scanner lag: ${lag} blocks behind, using batch size: ${dynamicBatchSize}`);
        }

        // --- 1) ERC20 logs (USDT/USDC) ---
        const tokenPromises: Promise<void>[] = [];
        
        if (chain.usdtAddress) {
          tokenPromises.push(
            (async () => {
              try {
                const logs = await provider.getLogs({
                  address: chain.usdtAddress,
                  fromBlock: last + 1,
                  toBlock: maxBlockToProcess,
                  topics: [TRANSFER_TOPIC],
                });

                for (const log of logs) {
                  try {
                    const parsed = this.iface.parseLog(log);
                    const to = parsed.args.to;
                    // Use in-memory cache instead of Redis
                    if (this.isDepositAddress(to)) {
                      await this.enqueueDeposit(
                        {
                          chain: chain.name,
                          token: 'USDT',
                          txHash: log.transactionHash,
                          to,
                          from: parsed.args.from,
                          amount: parsed.args.value.toString(),
                          blockNumber: log.blockNumber,
                        },
                        chain.confirmations,
                      );
                    }
                  } catch (err: any) {
                    this.logger.warn(`Failed to process USDT log: ${err.message}`);
                  }
                }
              } catch (err: any) {
                this.logger.warn(`Failed to fetch USDT logs for ${chain.name}: ${err.message}`);
              }
            })()
          );
        }
        
        if (chain.usdcAddress) {
          tokenPromises.push(
            (async () => {
              try {
                const logs = await provider.getLogs({
                  address: chain.usdcAddress,
                  fromBlock: last + 1,
                  toBlock: maxBlockToProcess,
                  topics: [TRANSFER_TOPIC],
                });

                for (const log of logs) {
                  try {
                    const parsed = this.iface.parseLog(log);
                    const to = parsed.args.to;
                    // Use in-memory cache instead of Redis
                    if (this.isDepositAddress(to)) {
                      await this.enqueueDeposit(
                        {
                          chain: chain.name,
                          token: 'USDC',
                          txHash: log.transactionHash,
                          to,
                          from: parsed.args.from,
                          amount: parsed.args.value.toString(),
                          blockNumber: log.blockNumber,
                        },
                        chain.confirmations,
                      );
                    }
                  } catch (err: any) {
                    this.logger.warn(`Failed to process USDC log: ${err.message}`);
                  }
                }
              } catch (err: any) {
                this.logger.warn(`Failed to fetch USDC logs for ${chain.name}: ${err.message}`);
              }
            })()
          );
        }
        
        // Wait for all token log processing to complete in parallel
        await Promise.all(tokenPromises);

        // --- 2) ETH transfers (parallel processing) ---
        const PARALLEL_BLOCKS = Math.min(10, maxBlockToProcess - last); // Process max 10 blocks in parallel
        const blockPromises: Promise<void>[] = [];
        
        for (let b = last + 1; b <= maxBlockToProcess; b++) {
          blockPromises.push(
            (async (blockNum) => {
              try {
                const block = await provider.getBlockWithTransactions(blockNum);
                if (!block) return;
                
                for (const tx of block.transactions) {
                  if (!tx.to) continue;
                  
                  try {
                    const to = ethers.utils.getAddress(tx.to);
                    // Use in-memory cache instead of Redis
                    if (this.isDepositAddress(to) && tx.value && !tx.value.isZero()) {
                      await this.enqueueDeposit(
                        {
                          chain: chain.name,
                          token: 'ETH',
                          txHash: tx.hash,
                          to,
                          from: tx.from,
                          amount: tx.value.toString(),
                          blockNumber: block.number,
                        },
                        chain.confirmations,
                      );
                    }
                  } catch (err: any) {
                    // Skip invalid transactions
                  }
                }
              } catch (err: any) {
                this.logger.warn(`Failed to process block ${blockNum} for ${chain.name}: ${err.message}`);
              }
            })(b)
          );
          
          // Process blocks in batches to avoid overwhelming the RPC
          if (blockPromises.length >= PARALLEL_BLOCKS || b === maxBlockToProcess) {
            await Promise.all(blockPromises);
            blockPromises.length = 0; // Clear array
          }
        }

        cs.lastProcessedBlock = maxBlockToProcess;
        await this.chainStateRepo.save(cs);

      } catch (err: any) {
        consecutiveErrors++;
        this.logger.error(
          `Error polling chain ${chain.name} (${consecutiveErrors}/${MAX_CONSECUTIVE_ERRORS}): ${err.message}`, 
          err.stack
        );

        // If we hit too many consecutive errors, try to refresh the provider
        if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
          this.logger.warn(`Too many consecutive errors for ${chain.name}, refreshing provider...`);
          try {
            const workingRPCs = await rpcManager.getWorkingRPCs(chain.chainId, 3);
            if (workingRPCs.length > 0) {
              const providers = workingRPCs.map((rpc, index) => ({
                provider: new ethers.providers.JsonRpcProvider(rpc),
                priority: index + 1,
                weight: 1,
                stallTimeout: 2000,
              }));

              if (providers.length > 1) {
                this.providers[chain.name] = new ethers.providers.FallbackProvider(providers);
                provider = this.providers[chain.name];
                this.logger.log(`✅ Refreshed FallbackProvider for ${chain.name} with ${providers.length} RPCs`);
              } else {
                this.providers[chain.name] = providers[0].provider;
                provider = this.providers[chain.name];
                this.logger.log(`✅ Refreshed provider for ${chain.name}`);
              }
              consecutiveErrors = 0; // Reset after successful refresh
            }
          } catch (refreshErr: any) {
            this.logger.error(`Failed to refresh provider for ${chain.name}: ${refreshErr.message}`);
          }
        }

        await this.sleep(5000);
      }
    }
  }

  private async enqueueDeposit(payload: {
    chain: string;
    token: string;
    txHash: string;
    to: string;
    from: string;
    amount: string;
    blockNumber: number;
  }, confirmations: number) {
    const jobId = `${payload.chain}_${payload.txHash}`;
    try {
      await this.depositQueue.add('new-deposit', payload, {
        jobId,
        removeOnComplete: true,
        attempts: 5,
        backoff: { type: 'exponential', delay: 1000 },
      });
      this.logger.debug(`💰 Enqueued ${payload.token} deposit ${jobId} amount=${payload.amount}`);
    } catch (err: any) {
      // Job already exists, ignore
      if (err.message?.includes('already exists')) {
        this.logger.debug(`Deposit ${jobId} already enqueued`);
      } else {
        this.logger.warn(`Failed to enqueue deposit ${jobId}: ${err.message}`);
      }
    }
  }

  private sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
