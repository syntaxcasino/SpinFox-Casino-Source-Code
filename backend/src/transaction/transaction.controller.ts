import { Controller, Get, UseGuards, Request, Query } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { Transaction } from 'src/transaction/entities/transaction.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) { }

  @Get('top10')
  async getTop10(): Promise<Transaction[]> {
    return this.transactionService.findTop10();
  }

  @Get('history')
  @UseGuards(JwtAuthGuard)
  async getUserHistory(
    @Request() req,
    @Query('limit') limit?: string,
  ) {
    const userId = req.user.userId;
    const limitNum = limit ? parseInt(limit, 10) : 50;

    const transactions = await this.transactionService.findByUserId(userId, limitNum);

    return {
      success: true,
      count: transactions.length,
      transactions: transactions.map((tx) => ({
        id: tx.id,
        type: tx.type,
        token: tx.token,
        amount: tx.amount,
        chain: tx.chain,
        status: tx.status,
        txHash: tx.txHash,
        walletAddress: tx.walletAddress,
        confirmations: tx.confirmations,
        notes: tx.notes,
        createdAt: tx.createdAt,
        updatedAt: tx.updatedAt,
      })),
    };
  }
}
