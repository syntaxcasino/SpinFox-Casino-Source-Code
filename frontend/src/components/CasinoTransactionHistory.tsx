'use client';

import { useState, useEffect } from 'react';
import { getCasinoTransactionHistory } from '@/lib/api';
import { useUser } from '@/contexts/UserContext';
import { motion } from 'framer-motion';
import { Loader2, TrendingUp, TrendingDown, ArrowDownRight, ArrowUpRight, Gamepad2 } from 'lucide-react';

interface CasinoTransaction {
  id: number;
  providerCode: string;
  gameCode: string;
  txnType: 'debit' | 'credit' | 'debit_credit';
  betAmount: number;
  winAmount: number;
  userBeforeBalance: number;
  userAfterBalance: number;
  createdAt: string;
}

export default function CasinoTransactionHistory() {
  const { isLoggedIn } = useUser();
  const [transactions, setTransactions] = useState<CasinoTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const limit = 20;

  useEffect(() => {
    if (isLoggedIn) {
      fetchTransactions();
    }
  }, [isLoggedIn, offset]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      const result = await getCasinoTransactionHistory(token, limit, offset);
      if (result.success) {
        setTransactions(result.transactions);
        setTotal(result.total);
      }
    } catch (error) {
      console.error('Error fetching casino transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTransactionIcon = (txnType: string) => {
    switch (txnType) {
      case 'debit':
        return <ArrowDownRight className="w-4 h-4 text-red-500" />;
      case 'credit':
        return <ArrowUpRight className="w-4 h-4 text-green-500" />;
      case 'debit_credit':
        return <Gamepad2 className="w-4 h-4 text-blue-500" />;
      default:
        return <Gamepad2 className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTransactionType = (txnType: string) => {
    switch (txnType) {
      case 'debit':
        return 'Bet';
      case 'credit':
        return 'Win';
      case 'debit_credit':
        return 'Bet & Win';
      default:
        return 'Unknown';
    }
  };

  const getNetAmount = (transaction: CasinoTransaction) => {
    if (transaction.txnType === 'debit') {
      return -transaction.betAmount;
    } else if (transaction.txnType === 'credit') {
      return transaction.winAmount;
    } else {
      return transaction.winAmount - transaction.betAmount;
    }
  };

  const totalPages = Math.ceil(total / limit);
  const currentPage = Math.floor(offset / limit) + 1;

  if (!isLoggedIn) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Please sign in to view your casino transaction history</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Casino Transaction History
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          View all your game bets and wins
        </p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}

      {/* Empty State */}
      {!loading && transactions.length === 0 && (
        <div className="text-center py-12">
          <Gamepad2 className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No casino transactions yet</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
            Start playing games to see your transaction history
          </p>
        </div>
      )}

      {/* Transactions List */}
      {!loading && transactions.length > 0 && (
        <>
          <div className="space-y-2">
            {transactions.map((transaction, index) => {
              const netAmount = getNetAmount(transaction);
              const isPositive = netAmount > 0;

              return (
                <motion.div
                  key={transaction.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    {/* Left Side - Icon and Game Info */}
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                        {getTransactionIcon(transaction.txnType)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {transaction.gameCode}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {transaction.providerCode} • {getTransactionType(transaction.txnType)}
                        </p>
                      </div>
                    </div>

                    {/* Right Side - Amount and Details */}
                    <div className="text-right">
                      <p
                        className={`font-bold ${
                          isPositive
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}
                      >
                        {isPositive ? '+' : ''}${Math.abs(netAmount).toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(transaction.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Expandable Details */}
                  {transaction.txnType === 'debit_credit' && (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Bet:</span>
                          <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                            ${transaction.betAmount.toFixed(2)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Win:</span>
                          <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                            ${transaction.winAmount.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Showing {offset + 1}-{Math.min(offset + limit, total)} of {total} transactions
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setOffset(Math.max(0, offset - limit))}
                  disabled={offset === 0}
                  className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-gray-700 dark:text-gray-300">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setOffset(Math.min((totalPages - 1) * limit, offset + limit))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

