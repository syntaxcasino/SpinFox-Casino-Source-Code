import { IsNumber, IsString, IsOptional, IsEnum, IsBoolean, Min, Max } from 'class-validator';

export enum TransactionType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
  SWEEP = 'sweep',
}

export enum TransactionStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  COMPLETED = 'completed',
}

export class UpdateTransactionDto {
  @IsString()
  id: string; // UUID

  @IsEnum(TransactionStatus)
  status: TransactionStatus;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class UpdateUserBalanceDto {
  @IsNumber()
  userId: number; // User.id is number

  @IsNumber()
  amount: number;

  @IsString()
  currency: string; // 'USDT', 'USDC', 'ETH', 'BTC', 'SOL'

  @IsOptional()
  @IsString()
  reason?: string;
}

export class UpdateUserRoleDto {
  @IsNumber()
  userId: number;

  @IsString()
  role: string; // 'user', 'admin', 'super_admin'
}

export class CreatePromotionDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsString()
  code: string;

  @IsEnum(['fixed', 'percentage'])
  type: 'fixed' | 'percentage';

  @IsNumber()
  @Min(0)
  value: number;

  @IsNumber()
  @Min(0)
  maxUses: number;

  @IsNumber()
  @Min(0)
  minDeposit: number;

  @IsString()
  startDate: string;

  @IsString()
  endDate: string;

  @IsBoolean()
  active: boolean;
}

export class UpdatePromotionDto {
  @IsNumber()
  id: number;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsNumber()
  maxUses?: number;
}

export class CreateLeaderboardDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsEnum(['daily', 'weekly', 'monthly', 'all-time'])
  period: 'daily' | 'weekly' | 'monthly' | 'all-time';

  @IsString()
  startDate: string;

  @IsString()
  endDate: string;

  @IsBoolean()
  active: boolean;

  @IsOptional()
  prizes?: any;
}

export class UpdateLeaderboardDto {
  @IsNumber()
  id: number;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  prizes?: any;
}

export class StatsQueryDto {
  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @IsEnum(['day', 'week', 'month', 'year'])
  period?: 'day' | 'week' | 'month' | 'year';
}

export class GameManagementDto {
  @IsNumber()
  gameId: number;

  @IsBoolean()
  active: boolean;
}

export class NotificationDto {
  @IsString()
  title: string;

  @IsString()
  message: string;

  @IsEnum(['info', 'warning', 'error', 'success'])
  type: 'info' | 'warning' | 'error' | 'success';

  @IsOptional()
  @IsNumber()
  userId?: number; // If specified, send to specific user, else broadcast
}

