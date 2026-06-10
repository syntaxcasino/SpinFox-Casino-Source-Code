"use client";

import React, { useState, useEffect, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "@/contexts/TranslationContext";
import { fadeInUp } from "@/utils/animations";
import { IGame } from "@/types";
import { GameCard } from "./GameCard";
import { fetchGameLaunchAsync } from "@/lib/api";
import { toast } from "react-toastify";
import { useUser } from "@/contexts/UserContext";
import { useNetwork } from "@/contexts/NetworkContext";
import { useGameCache } from "@/contexts/GameCacheContext";

interface SearchResultsSectionProps {
  activeCategory: string;
  searchQuery: string;
  selectedProvider: string;
}

// Stable top-level component
const HorizontalRow = memo(function HorizontalRow({ title, data, onPlay }: { title: string; data: IGame[]; onPlay: (game_code: string, providerCode: string, gameName: string) => void }) {
  if (!data || data.length === 0) return null;

  const itemVariants = {
    initial: { opacity: 0, scale: 0.96 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.96 }
  };

  return (
    <div className="mb-10">
      <div className="flex items-center mb-4">
        <div className="px-4 py-2 bg-gradient-to-r from-[#21184a] to-transparent border-l-4 border-white min-h-[48px] flex items-center w-full max-w-full">
          <h3 className="text-xl md:text-2xl font-bold text-white">{title}</h3>
        </div>
      </div>
      <motion.div className="flex flex-wrap gap-4 sm:justify-start justify-center" layout transition={{ type: 'spring', stiffness: 500, damping: 40 }}>
        <AnimatePresence initial={false} mode="popLayout">
          {data.map((game) => (
            <motion.div key={game.id} className="w-[170px] sm:w-[190px] md:w-[200px]" layout variants={itemVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.22 }}>
              <GameCard game={game} onPlay={onPlay} size="compact" />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
});

export default function SearchResultsSection({ activeCategory, searchQuery, selectedProvider }: SearchResultsSectionProps) {
  const { t } = useTranslation();
  const { activeNetwork } = useNetwork();
  const { fetchGames, fetchMultipleGames, isLoading } = useGameCache();
  const [games, setGames] = useState<IGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [launchUrl, setLaunchUrl] = useState('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  // Horizontal list datasets (for lobby view)
  const [featuredGames, setFeaturedGames] = useState<IGame[]>([]);
  const [originalGames, setOriginalGames] = useState<IGame[]>([]);
  const [slotsGames, setSlotsGames] = useState<IGame[]>([]);
  const [newGames, setNewGames] = useState<IGame[]>([]);
  const [tableGames, setTableGames] = useState<IGame[]>([]);
  // Pagination state (for grid view only)
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const { setUserBalance } = useUser();
  const [playingGame, setPlayingGame] = useState<string>("Game");

  const handlePlayGame = async (gameCode: string, providerCode: string, gameName: string) => {
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        toast.warning("Please sign in to play the game.");
        return;
      }
      
      // Determine balance type based on active network
      const balanceType = activeNetwork === 'mainnet' ? 'realBalance' : 'testBalance';
      
      setPlayingGame(gameName);
      const gameLaunch = await fetchGameLaunchAsync(providerCode, gameCode, token, balanceType);
      
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
      setIsModalOpen(true);
    } catch (error) {
      console.error("❌ Game launch error:", error);
      toast.error("Failed to launch game. Please check console for details.");
    }
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const showAllSections = activeCategory === "lobby" && !searchQuery && selectedProvider === "all";

  useEffect(() => {
    const loadGames = async () => {
      try {
        setLoading(true);
        if (showAllSections) {
          // Fetch providers concurrently using cache
          const gameResults = await fetchMultipleGames(["PRAGMATIC", "SPRIBE", "INOUT"]);
          const pragmatic = gameResults["PRAGMATIC"] || [];
          const spribe = gameResults["SPRIBE"] || [];
          const inout = gameResults["INOUT"] || [];
          // Build Featured: base INOUT + one Keno and one Roulette game (dedup)
          {
            const base = inout || [];
            const merged = [...base];
            const seen = new Set(base.map(g => (g && (g.id ?? g.game_code))));
            const pool = [
              ...(spribe || []),
              ...(inout || []),
              ...(pragmatic || []),
            ];
            const findBy = (keywords: string[]) => pool.find(g => {
              const name = (g?.game_name || "").toLowerCase();
              return keywords.some(k => name.includes(k));
            });
            const kenoGame = findBy(["multikeno", "keno"]);
            if (kenoGame) {
              const key = kenoGame.id ?? kenoGame.game_code;
              if (key != null && !seen.has(key)) {
                merged.push(kenoGame);
                seen.add(key);
              }
            }
            const rouletteGame = findBy(["mini-roulette", "mini roulette", "roulette"]);
            if (rouletteGame) {
              const key = rouletteGame.id ?? rouletteGame.game_code;
              if (key != null && !seen.has(key)) {
                merged.push(rouletteGame);
              }
            }
            setFeaturedGames(merged);
          }
          setSlotsGames(pragmatic.slice(10, 20).length ? pragmatic.slice(10, 20) : pragmatic.slice(0, 10));
          setOriginalGames(spribe.slice(0, 10));
          // Build New Games: first 10 INOUT + 2 PRAGMATIC slots (dedup)
          {
            const base = (inout || []).slice(0, 10);
            const seen = new Set(base.map(g => (g && (g.id ?? g.game_code))));
            const extraSlots: IGame[] = [];
            for (const g of (pragmatic || [])) {
              const key = g && (g.id ?? g.game_code);
              if (key != null && !seen.has(key)) {
                extraSlots.push(g);
                seen.add(key);
              }
              if (extraSlots.length >= 2) break;
            }
            setNewGames([...base, ...extraSlots]);
          }
          const tableKeywords = [
            "roulette",
            "mini-roulette",
            "blackjack",
            "baccarat",
            "poker",
            "holdem",
            "sic",
            "dragon",
            "andar",
            "teen",
            "keno",
            "multikeno",
            "hotline"
          ];
          const allGames = [...spribe];
          const tablesOnly = allGames.filter(g => {
            const name = (g.game_name || "").toLowerCase();
            return tableKeywords.some(k => name.includes(k));
          });
          setTableGames(tablesOnly.slice(0, 10));
          // Clear grid dataset
          setGames([]);
          setCurrentPage(1);
        } else {
          let gamesData: IGame[] = [];
          if (activeCategory === "slots" || activeCategory === "lobby") {
            gamesData = await fetchGames("PRAGMATIC");
            if (selectedProvider && selectedProvider !== "all") {
              gamesData = gamesData.filter(game => game.providerCode === selectedProvider);
            }
          } else if (activeCategory === "origin") {
            gamesData = await fetchGames("SPRIBE");
          } else if (activeCategory === "inout") {
            gamesData = await fetchGames("INOUT");
          }
          if (searchQuery) {
            gamesData = gamesData.filter(game =>
              game.game_name.toLowerCase().includes(searchQuery.toLowerCase())
            );
          }
          setGames(gamesData.slice(0, 30));
          setCurrentPage(1);
        }
      } catch (error) {
        console.error("Error loading search results:", error);
      } finally {
        setLoading(false);
      }
    };
    loadGames();
  }, [activeCategory, searchQuery, selectedProvider, showAllSections]);

  // Pagination calculation
  const totalPages = Math.ceil(games.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedGames = games.slice(startIndex, startIndex + itemsPerPage);
  const lists = [
    "Featured Games",
    "Original Games",
    "Slots",
    "New Games"
  ]
  const getTitle = () => {

    if (searchQuery) return `Search Results for "${searchQuery}"`;
    if (selectedProvider !== "all" && activeCategory == "slots") return `Slots by ${selectedProvider}`;
    switch (activeCategory) {
      case "slots":
        return "Slots";
      case "origin":
        return "Origin Games";
      case "inout":
        return "InOut";
      default:
        return "Games";
    }
  };

  if (loading) {
    return (
      <motion.section className="mx-4 mt-6" initial="hidden" animate="visible" variants={fadeInUp}>
        <div className="flex justify-between items-center mb-6">
          <div className="px-4 py-2 bg-gradient-to-r from-[#21184a] to-transparent border-l-4 border-white min-h-[48px] flex items-center w-full max-w-full">
            <h2 className="text-xl md:text-2xl font-bold text-white">{getTitle()}</h2>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {[...Array(12)].map((_, index) => (
            <div key={index} className="bg-light-bg-secondary dark:bg-dark-bg-secondary border border-light-border dark:border-dark-border rounded-xl overflow-hidden animate-pulse w-full h-auto aspect-[5/4]">
              <div className="w-full h-full bg-light-bg-tertiary dark:bg-dark-bg-tertiary rounded-xl"></div>
            </div>
          ))}
        </div>
      </motion.section>
    );
  }

  // HorizontalRow moved to top-level for stable identity

  return (
    <motion.section className="mx-4 mt-6" initial="hidden" animate="visible" variants={fadeInUp}>
      {!isModalOpen && (
        <>
          {showAllSections ? (
            <div>
              <HorizontalRow
                title="Featured Games"
                data={featuredGames}
                onPlay={handlePlayGame}
              />
              <HorizontalRow
                title="Original Games"
                data={originalGames}
                onPlay={handlePlayGame}
              />
              <HorizontalRow
                title="Slots"
                data={slotsGames}
                onPlay={handlePlayGame}
              />
              <HorizontalRow
                title="Table Games"
                data={tableGames}
                onPlay={handlePlayGame}
              />
              <HorizontalRow
                title="New Games"
                data={newGames}
                onPlay={handlePlayGame}
              />
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-6">
                <div className="px-4 py-2 bg-gradient-to-r from-[#21184a] to-transparent border-l-4 border-white min-h-[48px] flex items-center w-full max-w-full">
                  <h2 className="text-xl md:text-2xl font-bold text-white">{getTitle()}</h2>
                </div>
                {totalPages > 1 && (
                  <div className="flex items-center space-x-2">
                    <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className={`px-3 py-1 rounded-md font-medium text-sm transition-colors ${currentPage === 1 ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-purple-600 text-white hover:bg-purple-700'}`}>Prev</button>
                    <span className="text-sm font-medium text-white px-2">{currentPage} / {totalPages}</span>
                    <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className={`px-3 py-1 rounded-md font-medium text-sm transition-colors ${currentPage === totalPages ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-purple-600 text-white hover:bg-purple-700'}`}>Next</button>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {paginatedGames.map((game) => (
                  <GameCard key={game.id} game={game} onPlay={handlePlayGame} />
                ))}
              </div>
            </>
          )}
        </>
      )}

      {/* Modal */}
      {launchUrl && isModalOpen && (
        <div className="fixed inset-0 z-[1000] bg-black">
          <div className="w-full h-full relative flex flex-col">

            {/* Mobile Topbar (visible only on small screens) */}
            <div className="w-full h-12 bg-gray-900 flex items-center justify-between px-4 relative z-10">
              <h2 className="text-white text-sm font-semibold">{playingGame}</h2>

              {/* Close Button */}
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setUserBalance(localStorage.getItem("token"));
                }}
                className="p-2 bg-gray-800 bg-opacity-60 hover:bg-opacity-80 rounded-full cursor-pointer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="red"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Desktop Close Button (hidden on mobile) */}
            {/* <button
              onClick={() => {
                setIsModalOpen(false);
                setUserBalance(localStorage.getItem("token"));
              }}
              className="hidden md:block absolute top-4 right-4 p-2 bg-gray-800 bg-opacity-60 hover:bg-opacity-80 rounded-full cursor-pointer z-10"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="red"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button> */}

            {/* Iframe for Game */}
            <div className="flex-1">
              <iframe
                src={launchUrl}
                className="w-full h-full"
                title="Game Launch"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </motion.section>
  );
}
