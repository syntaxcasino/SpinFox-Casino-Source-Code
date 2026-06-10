"use client";

import React, { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getLeaderboard, getMyLeaderboardPosition } from "@/lib/api/leaderboard";

export type LeaderboardEntry = {
  id: string;
  rank: number;
  username: string;
  avatarUrl?: string;
  stake: number; // total bet amount or score
  wins: number;
  country?: string;
  isCurrentUser?: boolean;
};

const medalForRank = (rank: number) => {
  if (rank === 1) return "bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-200 text-black";
  if (rank === 2) return "bg-gradient-to-r from-gray-300 via-gray-200 to-gray-100 text-black";
  if (rank === 3) return "bg-gradient-to-r from-amber-300 via-amber-200 to-amber-100 text-black";
  return "bg-light-bg-tertiary dark:bg-white/5 text-light-text dark:text-white";
};

const formatCurrency = (v: number) => {
  return v.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
};

export default function Leaderboard() {
  const pageSize = 10;
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly" | "all-time">("all-time");
  const [type, setType] = useState<"all" | "casino" | "sports">("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<"rank" | "stake" | "wins">("rank");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  // Fetch leaderboard data from backend
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      
      try {
        const data = await getLeaderboard({ period, limit: 100, type });
        
        if (!data || data.length === 0) {
          setError('No leaderboard data available for this period.');
          setEntries([]);
          return;
        }
        
        // Deduplicate entries by username (combine stakes and wins for same user)
        const userMap = new Map<string, LeaderboardEntry>();
        data.forEach(entry => {
          const existing = userMap.get(entry.username);
          if (existing) {
            // Combine stakes and wins for the same user
            existing.stake += entry.stake;
            existing.wins += entry.wins;
          } else {
            userMap.set(entry.username, { ...entry });
          }
        });
        
        // Convert back to array and re-rank
        const deduplicatedData = Array.from(userMap.values())
          .sort((a, b) => b.stake - a.stake) // Sort by stake descending
          .map((entry, index) => ({ ...entry, rank: index + 1 })); // Re-assign ranks
        
        // Try to get user's position if logged in
        const token = localStorage.getItem('token');
        if (token) {
          try {
            const myPosition = await getMyLeaderboardPosition(period, type);
            if (myPosition) {
              // Mark user's entry in the leaderboard
              const updatedData = deduplicatedData.map(entry => 
                entry.username === myPosition.username ? { ...entry, isCurrentUser: true } : entry
              );
              setEntries(updatedData);
              return;
            }
          } catch (err) {
            // User position fetch failed, but continue with regular leaderboard
            console.log('Could not fetch user position:', err);
          }
        }
        
        setEntries(deduplicatedData);
      } catch (err) {
        console.error('Failed to fetch leaderboard:', err);
        setError('Failed to load leaderboard. Please try again later.');
        setEntries([]);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [period, type]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = entries.slice();
    if (q) {
      list = list.filter(e => e.username.toLowerCase().includes(q) || (e.country || "").toLowerCase().includes(q));
    }

    list.sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortKey === "rank") return (a.rank - b.rank) * dir;
      if (sortKey === "stake") return (a.stake - b.stake) * dir;
      return (a.wins - b.wins) * dir;
    });

    return list;
  }, [entries, query, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageClamped = Math.min(Math.max(1, page), totalPages);
  const pageItems = filtered.slice((pageClamped - 1) * pageSize, pageClamped * pageSize);

  const handleSortToggle = (key: "rank" | "stake" | "wins") => {
    if (sortKey === key) setSortDir(s => (s === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir(key === "rank" ? "asc" : "desc");
    }
    setPage(1);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-light-text dark:text-white">Leaderboard</h1>
          <p className="text-sm text-light-text-secondary dark:text-white/60 mt-1">
            Top players ranked by total stake
          </p>
        </div>
        
        {/* Period selector */}
        <select
          value={period}
          onChange={(e) => {
            setPeriod(e.target.value as any);
            setPage(1);
          }}
          disabled={loading}
          className="px-4 py-2.5 rounded-lg bg-light-bg-secondary dark:bg-dark-bg-secondary text-sm font-medium text-light-text dark:text-white border border-light-border dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-colors"
        >
          <option value="all-time">🏆 All Time</option>
          <option value="monthly">📅 This Month</option>
          <option value="weekly">📊 This Week</option>
          <option value="daily">⚡ Today</option>
        </select>
      </div>

      {/* Type Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { id: 'all', label: 'All Games', icon: '🎮' },
          { id: 'casino', label: 'Casino / Slots', icon: '🎰' },
          { id: 'sports', label: 'Sports Betting', icon: '⚽' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setType(tab.id as any);
              setPage(1);
            }}
            disabled={loading}
            className={`flex-1 px-4 py-3 rounded-lg font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              type === tab.id
                ? 'bg-primary text-white shadow-lg'
                : 'bg-light-bg-secondary dark:bg-dark-bg-secondary text-light-text dark:text-white border border-light-border dark:border-dark-border hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search and Stats */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <input
            value={query}
            onChange={e => { setQuery(e.target.value); setPage(1); }}
            placeholder="Search by username or country..."
            disabled={loading}
            className="w-full px-4 py-2.5 pl-10 rounded-lg bg-light-bg-secondary dark:bg-dark-bg-secondary placeholder:text-light-text-secondary/50 dark:placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary text-sm text-light-text dark:text-white border border-light-border dark:border-dark-border disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-colors"
            aria-label="Search leaderboard"
          />
          <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-light-text-secondary dark:text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <div className="flex items-center gap-2 px-4 py-2.5 bg-light-bg-tertiary dark:bg-dark-bg-tertiary rounded-lg border border-light-border dark:border-dark-border">
          <svg className="w-5 h-5 text-light-text-secondary dark:text-white/60" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
          </svg>
          <span className="text-sm font-medium text-light-text dark:text-white">
            {filtered.length} {filtered.length === 1 ? 'Player' : 'Players'}
          </span>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-2xl border border-light-border dark:border-dark-border shadow-sm">
          <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-primary mb-4"></div>
          <p className="text-sm text-light-text-secondary dark:text-white/60">Loading leaderboard...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-2xl border border-light-border dark:border-dark-border shadow-sm">
          <svg className="w-16 h-16 text-red-400 dark:text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-lg font-medium text-light-text dark:text-white mb-2">Oops! Something went wrong</p>
          <p className="text-sm text-light-text-secondary dark:text-white/60 mb-6">{error}</p>
          <button
            onClick={() => {
              setError(null);
              window.location.reload();
            }}
            className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors shadow-sm"
          >
            Try Again
          </button>
        </div>
      ) : (
        <div className="bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-2xl shadow-lg border border-light-border dark:border-dark-border overflow-hidden">
          {/* Table Header */}
          <div className="hidden md:grid grid-cols-12 gap-4 py-3 px-6 text-xs font-semibold text-light-text-secondary dark:text-white/60 uppercase tracking-wider bg-light-bg-tertiary dark:bg-dark-bg-tertiary border-b border-light-border dark:border-dark-border">
            <div className="col-span-1 flex items-center">Rank</div>
            <div className="col-span-4 flex items-center">Player</div>
            <button
              onClick={() => handleSortToggle("stake")}
              className="col-span-3 flex items-center gap-2 hover:text-primary transition-colors"
              aria-label="Sort by stake"
            >
              Total Stake
              {sortKey === "stake" && (
                <span className="text-primary">{sortDir === "asc" ? "↑" : "↓"}</span>
              )}
            </button>
            <button
              onClick={() => handleSortToggle("wins")}
              className="col-span-2 flex items-center gap-2 hover:text-primary transition-colors"
              aria-label="Sort by wins"
            >
              Wins
              {sortKey === "wins" && (
                <span className="text-primary">{sortDir === "asc" ? "↑" : "↓"}</span>
              )}
            </button>
            <div className="col-span-2 text-right flex items-center justify-end">Reward</div>
          </div>

          {/* Table Body */}
          <ul className="divide-y divide-light-border dark:divide-dark-border">
            {pageItems.map((e) => (
              <motion.li
                key={e.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18 }}
                className={`group grid grid-cols-1 md:grid-cols-12 gap-4 py-4 px-6 hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary transition-colors ${
                  e.isCurrentUser 
                    ? "bg-primary/5 dark:bg-primary/10 border-l-4 border-primary" 
                    : ""
                }`}
              >
                {/* Rank - Desktop */}
                <div className="hidden md:flex col-span-1 items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm ${medalForRank(e.rank)}`}>
                    {e.rank <= 3 ? (
                      <span>{e.rank === 1 ? "🥇" : e.rank === 2 ? "🥈" : "🥉"}</span>
                    ) : (
                      <span>#{e.rank}</span>
                    )}
                  </div>
                </div>

                {/* Player Info */}
                <div className="md:col-span-4 flex items-center gap-3">
                  <div className="relative flex-shrink-0">
                    {e.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img 
                        src={e.avatarUrl} 
                        alt={e.username} 
                        className="w-12 h-12 md:w-10 md:h-10 rounded-full object-cover border-2 border-light-border dark:border-dark-border" 
                      />
                    ) : (
                      <div className="w-12 h-12 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold border-2 border-light-border dark:border-dark-border">
                        {e.username.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    {e.isCurrentUser && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full border-2 border-light-bg-secondary dark:border-dark-bg-secondary flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm md:text-base font-semibold truncate ${
                        e.isCurrentUser 
                          ? "text-primary" 
                          : "text-light-text dark:text-white"
                      }`}>
                        {e.username}
                      </span>
                      <span className="md:hidden text-xs font-medium text-light-text-secondary dark:text-white/60">
                        #{e.rank}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-light-text-secondary dark:text-white/60">
                      <span>🌍</span>
                      <span>{e.country || "Unknown"}</span>
                    </div>
                  </div>
                </div>

                {/* Stake - Desktop */}
                <div className="hidden md:flex md:col-span-3 items-center">
                  <div>
                    <div className="text-sm font-semibold text-light-text dark:text-white">
                      ${formatCurrency(e.stake)}
                    </div>
                    <div className="text-xs text-light-text-secondary dark:text-white/60">
                      Total staked
                    </div>
                  </div>
                </div>

                {/* Wins - Desktop */}
                <div className="hidden md:flex md:col-span-2 items-center">
                  <div>
                    <div className="text-sm font-semibold text-light-text dark:text-white">
                      {e.wins}
                    </div>
                    <div className="text-xs text-light-text-secondary dark:text-white/60">
                      Total wins
                    </div>
                  </div>
                </div>

                {/* Reward - Desktop */}
                <div className="hidden md:flex md:col-span-2 items-center justify-end">
                  <div className="text-right">
                    <div className="text-sm font-bold text-green-600 dark:text-green-400">
                      ${formatCurrency(Math.round(e.stake * 0.1))}
                    </div>
                    <div className="text-xs text-light-text-secondary dark:text-white/60">
                      Estimated
                    </div>
                  </div>
                </div>

                {/* Mobile Stats */}
                <div className="md:hidden grid grid-cols-3 gap-4 mt-2 pt-3 border-t border-light-border dark:border-dark-border">
                  <div>
                    <div className="text-xs text-light-text-secondary dark:text-white/60 mb-1">Stake</div>
                    <div className="text-sm font-semibold text-light-text dark:text-white">
                      ${formatCurrency(e.stake)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-light-text-secondary dark:text-white/60 mb-1">Wins</div>
                    <div className="text-sm font-semibold text-light-text dark:text-white">
                      {e.wins}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-light-text-secondary dark:text-white/60 mb-1">Reward</div>
                    <div className="text-sm font-bold text-green-600 dark:text-green-400">
                      ${formatCurrency(Math.round(e.stake * 0.1))}
                    </div>
                  </div>
                </div>
              </motion.li>
            ))}

            {pageItems.length === 0 && (
              <li className="py-16 px-6 text-center">
                <svg className="mx-auto w-16 h-16 text-light-text-secondary/30 dark:text-white/20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p className="text-light-text-secondary dark:text-white/60 font-medium">No players found</p>
                <p className="text-sm text-light-text-secondary/70 dark:text-white/40 mt-1">Try adjusting your search or filters</p>
              </li>
            )}
          </ul>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-6 bg-light-bg-tertiary dark:bg-dark-bg-tertiary border-t border-light-border dark:border-dark-border">
            <div className="text-sm text-light-text-secondary dark:text-white/60">
              Showing <span className="font-semibold text-light-text dark:text-white">{pageItems.length}</span> of{" "}
              <span className="font-semibold text-light-text dark:text-white">{filtered.length}</span> players
              <span className="hidden sm:inline"> • Page {pageClamped} of {totalPages}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(1)}
                disabled={pageClamped <= 1}
                className="px-3 py-2 rounded-lg bg-light-bg-secondary dark:bg-dark-bg-secondary text-sm font-medium text-light-text dark:text-white hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-light-border dark:border-dark-border"
                aria-label="First page"
              >
                ««
              </button>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={pageClamped <= 1}
                className="px-4 py-2 rounded-lg bg-light-bg-secondary dark:bg-dark-bg-secondary text-sm font-medium text-light-text dark:text-white hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-light-border dark:border-dark-border"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-sm font-semibold text-light-text dark:text-white">
                {pageClamped}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={pageClamped >= totalPages}
                className="px-4 py-2 rounded-lg bg-light-bg-secondary dark:bg-dark-bg-secondary text-sm font-medium text-light-text dark:text-white hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-light-border dark:border-dark-border"
              >
                Next
              </button>
              <button
                onClick={() => setPage(totalPages)}
                disabled={pageClamped >= totalPages}
                className="px-3 py-2 rounded-lg bg-light-bg-secondary dark:bg-dark-bg-secondary text-sm font-medium text-light-text dark:text-white hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-light-border dark:border-dark-border"
                aria-label="Last page"
              >
                »»
              </button>
            </div>
          </div>

          {/* Footer Info */}
          <div className="px-6 py-4 bg-light-bg-tertiary/50 dark:bg-dark-bg-tertiary/30 border-t border-light-border dark:border-dark-border">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-light-text-secondary dark:text-white/60">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span>Click column headers to sort • Top 3 players get special medals</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="inline-block w-2 h-2 bg-primary rounded-full"></span>
                <span>Your position</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
