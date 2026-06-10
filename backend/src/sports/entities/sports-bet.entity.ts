import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, UpdateDateColumn, ValueTransformer } from 'typeorm';
import { User } from 'src/auth/entities/user.entity';

export enum BetStatus {
  OPEN = 'open',
  WON = 'won',
  LOST = 'lost',
  CANCELLED = 'cancelled',
}

// Transformer to convert decimal strings to numbers
const decimalToNumber: ValueTransformer = {
  to: (value: number) => value,
  from: (value: string) => parseFloat(value),
};

@Entity('sports_bets')
export class SportsBet {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.sportsBets)
  user: User;

  @Column()
  userId: number;

  // Bet Type
  @Column({ type: 'enum', enum: ['single', 'parlay'], default: 'single' })
  betType: string;

  // Game/Market Information (for single bets or primary game in parlay)
  @Column({ nullable: true })
  gameId: string;

  @Column({ nullable: true })
  sportId: number;

  @Column({ nullable: true })
  typeId: number;

  @Column({ type: 'bigint', nullable: true })
  maturity: number;

  @Column({ type: 'float', nullable: true, transformer: decimalToNumber })
  line?: number;

  @Column({ nullable: true })
  playerId: number;

  @Column({ nullable: true })
  position: number; // 0 = home/over, 1 = away/under, 2 = draw

  @Column({ nullable: true })
  homeTeam: string;

  @Column({ nullable: true })
  awayTeam: string;

  @Column({ nullable: true })
  tournamentName?: string;

  @Column({ nullable: true })
  positionLabel: string; // e.g., "Home", "Away", "Draw", "Over", "Under"

  @Column({ nullable: true })
  marketType?: string; // e.g., "Winner", "Totals", "Handicap"

  // Parlay Selections (for parlay bets) - stores array of game selections
  @Column({ type: 'json', nullable: true })
  parlaySelections?: Array<{
    gameId?: string; // Optional - removed from frontend response but kept in DB for backend use
    sportId: number;
    typeId: number;
    maturity: number;
    line?: number;
    playerId: number;
    position: number;
    homeTeam: string;
    awayTeam: string;
    tournamentName?: string;
    positionLabel: string;
    marketType?: string;
    odds: number;
    oddsType: string;
  }>;

  // Bet Details
  @Column({ type: 'decimal', precision: 18, scale: 8, transformer: decimalToNumber })
  amount: number; // Bet amount from user's real balance

  @Column({ type: 'decimal', precision: 18, scale: 8, transformer: decimalToNumber })
  odds: number; // Odds at the time of bet placement

  @Column({ type: 'enum', enum: ['decimal', 'normalizedImplied', 'american'], default: 'normalizedImplied' })
  oddsType: string; // Type of odds (decimal, normalizedImplied, american)

  @Column({ type: 'decimal', precision: 18, scale: 8, transformer: decimalToNumber })
  potentialPayout: number; // Calculated potential payout

  @Column({ type: 'decimal', precision: 18, scale: 8, default: 0, transformer: decimalToNumber })
  actualPayout: number; // Actual payout after bet is resolved

  // Status
  @Column({
    type: 'enum',
    enum: BetStatus,
    default: BetStatus.OPEN,
  })
  status: BetStatus;

  @Column({ default: false })
  claimed: boolean; // Whether winnings have been claimed

  // Multiple tickets support
  @Column({ type: 'json', nullable: true })
  combinedPositions?: any;

  @Column({ type: 'json', nullable: true })
  merkleProof?: string[];

  @Column({ default: false })
  live: boolean;

  // Network information
  @Column({ default: 10 })
  networkId: number;

  // Balance type used for this bet
  @Column({ type: 'enum', enum: ['realBalance', 'testBalance'], default: 'realBalance' })
  balanceType: 'realBalance' | 'testBalance';

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

