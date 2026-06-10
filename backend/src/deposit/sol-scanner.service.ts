import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
  Inject,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import {
  Connection,
  PublicKey,
  ParsedInstruction,
  ParsedConfirmedTransaction,
  PartiallyDecodedInstruction,
} from '@solana/web3.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { User } from 'src/auth/entities/user.entity';
import { getAssociatedTokenAddress } from '@solana/spl-token';
import Redis from 'ioredis';

@Injectable()
export class SolScannerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SolScannerService.name);
  private connection: Connection;
  private running = false;
  private interval: NodeJS.Timeout;
  private readonly usdcMint: PublicKey;
  private readonly usdtMint: PublicKey;

  /** Keeps track of the last processed signature per user (now backed by Redis) */
  private lastProcessed: Record<string, string> = {};
  private readonly REDIS_KEY_PREFIX = 'sol_last_sig:';

  constructor(
    private config: ConfigService,
    @InjectQueue('deposits') private depositQueue: Queue,
    @InjectRepository(User) private userRepo: Repository<User>,
    @Inject('REDIS_CLIENT') private redis: Redis,
  ) {
    const DEFAULT_SOLANA_RPC = 'https://api.mainnet-beta.solana.com';
    const rawRpc = this.config.get<string>('SOLANA_RPC');
    const rpcUrl = rawRpc && /^https?:\/\//i.test(rawRpc) ? rawRpc : DEFAULT_SOLANA_RPC;
    if (rawRpc && !/^https?:\/\//i.test(rawRpc)) {
      this.logger.warn(`Invalid SOLANA_RPC "${rawRpc}", falling back to ${DEFAULT_SOLANA_RPC}`);
    }
    this.connection = new Connection(rpcUrl, 'confirmed');

    this.usdcMint = new PublicKey(
      this.config.get<string>('SOLANA_USDC_ADDRESS')!,
    );
    this.usdtMint = new PublicKey(
      this.config.get<string>('SOLANA_USDT_ADDRESS')!,
    );
  }

  async onModuleInit() {
    if (this.config.get('DEV', 'AnyDev') !== 'thomasken900125') return;
    await this.loadLastProcessedSignatures();
    this.start();
  }

  async onModuleDestroy() {
    this.stop();
    await this.saveLastProcessedSignatures();
  }

  /** Load last processed signatures from Redis on startup */
  private async loadLastProcessedSignatures() {
    try {
      const keys = await this.redis.keys(`${this.REDIS_KEY_PREFIX}*`);
      for (const key of keys) {
        const address = key.replace(this.REDIS_KEY_PREFIX, '');
        const signature = await this.redis.get(key);
        if (signature) {
          this.lastProcessed[address] = signature;
        }
      }
      this.logger.log(`Loaded ${keys.length} last processed signatures from Redis`);
    } catch (err: any) {
      this.logger.warn(`Failed to load last processed signatures: ${err.message}`);
    }
  }

  /** Save last processed signatures to Redis */
  private async saveLastProcessedSignatures() {
    try {
      for (const [address, signature] of Object.entries(this.lastProcessed)) {
        await this.redis.set(`${this.REDIS_KEY_PREFIX}${address}`, signature);
      }
      this.logger.log(`Saved ${Object.keys(this.lastProcessed).length} signatures to Redis`);
    } catch (err: any) {
      this.logger.warn(`Failed to save last processed signatures: ${err.message}`);
    }
  }

  private start() {
    if (this.running) return;
    this.running = true;
    const intervalMs = +this.config.get<number>(
      'SOLANA_SCAN_INTERVAL_MS',
    )! || 15000;
    this.interval = setInterval(() => this.poll(), intervalMs);
    this.logger.log(`✅ Solana scanner started (interval=${intervalMs}ms)`);
  }

  private stop() {
    if (this.interval) clearInterval(this.interval);
    this.running = false;
  }

  private async poll() {
    try {
      const monitoredUsers = await this.userRepo.find({
        select: ['id', 'SOLAddress'],
        where: { SOLAddress: Not('') },
      });

      for (const user of monitoredUsers) {
        if (!user.SOLAddress) continue;

        try {
          const address = new PublicKey(user.SOLAddress);

          // Fetch latest signatures
          const signatures = await this.connection.getSignaturesForAddress(
            address,
            { limit: 20 },
          );

          const lastSig = this.lastProcessed[user.SOLAddress];
          let newSigs = signatures;
          if (lastSig) {
            const index = signatures.findIndex((s) => s.signature === lastSig);
            if (index >= 0) newSigs = signatures.slice(0, index);
          }

          for (const sig of newSigs.reverse()) {
            const tx = await this.connection.getParsedTransaction(sig.signature, {
              commitment: 'confirmed',
            });
            if (!tx) continue;

            await this.handleSolTransfer(tx, sig.signature, user);
            await this.handleSplTransfers(tx, sig.signature, user);

            this.lastProcessed[user.SOLAddress] = sig.signature;
            // Persist to Redis immediately
            await this.redis.set(`${this.REDIS_KEY_PREFIX}${user.SOLAddress}`, sig.signature);
          }
        } catch (err: any) {
          this.logger.warn(`Error scanning SOL address ${user.SOLAddress}: ${err.message}`);
        }
      }
    } catch (err: any) {
      this.logger.error(`❌ Error polling Solana: ${err.message}`, err.stack);
    }
  }

  /** 🔹 Handle SOL deposits */
  private async handleSolTransfer(
    tx: ParsedConfirmedTransaction,
    signature: string,
    user: User,
  ) {
    if (!tx.meta || !tx.transaction) return;

    const userIndex = tx.transaction.message.accountKeys.findIndex(
      (acc) => acc.pubkey.toBase58() === user.SOLAddress,
    );
    if (userIndex === -1) return;

    const pre = tx.meta.preBalances?.[userIndex];
    const post = tx.meta.postBalances?.[userIndex];
    const lamports = post - pre;

    if (lamports <= 0 || isNaN(lamports)) {
      this.logger.warn(
        `Skipping SOL tx ${signature} for ${user.SOLAddress} (pre=${pre}, post=${post})`,
      );
      return;
    }

    const amount = (lamports / 1e9).toFixed(9);
    const payload = {
      chain: 'solana',
      token: 'SOL',
      txHash: signature,
      to: user.SOLAddress,
      from: tx.transaction.message.accountKeys[0].pubkey.toBase58(),
      amount,
      blockNumber: tx.slot,
      confirmations: 1,
    };

    await this.enqueueDeposit(payload);
  }

  /** 🔹 Handle USDC / USDT deposits */
  private async handleSplTransfers(
    tx: ParsedConfirmedTransaction,
    signature: string,
    user: User,
  ) {
    if (!tx.transaction?.message?.instructions) return;

    // Combine main and inner instructions
    const instructions: (ParsedInstruction | PartiallyDecodedInstruction)[] = [
      ...(tx.transaction.message.instructions),
      ...tx.meta?.innerInstructions?.flatMap((inner) => inner.instructions) ?? [],
    ];

    const parsedInstructions = instructions.filter(
      (ix): ix is ParsedInstruction => 'parsed' in ix
    );

    for (const ix of parsedInstructions) {
      if (ix.program !== 'spl-token') continue;
      const parsed = ix.parsed as any;
      if (parsed.type !== 'transfer' && parsed.type !== 'transferChecked') continue;

      const mint = new PublicKey(parsed.info.mint);
      const destTokenAccount = new PublicKey(parsed.info.destination);

      // Dynamically compute user ATA
      const userTokenAccount = await getAssociatedTokenAddress(
        mint,
        new PublicKey(user.SOLAddress),
      );

      if (!destTokenAccount.equals(userTokenAccount)) continue;

      const rawAmount = Number(parsed.info.amount ?? parsed.info.tokenAmount?.amount);
      if (isNaN(rawAmount) || rawAmount <= 0) continue;

      const tokenSymbol = mint.equals(this.usdcMint)
        ? 'USDC'
        : mint.equals(this.usdtMint)
          ? 'USDT'
          : null;
      if (!tokenSymbol) continue;

      const decimals = 6; // USDC/USDT
      const amount = (rawAmount / 10 ** decimals).toFixed(decimals);

      const payload = {
        chain: 'solana',
        token: tokenSymbol,
        txHash: signature,
        to: destTokenAccount.toBase58(),
        from: parsed.info.source,
        amount,
        blockNumber: tx.slot,
        confirmations: 1,
      };

      await this.enqueueDeposit(payload);
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
    await this.depositQueue.add('new-deposit', payload, {
      jobId,
      removeOnComplete: true,
      attempts: 3,
      backoff: { type: 'exponential', delay: 1000 },
    });

    this.logger.debug(
      `💰 Enqueued ${payload.token} deposit ${jobId} amount=${payload.amount}`,
    );
  }
}
