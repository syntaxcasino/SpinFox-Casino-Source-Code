import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import axios from 'axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class BtcScannerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(BtcScannerService.name);
  private running = false;
  private interval: NodeJS.Timeout;
  private network: 'mainnet' | 'testnet';
  private baseUrl: string;
  
  /** Track last processed transaction per address to avoid duplicates */
  private lastProcessedTx: Record<string, string> = {};

  constructor(
    private config: ConfigService,
    @InjectQueue('deposits') private depositQueue: Queue,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {
    this.network = this.config.get<string>('BTC_NETWORK') === 'testnet' ? 'testnet' : 'mainnet';
    this.baseUrl = this.network === 'testnet' 
      ? 'https://blockstream.info/testnet/api' 
      : 'https://blockstream.info/api';
  }

  onModuleInit() {
    if (this.config.get('DEV', 'AnyDev') !== 'thomasken900125') return;
    this.start();
  }

  onModuleDestroy() {
    this.stop();
  }

  private start() {
    if (this.running) return;
    this.running = true;
    const intervalMs: number = Number(this.config.get<string>('BTC_SCAN_INTERVAL_MS')) || 15000;
    this.interval = setInterval(() => this.poll(), intervalMs);
    this.logger.log(`BTC scanner started (network=${this.network}, interval=${intervalMs}ms)`);
  }

  private stop() {
    if (this.interval) clearInterval(this.interval);
    this.running = false;
  }

  private async poll() {
    try {
      // Fetch only users with non-empty BTC addresses
      const users = await this.userRepo.find({
        select: ['id', 'BTCAddress'],
        where: { BTCAddress: Not('') },
      });

      for (const user of users) {
        if (!user.BTCAddress) continue;

        try {
          // Fetch latest transactions for user BTC address
          const { data: txs } = await axios.get(`${this.baseUrl}/address/${user.BTCAddress}/txs`);
          
          // Filter for new transactions only
          const lastTxId = this.lastProcessedTx[user.BTCAddress];
          let newTxs = txs;
          if (lastTxId) {
            const index = txs.findIndex((t: any) => t.txid === lastTxId);
            if (index >= 0) newTxs = txs.slice(0, index);
          }

          for (const tx of newTxs) {
            const confirmations = tx.status?.confirmed ? tx.status.confirmed : 0;
            if (confirmations === 0) continue; // skip unconfirmed

            // Find outputs to user's address
            const output = tx.vout.find((v: any) => v.scriptpubkey_address === user.BTCAddress);
            if (!output) continue;

            const amount = output.value.toString(); // satoshis
            
            const payload = {
              chain: 'segwit',
              token: 'BTC',
              txHash: tx.txid,
              to: user.BTCAddress,
              from: tx.vin[0]?.prevout?.scriptpubkey_address ?? '',
              amount, // in satoshis
              blockNumber: tx.status.block_height,
              confirmations: tx.status.confirmed ? 1 : 0,
            };

            await this.enqueueDeposit(payload);
          }

          // Update last processed transaction
          if (newTxs.length > 0) {
            this.lastProcessedTx[user.BTCAddress] = newTxs[0].txid;
          }
        } catch (err: any) {
          this.logger.warn(`Error scanning BTC address ${user.BTCAddress}: ${err.message}`);
        }
      }
    } catch (err: any) {
      this.logger.error(`Error polling BTC: ${err.message}`, err.stack);
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
    confirmations: number;
  }) {
    const jobId = `${payload.chain}_${payload.txHash}`;
    try {
      await this.depositQueue.add('new-deposit', payload, {
        jobId,
        removeOnComplete: true,
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 },
      });
      this.logger.log(`Enqueued BTC deposit ${jobId} amount=${payload.amount}`);
    } catch (err) {
      this.logger.error(`Failed to enqueue BTC deposit ${jobId}: ${err.message}`);
    }
  }
}
