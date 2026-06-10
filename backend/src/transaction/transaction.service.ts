import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction } from './entities/transaction.entity';
import { Repository } from 'typeorm';
import { TransactionGateway } from './transaction.gateway';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    private readonly transactionGateway: TransactionGateway,
  ) { }

  async createTransaction(data: Partial<Transaction>) {
    const tx = this.transactionRepository.create(data);
    const savedTx = await this.transactionRepository.save(tx);
    // Emit to WebSocket clients
    this.transactionGateway.emitNewTransaction(savedTx);

    return savedTx;
  }

  async updateTransaction(tx: Transaction): Promise<Transaction> {
    const updatedTx = await this.transactionRepository.save(tx);
    this.transactionGateway.emitNewTransaction(updatedTx);
    return updatedTx;
  }

  async updateTransactionStatus(
    txId: string,
    status: 'pending' | 'confirmed' | 'failed' | 'approved' | 'rejected' | 'processing' | 'completed',
    confirmations?: number,
  ): Promise<Transaction> {
    const tx = await this.transactionRepository.findOne({ where: { id: txId } });
    if (!tx) throw new Error(`Transaction ${txId} not found`);

    tx.status = status;
    if (typeof confirmations === 'number') tx.confirmations = confirmations;

    const updatedTx = await this.transactionRepository.save(tx);

    // Emit WebSocket update
    this.transactionGateway.emitNewTransaction(updatedTx);

    return updatedTx;
  }

  async findTop10(): Promise<Transaction[]> {
    const top10 = await this.transactionRepository.find({
      order: { createdAt: 'DESC' },
      take: 10,
    });
    return top10;
  }

  async findByUserId(userId: number, limit: number = 50): Promise<Transaction[]> {
    return this.transactionRepository.find({
      where: { userId: userId.toString() },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async findByTxHash(txHash: string): Promise<Transaction | null> {
    return this.transactionRepository.findOne({ where: { txHash } });
  }

  async findById(id: string): Promise<Transaction | null> {
    return this.transactionRepository.findOne({ where: { id } });
  }
}