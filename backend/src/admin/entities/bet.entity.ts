// bets/bet.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, ValueTransformer } from 'typeorm';
import { User } from 'src/auth/entities/user.entity';
import { Game } from './game.entity';

// Transformer to convert decimal strings to numbers
const decimalToNumber: ValueTransformer = {
  to: (value: number) => value,
  from: (value: string) => parseFloat(value),
};

@Entity()
export class Bet {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.bets)
  user: User;

  @ManyToOne(() => Game, (game) => game.bets)
  game: Game;

  @Column({ type: 'decimal', precision: 18, scale: 2, transformer: decimalToNumber })
  amount: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0, transformer: decimalToNumber })
  winAmount: number;

  @Column({ type: 'enum', enum: ['pending', 'won', 'lost'], default: 'pending' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;
}
