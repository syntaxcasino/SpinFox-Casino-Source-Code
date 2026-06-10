import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';

@Entity('casino_transactions')
@Index(['txnId', 'txnType'], { unique: true })
@Index(['userId', 'createdAt'])
export class CasinoTransaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userCode: string;

  @Column()
  providerCode: string;

  @Column()
  gameCode: string;

  @Column()
  gameType: string;

  @Column({ nullable: true })
  roundId: string;

  @Column({ nullable: true })
  roundType: string; // BASE, FREESPIN, etc.

  @Column()
  txnId: string;

  @Column({ type: 'enum', enum: ['debit', 'credit', 'debit_credit'] })
  txnType: string;

  @Column({ type: 'decimal', precision: 20, scale: 2, default: 0 })
  betAmount: number;

  @Column({ type: 'decimal', precision: 20, scale: 2, default: 0 })
  winAmount: number;

  @Column({ type: 'decimal', precision: 20, scale: 2 })
  userBeforeBalance: number;

  @Column({ type: 'decimal', precision: 20, scale: 2 })
  userAfterBalance: number;

  @Column({ type: 'decimal', precision: 20, scale: 2, nullable: true })
  agentBeforeBalance: number;

  @Column({ type: 'decimal', precision: 20, scale: 2, nullable: true })
  agentAfterBalance: number;

  @Column({ type: 'decimal', precision: 20, scale: 2, nullable: true })
  userTotalDebit: number;

  @Column({ type: 'decimal', precision: 20, scale: 2, nullable: true })
  userTotalCredit: number;

  // Balance type used for this transaction
  @Column({ type: 'enum', enum: ['realBalance', 'testBalance'], default: 'realBalance' })
  balanceType: 'realBalance' | 'testBalance';

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

