"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "@/contexts/UserContext";
import NotFound from "../../not-found";
import { 
  getPendingTransactions, 
  getAdminTransactions,
  approveTransaction,
  rejectTransaction
} from "@/lib/api/admin";
import { CheckCircle, XCircle, Clock, Filter, Search } from "lucide-react";
import { toast } from "react-toastify";

interface Transaction {
  id: string; // UUID
  userId: string; // Can be string
  type: string;
  chain: string;
  token: string;
  amount: string; // Stored as string in DB
  status: string;
  walletAddress?: string;
  txHash?: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminApprovePage() {
  const { user } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [processing, setProcessing] = useState<string | null>(null);

  const fetchTransactions = async (token: string) => {
    try {
      setLoading(true);
      
      if (filter === 'pending') {
        const data = await getPendingTransactions(token);
        setTransactions(data);
      } else {
        const data = await getAdminTransactions(
          token, 
          currentPage, 
          20, 
          undefined, 
          filter === 'all' ? undefined : filter
        );
        setTransactions(data.transactions);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user?.role !== 'user') {
      setIsAdmin(true);
      const token = localStorage.getItem('token');
      if (token) {
        fetchTransactions(token);
      } else {
        setLoading(false);
      }
    } else {
      setIsAdmin(false);
      setLoading(false);
    }
  }, [user, filter, currentPage]);

  const handleApprove = async (transactionId: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    setProcessing(transactionId);
    try {
      await approveTransaction(token, {
        id: transactionId,
        status: 'completed',
      });
      toast.success('Transaction approved successfully');
      fetchTransactions(token);
    } catch (error) {
      console.error('Error approving transaction:', error);
      toast.error('Failed to approve transaction');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (transactionId: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const reason = prompt('Please enter rejection reason:');
    if (!reason) return;

    setProcessing(transactionId);
    try {
      await rejectTransaction(token, {
        id: transactionId,
        status: 'rejected',
        reason,
      });
      toast.success('Transaction rejected');
      fetchTransactions(token);
    } catch (error) {
      console.error('Error rejecting transaction:', error);
      toast.error('Failed to reject transaction');
    } finally {
      setProcessing(null);
    }
  };

  if (!isAdmin) return <NotFound />;
  
  if (loading && transactions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-900 dark:text-white">
        Loading transactions...
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-500';
      case 'completed': 
      case 'approved': return 'text-green-500';
      case 'rejected': return 'text-red-500';
      default: return 'text-gray-400';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'deposit': return 'text-green-400';
      case 'withdraw': return 'text-red-400';
      case 'sweep': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Transaction Management</h1>
        <p className="text-gray-600 dark:text-gray-400">Review and manage platform transactions</p>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        {(['all', 'pending', 'approved', 'rejected'] as const).map((filterOption) => (
          <button
            key={filterOption}
            onClick={() => {
              setFilter(filterOption);
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === filterOption
                ? 'bg-blue-600 text-white'
                : 'bg-light-bg-secondary dark:bg-dark-bg-tertiary text-gray-600 dark:text-gray-400 hover:bg-light-bg-tertiary dark:hover:bg-dark-border'
            }`}
          >
            {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
          </button>
        ))}
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-light-bg-secondary dark:bg-dark-bg-tertiary rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-yellow-500" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {transactions.filter(t => t.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-light-bg-secondary dark:bg-dark-bg-tertiary rounded-lg p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Approved</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {transactions.filter(t => t.status === 'completed' || t.status === 'approved').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-light-bg-secondary dark:bg-dark-bg-tertiary rounded-lg p-4">
          <div className="flex items-center gap-3">
            <XCircle className="w-8 h-8 text-red-500" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Rejected</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {transactions.filter(t => t.status === 'rejected').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-light-bg-secondary dark:bg-dark-bg-tertiary rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Filter className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{transactions.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-light-bg-secondary dark:bg-dark-bg-tertiary rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-light-bg-tertiary dark:bg-dark-border">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">User ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">Currency</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-border dark:divide-dark-border">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-600 dark:text-gray-400">
                    No transactions found
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-light-bg-tertiary dark:hover:bg-dark-border transition">
                    <td className="px-4 py-3 text-gray-900 dark:text-white font-mono text-sm">#{tx.id.substring(0, 8)}...</td>
                    <td className="px-4 py-3 text-gray-900 dark:text-white">User {tx.userId}</td>
                    <td className="px-4 py-3">
                      <span className={`font-medium ${getTypeColor(tx.type)}`}>
                        {tx.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-900 dark:text-white">{tx.token}</td>
                    <td className="px-4 py-3 text-gray-900 dark:text-white font-semibold">${parseFloat(tx.amount).toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={`font-medium ${getStatusColor(tx.status)}`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-sm">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      {tx.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(tx.id)}
                            disabled={processing === tx.id}
                            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition disabled:opacity-50"
                          >
                            {processing === tx.id ? 'Processing...' : 'Approve'}
                          </button>
                          <button
                            onClick={() => handleReject(tx.id)}
                            disabled={processing === tx.id}
                            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      {tx.status !== 'pending' && (
                        <span className="text-gray-600 dark:text-gray-400 text-sm">No action</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filter !== 'pending' && totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 bg-light-bg-tertiary dark:bg-dark-border">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-light-bg-secondary dark:bg-dark-bg-tertiary text-gray-900 dark:text-white rounded hover:bg-light-border dark:hover:bg-dark-bg disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-light-bg-secondary dark:bg-dark-bg-tertiary text-gray-900 dark:text-white rounded hover:bg-light-border dark:hover:bg-dark-bg disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
