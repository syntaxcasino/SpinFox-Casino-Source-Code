import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Transaction } from '../transaction/entities/transaction.entity';
import { User } from '../auth/entities/user.entity';
import { WithdrawalService } from './withdraw.service';
import { WithdrawalProcessor } from './withdraw.processor';
import { WithdrawalController } from './withdraw.controller';
import { TransactionService } from '../transaction/transaction.service';
import { TransactionGateway } from '../transaction/transaction.gateway';
import { ApiService } from '../api/api.service';
import { DepositGateway } from '../deposit/deposit.gateway';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Transaction, User]),

    // ✅ BullMQ Queue for Withdrawals (async config)
    BullModule.registerQueueAsync({
      name: 'withdrawals',
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('REDIS_HOST', '127.0.0.1'),
          port: +configService.get<number>('REDIS_PORT', 6379),
          password: configService.get<string>('REDIS_PASSWORD') || undefined,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [WithdrawalController],
  providers: [
    WithdrawalService,
    WithdrawalProcessor,
    TransactionService,
    TransactionGateway,
    ApiService,
    DepositGateway,
  ],
  exports: [WithdrawalService],
})
export class WithdrawModule {}
