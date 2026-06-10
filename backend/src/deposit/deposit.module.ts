import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { EvmScannerService } from './evm-scanner.service';
import { SolScannerService } from './sol-scanner.service';
import { DepositProcessor } from './deposit.processor';
import { TransactionModule } from 'src/transaction/transaction.module'; // <-- import this
import { Transaction } from '../transaction/entities/transaction.entity';
import { ChainState } from './entities/chain-state.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DepositGateway } from './deposit.gateway';
import Redis from 'ioredis';
import { User } from 'src/auth/entities/user.entity';
import { ApiModule } from 'src/api/api.module';

@Global()
@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Transaction, ChainState, User]),
    TransactionModule,
    ApiModule,
    // BullMQ queue for deposits
    BullModule.registerQueueAsync({
      name: 'deposits',
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        connection: {
          host: configService.get('REDIS_HOST'),
          port: +configService.get('REDIS_PORT'),
          password: configService.get('REDIS_PASSWORD') || undefined,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    DepositGateway,
    EvmScannerService,
    SolScannerService,
    DepositProcessor,
    {
      provide: 'REDIS_CLIENT',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return new Redis({
          host: configService.get('REDIS_HOST'),
          port: +configService.get('REDIS_PORT'),
          password: configService.get('REDIS_PASSWORD') || undefined,
        });
      },
    },
  ],
  exports: [EvmScannerService, SolScannerService, 'REDIS_CLIENT'],
})
export class DepositModule {}
