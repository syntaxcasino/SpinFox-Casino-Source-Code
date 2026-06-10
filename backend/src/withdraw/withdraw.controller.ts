import { Controller, Post, Body, UseGuards, Request, Get } from '@nestjs/common';
import { WithdrawalService } from './withdraw.service';
import { CreateWithdrawalDto } from './dto/create-withdrawal.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ChainType } from '../transaction/entities/transaction.entity';

@Controller('withdrawals')
@UseGuards(JwtAuthGuard)
export class WithdrawalController {
  constructor(private readonly withdrawalService: WithdrawalService) {}

  @Post()
  async withdraw(@Request() req, @Body() dto: CreateWithdrawalDto) {
    const userId = req.user.userId;

    const tx = await this.withdrawalService.createWithdrawal(
      userId,
      dto.token,
      dto.amount,
      dto.walletAddress,
      dto.chain,
    );

    return {
      success: true,
      message: 'Withdrawal request submitted successfully',
      transaction: {
        id: tx.id,
        amount: tx.amount,
        token: tx.token,
        chain: tx.chain,
        status: tx.status,
        walletAddress: tx.walletAddress,
      },
    };
  }

  @Get('fees')
  async getFees() {
    const chains: ChainType[] = [
      'ethereum', 
      'optimism', 
      'arbitrum', 
      'base', 
      'solana',
      'ethereum-sepolia',
      'optimism-sepolia',
      'arbitrum-sepolia',
      'base-sepolia'
    ];
    const fees = {};

    chains.forEach((chain) => {
      fees[chain] = this.withdrawalService.getWithdrawalFee(chain);
    });

    return {
      fees,
      description: 'Withdrawal fees in USDC/USDT (includes testnets)',
    };
  }
}
