'use client';

import React, { useEffect, useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import NotFound from '../../not-found';
import { getAdminDashboard } from '@/lib/api/admin';
import { Users, DollarSign, TrendingUp, Activity, Clock, CheckCircle } from 'lucide-react';

interface DashboardData {
  users: {
    total: number;
    active24h: number;
  };
  finance: {
    totalDeposits: number;
    totalWithdrawals: number;
    pendingWithdrawals: number;
    profit: number;
  };
  bets: {
    total: number;
    today: number;
    totalWinAmount: number;
  };
  platform: {
    activeGames: number;
    activePromotions: number;
  };
}

export default function AdminDashboardPage() {
  const { user } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);

  useEffect(() => {
    if (user && user?.role !== 'user') {
      setIsAdmin(true);

      const token = localStorage.getItem('token');
      if (token) {
        getAdminDashboard(token)
          .then((data) => setDashboardData(data))
          .catch((err) => console.error('Error fetching dashboard:', err))
          .finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    } else {
      setIsAdmin(false);
      setLoading(false);
    }
  }, [user]);

  if (!isAdmin) return <NotFound />;
  
  if (loading) {
    return (
      <div className="min-h-screen bg-light-bg dark:bg-dark-bg flex items-center justify-center">
        <div className="text-light-text dark:text-white">Loading dashboard...</div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-light-bg dark:bg-dark-bg flex items-center justify-center">
        <div className="text-light-text dark:text-white">Failed to load dashboard data</div>
      </div>
    );
  }

  const StatCard = ({ 
    title, 
    value, 
    subtitle, 
    icon: Icon, 
    gradient 
  }: { 
    title: string; 
    value: string | number; 
    subtitle?: string; 
    icon: any; 
    gradient: string; 
  }) => (
    <div className="bg-light-bg-secondary dark:bg-dark-bg-tertiary rounded-xl p-6 shadow-lg border border-light-border dark:border-transparent">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</h3>
        <div className={`p-3 rounded-lg bg-gradient-to-br ${gradient}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      <div className="mb-2">
        <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
      </div>
      {subtitle && (
        <p className="text-xs text-gray-600 dark:text-gray-400">{subtitle}</p>
      )}
    </div>
  );

  return (
    <div className="px-4 py-6 min-h-[calc(100vh-4rem)]">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Admin Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">Welcome back! Here's what's happening with your platform.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Users"
          value={dashboardData.users.total.toLocaleString()}
          subtitle={`${dashboardData.users.active24h} active in 24h`}
          icon={Users}
          gradient="from-blue-500 to-cyan-500"
        />
        
        <StatCard
          title="Total Deposits"
          value={`$${dashboardData.finance.totalDeposits.toLocaleString()}`}
          subtitle="All time"
          icon={DollarSign}
          gradient="from-green-500 to-emerald-500"
        />

        <StatCard
          title="Total Withdrawals"
          value={`$${dashboardData.finance.totalWithdrawals.toLocaleString()}`}
          subtitle={`${dashboardData.finance.pendingWithdrawals} pending`}
          icon={TrendingUp}
          gradient="from-purple-500 to-pink-500"
        />

        <StatCard
          title="Platform Profit"
          value={`$${dashboardData.finance.profit.toLocaleString()}`}
          subtitle="Deposits - Withdrawals"
          icon={Activity}
          gradient="from-yellow-500 to-orange-500"
        />

        <StatCard
          title="Total Bets"
          value={dashboardData.bets.total.toLocaleString()}
          subtitle={`${dashboardData.bets.today} today`}
          icon={Activity}
          gradient="from-red-500 to-rose-500"
        />

        <StatCard
          title="Total Wins"
          value={`$${dashboardData.bets.totalWinAmount.toLocaleString()}`}
          subtitle="Player winnings"
          icon={CheckCircle}
          gradient="from-indigo-500 to-purple-500"
        />

        <StatCard
          title="Active Games"
          value={dashboardData.platform.activeGames}
          subtitle="Available to play"
          icon={Activity}
          gradient="from-teal-500 to-cyan-500"
        />

        <StatCard
          title="Active Promotions"
          value={dashboardData.platform.activePromotions}
          subtitle="Currently running"
          icon={Activity}
          gradient="from-pink-500 to-rose-500"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <div className="bg-light-bg-secondary dark:bg-dark-bg-tertiary rounded-xl p-6 shadow-lg border border-light-border dark:border-transparent">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <a
              href="/admin/approve"
              className="block w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-center transition"
            >
              Review Withdrawals
            </a>
            <a
              href="/admin"
              className="block w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-center transition"
            >
              Manage Users
            </a>
            <a
              href="/admin/promocode"
              className="block w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-center transition"
            >
              Create Promo Code
            </a>
          </div>
        </div>

        <div className="bg-light-bg-secondary dark:bg-dark-bg-tertiary rounded-xl p-6 shadow-lg border border-light-border dark:border-transparent">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Platform Health</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Revenue Ratio</span>
              <span className="text-green-500 font-semibold">
                {dashboardData.finance.totalDeposits > 0 
                  ? `${((dashboardData.finance.profit / dashboardData.finance.totalDeposits) * 100).toFixed(2)}%`
                  : '0%'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Pending Actions</span>
              <span className="text-yellow-500 font-semibold">{dashboardData.finance.pendingWithdrawals}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Active Today</span>
              <span className="text-blue-500 font-semibold">{dashboardData.users.active24h}</span>
            </div>
          </div>
        </div>

        <div className="bg-light-bg-secondary dark:bg-dark-bg-tertiary rounded-xl p-6 shadow-lg border border-light-border dark:border-transparent">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <span className="text-gray-600 dark:text-gray-400">New users today:</span>
              <span className="text-gray-900 dark:text-white font-semibold">{dashboardData.users.active24h}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <span className="text-gray-600 dark:text-gray-400">Bets today:</span>
              <span className="text-gray-900 dark:text-white font-semibold">{dashboardData.bets.today}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <span className="text-gray-600 dark:text-gray-400">Pending reviews:</span>
              <span className="text-gray-900 dark:text-white font-semibold">{dashboardData.finance.pendingWithdrawals}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

