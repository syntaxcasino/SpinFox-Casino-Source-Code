"use client";

import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "@/contexts/TranslationContext";
import {
  fetchGameLaunchAsync,
  fetchGameListAsync,
  fetchProviderListAsync,
} from "@/lib/api";
import { IGame, IProvider } from "@/types";
import Image from "next/image";
import { toast } from "react-toastify";
import { GameCard } from "@/components/GameCard";
import { useNetwork } from "@/contexts/NetworkContext";
import { useUser } from "@/contexts/UserContext";
import { useGameCache } from "@/contexts/GameCacheContext";

export default function Slots() {
  const { t: tSlots } = useTranslation("slots");
  const { activeNetwork } = useNetwork();
  const { fetchProviders, fetchGames, isLoading } = useGameCache();

  const [searchQuery, setSearchQuery] = useState("");
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const [providers, setProviders] = useState<IProvider[]>([]);
  const [showProvidersDropdown, setShowProvidersDropdown] = useState(false);
  const [currentProvider, setCurrentProvider] = useState("PRAGMATIC");
  const [games, setGames] = useState<IGame[]>([]);
  const [launchUrl, setLaunchUrl] = useState("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isLoadingGames, setIsLoadingGames] = useState(false);
  const [currentGameName, setCurrentGameName] = useState("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(18); // default for desktop
  const { setUserBalance } = useUser();
  useEffect(() => {
    const getProviderList = async () => {
      try {
        const providerList = await fetchProviders();
        setProviders(providerList);
        if (providerList.length > 0) {
          setCurrentProvider(providerList[0].name);
        }
      } catch (error) {
        console.error("get provider list: ", error);
      }
    };
    getProviderList();
  }, [fetchProviders]);

  useEffect(() => {
    const getGameList = async () => {
      setIsLoadingGames(true);
      try {
        const gameList = await fetchGames(currentProvider);
        setGames(gameList);
        setCurrentPage(1); // reset to first page when provider changes
      } catch (error) {
        console.error("Error fetching game list:", error);
      } finally {
        setIsLoadingGames(false);
      }
    };
    getGameList();
  }, [currentProvider, fetchGames]);

  // Update items per page based on screen size
  useEffect(() => {
    const updateItemsPerPage = () => {
      if (window.innerWidth >= 1024) {
        setItemsPerPage(18);
      } else {
        setItemsPerPage(8);
      }
    };
    updateItemsPerPage();
    window.addEventListener("resize", updateItemsPerPage);
    return () => window.removeEventListener("resize", updateItemsPerPage);
  }, []);

  const handlePlayGame = async (gameCode: string, providerCode: string, gameName: string) => {
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        toast.warning("Please sign in to play the game.");
        return;
      }
      
      // Determine balance type based on active network
      const balanceType = activeNetwork === 'mainnet' ? 'realBalance' : 'testBalance';
      
      const gameLaunch = await fetchGameLaunchAsync(
        providerCode,
        gameCode,
        token,
        balanceType
      );
      
      console.log(`🎮 Game launch response (${balanceType}):`, gameLaunch);
      
      if (!gameLaunch) {
        toast.error("Failed to launch game. Please try again.");
        return;
      }
      
      if (!gameLaunch.launch_url) {
        const errorMsg = gameLaunch.msg || gameLaunch.message || "Unable to launch game";
        toast.error(errorMsg);
        return;
      }
      
      setLaunchUrl(gameLaunch.launch_url);
      setCurrentGameName(gameName);
      setIsModalOpen(true);
    } catch (error) {
      console.error("❌ Game launch error:", error);
      toast.error("Failed to launch game. Please check console for details.");
    }
  };

  const onSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // reset page on search
  }, []);

  const handleProviderSelect = (providerKey: string) => {
    setCurrentProvider(providerKey);
    setShowProvidersDropdown(false);
  };

  const toggleDropdown = () => {
    setShowProvidersDropdown((prev) => !prev);
  };

  const ProvidersDropdown = memo(
    ({
      className = "",
      widthClass = "w-full sm:w-[190px]",
    }: {
      className?: string;
      widthClass?: string;
    }) => (
      <div className={`relative ${className} z-[2]`}>
        <button
          onClick={toggleDropdown}
          className={`bg-light-bg-secondary dark:bg-[#0b0911] text-light-text dark:text-white border border-light-border dark:border-transparent px-4 py-2 pr-10 rounded-lg text-sm ${widthClass} h-10 text-left focus:outline-none focus:ring-2 focus:ring-primary flex items-center justify-between transition-colors`}
        >
          <span className="truncate">{currentProvider}</span>
          <Image
            src="/images/icons/games-providers.png"
            alt="Providers"
            width={16}
            height={16}
            className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 dark:invert-0 invert opacity-70"
          />
        </button>
        {showProvidersDropdown && (
          <div
            className={`absolute top-full right-0 mt-1 bg-light-bg-secondary dark:bg-[#0b0911] border border-light-border dark:border-gray-700 rounded-lg shadow-lg z-[2] ${widthClass}`}
          >
            {providers.map((provider) => (
              <button
                key={provider.code}
                onClick={() => handleProviderSelect(provider.code)}
                className={`w-full text-left px-4 py-2 text-light-text dark:text-white hover:bg-light-bg-tertiary dark:hover:bg-[#221d35] text-sm transition-colors ${
                  currentProvider === provider.name
                    ? "bg-light-bg-tertiary dark:bg-[#221d35] font-bold"
                    : ""
                }`}
                style={{ touchAction: "manipulation" }}
              >
                {provider.name}
              </button>
            ))}
          </div>
        )}
      </div>
    )
  );

  // Filter games based on search query
  const filteredGames = searchQuery
    ? games.filter((game) =>
        game.game_name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : games;

  // Pagination calculation
  const totalPages = Math.ceil(filteredGames.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedGames = filteredGames.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // Skeleton loader component
  const GameCardSkeleton = () => (
    <div className="relative w-full h-full rounded-2xl overflow-hidden bg-gray-200 dark:bg-gray-800 animate-pulse">
      <div className="w-full h-full bg-gradient-to-br from-gray-300 dark:from-gray-700 to-gray-200 dark:to-gray-800"></div>
      <div className="absolute bottom-0 left-0 right-0 bg-gray-300/90 dark:bg-gray-700/60 backdrop-blur-sm px-3 py-2 h-10"></div>
    </div>
  );

  return (
    <div className="mx-auto px-4 py-4 relative">
      {/* Desktop Layout */}
      {!isModalOpen && (
        <div className="hidden lg:flex flex-col items-center relative">
          <div className="flex flex-row w-full justify-between items-center space-x-4 relative mb-4 px-4">
            <div className="flex flex-row items-center">
              <ProvidersDropdown />
              <div className="relative pl-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder={tSlots("searchPlaceholder")}
                  className="bg-light-bg-secondary dark:bg-[#0b0911] text-light-text dark:text-white placeholder-light-text-secondary dark:placeholder-gray-400 border border-light-border dark:border-transparent px-4 py-2 pr-10 rounded-lg text-sm w-[290px] focus:outline-none focus:ring-2 focus:ring-primary transition-colors ml-2"
                />
                <Image
                  src="/images/icons/games-search.png"
                  alt="Search"
                  width={16}
                  height={16}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 dark:invert-0 invert opacity-70"
                />
              </div>
            </div>
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded-md font-medium text-sm transition-colors ${
                    currentPage === 1
                      ? "bg-light-bg-tertiary dark:bg-gray-700 text-light-text-secondary dark:text-gray-400 cursor-not-allowed opacity-50"
                      : "bg-primary text-white hover:bg-primary/90"
                  }`}
                >
                  Prev
                </button>

                {/* Current Page / Total Pages */}
                <span className="text-sm font-medium text-light-text dark:text-white px-2">
                  {currentPage} / {totalPages}
                </span>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded-md font-medium text-sm transition-colors ${
                    currentPage === totalPages
                      ? "bg-light-bg-tertiary dark:bg-gray-700 text-light-text-secondary dark:text-gray-400 cursor-not-allowed opacity-50"
                      : "bg-primary text-white hover:bg-primary/90"
                  }`}
                >
                  Next
                </button>
              </div>
            )}
          </div>
          <div className="w-full max-w-[1400px] mx-auto px-4">
            {isLoadingGames ? (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
                {Array.from({ length: itemsPerPage }).map((_, idx) => (
                  <div key={idx} className="w-full aspect-[5/4]">
                    <GameCardSkeleton />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
                {paginatedGames.map((slot) => (
                  <GameCard key={slot.id} game={slot} onPlay={handlePlayGame} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile Layout */}
      {!isModalOpen && (
        <div className="lg:hidden flex flex-col space-y-4">
          <div className="flex flex-col space-y-2">
            {totalPages > 1 && (
              <div className="flex items-center space-x-2 w-full justify-between">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded-md font-medium text-sm transition-colors ${
                    currentPage === 1
                      ? "bg-light-bg-tertiary dark:bg-gray-700 text-light-text-secondary dark:text-gray-400 cursor-not-allowed opacity-50"
                      : "bg-primary text-white hover:bg-primary/90"
                  }`}
                >
                  Prev
                </button>

                {/* Current Page / Total Pages */}
                <span className="text-sm font-medium text-light-text dark:text-white px-2">
                  {currentPage} / {totalPages}
                </span>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded-md font-medium text-sm transition-colors ${
                    currentPage === totalPages
                      ? "bg-light-bg-tertiary dark:bg-gray-700 text-light-text-secondary dark:text-gray-400 cursor-not-allowed opacity-50"
                      : "bg-primary text-white hover:bg-primary/90"
                  }`}
                >
                  Next
                </button>
              </div>
            )}
            <ProvidersDropdown widthClass="w-full" />
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={tSlots("searchPlaceholder")}
                className="bg-light-bg-secondary dark:bg-[#0b0911] text-light-text dark:text-white placeholder-light-text-secondary dark:placeholder-gray-400 border border-light-border dark:border-transparent px-4 py-2 pr-10 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
              />
              <Image
                src="/images/icons/games-search.png"
                alt="Search"
                width={16}
                height={16}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 dark:invert-0 invert opacity-70"
              />
            </div>
          </div>
          <div className="w-full max-w-[600px] mx-auto">
            {isLoadingGames ? (
              <div className="grid grid-cols-2 gap-3 justify-items-center">
                {Array.from({ length: itemsPerPage }).map((_, idx) => (
                  <div key={idx} className="w-full max-w-[180px] aspect-[5/4]">
                    <GameCardSkeleton />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 justify-items-center">
                {paginatedGames.map((slot) => (
                  <GameCard key={slot.id} game={slot} onPlay={handlePlayGame} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Game Modal */}
      {launchUrl && isModalOpen && (
        <div className="flex items-center justify-center px-4">
          <div className="bg-[#0b0911] rounded-xl shadow-lg w-[95vw] h-[70vh] lg:w-[90vw] lg:h-[80vh] overflow-hidden flex flex-col">
            {/* Title Bar */}
            <div className="flex items-center justify-between px-4 py-3 bg-gray-800 bg-opacity-50 border-b border-gray-700">
              <h3 className="text-white font-medium text-lg">{currentGameName || "Game"}</h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setUserBalance(localStorage.getItem("token"));
                }}
                className="p-1 hover:bg-gray-700 rounded-md transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-6 h-6 text-gray-300 hover:text-white"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Iframe for Game */}
            <div className="flex-1 overflow-auto">
              <iframe
                src={launchUrl}
                className="w-full h-full rounded-b-xl"
                title="Game Launch"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
