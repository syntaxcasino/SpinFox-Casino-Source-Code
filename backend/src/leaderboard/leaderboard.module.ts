import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeaderboardController } from './leaderboard.controller';
import { LeaderboardService } from './leaderboard.service';
import { Leaderboard } from '../admin/entities/leaderboard.entity';
import { User } from '../auth/entities/user.entity';
import { Bet } from '../admin/entities/bet.entity';
import { SportsBet } from '../sports/entities/sports-bet.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Leaderboard, User, Bet, SportsBet])],
  controllers: [LeaderboardController],
  providers: [LeaderboardService],
  exports: [LeaderboardService],
})
export class LeaderboardModule {}

