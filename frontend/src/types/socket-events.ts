/**
 * TypeScript interfaces for WebSocket events
 */

export interface DepositConfirmedEvent {
  token: string;
  amount: string;
  newRealBalance?: number;
  newTestBalance?: number;
  balanceType?: 'realBalance' | 'testBalance';
  // For backwards compatibility
  newBalance?: string | number;
}

export interface CasinoBalanceUpdateEvent {
  transactionType: 'debit' | 'credit' | 'debit_credit';
  betAmount: number;
  winAmount: number;
  newBalance: number;
  providerCode: string;
  gameCode: string;
  txnId: string;
  balanceType: 'realBalance' | 'testBalance';
}

export interface SportsBetPlacedEvent {
  betAmount: number;
  potentialPayout: number;
  newRealBalance?: number;
  newTestBalance?: number;
  balanceType?: 'realBalance' | 'testBalance';
  betType: 'single' | 'parlay';
  betId: number;
  // For backwards compatibility
  newBalance?: number;
}

export interface WithdrawalCreatedEvent {
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
}

