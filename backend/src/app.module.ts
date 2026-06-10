import { Module, MiddlewareConsumer } from "@nestjs/common";
import { DecryptBodyMiddleware } from "./utils/crypto.util";
import { AuthController } from "./auth/auth.controller";
import { CasinoController } from "./casino/casino.controller";
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ApiModule } from './api/api.module';
import { BootstrapService } from './bootstrap.service';
import { CasinoModule } from './casino/casino.module';
import { TypeOrmModule } from "@nestjs/typeorm";
import { DepositModule } from "./deposit/deposit.module";
import { WithdrawModule } from "./withdraw/withdraw.module";
import { AdminModule } from './admin/admin.module';
import { SportsModule } from "./sports/sports.module";
import { LeaderboardModule } from './leaderboard/leaderboard.module';
import { PromotionsModule } from './promotions/promotions.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    AuthModule,
    ApiModule,
    CasinoModule,
    DepositModule,
    WithdrawModule,
    AdminModule,
    SportsModule,
    LeaderboardModule,
    PromotionsModule,
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
          type: "mysql",
          host: configService.get<string>('DB_HOST'),
          port: configService.get<number>('DB_PORT'),
          username: configService.get<string>('DB_USERNAME'),
          password: configService.get<string>('DB_PASSWORD') || "",
          database: configService.get<string>('DB_NAME'),
          synchronize: true, // For development; False in production
          autoLoadEntities: true,
          connectTimeout: 10000, // 10 seconds
          acquireTimeout: 10000, // 10 seconds
          timeout: 10000, // 10 seconds
          extra: {
            connectionLimit: 10,
            connectTimeout: 10000,
          },
          logging: ['error', 'warn'], // Log errors and warnings
          maxQueryExecutionTime: 5000, // Log slow queries (>5s)
        }),
    }),
  ],
  controllers: [AppController],
  providers: [AppService, BootstrapService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(DecryptBodyMiddleware).forRoutes(AuthController, CasinoController);
  }
}