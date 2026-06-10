import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL, // your frontend dev URL
    credentials: true,
  },
})
export class DepositGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('join_room')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { room: string },
  ) {
    client.join(data.room);
    // console.log(`Client joined room ${data.room}`);
  }

  sendDepositConfirmed(userId: number, data: {
    token: string;
    amount: string;
    newRealBalance: number;
    newTestBalance: number;
    balanceType: 'realBalance' | 'testBalance';
  }) {
    // Emit only to this user's room
    this.server.to(`user_${userId}`).emit('deposit_confirmed', data);
  }

  /**
   * Send casino balance update to user
   * Called when a game transaction (bet/win) is processed
   */
  sendCasinoBalanceUpdate(userId: number, data: {
    transactionType: 'debit' | 'credit' | 'debit_credit';
    betAmount: number;
    winAmount: number;
    newBalance: number;
    providerCode: string;
    gameCode: string;
    txnId: string;
    balanceType: 'realBalance' | 'testBalance';
  }) {
    this.server.to(`user_${userId}`).emit('casino_balance_update', data);
    // console.log(`💰 Casino balance update sent to user ${userId}:`, data);
  }

  /**
   * Send sports bet balance update to user
   * Called when a sports bet is placed
   */
  sendSportsBetUpdate(userId: number, data: {
    betAmount: number;
    potentialPayout: number;
    newRealBalance: number;
    newTestBalance: number;
    balanceType: 'realBalance' | 'testBalance';
    betType: 'single' | 'parlay';
    betId: number;
  }) {
    this.server.to(`user_${userId}`).emit('sports_bet_placed', data);
    // console.log(`🏀 Sports bet update sent to user ${userId}:`, data);
  }

  /**
   * Send withdrawal balance update to user
   * Called when a withdrawal is created
   */
  sendWithdrawalUpdate(userId: number, data: {
    amount: number;
    fee: number;
    token: string;
    chain: string;
    newRealBalance: number;
    newTestBalance: number;
    balanceType?: 'realBalance' | 'testBalance';
    withdrawalId: number;
  }) {
    this.server.to(`user_${userId}`).emit('withdrawal_created', data);
    // console.log(`💸 Withdrawal update sent to user ${userId}:`, data);
  }
}
