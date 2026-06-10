import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';  // import this
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { LocalStrategy } from './local.strategy';
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LocalAuthGuard } from './local-auth.guard';
import { User } from './entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiModule } from 'src/api/api.module';
import { MailerModule } from 'src/mailer/mailer.module';

@Module({
  imports: [
    PassportModule,
    ApiModule,
    MailerModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET_KEY ?? 'STR0NGJWTSECRETKEY',
      signOptions: { expiresIn: '60m' }, // token expiration
    }),
    TypeOrmModule.forFeature([User]),
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy, JwtAuthGuard, LocalAuthGuard],
  controllers: [AuthController],
  exports: [JwtAuthGuard], // if other modules need to use this guard
})
export class AuthModule {}
