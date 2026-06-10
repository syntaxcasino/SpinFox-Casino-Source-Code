"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useDetailedMarketStore } from "@/store/detailedMarket";
import { useMarketTypesStore } from "@/store/marketTypes";
import { useAllSportsStore } from "@/store/sportsStore";
import { useOddsPreferenceStore } from "@/store/oddsPreference";
// import { useAppKitNetwork } from "@reown/appkit/react";
import { getUniqueMarketTypeNames } from "@/utils/marketUtils";
import { useBetSlipStore, SelectedTicket } from "@/store/betSlip";
import { Market, StatusEnum } from "@/types/overtime-v2";
import { formatTimestamp, slugifyTeamName } from "@/utils/general";
import { formatOdds } from "@/utils/oddsFormatter";
import ErrorableImage from "@/components/ui/ErrorableImage";
import { ClipLoader } from "react-spinners";
import { ChevronLeft, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "react-toastify";
import { useTranslation } from "@/contexts/TranslationContext";
import { scrollLeft, scrollRight } from "@/lib/utils/common";

export default function SportDetail() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t } = useTranslation("sports");
  const id = params.id as string;
  const leagueId = searchParams.get("league");
  const marketTypeRef = useRef<HTMLDivElement>(null);

  // const { chainId } = useAppKitNetwork();
  const { detailedMarket, isLoadingDetailedMarket, fetchDetailedMarket } =
    useDetailedMarketStore();
  const { marketTypes, fetchMarketTypes } = useMarketTypesStore();
  const { allSports } = useAllSportsStore();
  const { addTicket, selectedTickets, removeTicket } = useBetSlipStore();
  const { oddsFormat, setOddsFormat } = useOddsPreferenceStore();

  const [activeTab, setActiveTab] = useState<string>("Winner");
  const [expandedMarkets, setExpandedMarkets] = useState<Set<string>>(
    new Set(["Winner"])
  );
  const [showPausedMarkets, setShowPausedMarkets] = useState<boolean>(false);

  useEffect(() => {
    const networkId = 10; // Default to Optimism mainnet
    fetchDetailedMarket(Number(networkId), id);
  }, [fetchDetailedMarket, id]);

  useEffect(() => {
    fetchMarketTypes();
  }, [fetchMarketTypes]);

  const getSportFromSubLeagueId = (subLeagueId: number): string => {
    return allSports[subLeagueId]?.sport ?? "Unknown Sport";
  };

  const getLabelFromSubLeagueId = (subLeagueId: number): string => {
    return allSports[subLeagueId]?.label ?? "Unknown League";
  };

  const toggleMarket = (marketName: string) => {
    setExpandedMarkets((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(marketName)) {
        newSet.delete(marketName);
      } else {
        newSet.add(marketName);
      }
      return newSet;
    });
  };

  const handleSelectPosition = (market: Market, position: number) => {
    const oddValue = market.odds[position]?.normalizedImplied || 0;

    if (oddValue === 0) {
      toast.error("Invalid odd value");
      return;
    }

    // Check if this exact position is already selected
    const existingTicket = selectedTickets.find(t =>
      t.gameId === market.gameId && t.typeId === market.typeId && t.line === market.line && t.position === position
    );

    if (existingTicket) {
      // Deselect if clicking the same position
      removeTicket(market.gameId);
      toast.info("Removed from bet slip");
      return;
    }

    // Remove any existing selection from this game (single selection per game)
    const hasExistingSelection = selectedTickets.some(t => t.gameId === market.gameId);
    if (hasExistingSelection) {
      removeTicket(market.gameId);
    }

    // Get position label based on market type
    let positionLabel = "";
    const positionNames = market.positionNames || [];

    if (positionNames.length > position) {
      positionLabel = positionNames[position];
    } else if (market.odds.length === 3) {
      positionLabel =
        position === 0
          ? market.homeTeam
          : position === 2
          ? "Draw"
          : market.awayTeam;
    } else if (market.odds.length === 2) {
      positionLabel =
        position === 0
          ? market.line
            ? "Over"
            : market.homeTeam
          : market.line
          ? "Under"
          : market.awayTeam;
    }

    const ticket: SelectedTicket = {
      gameId: market.gameId,
      sportId: market.subLeagueId,
      typeId: market.typeId,
      maturity: market.maturity,
      status: market.status,
      line: market.line,
      playerId: market.playerProps?.playerId || 0,
      odds: oddValue,
      merkleProof: market.proof || [],
      position: position,
      combinedPositions: market.combinedPositions || [],
      live: false,
      homeTeam: market.homeTeam,
      awayTeam: market.awayTeam,
      tournamentName: getLabelFromSubLeagueId(market.subLeagueId),
      positionLabel: positionLabel,
      marketType: market.type,
    };

    addTicket(ticket);
    toast.success("Added to bet slip");
  };

  const isPositionSelected = (market: Market, position: number): boolean => {
    const marketKey = `${market.gameId}-${market.typeId}-${market.line || 0}`;
    return selectedTickets.some(
      (t) =>
        t.gameId === market.gameId &&
        t.typeId === market.typeId &&
        t.line === market.line &&
        t.position === position
    );
  };

  const getMarketsByType = (typeName: string): Market[] => {
    if (!detailedMarket) return [];

    const markets: Market[] = [];

    // Check main market
    const mainMarketType = marketTypes[detailedMarket.typeId];
    if (mainMarketType?.name === typeName) {
      if (showPausedMarkets || !detailedMarket.isPaused) {
        markets.push(detailedMarket);
      }
    }

    // Check child markets
    detailedMarket.childMarkets?.forEach((child) => {
      const childType = marketTypes[child.typeId];
      if (childType?.name === typeName) {
        if (showPausedMarkets || !child.isPaused) {
          markets.push(child);
        }
      }
    });

    return markets;
  };

  const marketTypeNames = detailedMarket
    ? getUniqueMarketTypeNames(detailedMarket, marketTypes)
    : [];

  if (isLoadingDetailedMarket) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <ClipLoader color="#896cef" size={50} />
      </div>
    );
  }

  if (!detailedMarket) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen gap-4">
        <p className="text-light-text dark:text-white text-lg">
          Market not found
        </p>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-4 pb-24">
      {/* Header with Back Button and Odds Switcher */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-light-text dark:text-white hover:text-primary transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back</span>
        </button>

        {/* Odds Format Quick Switcher */}
        <div className="flex items-center gap-1.5 bg-light-bg-secondary dark:bg-dark-bg-secondary border border-light-border dark:border-dark-border rounded-lg p-0.5">
          <button
            onClick={() => setOddsFormat('decimal')}
            className={`px-2.5 py-1 text-[10px] font-medium rounded transition-colors ${oddsFormat === 'decimal'
              ? 'bg-primary text-white'
              : 'text-light-text-secondary dark:text-white/50 hover:text-light-text dark:hover:text-white'
              }`}
          >
            DEC
          </button>
          <button
            onClick={() => setOddsFormat('american')}
            className={`px-2.5 py-1 text-[10px] font-medium rounded transition-colors ${oddsFormat === 'american'
              ? 'bg-primary text-white'
              : 'text-light-text-secondary dark:text-white/50 hover:text-light-text dark:hover:text-white'
              }`}
          >
            AM
          </button>
          <button
            onClick={() => setOddsFormat('normalizedImplied')}
            className={`px-2.5 py-1 text-[10px] font-medium rounded transition-colors ${oddsFormat === 'normalizedImplied'
              ? 'bg-primary text-white'
              : 'text-light-text-secondary dark:text-white/50 hover:text-light-text dark:hover:text-white'
              }`}
          >
            NORM
          </button>
        </div>
      </div>

      {/* Match Header */}
      <div className="max-w-3xl mx-auto bg-light-bg-secondary dark:bg-dark-bg-secondary border border-light-border dark:border-dark-border rounded-xl p-4 mb-4">
        {/* League and Time */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-light-text-secondary dark:text-white/50 uppercase">
              {getSportFromSubLeagueId(detailedMarket.subLeagueId)} / {getLabelFromSubLeagueId(detailedMarket.subLeagueId)}
            </span>
          </div>
          <div className="flex flex-col items-end gap-0.5">
            <span className="text-[10px] text-light-text-secondary dark:text-white/50">Match time:</span>
            <span className="text-xs font-semibold text-light-text dark:text-white">
              {formatTimestamp(detailedMarket.maturity)}
            </span>
            <span className="text-[10px] text-light-text-secondary dark:text-white/50">Regular Season</span>
          </div>
        </div>

        {/* Teams */}
        <div className="flex items-center justify-center gap-6">
          {/* Home Team */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 relative">
              {(() => {
                const leagueLabel = getLabelFromSubLeagueId(
                  detailedMarket.subLeagueId
                );
                console.log("leagueLable:", leagueLabel);
                const sportFolder =
                  leagueLabel === "NCAA Football"
                    ? "NCAA"
                    : getSportFromSubLeagueId(detailedMarket.subLeagueId);

                return (
                  <ErrorableImage
                    url={`https://www.overtimemarkets.xyz/logos/${sportFolder}/${slugifyTeamName(
                      detailedMarket.homeTeam
                    )}.webp`}
                    alt="Home"
                  />
                );
              })()}
            </div>
            <span className="text-base font-bold text-light-text dark:text-white text-center">
              {detailedMarket.homeTeam}
            </span>
          </div>

          {/* VS */}
          <div className="text-xl font-bold text-light-text-secondary dark:text-white/30">-</div>

          {/* Away Team */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 relative">
              {(() => {
                const leagueLabel = getLabelFromSubLeagueId(
                  detailedMarket.subLeagueId
                );
                console.log("leagueLable:", leagueLabel);
                const sportFolder =
                  leagueLabel === "NCAA Football"
                    ? "NCAA"
                    : getSportFromSubLeagueId(detailedMarket.subLeagueId);

                return (
                  <ErrorableImage
                    url={`https://www.overtimemarkets.xyz/logos/${sportFolder}/${slugifyTeamName(
                      detailedMarket.awayTeam
                    )}.webp`}
                    alt="Home"
                  />
                );
              })()}
            </div>
            <span className="text-base font-bold text-light-text dark:text-white text-center">
              {detailedMarket.awayTeam}
            </span>
          </div>
        </div>
      </div>

      {/* Market Type Tabs and Controls */}
      <div className="max-w-3xl mx-auto mb-4">
        {/* Tabs */}
        <div className="flex items-center justify-between mb-3">
          <div className="overflow-x-auto scrollbar-hide" ref={marketTypeRef}>
            <div className="flex gap-1.5 min-w-max">
              {marketTypeNames.map((typeName) => (
                <button
                  key={typeName}
                  onClick={() => {
                    setActiveTab(typeName);
                    setExpandedMarkets(new Set([typeName]));
                  }}
                  className={`px-3 py-1.5 rounded-lg font-medium text-xs whitespace-nowrap transition-all ${activeTab === typeName
                    ? 'bg-primary text-white'
                    : 'bg-light-bg-tertiary dark:bg-dark-bg-tertiary text-light-text dark:text-white hover:bg-light-border dark:hover:bg-dark-border border border-light-border dark:border-dark-border'
                    }`}
                >
                  {typeName}
                </button>
              ))}
            </div>
          </div>
          
          <button
            type="button"
            onClick={() =>
              marketTypeRef.current &&
              scrollLeft(marketTypeRef.current)
            }
            className="px-4 py-3 cursor-pointer hover:scale-95 duration-300 transition-all hidden md:block lg:block rounded-[10px] bg-light-bg-secondary dark:bg-dark-bg-secondary border border-light-border dark:border-dark-border text-light-text dark:text-white hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary"
          >
            <img
              src="/chevron-left.svg"
              alt=""
              className="w-full dark:invert-0 invert"
            />
          </button>
          <button
            type="button"
            onClick={() =>
              marketTypeRef.current &&
              scrollRight(marketTypeRef.current)
            }
            className="px-4 py-3 cursor-pointer hover:scale-95 duration-300 transition-all hidden md:block lg:block rounded-[10px] bg-light-bg-secondary dark:bg-dark-bg-secondary border border-light-border dark:border-dark-border text-light-text dark:text-white hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary"
          >
            <img
              src="/chevron-right.svg"
              alt=""
              className="w-full dark:invert-0 invert"
            />
          </button>
        </div>

        {/* Show Paused Toggle */}
        <div className="flex items-center justify-between bg-light-bg-secondary dark:bg-dark-bg-secondary border border-light-border dark:border-dark-border rounded-lg px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-light-text dark:text-white">
              SHOW PAUSED MARKETS
            </span>
            <button
              onClick={() => setShowPausedMarkets(!showPausedMarkets)}
              className={`relative w-12 h-6 rounded-full transition-colors bg-light-border dark:bg-gray-700 peer-checked:bg-primary`}
            >
              <div
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full transition-transform ${
                  showPausedMarkets
                    ? "translate-x-6 bg-primary"
                    : "translate-x-0 bg-white dark:bg-dark-bg-tertiary"
                }`}
              />
            </button>
          </div>
          <span
            className={`text-xs font-medium px-3 py-1 rounded-full ${
              showPausedMarkets
                ? "bg-primary/20 text-primary"
                : "bg-light-bg-tertiary dark:bg-dark-bg-tertiary text-light-text-secondary dark:text-white/50"
            }`}
          >
            {showPausedMarkets ? "ON" : "OFF"}
          </span>
        </div>
      </div>

      {/* Markets Display */}
      <div className="max-w-3xl mx-auto space-y-3">
        {marketTypeNames.map((typeName) => {
          const markets = getMarketsByType(typeName);
          const isExpanded = expandedMarkets.has(typeName);

          if (markets.length === 0) return null;

          return (
            <div key={typeName} className="bg-light-bg-secondary dark:bg-dark-bg-secondary border border-light-border dark:border-dark-border rounded-lg overflow-hidden">
              {/* Market Header */}
              <button
                onClick={() => toggleMarket(typeName)}
                className="w-full flex items-center justify-between p-3 hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary transition-colors"
              >
                <h3 className="text-base font-semibold text-light-text dark:text-white uppercase">
                  {typeName}
                </h3>
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-light-text dark:text-white" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-light-text dark:text-white" />
                )}
              </button>

              {/* Market Content */}
              {isExpanded && (
                <div className="border-t border-light-border dark:border-dark-border">
                  {markets.map((market, idx) => (
                    <div
                      key={`${market.typeId}-${market.line || 0}-${idx}`}
                      className="p-3 border-b last:border-b-0 border-light-border dark:border-dark-border"
                    >
                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        {/* Market Info */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-medium text-light-text dark:text-white whitespace-nowrap">
                            {market.type}
                            {market.line !== undefined &&
                              market.line !== 0 &&
                              ` (${market.line})`}
                          </span>
                          {market.playerProps && (
                            <span className="text-[10px] text-light-text-secondary dark:text-white/50 bg-light-bg-tertiary dark:bg-dark-bg-tertiary px-1.5 py-0.5 rounded">
                              {market.playerProps.playerName}
                            </span>
                          )}
                          {market.isPaused && (
                            <span className="text-[10px] bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 px-1.5 py-0.5 rounded font-medium">
                              PAUSED
                            </span>
                          )}
                        </div>

                        {/* Odds Positions */}
                        <div className="flex flex-wrap gap-2 justify-end flex-1">
                          {market.odds.map((odd, position) => {
                            const isSelected = isPositionSelected(market, position);
                            const positionName = market.positionNames?.[position] ||
                              (position === 0 ? (market.line ? 'Over' : market.homeTeam) :
                                position === 2 ? 'Draw' :
                                  (market.line ? 'Under' : market.awayTeam));

                            return (
                              <button
                                key={position}
                                onClick={() => handleSelectPosition(market, position)}
                                disabled={market.isPaused}
                                className={`min-w-[140px] max-w-[160px] p-2.5 rounded-lg border transition-all hover:scale-[1.02] ${isSelected
                                  ? 'bg-primary/20 border-primary'
                                  : 'bg-light-bg-tertiary dark:bg-dark-bg-tertiary border-light-border dark:border-dark-border hover:border-primary/50'
                                  } ${market.isPaused ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-[11px] text-light-text-secondary dark:text-white/70 font-medium truncate">
                                    {positionName}
                                  </span>
                                  <span className={`text-sm font-bold whitespace-nowrap ${isSelected ? 'text-primary' : 'text-light-text dark:text-white'
                                    }`}>
                                    {formatOdds(odd, oddsFormat)}
                                  </span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {marketTypeNames.length === 0 && (
          <div className="text-center py-8">
            <p className="text-sm text-light-text-secondary dark:text-white/50">No markets available</p>
          </div>
        )}
      </div>
    </div>
  );
}
