'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '@/contexts/UserContext';
import { useNetwork } from '@/contexts/NetworkContext';
import { useRouter } from 'next/navigation';
import {
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  History,
  Eye,
  EyeOff,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Copy,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import Image from 'next/image';
import ModernDepositModal from '@/components/modals/ModernDepositModal';
import { toast } from 'react-toastify';
import { createWithdrawal, getWithdrawalFees, getTransactionHistory } from '@/lib/api';
import { getNetworksByType } from '@/utils/networkUtils';

type TabType = 'deposit' | 'withdraw' | 'history';
type ChainType = 'ethereum' | 'optimism' | 'arbitrum' | 'base' | 'solana' | 'ethereum-sepolia' | 'optimism-sepolia' | 'arbitrum-sepolia' | 'base-sepolia';

interface Transaction {
  id: string;
  type: 'deposit' | 'withdraw';
  token: string;
  amount: string;
  status: 'pending' | 'completed' | 'failed' | 'confirmed';
  createdAt: string;
  txHash?: string;
  chain?: string;
  walletAddress?: string;
}

interface WithdrawalFees {
  [chain: string]: number;
}

export default function WalletPage() {
  const { user, isLoggedIn } = useUser();
  const { activeNetwork, getActiveBalance } = useNetwork();
  const router = useRouter();
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const [activeTab, setActiveTab] = useState<TabType>('deposit');
  const [showBalance, setShowBalance] = useState(true);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState<'USDC' | 'USDT'>('USDC');
  const [selectedChain, setSelectedChain] = useState<ChainType>('base');

  // Reset selected chain when network type changes
  useEffect(() => {
    const availableNetworks = getNetworksByType(activeNetwork);
    const chains = availableNetworks.map(network => ({
      id: network.id,
      label: network.label,
      icon: network.icon
    }));
    
    if (chains.length > 0) {
      const defaultChain = chains.find(chain => chain.id === 'base') || chains[0];
      setSelectedChain(defaultChain.id as ChainType);
    }
  }, [activeNetwork]);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [withdrawalFees, setWithdrawalFees] = useState<WithdrawalFees>({});
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Fetch withdrawal fees on mount
  useEffect(() => {
    if (token) {
      fetchWithdrawalFees();
      fetchTransactionHistory();
    }
  }, [token]);

  const fetchWithdrawalFees = async () => {
    try {
      if (!token) return;
      const result = await getWithdrawalFees(token);
      setWithdrawalFees(result.fees || {});
    } catch (error) {
      console.error('Failed to fetch withdrawal fees:', error);
    }
  };

  const fetchTransactionHistory = async () => {
    try {
      if (!token) return;
      setIsLoadingHistory(true);
      const result = await getTransactionHistory(token, 50);
      setTransactions(result.transactions || []);
    } catch (error) {
      console.error('Failed to fetch transaction history:', error);
      toast.error('Failed to load transaction history');
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Format amount for display
  const formatAmount = (amount: string, token: string): string => {
    try {
      const num = parseFloat(amount);
      if (isNaN(num)) return '0.00';
      
      // For stablecoins, show 2 decimals
      if (token === 'USDC' || token === 'USDT') {
        return num.toFixed(2);
      }
      
      // For ETH/BTC, show up to 6 decimals (remove trailing zeros)
      if (token === 'ETH' || token === 'BTC') {
        return parseFloat(num.toFixed(6)).toString();
      }
      
      // For SOL, show up to 4 decimals
      if (token === 'SOL') {
        return parseFloat(num.toFixed(4)).toString();
      }
      
      return num.toFixed(2);
    } catch (error) {
      console.error('Error formatting amount:', error);
      return '0.00';
    }
  };

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/');
    }
  }, [isLoggedIn, router]);

  if (!user) return null;

  const tokens = [
    { id: 'USDC', label: 'USDC', icon: '/crypto/USDC.png' },
    { id: 'USDT', label: 'USDT', icon: '/crypto/USDT.png' },
  ];

  // Get chains based on active network type
  const availableNetworks = getNetworksByType(activeNetwork);
  const chains = availableNetworks.map(network => ({
    id: network.id,
    label: network.label,
    icon: network.icon
  }));

  // Get the correct balance based on active network type
  const activeBalance = user ? getActiveBalance(user) : 0;
  const totalBalance = activeBalance;
  const currentFee = withdrawalFees[selectedChain] || 0;

  const validateAddress = (address: string, chain: ChainType): boolean => {
    const trimmedAddress = address.trim();

    if (!trimmedAddress) {
      toast.error('Please enter a withdrawal address');
      return false;
    }

    // Validate EVM addresses (Ethereum, Optimism, Arbitrum, Base, and their Sepolia testnets)
    const evmChains: ChainType[] = ['ethereum', 'optimism', 'arbitrum', 'base', 'ethereum-sepolia', 'optimism-sepolia', 'arbitrum-sepolia', 'base-sepolia'];
    if (evmChains.includes(chain)) {
      const evmAddressRegex = /^0x[a-fA-F0-9]{40}$/;
      if (!evmAddressRegex.test(trimmedAddress)) {
        toast.error('Invalid EVM address. Must start with 0x followed by 40 hexadecimal characters');
        return false;
      }
    }

    // Validate Solana addresses
    if (chain === 'solana') {
      const solanaAddressRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
      if (!solanaAddressRegex.test(trimmedAddress)) {
        toast.error('Invalid Solana address. Must be a valid base58 encoded address (32-44 characters)');
        return false;
      }
    }

    return true;
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || !withdrawAddress) {
      toast.error('Please fill in all fields');
      return;
    }

    // Validate wallet address format
    if (!validateAddress(withdrawAddress, selectedChain)) {
      return;
    }
    
    const amount = parseFloat(withdrawAmount);
    if (amount <= 0) {
      toast.error('Invalid amount');
      return;
    }

    const minWithdrawal = 10;
    if (amount < minWithdrawal) {
      toast.error(`Minimum withdrawal is $${minWithdrawal}`);
      return;
    }

    // Check active balance (in USD) instead of token-specific balance
    const totalNeeded = amount + currentFee;
    
    if (activeBalance < totalNeeded) {
      toast.error(`Insufficient balance. You need $${totalNeeded.toFixed(2)} (including $${currentFee.toFixed(2)} fee)`);
      return;
    }

    try {
      setIsWithdrawing(true);
      
      if (!token) {
        toast.error('Please log in to withdraw');
        return;
      }

      const result = await createWithdrawal(token, {
        token: selectedCurrency,
        amount: withdrawAmount,
        walletAddress: withdrawAddress,
        chain: selectedChain,
      });

      toast.success(result.message || 'Withdrawal request submitted successfully!');
      setWithdrawAmount('');
      setWithdrawAddress('');
      
      // Refresh transaction history
      await fetchTransactionHistory();
      
      // Switch to history tab to show the new withdrawal
      setActiveTab('history');
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit withdrawal request');
    } finally {
      setIsWithdrawing(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-400" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-400" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-400" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'pending':
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'failed':
        return 'text-red-400 bg-red-400/10 border-red-400/20';
      default:
        return 'text-gray-400 bg-gray-400/10';
    }
  };

    return (
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-bold text-light-text dark:text-white mb-1">
            Wallet Management
          </h1>
          <p className="text-sm text-light-text-secondary dark:text-white/60">
            Manage your deposits, withdrawals, and view transaction history
          </p>
        </motion.div>

        {/* Balance Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative overflow-hidden rounded-2xl mb-6"
        >
        {/* Glassmorphic background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-purple-500/20 to-pink-500/20 backdrop-blur-xl"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-purple-600/10"></div>
        
          <div className="relative p-5 border border-white/20">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Wallet className="w-5 h-5 text-white/80" />
                  <h2 className="text-white/80 text-xs font-medium">Total Balance ({activeNetwork === 'mainnet' ? 'Mainnet' : 'Testnet'})</h2>
                </div>
                <div className="flex items-center gap-2">
                  {showBalance ? (
                    <h3 className="text-3xl font-bold text-white">
                      ${totalBalance.toFixed(2)}
                    </h3>
                  ) : (
                    <h3 className="text-3xl font-bold text-white">****</h3>
                  )}
                  <button
                    onClick={() => setShowBalance(!showBalance)}
                    className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    {showBalance ? (
                      <Eye className="w-4 h-4 text-white/60" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-white/60" />
                    )}
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/20 rounded-lg border border-green-500/30">
                <TrendingUp className="w-3 h-3 text-green-400" />
                <span className="text-green-400 text-xs font-medium">Active</span>
              </div>
            </div>
          </div>
      </motion.div>

        {/* Tabs */}
        <div className="flex gap-1.5 mb-4 p-1 bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-xl border border-light-border dark:border-dark-border">
          {[
            { id: 'deposit', label: 'Deposit', icon: ArrowDownCircle },
            { id: 'withdraw', label: 'Withdraw', icon: ArrowUpCircle },
            { id: 'history', label: 'History', icon: History },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
    return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg font-medium text-sm transition-all ${
                  isActive
                    ? 'bg-primary text-white shadow-lg'
                    : 'text-light-text-secondary dark:text-white/60 hover:bg-light-bg-tertiary dark:hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-xl border border-light-border dark:border-dark-border p-4"
        >
          {/* Deposit Tab */}
          {activeTab === 'deposit' && (
            <div className="space-y-4">
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-purple-600 rounded-2xl mb-3">
                  <ArrowDownCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-light-text dark:text-white mb-1">
                  Deposit Cryptocurrency
                </h3>
                <p className="text-sm text-light-text-secondary dark:text-white/60 mb-4">
                  Fund your wallet with crypto to start playing
                </p>
                <button
                  onClick={() => setIsDepositModalOpen(true)}
                  className="px-6 py-3 bg-gradient-to-r from-primary to-purple-600 text-white font-bold text-sm rounded-lg hover:shadow-lg hover:shadow-primary/50 transition-all"
                >
                  Generate Deposit Address
                </button>
              </div>

              {/* Info Cards */}
              <div className="grid md:grid-cols-3 gap-3">
                <div className="p-3 bg-light-bg-tertiary dark:bg-dark-bg-tertiary rounded-lg">
                  <h4 className="text-xs font-medium text-light-text dark:text-white mb-1">
                    Supported Networks
                  </h4>
                  <p className="text-[10px] text-light-text-secondary dark:text-white/60">
                    Ethereum, Base, Optimism, Arbitrum, Solana + Testnets
                  </p>
                </div>
                <div className="p-3 bg-light-bg-tertiary dark:bg-dark-bg-tertiary rounded-lg">
                  <h4 className="text-xs font-medium text-light-text dark:text-white mb-1">
                    Processing Time
                  </h4>
                  <p className="text-[10px] text-light-text-secondary dark:text-white/60">
                    Instant after network confirmations
                  </p>
                </div>
                <div className="p-3 bg-light-bg-tertiary dark:bg-dark-bg-tertiary rounded-lg">
                  <h4 className="text-xs font-medium text-light-text dark:text-white mb-1">
                    Minimum Deposit
                  </h4>
                  <p className="text-[10px] text-light-text-secondary dark:text-white/60">
                    0.001 for all supported currencies
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Withdraw Tab */}
          {activeTab === 'withdraw' && (
            <div className="space-y-4 max-w-2xl mx-auto">
              <div className="text-center mb-4">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-orange-400 to-red-400 rounded-xl mb-2">
                  <ArrowUpCircle className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-light-text dark:text-white mb-0.5">
                  Withdraw Funds
                </h3>
                <p className="text-xs text-light-text-secondary dark:text-white/60">
                  Withdraw from your {activeNetwork === 'mainnet' ? 'mainnet' : 'testnet'} balance to external wallet
                </p>
                <div className="mt-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-lg inline-block">
                  <span className="text-xs text-primary font-medium">
                    Available Balance: ${activeBalance.toFixed(2)} ({activeNetwork === 'mainnet' ? 'Mainnet' : 'Testnet'})
                  </span>
                </div>
              </div>

              {/* Token Selection */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-light-text dark:text-white">
                  Select Token
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {tokens.map((token) => (
                    <button
                      key={token.id}
                      type="button"
                      onClick={() => setSelectedCurrency(token.id as 'USDC' | 'USDT')}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        selectedCurrency === token.id
                          ? 'border-primary bg-primary/10'
                          : 'border-light-border dark:border-dark-border bg-light-bg-tertiary dark:bg-dark-bg-tertiary hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 relative">
                          <Image
                            src={token.icon}
                            alt={token.label}
                            width={32}
                            height={32}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <span className="text-sm font-medium text-light-text dark:text-white">
                          {token.label}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Network Selection */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-light-text dark:text-white">
                  Select Network
                </label>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                  {chains.map((chain) => (
                    <button
                      key={chain.id}
                      type="button"
                      onClick={() => setSelectedChain(chain.id as ChainType)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        selectedChain === chain.id
                          ? 'border-primary bg-primary/10'
                          : 'border-light-border dark:border-dark-border bg-light-bg-tertiary dark:bg-dark-bg-tertiary hover:border-primary/50'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-1.5">
                        <div className="w-8 h-8 relative">
                          <Image
                            src={chain.icon}
                            alt={chain.label}
                            width={32}
                            height={32}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <span className="text-[10px] font-medium text-light-text dark:text-white">
                          {chain.label}
                        </span>
                        {withdrawalFees[chain.id] !== undefined && (
                          <span className="text-[9px] text-light-text-secondary dark:text-white/60">
                            ${withdrawalFees[chain.id]}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Withdraw Address */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-light-text dark:text-white">
                  Withdrawal Address
                </label>
                <input
                  type="text"
                  value={withdrawAddress}
                  onChange={(e) => setWithdrawAddress(e.target.value)}
                  placeholder={selectedChain === 'solana' ? 'Enter Solana address' : 'Enter EVM address (0x...)'}
                  className="w-full px-3 py-2.5 text-sm bg-light-bg-tertiary dark:bg-dark-bg-tertiary border border-light-border dark:border-dark-border rounded-lg text-light-text dark:text-white placeholder-light-text-secondary dark:placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <p className="text-[10px] text-light-text-secondary dark:text-white/60">
                  {selectedChain === 'solana' 
                    ? 'Expected: Base58 encoded address (32-44 characters)' 
                    : 'Expected: 0x followed by 40 hexadecimal characters'}
                </p>
              </div>

              {/* Amount */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-medium text-light-text dark:text-white">
                    Amount (USD)
                  </label>
                  <span className="text-[10px] text-light-text-secondary dark:text-white/60">
                    Available: ${activeBalance.toFixed(2)}
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    min="10"
                    className="w-full px-3 py-2.5 pr-16 text-sm bg-light-bg-tertiary dark:bg-dark-bg-tertiary border border-light-border dark:border-dark-border rounded-lg text-light-text dark:text-white placeholder-light-text-secondary dark:placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <button
                    onClick={() => {
                      const maxAmount = Math.max(0, activeBalance - currentFee);
                      setWithdrawAmount(maxAmount.toFixed(2));
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-primary/20 text-primary text-[10px] font-medium rounded hover:bg-primary/30 transition-colors"
                  >
                    MAX
                  </button>
                </div>
              </div>

              {/* Fee Info */}
              <div className="p-3 bg-light-bg-tertiary dark:bg-dark-bg-tertiary rounded-lg border border-light-border dark:border-dark-border space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-light-text-secondary dark:text-white/60">Withdrawal Amount</span>
                  <span className="text-light-text dark:text-white font-medium">
                    ${withdrawAmount || '0'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="text-light-text-secondary dark:text-white/60">Network Fee</span>
                    <div className="flex items-center gap-1">
                      <div className="w-3.5 h-3.5 relative">
                        <Image
                          src={chains.find(c => c.id === selectedChain)?.icon || ''}
                          alt={chains.find(c => c.id === selectedChain)?.label || ''}
                          width={14}
                          height={14}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <span className="text-[10px] text-light-text-secondary dark:text-white/60">
                        {chains.find(c => c.id === selectedChain)?.label}
                      </span>
                    </div>
                  </div>
                  <span className="text-light-text dark:text-white font-medium">
                    ${currentFee.toFixed(2)}
                  </span>
                </div>
                <div className="h-px bg-light-border dark:bg-dark-border"></div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-light-text-secondary dark:text-white/60">Total Deducted</span>
                  <span className="text-red-400 font-bold">
                    ${withdrawAmount ? (parseFloat(withdrawAmount) + currentFee).toFixed(2) : currentFee.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-light-text-secondary dark:text-white/60">You will receive</span>
                  <div className="flex items-center gap-1">
                    <span className="text-primary font-bold">
                      ~{withdrawAmount || '0'}
                    </span>
                    <div className="w-3.5 h-3.5 relative">
                      <Image
                        src={tokens.find(t => t.id === selectedCurrency)?.icon || ''}
                        alt={selectedCurrency}
                        width={14}
                        height={14}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <span className="text-primary font-bold">
                      {selectedCurrency}
                    </span>
                  </div>
                </div>
              </div>

              {/* Withdraw Button */}
              <button
                onClick={handleWithdraw}
                disabled={!withdrawAmount || !withdrawAddress || isWithdrawing}
                className="w-full py-3 text-sm bg-gradient-to-r from-orange-400 to-red-400 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-orange-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isWithdrawing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>Withdraw to {selectedCurrency}</>
                )}
              </button>

              {/* Warning */}
              <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-300 dark:border-yellow-500/20 rounded-lg">
                <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-yellow-800 dark:text-yellow-200/80">
                  <p className="font-medium mb-0.5">Important:</p>
                  <ul className="space-y-0.5 text-[10px]">
                    <li>• Withdrawals are processed from your real balance</li>
                    <li>• Double-check the withdrawal address and network</li>
                    <li>• Withdrawals processed from hot wallet within 5-30 minutes</li>
                    <li>• Minimum withdrawal: $10</li>
                    <li>• Network fees are deducted from your real balance</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-light-text dark:text-white">
                  Transaction History
                </h3>
                <button
                  onClick={fetchTransactionHistory}
                  disabled={isLoadingHistory}
                  className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
                >
                  {isLoadingHistory ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Clock className="w-3.5 h-3.5" />
                  )}
                  <span>Refresh</span>
                </button>
              </div>

              {isLoadingHistory && transactions.length === 0 ? (
                <div className="text-center py-12">
                  <Loader2 className="w-12 h-12 text-primary mx-auto mb-3 animate-spin" />
                  <p className="text-sm text-light-text-secondary dark:text-white/60">
                    Loading transactions...
                  </p>
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-12">
                  <History className="w-12 h-12 text-light-text-secondary dark:text-white/20 mx-auto mb-3" />
                  <p className="text-sm text-light-text-secondary dark:text-white/60">
                    No transactions yet
                  </p>
                  <p className="text-xs text-light-text-secondary dark:text-white/40 mt-1">
                    Your deposits and withdrawals will appear here
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="p-3 bg-light-bg-tertiary dark:bg-dark-bg-tertiary rounded-lg border border-light-border dark:border-dark-border hover:border-primary/50 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-1.5 rounded-lg ${
                            tx.type === 'deposit' 
                              ? 'bg-green-500/20' 
                              : 'bg-orange-500/20'
                          }`}>
                            {tx.type === 'deposit' ? (
                              <ArrowDownCircle className="w-4 h-4 text-green-400" />
                            ) : (
                              <ArrowUpCircle className="w-4 h-4 text-orange-400" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-medium text-sm text-light-text dark:text-white capitalize">
                                {tx.type}
                              </span>
                              <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded-full border ${getStatusColor(tx.status)}`}>
                                {tx.status}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-light-text-secondary dark:text-white/60">
                              <span>{tx.chain || 'Unknown'}</span>
                              <span>•</span>
                              <span>{new Date(tx.createdAt).toLocaleString()}</span>
                            </div>
                            {tx.txHash && (
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[10px] text-light-text-secondary dark:text-white/40 font-mono">
                                  {tx.txHash.length > 16 ? `${tx.txHash.slice(0, 8)}...${tx.txHash.slice(-8)}` : tx.txHash}
                                </span>
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(tx.txHash!);
                                    toast.success('Transaction hash copied!');
                                  }}
                                  className="p-0.5 hover:bg-light-border dark:hover:bg-white/10 rounded transition-colors"
                                >
                                  <Copy className="w-2.5 h-2.5 text-light-text-secondary dark:text-white/40" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-base font-bold ${
                            tx.type === 'deposit' ? 'text-green-400' : 'text-orange-400'
                          }`}>
                            {tx.type === 'deposit' ? '+' : '-'}{formatAmount(tx.amount, tx.token)} {tx.token}
                          </div>
                          <div className="flex justify-end mt-0.5">
                            {getStatusIcon(tx.status)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
      </motion.div>

      {/* Modern Deposit Modal */}
      <ModernDepositModal
        isOpen={isDepositModalOpen}
        onClose={() => setIsDepositModalOpen(false)}
      />
    </div>
  );
}
