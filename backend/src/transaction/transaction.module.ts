// src/transaction/transaction.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionService } from './transaction.service';
import { Transaction } from './entities/transaction.entity';
import { TransactionGateway } from './transaction.gateway';
import { TransactionController } from './transaction.controller';
@Module({
  imports: [TypeOrmModule.forFeature([Transaction])],
  providers: [TransactionService, TransactionGateway],
  controllers: [TransactionController],
  exports: [TransactionService], // <-- important
})
export class TransactionModule {}
