"use client";

import React, { use, useEffect, useRef, useState } from "react";
import { useMarketsStore } from "@/store/MarketsStore";
import { useAllSportsStore } from "@/store/sportsStore";
import { useMarketTypesStore } from "@/store/marketTypes";
import { useOddsPreferenceStore } from "@/store/oddsPreference";
import { ClipLoader } from "react-spinners";
import SportsCard from "@/components/ui/SportsCard";
import { scrollLeft, scrollRight } from "@/lib/utils/common";
// import { useAppKitNetwork } from "@reown/appkit/react";
import { MarketsQueryParams } from "@/store/MarketsStore";
import { GameMarket, StatusCodeEnum } from "@/types/overtime-v2";
import Pagination from "@/components/ui/Pagination";
import { useTranslation } from "@/contexts/TranslationContext";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import { useRouter } from "next/navigation";
import { Ticket } from "lucide-react";

export default function SportsPage() {
  const { t } = useTranslation('sports');
  const router = useRouter();
  const { oddsFormat, setOddsFormat } = useOddsPreferenceStore();
  const {
    markets,
    isLoadingMarkets,
    marketsError,
    fetchMarkets,
    responseHash,
  } = useMarketsStore();
  const { allSports, isLoadingAllSports, allSportsError, fetchAllSports } =
    useAllSportsStore();
  const { marketTypes, fetchMarketTypes } = useMarketTypesStore();
  const topicContainerRef = useRef<HTMLDivElement>(null);
  const [showSportList, setShowSportList] = useState(false);
  const [sportFilter, setSportFilter] = useState<string>("");
  const [leagueFilter, setLeagueFilter] = useState<string>("");
  const [paginatedMarkets, setPaginatedMarkets] = useState<GameMarket[]>([]);
  const [filteredMarkets, setFilteredMarkets] = useState<GameMarket[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 6;
  const [sportsList, setSportsList] = useState<string[]>([]);
  const [leagueList, setLeagueList] = useState<string[]>(["All Sports"]);
  const [timeFilter, setTimeFilter] = useState<'1h' | '1day' | '1week' | 'all'>('1week');
  // const { chainId } = useAppKitNetwork();
  const [totalPages, setTotalPages] = useState(1);
  const SECTIONS_PER_PAGE = 12;

  const getLabelFromSubLeagueId = (subLeagueId: number): string => {
    return allSports[subLeagueId]?.label ?? 'Unknown League';
  }

  const getSportFromSubLeagueId = (subLeagueId: number): string => {
    return allSports[subLeagueId]?.sport ?? 'Unknown Sport';
  }
  useEffect(() => {
    // Fetch data on mount
    fetchAllSports();
  }, [fetchAllSports]);

  useEffect(() => {
    fetchMarketTypes();
  }, [fetchMarketTypes]);

  const getMaturityRange = (period: '1h' | '1day' | '1week' | 'all') => {
    const now = Math.floor(Date.now() / 1000);
    
    switch (period) {
      case '1h':
        return { minMaturity: now, maxMaturity: now + (1 * 60 * 60) }; // Next 1 hour
      case '1day':
        return { minMaturity: now, maxMaturity: now + (24 * 60 * 60) }; // Next 1 day
      case '1week':
        return { minMaturity: now, maxMaturity: now + (7 * 24 * 60 * 60) }; // Next 1 week
      case 'all':
        return { minMaturity: now }; // All future events (no max)
      default:
        return { minMaturity: now };
    }
  };

  useEffect(() => {
    const networkId = 10; // Default to Optimism mainnet
    const maturityRange = getMaturityRange(timeFilter);

    const params: MarketsQueryParams = {
      ungroup: true,
      onlyBasicProperties: true,
      includeHashInResponse: true,
      status: StatusCodeEnum.OPEN,
      responseHash: responseHash || "",
      onlyMainMarkets: true,
      includeProofs: false,
      ...maturityRange,
      // ...(sportFilter ? { includeFuturesInSport: true } : {}),
      // ...(sportFilter ? { sport: sportFilter } : {}),
    };

    fetchMarkets(Number(networkId), params);
  }, [fetchMarkets, responseHash, sportFilter, leagueFilter, timeFilter]);

  useEffect(() => {
    if (!markets) return;

    let filtered = markets;

    // Apply search filter
    if (searchTerm) {
      const searchLowerCase = searchTerm.toLowerCase();
      filtered = filtered.filter(
        ({ homeTeam, awayTeam }) =>
          homeTeam.toLowerCase().includes(searchLowerCase) ||
          awayTeam.toLowerCase().includes(searchLowerCase)
      );
    }

    // Apply league filter
    if (leagueFilter !== "") {
      filtered = filtered.filter(
        ({ subLeagueId }) => getLabelFromSubLeagueId(subLeagueId) === leagueFilter
      );
    }

    if (sportFilter !== "") {
      filtered = filtered.filter(
        ({ subLeagueId }) => getSportFromSubLeagueId(subLeagueId) === sportFilter
      );
    }

    setFilteredMarkets(filtered);
  }, [markets, searchTerm, leagueFilter, sportFilter]);

  useEffect(() => {
    const totalPagesCalc = Math.ceil(filteredMarkets.length / SECTIONS_PER_PAGE);
    setTotalPages(totalPagesCalc);
  }, [filteredMarkets.length]);

  useEffect(() => {
    const startIdx = (currentPage - 1) * SECTIONS_PER_PAGE;
    const endIdx = startIdx + SECTIONS_PER_PAGE;
    const slicedMarkets = filteredMarkets.slice(startIdx, endIdx);
    setPaginatedMarkets(slicedMarkets);
  }, [filteredMarkets, currentPage]);

  const handleSelectSportDropdown = () => {
    setShowSportList(!showSportList);

    // Count games per sport
    const sportCounts: Record<string, number> = {};
    markets.forEach((market) => {
      const sport = getSportFromSubLeagueId(market.subLeagueId);
      if (sport !== "Unknown Sport" && sport !== "Futures") {
        sportCounts[sport] = (sportCounts[sport] || 0) + 1;
      }
    });

    // Keep only sports with more than 1 game
    const sportsWithMultipleGames = Object.entries(sportCounts)
      .filter(([sport, count]) => count > 1)
      .map(([sport]) => sport);

    setSportsList(sportsWithMultipleGames);
  };

  const handleLeageueList = (sport: string) => {
    if (sport === "All Sports") {
      setLeagueList(["All Sports"]);
      return;
    }

    // 1. Filter markets by selected sport
    const filteredMarkets = markets.filter(
      (market) => getSportFromSubLeagueId(market.subLeagueId) === sport
    );

    // 2. Count games per league
    const leagueCounts: Record<string, number> = {};
    filteredMarkets.forEach((market) => {
      const label = getLabelFromSubLeagueId(market.subLeagueId);
      if (label !== "Unknown League") {
        leagueCounts[label] = (leagueCounts[label] || 0) + 1;
      }
    });

    // 3. Filter leagues that have more than 1 game
    const leaguesWithMultipleGames = Object.entries(leagueCounts)
      .filter(([label, count]) => count > 1)
      .map(([label]) => label);

    setLeagueList(leaguesWithMultipleGames);
  };

  return (
    <div className="flex flex-col items-center px-4 py-4 relative">

      {isLoadingAllSports ? (
        <div className="flex flex-col gap-4 w-full min-h-screen p-6">
          <SkeletonTheme baseColor="var(--skeleton-base)" highlightColor="var(--skeleton-highlight)">
            {/* Skeleton for Header */}
            <div className="flex justify-between items-center">
              <Skeleton height={40} width={200} borderRadius={10} />
              <Skeleton height={40} width={150} borderRadius={10} />
            </div>

            {/* Skeleton for league buttons */}
            <div className="flex gap-3 mt-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} height={36} width={100} borderRadius={10} />
              ))}
            </div>
          </SkeletonTheme>
        </div>
      ) : (
        <>
          <header className="flex w-full flex-col gap-4 items-start">
            {/* Time Filter Buttons */}
            <div className="flex items-center gap-2 w-full overflow-x-auto scrollbar-hide">
              <span className="text-sm font-medium text-light-text dark:text-white whitespace-nowrap mr-2">
                {t('timeFilter') || 'Time Filter'}:
              </span>
              {(['1h', '1day', '1week', 'all'] as const).map((period) => (
                <button
                  key={period}
                  type="button"
                  onClick={() => {
                    setTimeFilter(period);
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-2 text-sm font-medium cursor-pointer hover:scale-95 duration-300 transition-all rounded-[10px] whitespace-nowrap border ${
                    timeFilter === period
                      ? "bg-primary text-white border-primary"
                      : "bg-light-bg-secondary dark:bg-dark-bg-secondary text-light-text dark:text-white border-light-border dark:border-dark-border hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary"
                  }`}
                >
                  {period === '1h' ? '1 Hour' : period === '1day' ? '1 Day' : period === '1week' ? '1 Week' : 'All'}
                </button>
              ))}
            </div>

            {/* Main Header Row */}
            <div className="flex w-full flex-col gap-4 lg:flex-row items-center justify-between">
            <div className="flex items-center gap-4 w-full lg:w-[70%]">
              <div
                ref={topicContainerRef}
                className="flex items-center gap-4 overflow-x-auto overflow-hidden scrollbar-hide w-full lg:w-[60%]"
              >
                {leagueList.map((league, index) => (
                  <button
                    type="button"
                    className={`px-4 py-2 text-sm font-medium cursor-pointer hover:scale-95 duration-300 transition-all rounded-[10px] whitespace-nowrap border ${leagueFilter === league
                      ? "bg-primary text-white border-primary"
                      : "bg-light-bg-secondary dark:bg-dark-bg-secondary text-light-text dark:text-white border-light-border dark:border-dark-border hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary"
                      }`}
                    key={index}
                    onClick={() => {
                      setLeagueFilter(league);
                      setShowSportList(false);
                      setCurrentPage(1);
                    }}
                  >
                    {league}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() =>
                  topicContainerRef.current &&
                  scrollLeft(topicContainerRef.current)
                }
                className="px-4 py-3 cursor-pointer hover:scale-95 duration-300 transition-all hidden md:block lg:block rounded-[10px] bg-light-bg-secondary dark:bg-dark-bg-secondary border border-light-border dark:border-dark-border text-light-text dark:text-white hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary"
              >
                <img src="/chevron-left.svg" alt="" className="w-full dark:invert-0 invert" />
              </button>
              <button
                type="button"
                onClick={() =>
                  topicContainerRef.current &&
                  scrollRight(topicContainerRef.current)
                }
                className="px-4 py-3 cursor-pointer hover:scale-95 duration-300 transition-all hidden md:block lg:block rounded-[10px] bg-light-bg-secondary dark:bg-dark-bg-secondary border border-light-border dark:border-dark-border text-light-text dark:text-white hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary"
              >
                <img src="/chevron-right.svg" alt="" className="w-full dark:invert-0 invert" />
              </button>
            </div>
            <div className="flex flex-row gap-4 w-full lg:w-[30%] justify-end">
              <button
                type="button"
                onClick={() => router.push('/sports/my-bets')}
                className="px-4 py-2 bg-primary hover:bg-primary-hover text-white font-medium rounded-[10px] transition-all flex items-center gap-2 whitespace-nowrap"
              >
                <Ticket className="w-4 h-4" />
                My Bets
              </button>
              <div className="relative flex">
                <button
                  type="button"
                  onClick={() => {
                    setShowSportList(!showSportList);
                    handleSelectSportDropdown();
                  }}
                  className="flex items-center justify-between w-[150px] gap-3 px-4 py-2 cursor-pointer text-sm bg-light-bg-secondary dark:bg-dark-bg-secondary border border-light-border dark:border-dark-border rounded-[10px] hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary transition-colors text-light-text dark:text-white"
                >
                  {sportFilter
                    ? sportFilter.replace("(NFL)", "")
                    : t('selectSport')}
                  <img
                    src="/chevron-down.svg"
                    alt="chevron down"
                    className={`${showSportList ? "rotate-180" : ""
                      } transition-transform duration-200 dark:invert-0 invert`}
                  />
                </button>

                {showSportList && (
                  <div className="absolute z-[900] top-full mt-2 w-[150px] right-0 flex flex-col items-start rounded-[10px] p-2 bg-light-bg-secondary dark:bg-dark-bg-secondary border border-light-border dark:border-dark-border overflow-y-auto max-h-[262px] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-[#221d35] [&::-webkit-scrollbar-thumb]:bg-[#7b45ac] [&::-webkit-scrollbar-thumb]:rounded-md [&::-webkit-scrollbar-thumb:hover]:bg-[#8b55bc]">
                    <button
                      type="button"
                      className={`px-4 py-2 text-sm text-left text-light-text dark:text-white w-full rounded-[6px] hover:bg-primary/20 transition-colors ${sportFilter == "" ? "bg-primary/20" : ""
                        }`}
                      onClick={() => {
                        handleLeageueList("All Sports");
                        setSportFilter("");
                        setLeagueFilter("");
                        setCurrentPage(1);
                        setShowSportList(false);
                      }}
                    >
                      {t('allSports')}
                    </button>
                    {sportsList.map((sport, index) => (
                      <button
                        key={index}
                        type="button"
                        className={`${sportFilter === sport && "bg-primary/20"
                          } px-4 py-2 text-sm text-left text-light-text dark:text-white w-full rounded-[6px] hover:bg-primary/20 transition-colors`}
                        onClick={() => {
                          handleLeageueList(sport);
                          setSportFilter(sport);
                          setLeagueFilter("");
                          setCurrentPage(1); // Reset to first page when filter changes
                          setShowSportList(false);
                        }}
                      >
                        {sport}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between gap-3 bg-light-bg-secondary dark:bg-dark-bg-secondary border border-light-border dark:border-dark-border px-4 w-full h-[40px] rounded-[12px] focus-within:border-primary/50 transition-colors">
                <input
                  type="text"
                  placeholder={t('search')}
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1); // Reset to first page when searching
                  }}
                  className="outline-none placeholder:text-sm placeholder:text-light-text-secondary dark:placeholder:text-white/30 text-sm w-full bg-transparent text-light-text dark:text-white"
                />
                <img src="/search-icon.svg" alt="search icon" className="w-4 opacity-50 dark:invert-0 invert" />
              </div>
            </div>
            </div>
          </header>
        </>
      )}
      {marketsError && (
        <p className="text-red-500">Error: {marketsError}</p>
      )}
      {!marketsError && (
        <div className="gap-4 grid grid-cols-1 lg:grid-cols-4 w-full pt-4">
          {paginatedMarkets.length > 0 ? (
            paginatedMarkets.map((market, index) => (
              <SportsCard
                key={index} market={market}
                isGrid={true}
                isLoading={isLoadingMarkets}
              />
            ))
          ) : searchTerm !== '' ? (
            <div className="w-full flex flex-col gap-5 items-center col-span-4 h-[40vh] justify-center">
              <img src="/search-icon.svg" alt="" className="w-[3%] opacity-50 dark:invert-0 invert" />
              <p className="text-sm text-light-text-secondary dark:text-white/40">{t('noResults')} '{searchTerm}'</p>
            </div>
          ) : (
            <div className="w-full text-sm text-light-text-secondary dark:text-white/40 flex flex-col gap-5 items-center col-span-4 h-[40vh] justify-center">
              {t('noSportsAvailable')}
            </div>
          )}
        </div>
      )}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        className="mt-6"
      />
    </div>
  );
}
