// games/game.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ValueTransformer } from 'typeorm';
import { Bet } from './bet.entity';

// Transformer to convert decimal strings to numbers
const decimalToNumber: ValueTransformer = {
  to: (value: number) => value,
  from: (value: string) => parseFloat(value),
};

@Entity()
export class Game {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: ['slot', 'jackpot', 'table'] })
  type: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 1000, transformer: decimalToNumber })
  maxBet: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 96, transformer: decimalToNumber })
  defaultRTP: number;

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Bet, (bet) => bet.game)
  bets: Bet[];
}
