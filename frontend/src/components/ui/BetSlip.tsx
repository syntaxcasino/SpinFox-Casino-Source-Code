'use client';

import React, { useState, useMemo } from 'react';
import { useBetSlipStore } from '@/store/betSlip';
import { useOddsPreferenceStore } from '@/store/oddsPreference';
import { formatTimestamp } from '@/utils/general';
import { formatOdds } from '@/utils/oddsFormatter';
import { X, ChevronDown, ChevronUp, Trash2, Ticket } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { useNetwork } from '@/contexts/NetworkContext';
import { placeSportsBet } from '@/lib/api';
import { toast } from 'react-toastify';
// import { useAppKitNetwork } from '@reown/appkit/react';

const BetSlipModal = () => {
  const {
    selectedTickets,
    isCollapsed,
    toggleCollapsed,
    removeTicket,
    removeTicketByMarket,
    clearAllTickets,
  } = useBetSlipStore();
  const { oddsFormat } = useOddsPreferenceStore();
  const { user, setUserBalance } = useUser();
  const { activeNetwork, getActiveChainId } = useNetwork();
  // const { chainId } = useAppKitNetwork();

  const [buyInAmount, setBuyInAmount] = useState<string>('0');
  const [isPlacingBet, setIsPlacingBet] = useState<boolean>(false);

  // Calculate total decimal odds from normalized odds
  // For normalized odds: decimalOdds = 1 / normalizedOdds
  // For parlay: multiply all decimal odds together
  const totalDecimalOdds = useMemo(() => {
    if (selectedTickets.length === 0) return 0;
    return selectedTickets.reduce((acc, ticket) => {
      const decimalOdd = 1 / ticket.odds; // Convert normalized to decimal
      return acc * decimalOdd;
    }, 1);
  }, [selectedTickets]);

  // Calculate total normalized odds (for display purposes)
  const totalNormalizedOdds = useMemo(() => {
    if (totalDecimalOdds === 0) return 0;
    return 1 / totalDecimalOdds;
  }, [totalDecimalOdds]);

  // Calculate potential payout
  const potentialPayout = useMemo(() => {
    const buyIn = parseFloat(buyInAmount) || 0;
    return buyIn * totalDecimalOdds;
  }, [buyInAmount, totalDecimalOdds]);

  // Calculate potential profit
  const potentialProfit = useMemo(() => {
    const buyIn = parseFloat(buyInAmount) || 0;
    return potentialPayout - buyIn;
  }, [potentialPayout, buyInAmount]);

  // Get user's balance based on active network
  const userRealBalance = useMemo(() => {
    if (!user) return 0;
    return activeNetwork === 'mainnet' ? (user.realBalance || 0) : (user.testBalance || 0);
  }, [user, activeNetwork]);

  // Handle MAX button click
  const handleMaxClick = () => {
    setBuyInAmount(userRealBalance.toString());
  };

  // Handle place bet
  const handlePlaceBet = async () => {
    if (!user) {
      toast.error('Please login to place a bet');
      return;
    }

    const amount = parseFloat(buyInAmount);
    if (amount <= 0) {
      toast.error('Please enter a valid bet amount');
      return;
    }
    console.log(userRealBalance, amount);
    if (amount > userRealBalance) {
      toast.error('Insufficient balance');
      return;
    }

    if (selectedTickets.length === 0) {
      toast.error('Please select at least one ticket');
      return;
    }

    setIsPlacingBet(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to place a bet');
        return;
      }

      const isParlay = selectedTickets.length > 1;
      
      let betData: any;

      if (isParlay) {
        // Parlay bet - multiple selections
        betData = {
          betType: 'parlay',
          parlaySelections: selectedTickets.map(ticket => ({
            gameId: ticket.gameId,
            sportId: ticket.sportId,
            typeId: ticket.typeId,
            maturity: ticket.maturity,
            line: ticket.line,
            playerId: ticket.playerId,
            position: ticket.position,
            homeTeam: ticket.homeTeam,
            awayTeam: ticket.awayTeam,
            tournamentName: ticket.tournamentName,
            positionLabel: ticket.positionLabel,
            marketType: ticket.marketType,
            odds: ticket.odds,
            oddsType: 'normalizedImplied',
          })),
          amount: amount,
          live: false,
          networkId: getActiveChainId(), // Use active network's chainId
        };
      } else {
        // Single bet
        const ticket = selectedTickets[0];
        betData = {
          betType: 'single',
          gameId: ticket.gameId,
          sportId: ticket.sportId,
          typeId: ticket.typeId,
          maturity: ticket.maturity,
          line: ticket.line,
          playerId: ticket.playerId,
          odds: ticket.odds,
          oddsType: 'normalizedImplied',
          position: ticket.position,
          homeTeam: ticket.homeTeam,
          awayTeam: ticket.awayTeam,
          tournamentName: ticket.tournamentName,
          positionLabel: ticket.positionLabel,
          marketType: ticket.marketType,
          amount: amount,
          combinedPositions: ticket.combinedPositions,
          merkleProof: ticket.merkleProof,
          live: ticket.live,
          networkId: getActiveChainId(), // Use active network's chainId
        };
      }

      const result = await placeSportsBet(token, betData);
      
      // Note: Balance update will be handled automatically via WebSocket
      // No need to manually refresh balance here
      
      // Clear bet slip
      clearAllTickets();
      setBuyInAmount('0');
    } catch (error: any) {
      console.error('Failed to place bet:', error);
      toast.error(error.message || 'Failed to place bet');
    } finally {
      setIsPlacingBet(false);
    }
  };

  // Always render if there are tickets
  if (selectedTickets.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[400px] max-w-[calc(100vw-48px)] animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-[16px] shadow-2xl border border-light-border dark:border-dark-border overflow-hidden transition-colors duration-300">
        {/* Header */}
        <div
          className="flex items-center justify-between p-4 bg-light-bg-tertiary dark:bg-dark-bg-tertiary cursor-pointer hover:bg-light-border dark:hover:bg-dark-border transition-colors"
          onClick={toggleCollapsed}
        >
          <div className="flex items-center gap-2">
            <div className="bg-[#896cef] p-1.5 rounded-lg">
              <Ticket className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-light-text dark:text-white font-semibold text-sm">TICKET SLIP</h3>
              <p className="text-primary text-xs font-medium">
                {selectedTickets.length} {selectedTickets.length === 1 ? 'Selection' : 'Selections'}
              </p>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleCollapsed();
            }}
            className="text-light-text-secondary dark:text-white/50 hover:text-light-text dark:hover:text-white transition-colors"
          >
            {isCollapsed ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Content */}
        {!isCollapsed && (
          <div className="max-h-[calc(100vh-200px)] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-[#221d35] [&::-webkit-scrollbar-thumb]:bg-[#7b45ac] [&::-webkit-scrollbar-thumb]:rounded-md [&::-webkit-scrollbar-thumb:hover]:bg-[#8b55bc]">
            {/* Network Indicator */}
            <div className={`mx-4 mt-4 p-2 rounded-lg border-l-4 ${
              activeNetwork === 'mainnet'
                ? 'bg-green-500/10 border-green-500'
                : 'bg-orange-500/10 border-orange-500'
            }`}>
              <div className="flex items-center gap-2">
                <span className={`inline-block w-2 h-2 rounded-full ${
                  activeNetwork === 'mainnet' ? 'bg-green-500' : 'bg-orange-500'
                }`}></span>
                <span className={`text-xs font-bold ${
                  activeNetwork === 'mainnet' 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-orange-600 dark:text-orange-400'
                }`}>
                  Betting on {activeNetwork.toUpperCase()}
                </span>
              </div>
              <p className="text-[10px] text-light-text-secondary dark:text-white/50 mt-1">
                Using {activeNetwork === 'mainnet' ? 'Real' : 'Test'} Balance: ${(activeNetwork === 'mainnet' ? user?.realBalance : user?.testBalance || 0).toFixed(2)}
              </p>
            </div>
            {/* Selected Tickets */}
            <div className="p-4 space-y-2">
              {selectedTickets.map((ticket, index) => (
                <div
                  key={`${ticket.gameId}-${ticket.typeId}-${ticket.line || 0}`}
                  className="bg-light-bg-tertiary dark:bg-dark-bg-tertiary rounded-[12px] p-3 relative group hover:bg-light-border dark:hover:bg-dark-border transition-colors border border-light-border/50 dark:border-dark-border/50"
                >
                  {/* Remove button */}
                  <button
                    onClick={() => removeTicketByMarket(ticket.gameId, ticket.typeId, ticket.line)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#FF3D3D]/20 hover:bg-[#FF3D3D]/30 p-1 rounded"
                  >
                    <X className="w-3.5 h-3.5 text-[#FF3D3D]" />
                  </button>

                  {/* Match info */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between pr-8">
                      <p className="text-[10px] text-light-text-secondary dark:text-white/30 font-medium uppercase">
                        {ticket.tournamentName || 'Match'}
                      </p>
                      <p className="text-[10px] text-light-text-secondary dark:text-white/30">
                        {formatTimestamp(ticket.maturity)}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-light-text dark:text-white text-sm font-medium">
                        {ticket.homeTeam} vs {ticket.awayTeam}
                      </p>
                      {ticket.marketType && (
                        <p className="text-[10px] text-light-text-secondary dark:text-white/40 font-medium">
                          {ticket.marketType}
                          {ticket.line !== undefined && ticket.line !== 0 && ` (Line: ${ticket.line})`}
                        </p>
                      )}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-primary text-xs font-medium">
                          {ticket.positionLabel}
                        </span>
                        <span className="text-light-text-secondary dark:text-white/50 text-xs">•</span>
                        <span className="text-light-text dark:text-white text-xs bg-light-border dark:bg-dark-border px-2 py-0.5 rounded-md font-medium">
                          {formatOdds(ticket.odds, oddsFormat)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Divider */}
            <div className="border-t border-light-border dark:border-dark-border" />

            {/* Buy-in and calculations */}
            <div className="p-4 space-y-3">
              {/* Total Quote */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <p className="text-light-text-secondary dark:text-white/50">TOTAL QUOTE:</p>
                  <span className="text-[9px] text-light-text-secondary dark:text-white/30 uppercase bg-light-bg-tertiary dark:bg-dark-bg-tertiary px-1.5 py-0.5 rounded">
                    {oddsFormat === 'american' ? 'AM' : oddsFormat === 'decimal' ? 'DEC' : 'NORM'}
                  </span>
                </div>
                <p className="text-light-text dark:text-white font-semibold">
                  {oddsFormat === 'decimal' 
                    ? totalDecimalOdds.toFixed(2)
                    : oddsFormat === 'american'
                    ? totalDecimalOdds >= 2 
                      ? `+${((totalDecimalOdds - 1) * 100).toFixed(0)}`
                      : `${(-100 / (totalDecimalOdds - 1)).toFixed(0)}`
                    : totalNormalizedOdds.toFixed(4)
                  }
                </p>
              </div>

              {/* Clear All Button */}
              <button
                onClick={clearAllTickets}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-light-bg-tertiary dark:bg-dark-bg-tertiary hover:bg-[#FF3D3D]/20 text-light-text-secondary dark:text-white/50 hover:text-[#FF3D3D] rounded-lg transition-colors text-xs font-medium border border-light-border dark:border-dark-border"
              >
                <Trash2 className="w-3.5 h-3.5" />
                CLEAR ALL
              </button>

              {/* Buy-in Input */}
              <div className="space-y-2">
                <label className="text-light-text-secondary dark:text-white/50 text-xs font-medium">BUY-IN:</label>
                <div className="relative">
                  <input
                    type="number"
                    value={buyInAmount}
                    onChange={(e) => setBuyInAmount(e.target.value)}
                    placeholder="0"
                    className="w-full bg-light-bg-tertiary dark:bg-dark-bg-tertiary text-light-text dark:text-white rounded-lg px-4 py-3 pr-16 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all border border-light-border dark:border-dark-border"
                    step="0.01"
                    min="0"
                  />
                  <button 
                    onClick={handleMaxClick}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-light-border dark:bg-dark-border px-3 py-1.5 rounded text-xs font-medium text-light-text-secondary dark:text-white/70 hover:text-light-text dark:hover:text-white hover:bg-primary transition-colors"
                  >
                    MAX
                  </button>
                </div>
                <div className="flex gap-2">
                  {[3, 10, 50, 100, 500].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setBuyInAmount(amount.toString())}
                      className="flex-1 bg-light-bg-tertiary dark:bg-dark-bg-tertiary hover:bg-light-border dark:hover:bg-dark-border text-light-text-secondary dark:text-white/70 hover:text-light-text dark:hover:text-white rounded-lg py-2 text-xs font-medium transition-colors border border-light-border dark:border-dark-border"
                    >
                      {amount} $
                    </button>
                  ))}
                </div>
              </div>

              {/* Balance */}
              <div className="flex items-center justify-between text-xs">
                <p className="text-light-text-secondary dark:text-white/50">YOUR BALANCE:</p>
                <p className="text-primary">${userRealBalance.toFixed(2)}</p>
              </div>

              {/* Total to Pay */}
              <div className="flex items-center justify-between text-xs">
                <p className="text-light-text-secondary dark:text-white/50">TOTAL TO PAY:</p>
                <p className="text-light-text dark:text-white font-medium">
                  ${buyInAmount || '0'}
                </p>
              </div>

              {/* Payout */}
              <div className="flex items-center justify-between text-xs">
                <p className="text-light-text-secondary dark:text-white/50">PAYOUT:</p>
                <p className="text-light-text dark:text-white font-medium">
                  ${potentialPayout.toFixed(2)}
                </p>
              </div>

              {/* Potential Profit */}
              <div className="flex items-center justify-between text-sm">
                <p className="text-light-text-secondary dark:text-white/50">POTENTIAL PROFIT:</p>
                <p className="text-primary font-semibold">
                  {potentialProfit > 0 ? '+' : ''}
                  ${potentialProfit.toFixed(2)}
                </p>
              </div>

              {/* Buy Button */}
              <button 
                onClick={handlePlaceBet}
                disabled={isPlacingBet || !user || parseFloat(buyInAmount) <= 0 || parseFloat(buyInAmount) > userRealBalance}
                className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-4 rounded-[12px] transition-colors text-sm uppercase mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPlacingBet ? 'PLACING BET...' : 'PLACE BET'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BetSlipModal;
