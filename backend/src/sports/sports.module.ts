import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SportsController } from './sports.controller';
import { SportsService } from './sports.service';
import { SportsBet } from './entities/sports-bet.entity';
import { User } from 'src/auth/entities/user.entity';
import { DepositGateway } from '../deposit/deposit.gateway';

@Module({
  imports: [
    CacheModule.register({
      ttl: 21600 * 1000,
    }),
    TypeOrmModule.forFeature([SportsBet, User]),
  ],
  controllers: [SportsController],
  providers: [SportsService, DepositGateway],
  exports: [SportsService],
})
export class SportsModule {}
