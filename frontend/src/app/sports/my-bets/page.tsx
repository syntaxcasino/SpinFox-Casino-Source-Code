'use client';

import React, { useEffect, useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { getUserSportsBets, claimSportsBetWinnings, SportsBet } from '@/lib/api';
import { formatTimestamp } from '@/utils/general';
import { formatOdds } from '@/utils/oddsFormatter';
import { useOddsPreferenceStore } from '@/store/oddsPreference';
import { toast } from 'react-toastify';
import { ClipLoader } from 'react-spinners';
import { Trophy, XCircle, Clock, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

type BetTab = 'all' | 'open' | 'won' | 'lost';

// Calculate potential payout based on odds type
const calculatePotentialPayout = (amount: number, odds: number, oddsType: string = 'normalizedImplied'): number => {
  switch (oddsType) {
    case 'decimal':
      return amount * odds;
    case 'normalizedImplied':
      return amount / odds;
    case 'american':
      if (odds > 0) {
        return amount * (1 + odds / 100);
      } else {
        return amount * (1 + 100 / Math.abs(odds));
      }
    default:
      return amount / odds; // Default to normalizedImplied
  }
};

export default function MyBetsPage() {
  const { user, setUserBalance } = useUser();
  const router = useRouter();
  const { oddsFormat } = useOddsPreferenceStore();
  const [activeTab, setActiveTab] = useState<BetTab>('all');
  const [bets, setBets] = useState<SportsBet[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [claimingBetId, setClaimingBetId] = useState<number | null>(null);
  const [expandedBetId, setExpandedBetId] = useState<number | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/sports');
      return;
    }
    fetchBets();
  }, [user, activeTab]);

  const fetchBets = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to view your bets');
        return;
      }

      const status = activeTab === 'all' ? undefined : activeTab;
      const fetchedBets = await getUserSportsBets(token, status);
      setBets(fetchedBets);
    } catch (error: any) {
      console.error('Failed to fetch bets:', error);
      toast.error('Failed to fetch bets');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClaimWinnings = async (betId: number) => {
    setClaimingBetId(betId);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to claim winnings');
        return;
      }

      await claimSportsBetWinnings(token, betId);
      toast.success('Winnings claimed successfully!');
      
      // Update user balance
      await setUserBalance(token);
      
      // Refresh bets
      fetchBets();
    } catch (error: any) {
      console.error('Failed to claim winnings:', error);
      toast.error(error.message || 'Failed to claim winnings');
    } finally {
      setClaimingBetId(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'won':
        return <Trophy className="w-5 h-5 text-green-500" />;
      case 'lost':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase";
    switch (status) {
      case 'open':
        return `${baseClasses} bg-blue-500/20 text-blue-400`;
      case 'won':
        return `${baseClasses} bg-green-500/20 text-green-400`;
      case 'lost':
        return `${baseClasses} bg-red-500/20 text-red-400`;
      default:
        return `${baseClasses} bg-gray-500/20 text-gray-400`;
    }
  };

  const filteredBets = bets;

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-6 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-light-text dark:text-white mb-1">My Bets</h1>
          <p className="text-sm text-light-text-secondary dark:text-white/60">View and manage your sports bets</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1.5 mb-4 border-b border-light-border dark:border-dark-border overflow-x-auto">
          {(['all', 'open', 'won', 'lost'] as BetTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 font-medium text-xs uppercase transition-colors whitespace-nowrap ${
                activeTab === tab
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-light-text-secondary dark:text-white/50 hover:text-light-text dark:hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Bets List */}
        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <ClipLoader color="#896cef" size={40} />
          </div>
        ) : filteredBets.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-light-bg-tertiary dark:bg-dark-bg-tertiary flex items-center justify-center">
              <Trophy className="w-8 h-8 text-light-text-secondary dark:text-white/30" />
            </div>
            <h3 className="text-lg font-semibold text-light-text dark:text-white mb-1">
              No bets found
            </h3>
            <p className="text-sm text-light-text-secondary dark:text-white/60 mb-4">
              {activeTab === 'all' 
                ? "You haven't placed any bets yet. Start betting on your favorite sports!"
                : `You don't have any ${activeTab} bets.`}
            </p>
            <button
              onClick={() => router.push('/sports')}
              className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
            >
              Browse Sports
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredBets.map((bet) => (
              <div
                key={bet.id}
                className="bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-xl p-4 border border-light-border dark:border-dark-border hover:border-primary/50 transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                  {/* Left: Bet Info */}
                  <div className="flex-1 space-y-2">
                    {/* Status and Date */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={getStatusBadge(bet.status)}>
                        {bet.status}
                      </span>
                      <span className="text-[10px] text-light-text-secondary dark:text-white/40">
                        {formatTimestamp(bet.maturity)}
                      </span>
                      <span className="text-[10px] text-light-text-secondary dark:text-white/40">
                        Bet ID: #{bet.id}
                      </span>
                    </div>

                    {/* Match Info */}
                    <div>
                      {bet.betType === 'parlay' ? (
                        <>
                          <h3 className="text-base font-semibold text-light-text dark:text-white flex items-center gap-2">
                            🎰 Parlay Bet ({bet.parlaySelections?.length || 0} Selections)
                          </h3>
                          <p className="text-xs text-light-text-secondary dark:text-white/50 mt-1">
                            Combined odds from multiple selections
                          </p>
                        </>
                      ) : (
                        <>
                          <h3 className="text-base font-semibold text-light-text dark:text-white">
                            {bet.homeTeam} vs {bet.awayTeam}
                          </h3>
                          {bet.tournamentName && (
                            <p className="text-xs text-light-text-secondary dark:text-white/50">
                              {bet.tournamentName}
                            </p>
                          )}
                        </>
                      )}
                    </div>

                    {/* Bet Details */}
                    {bet.betType === 'parlay' ? (
                      <div className="flex items-center gap-3 flex-wrap text-xs">
                        <div>
                          <span className="text-light-text-secondary dark:text-white/50">Selections: </span>
                          <span className="text-primary font-medium">{bet.parlaySelections?.length || 0}</span>
                        </div>
                        <div>
                          <span className="text-light-text-secondary dark:text-white/50">Combined Odds: </span>
                          <span className="text-light-text dark:text-white font-medium">
                            {formatOdds(bet.odds, oddsFormat, (bet.oddsType || 'normalizedImplied') as any)}
                          </span>
                        </div>
                        <button
                          onClick={() => setExpandedBetId(expandedBetId === bet.id ? null : bet.id)}
                          className="text-primary hover:text-primary-hover font-medium underline"
                        >
                          {expandedBetId === bet.id ? 'Hide Details' : 'View Details'}
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 flex-wrap text-xs">
                        <div>
                          <span className="text-light-text-secondary dark:text-white/50">Pick: </span>
                          <span className="text-primary font-medium">{bet.positionLabel}</span>
                        </div>
                        {bet.marketType && (
                          <div>
                            <span className="text-light-text-secondary dark:text-white/50">Market: </span>
                            <span className="text-light-text dark:text-white font-medium">{bet.marketType}</span>
                          </div>
                        )}
                        <div>
                          <span className="text-light-text-secondary dark:text-white/50">Odds: </span>
                          <span className="text-light-text dark:text-white font-medium">
                            {formatOdds(bet.odds, oddsFormat, (bet.oddsType || 'normalizedImplied') as any)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right: Amounts and Actions */}
                  <div className="flex flex-col gap-2 lg:items-end lg:min-w-[180px]">
                    {/* Bet Amount */}
                    <div className="text-xs">
                      <p className="text-light-text-secondary dark:text-white/50">Bet Amount</p>
                      <p className="text-base font-semibold text-light-text dark:text-white">
                        ${bet.amount.toFixed(2)}
                      </p>
                    </div>

                    {/* Potential/Actual Payout */}
                    <div className="text-xs">
                      <p className="text-light-text-secondary dark:text-white/50">
                        {bet.status === 'open' ? 'Potential Payout' : bet.status === 'won' ? 'Winnings' : 'Payout'}
                      </p>
                      <p className={`text-base font-semibold ${
                        bet.status === 'won' ? 'text-green-400' : 
                        bet.status === 'lost' ? 'text-red-400' : 
                        'text-primary'
                      }`}>
                        {bet.status === 'won' || bet.status === 'open' 
                          ? `$${calculatePotentialPayout(bet.amount, bet.odds, bet.oddsType || 'normalizedImplied').toFixed(2)}`
                          : '$0.00'}
                      </p>
                    </div>

                    {/* Claim Button */}
                    {bet.status === 'won' && !bet.claimed && (
                      <button
                        onClick={() => handleClaimWinnings(bet.id)}
                        disabled={claimingBetId === bet.id}
                        className="w-full lg:w-auto bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {claimingBetId === bet.id ? (
                          <>
                            <ClipLoader color="#ffffff" size={14} />
                            Claiming...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-3.5 h-3.5" />
                            Claim Winnings
                          </>
                        )}
                      </button>
                    )}

                    {bet.status === 'won' && bet.claimed && (
                      <div className="w-full lg:w-auto bg-green-500/20 text-green-400 px-5 py-2 rounded-lg text-sm font-semibold text-center flex items-center justify-center gap-2">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Claimed
                      </div>
                    )}
                  </div>
                </div>

                {/* Parlay Details Expansion */}
                {bet.betType === 'parlay' && expandedBetId === bet.id && bet.parlaySelections && (
                  <div className="mt-4 pt-4 border-t border-light-border dark:border-dark-border">
                    <h4 className="text-sm font-semibold text-light-text dark:text-white mb-3">
                      Parlay Selections ({bet.parlaySelections.length})
                    </h4>
                    <div className="space-y-2">
                      {bet.parlaySelections.map((selection, index) => (
                        <div
                          key={index}
                          className="p-3 bg-light-bg-tertiary dark:bg-dark-bg-tertiary rounded-lg border border-light-border dark:border-dark-border"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-bold text-primary">#{index + 1}</span>
                                <h5 className="text-sm font-semibold text-light-text dark:text-white">
                                  {selection.homeTeam} vs {selection.awayTeam}
                                </h5>
                              </div>
                              {selection.tournamentName && (
                                <p className="text-[10px] text-light-text-secondary dark:text-white/40 mb-1">
                                  {selection.tournamentName}
                                </p>
                              )}
                              <div className="flex items-center gap-3 flex-wrap text-[10px]">
                                <div>
                                  <span className="text-light-text-secondary dark:text-white/50">Pick: </span>
                                  <span className="text-primary font-medium">{selection.positionLabel}</span>
                                </div>
                                {selection.marketType && (
                                  <div>
                                    <span className="text-light-text-secondary dark:text-white/50">Market: </span>
                                    <span className="text-light-text dark:text-white font-medium">{selection.marketType}</span>
                                  </div>
                                )}
                                <div>
                                  <span className="text-light-text-secondary dark:text-white/50">Odds: </span>
                                  <span className="text-light-text dark:text-white font-medium">
                                    {formatOdds(selection.odds, oddsFormat, selection.oddsType as any)}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="text-xs sm:text-right">
                              <p className="text-light-text-secondary dark:text-white/40">
                                Game ID: {selection.gameId}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

