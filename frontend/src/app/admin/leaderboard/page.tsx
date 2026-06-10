"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "@/contexts/UserContext";
import NotFound from "../../not-found";
import { getAdminLeaderboards, updateLeaderboard } from "@/lib/api/admin";
import { Trophy, TrendingUp, Users, Award } from "lucide-react";
import { toast } from "react-toastify";

interface LeaderboardEntry {
  id: number;
  userId: number;
  username: string;
  avatarUrl: string;
  totalStake: number;
  totalWins: number;
  totalBets: number;
  totalWinAmount: number;
  country: string;
  rank: number;
  period: string;
  type: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminLeaderboardPage() {
  const { user } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [filter, setFilter] = useState<'all-time' | 'daily' | 'weekly' | 'monthly'>('all-time');

  const fetchLeaderboard = async (token: string) => {
    try {
      setLoading(true);
      const data = await getAdminLeaderboards(token);
      setLeaderboardData(data);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      toast.error('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user?.role !== 'user') {
      setIsAdmin(true);
      const token = localStorage.getItem('token');
      if (token) {
        fetchLeaderboard(token);
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
      <div className="min-h-screen flex items-center justify-center text-gray-900 dark:text-white">
        Loading leaderboard...
      </div>
    );
  }

  // Filter by period and remove duplicates by userId
  const filteredData = leaderboardData
    .filter(entry => entry.period === filter)
    .reduce((unique, entry) => {
      // Check if we already have this userId
      const exists = unique.find(item => item.userId === entry.userId);
      if (!exists) {
        unique.push(entry);
      }
      return unique;
    }, [] as LeaderboardEntry[])
    .sort((a, b) => a.rank - b.rank); // Ensure sorted by rank

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-500';
    if (rank === 2) return 'text-gray-400';
    if (rank === 3) return 'text-orange-600';
    return 'text-gray-300';
  };

  const getRankIcon = (rank: number) => {
    if (rank <= 3) {
      return <Trophy className={`w-6 h-6 ${getRankColor(rank)}`} />;
    }
    return <span className={`text-lg font-bold ${getRankColor(rank)}`}>#{rank}</span>;
  };

  return (
    <div className="px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Leaderboard Management</h1>
        <p className="text-gray-600 dark:text-gray-400">View and manage platform leaderboards</p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-light-bg-secondary dark:bg-dark-bg-tertiary rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Participants</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{filteredData.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-light-bg-secondary dark:bg-dark-bg-tertiary rounded-lg p-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Bets</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {filteredData.reduce((sum, entry) => sum + entry.totalBets, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-light-bg-secondary dark:bg-dark-bg-tertiary rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Award className="w-8 h-8 text-yellow-500" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Stakes</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${filteredData.reduce((sum, entry) => sum + entry.totalStake, 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-light-bg-secondary dark:bg-dark-bg-tertiary rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8 text-purple-500" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Wins</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${filteredData.reduce((sum, entry) => sum + entry.totalWinAmount, 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        {(['all-time', 'daily', 'weekly', 'monthly'] as const).map((filterOption) => (
          <button
            key={filterOption}
            onClick={() => setFilter(filterOption)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === filterOption
                ? 'bg-blue-600 text-white'
                : 'bg-light-bg-secondary dark:bg-dark-bg-tertiary text-gray-600 dark:text-gray-400 hover:bg-light-bg-tertiary dark:hover:bg-dark-border'
            }`}
          >
            {filterOption.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
          </button>
        ))}
      </div>

      {/* Leaderboard Table */}
      <div className="bg-light-bg-secondary dark:bg-dark-bg-tertiary rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-light-bg-tertiary dark:bg-dark-border">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">Rank</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">Player</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">Total Bets</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">Total Stake</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">Total Wins</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">Win Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">Win Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-border dark:divide-dark-border">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-600 dark:text-gray-400">
                    No leaderboard data available for this period
                  </td>
                </tr>
              ) : (
                filteredData.map((entry) => (
                  <tr key={`${entry.userId}-${entry.period}`} className="hover:bg-light-bg-tertiary dark:hover:bg-dark-border transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center w-12">
                        {getRankIcon(entry.rank)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={entry.avatarUrl || `/images/avatar/default.png`}
                          alt={entry.username}
                          className="w-10 h-10 rounded-full border-2 border-gray-600"
                        />
                        <div>
                          <p className="text-gray-900 dark:text-white font-medium">{entry.username}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">User ID: {entry.userId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-900 dark:text-white">{entry.totalBets}</td>
                    <td className="px-4 py-3 text-gray-900 dark:text-white font-semibold">${entry.totalStake.toFixed(2)}</td>
                    <td className="px-4 py-3 text-green-500">{entry.totalWins}</td>
                    <td className="px-4 py-3 text-green-500 font-semibold">${entry.totalWinAmount.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={`font-medium ${
                        (entry.totalWins / entry.totalBets * 100) > 50 
                          ? 'text-green-500' 
                          : 'text-red-500'
                      }`}>
                        {((entry.totalWins / entry.totalBets) * 100).toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Leaderboard Info */}
      <div className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Trophy className="w-6 h-6 text-blue-500 mt-1" />
          <div>
            <h3 className="text-gray-900 dark:text-white font-semibold mb-2">Leaderboard Information</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              The leaderboard tracks player performance across different time periods. Players are ranked based on their total stakes and wins.
            </p>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Daily: Resets every 24 hours</li>
              <li>• Weekly: Resets every Monday</li>
              <li>• Monthly: Resets on the 1st of each month</li>
              <li>• All-time: Never resets, tracks lifetime performance</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
