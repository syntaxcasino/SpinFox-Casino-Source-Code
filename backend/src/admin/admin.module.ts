import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { User } from 'src/auth/entities/user.entity';
import { Transaction } from 'src/transaction/entities/transaction.entity';
import { Bet } from './entities/bet.entity';
import { Game } from './entities/game.entity';
import { Promotion } from './entities/promotion.entity';
import { SupportTicket } from './entities/support-ticket.entity';
import { Notification } from './entities/notification.entity';
import { Leaderboard } from './entities/leaderboard.entity';
import { Setting } from './entities/setting.entity';
import { ApiService } from 'src/api/api.service';
import { AdminController } from './admin.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User, 
      Transaction, 
      Bet, 
      Game, 
      Promotion, 
      SupportTicket, 
      Notification, 
      Leaderboard,
      Setting
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService, ApiService],
  exports: [AdminService, ApiService],
})
export class AdminModule {}