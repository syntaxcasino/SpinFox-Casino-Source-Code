import { Entity, Column, PrimaryGeneratedColumn, Index, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export type DepositStatus = 'pending' | 'confirmed' | 'failed';
export type WithdrawalStatus = 'pending' | 'approved' | 'rejected' | 'processing' | 'completed' | 'failed';
export type TokenType = 'ETH' | 'USDT' | 'BTC' | 'SOL' | 'USDC';
export type ChainType = 'ethereum' | 'optimism' | 'arbitrum' | 'base' | 'ethereum-sepolia' | 'optimism-sepolia' | 'arbitrum-sepolia' | 'base-sepolia' | 'solana' | 'segwit';
export type TransactionType = 'deposit' | 'withdraw' | 'bonus' | 'win' | 'refund';
export type TransactionStatus = DepositStatus | WithdrawalStatus;

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  userId: string;

  @Index()
  @Column()
  walletAddress: string;

  @Index()
  @Column({ nullable: true })
  txHash: string; // EVM tx hash or Solana signature

  @Column({ type: 'varchar' })
  chain: ChainType;

  @Column({ type: 'varchar' })
  token: TokenType;

  @Column({ type: 'numeric', precision: 36, scale: 18 })
  amount: string;

  @Column({ type: 'int', nullable: true })
  blockNumber?: number; // EVM block, optional for Solana

  @Column({ type: 'bigint', nullable: true })
  slot?: number; // Solana slot number

  @Column({ type: 'int', default: 0 })
  confirmations: number; // EVM numeric confirmations OR Solana commitment level as int

  @Column({ type: 'varchar', default: 'pending' })
  type: TransactionType;

  @Column({ type: 'varchar', default: 'pending' })
  status: TransactionStatus;

  @Column({ nullable: true })
  notes?: string;

  @Column({ nullable: true })
  processedBy?: string; // admin id or system

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
