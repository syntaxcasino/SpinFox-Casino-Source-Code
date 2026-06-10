import { IsNotEmpty, IsNumber, IsString, IsOptional, IsBoolean, IsArray, Min, IsEnum } from 'class-validator';

export class PlaceBetDto {
  @IsOptional()
  @IsEnum(['single', 'parlay'])
  betType?: 'single' | 'parlay'; // 'single' or 'parlay'

  // For single bets - required if betType is 'single' or not specified
  @IsOptional()
  @IsString()
  gameId?: string;

  @IsOptional()
  @IsNumber()
  sportId?: number;

  @IsOptional()
  @IsNumber()
  typeId?: number;

  @IsOptional()
  @IsNumber()
  maturity?: number;

  @IsOptional()
  @IsNumber()
  line?: number;

  @IsOptional()
  @IsNumber()
  playerId?: number;

  @IsOptional()
  @IsNumber()
  odds?: number;

  @IsOptional()
  @IsString()
  oddsType?: string; // 'decimal', 'normalizedImplied', or 'american'

  @IsOptional()
  @IsNumber()
  position?: number;

  @IsOptional()
  @IsString()
  homeTeam?: string;

  @IsOptional()
  @IsString()
  awayTeam?: string;

  @IsOptional()
  @IsString()
  tournamentName?: string;

  @IsOptional()
  @IsString()
  positionLabel?: string;

  @IsOptional()
  @IsString()
  marketType?: string;

  // For parlay bets - required if betType is 'parlay'
  @IsOptional()
  @IsArray()
  parlaySelections?: Array<{
    gameId: string;
    sportId: number;
    typeId: number;
    maturity: number;
    line?: number;
    playerId: number;
    position: number;
    homeTeam: string;
    awayTeam: string;
    tournamentName?: string;
    positionLabel: string;
    marketType?: string;
    odds: number;
    oddsType: string;
  }>;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  amount: number; // Bet amount in USDC

  @IsOptional()
  @IsArray()
  combinedPositions?: any;

  @IsOptional()
  @IsArray()
  merkleProof?: string[];

  @IsOptional()
  @IsBoolean()
  live?: boolean;

  @IsOptional()
  @IsNumber()
  networkId?: number;
}

