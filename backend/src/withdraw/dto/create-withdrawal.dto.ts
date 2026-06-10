import { IsEnum, IsNotEmpty, IsString, Matches, IsNumberString } from 'class-validator';
import { ChainType, TokenType } from '../../transaction/entities/transaction.entity';

export class CreateWithdrawalDto {
  @IsEnum(['USDC', 'USDT'], { message: 'Only USDC and USDT withdrawals are supported' })
  token: TokenType;

  @IsNumberString({}, { message: 'Amount must be a valid number' })
  @IsNotEmpty()
  amount: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^(0x[a-fA-F0-9]{40}|[1-9A-HJ-NP-Za-km-z]{32,44})$/, {
    message: 'Invalid wallet address format',
  })
  walletAddress: string;

  @IsEnum(['ethereum', 'optimism', 'arbitrum', 'base', 'solana', 'ethereum-sepolia', 'optimism-sepolia', 'arbitrum-sepolia', 'base-sepolia'], {
    message: 'Supported chains: ethereum, optimism, arbitrum, base, solana, ethereum-sepolia, optimism-sepolia, arbitrum-sepolia, base-sepolia',
  })
  chain: ChainType;
}

