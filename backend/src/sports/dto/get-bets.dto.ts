import { IsOptional, IsEnum } from 'class-validator';
import { BetStatus } from '../entities/sports-bet.entity';

export class GetBetsDto {
  @IsOptional()
  @IsEnum(BetStatus)
  status?: BetStatus;
}

