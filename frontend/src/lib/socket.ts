// lib/socket.ts
import { io, Socket } from 'socket.io-client';

interface ServerToClientEvents {
  deposit_confirmed: (data: {
    token: string;
    amount: string;
    newRealBalance?: number;
    newTestBalance?: number;
    balanceType?: 'realBalance' | 'testBalance';
    // For backwards compatibility
    newBalance?: string | number;
  }) => void;
  casino_balance_update: (data: {
    transactionType: 'debit' | 'credit' | 'debit_credit';
    betAmount: number;
    winAmount: number;
    newBalance: number;
    providerCode: string;
    gameCode: string;
    txnId: string;
    balanceType: 'realBalance' | 'testBalance';
  }) => void;
  sports_bet_placed: (data: {
    betAmount: number;
    potentialPayout: number;
    newRealBalance?: number;
    newTestBalance?: number;
    balanceType?: 'realBalance' | 'testBalance';
    betType: 'single' | 'parlay';
    betId: number;
    // For backwards compatibility
    newBalance?: number;
  }) => void;
  withdrawal_created: (data: {
    amount: number;
    fee: number;
    token: string;
    chain: string;
    newRealBalance?: number;
    newTestBalance?: number;
    balanceType?: 'realBalance' | 'testBalance';
    withdrawalId: number;
    // For backwards compatibility
    newBalance?: number;
  }) => void;
}

interface ClientToServerEvents {
  join_room: (data: { room: string }) => void;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(BACKEND_URL, {
  withCredentials: true,
  autoConnect: false,
});
