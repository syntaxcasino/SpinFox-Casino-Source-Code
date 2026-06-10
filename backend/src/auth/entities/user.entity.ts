import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  BeforeInsert,
  BeforeUpdate,
  OneToMany,
  Index,
  ValueTransformer,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Transaction } from 'src/transaction/entities/transaction.entity';
import { Bet } from 'src/admin/entities/bet.entity';
import { SupportTicket } from 'src/admin/entities/support-ticket.entity';
import { Notification } from 'src/admin/entities/notification.entity';
import { SportsBet } from 'src/sports/entities/sports-bet.entity';

// Transformer to convert decimal/float strings to numbers
const decimalToNumber: ValueTransformer = {
  to: (value: number) => value,
  from: (value: string) => parseFloat(value),
};

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column({ default: 'spinfox@gmail.com' })
  email: string;

  @Column()
  usercode: string;

  @Column()
  password: string;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ nullable: true })
  verificationCode: string;

  @Column({ type: 'float', default: 0, transformer: decimalToNumber })
  realBalance: number; // For mainnet chains

  @Column({ type: 'float', default: 0, transformer: decimalToNumber })
  testBalance: number; // For testnet chains

  @Column({ type: 'float', default: 0, transformer: decimalToNumber })
  bonusBalance: number;

  @Column({ type: 'int', default: 0 })
  loyaltyPoints: number;

  @Column({ type: 'int', default: 1 })
  level: number;

  @Column({ default: '/images/avatar/default.png' })
  avatar: string;

  @Column({ type: 'enum', enum: ['admin', 'user', 'support'], default: 'user' })
  role: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Transaction, (tx) => tx.userId)
  transactions: Transaction[];

  @OneToMany(() => Bet, (bet) => bet.user)
  bets: Bet[];

  @OneToMany(() => SportsBet, (sportsBet) => sportsBet.user)
  sportsBets: SportsBet[];

  @OneToMany(() => SupportTicket, (ticket) => ticket.user)
  tickets: SupportTicket[];

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[];

  // 🔹 EVM Wallet
  @Column({ nullable: true })
  EVMAddress: string;

  @Column({ nullable: true })
  EVMPrivatekey: string;

  // 🔹 Solana Wallet
  @Column({ nullable: true })
  SOLAddress: string;

  @Column({ nullable: true })
  SOLPrivatekey: string;

  // 🔹 Solana Token Accounts (for SPL tokens)
  @Column({ nullable: true })
  SOLUSDCAddress: string; // USDC associated token account

  @Column({ nullable: true })
  SOLUSDTAddress: string; // USDT associated token account

  // 🔹 Bitcoin Wallet
  @Column({ nullable: true })
  BTCAddress: string;

  @Column({ nullable: true })
  BTCPrivatekey: string;

  // 🔹 Balances
  @Column({ default: '0' })
  ethBalance: string;

  @Column({ default: '0' })
  usdtBalance: string;

  @Column({ default: '0' })
  usdcBalance: string;

  @Column({ default: '0' })
  btcBalance: string;

  @Column({ default: '0' })
  solBalance: string;

  @Column({ default: '' })
  favorites: string;

  // 🔐 Password Handling
  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password && !this.password.startsWith('$2b$')) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }
  }

  async validatePassword(password: string): Promise<boolean> {
    return await bcrypt.compare(password, this.password);
  }
}
