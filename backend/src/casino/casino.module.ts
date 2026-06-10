import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CasinoController } from './casino.controller';
import { CasinoService } from './casino.service';
import { SeamlessCallbackController } from './seamless-callback.controller';
import { SeamlessCallbackService } from './seamless-callback.service';
import { AuthModule } from '../auth/auth.module';
import { ApiModule } from 'src/api/api.module';
import { User } from 'src/auth/entities/user.entity';
import { CasinoTransaction } from './entities/casino-transaction.entity';
import { DepositGateway } from '../deposit/deposit.gateway';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Module({
  imports: [
    AuthModule,
    ApiModule,
    ConfigModule,
    TypeOrmModule.forFeature([User, CasinoTransaction]), // 👈 register User and CasinoTransaction repositories
  ],
  controllers: [CasinoController, SeamlessCallbackController],
  providers: [
    CasinoService, 
    SeamlessCallbackService, 
    DepositGateway,
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
  exports: [CasinoService, SeamlessCallbackService],
})
export class CasinoModule {}
