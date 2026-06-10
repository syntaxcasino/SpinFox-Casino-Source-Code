import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ValueTransformer } from 'typeorm';

// Transformer to convert decimal strings to numbers
const decimalToNumber: ValueTransformer = {
  to: (value: number) => value,
  from: (value: string) => parseFloat(value),
};

@Entity()
export class Leaderboard {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  username: string;

  @Column({ nullable: true })
  avatarUrl: string;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0, transformer: decimalToNumber })
  totalStake: number;

  @Column({ type: 'int', default: 0 })
  totalWins: number;

  @Column({ type: 'int', default: 0 })
  totalBets: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0, transformer: decimalToNumber })
  totalWinAmount: number;

  @Column({ nullable: true })
  country: string;

  @Column({ type: 'int', default: 0 })
  rank: number;

  @Column({ type: 'enum', enum: ['daily', 'weekly', 'monthly', 'all-time'], default: 'all-time' })
  period: string;

  @Column({ type: 'enum', enum: ['all', 'casino', 'sports'], default: 'all' })
  type: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

