'use client';

import { motion } from 'framer-motion';

import { IGame, IUser } from '@/types'; // adjust path if needed
import { Icon } from '@iconify/react';
import { useEffect, useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { toast } from 'react-toastify';
import { userFavorites } from '@/lib/api';
import { fetchUserInfo } from '@/lib/api';

interface GameCardProps {
  game: IGame;
  onPlay: (game_code: string, providerCode: string, gameName: string) => void;
  size?: 'default' | 'compact';
}

export function GameCard({ game, onPlay, size = 'default' }: GameCardProps) {

  const [favorite, setFavorite] = useState(false);
  const { user } = useUser();

  const handleFavorite = async () => {
    if (!user) {
      toast.error("please log in");
      return;
    }

    try {
      const newFavorite = !favorite;
      setFavorite(newFavorite);
      const token = localStorage.getItem("token");

      if (!token) return;

      // Use user.favorites directly instead of making another API call
      let favorites = user.favorites
        ? JSON.parse(user.favorites)
        : [];

      // Update local list
      if (newFavorite) {
        if (!favorites.includes(game.game_code)) {
          favorites.push(game.game_code);
        }
      } else {
        favorites = favorites.filter((code) => code !== game.game_code);
      }

      // Sync with backend
      if (user && token) {
        await userFavorites(token, JSON.stringify(favorites));
      }

      // console.log("✅ Favorites updated:", favorites);
    } catch (error) {
      console.error("❌ Error updating favorites:", error);
    }
  };


  useEffect(() => {
    const fetchFavorites = async () => {
      if (user) {
        try {
          // Use user.favorites directly instead of making another API call
          const favorites = user.favorites
            ? JSON.parse(user.favorites)
            : [];

          // Update favorite state based on current game
          setFavorite(favorites.includes(game.game_code));
        } catch (error) {
          console.error("Error parsing user favorites:", error);
        }
      } else {
        setFavorite(false);
      }
    };

    fetchFavorites();
  }, [user, game.game_code]);

  // Let the card fill its grid cell with a responsive aspect ratio
  // This ensures cards fit the grid container without overlaying
  const cardSizeClass = size === 'compact' 
    ? 'w-full aspect-[5/4]' 
    : 'w-full max-w-[180px] sm:max-w-none aspect-[5/4]';
  const titleTextClass = size === 'compact' ? 'text-[10px] sm:text-[11px]' : 'text-[12px] md:text-sm';
  
  return (
    <motion.div
      key={game.id}
      className={`relative group ${cardSizeClass}`}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Hover glow effect - adapts to theme */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#6e4bff] via-[#a87cf7] to-[#ff6ec7] opacity-0 group-hover:opacity-100 blur-md transition-all duration-300" />
      
      {/* Main card container - light/dark theme support */}
      <div className="relative w-full h-full rounded-2xl overflow-hidden bg-white dark:bg-[#120f1e] border border-gray-200 dark:border-white/10 shadow-md dark:shadow-none flex flex-col">
        {/* Image container */}
        <div className="relative flex-1 overflow-hidden">
          <img
            src={game.banner}
            alt={game.game_name}
            className="w-full h-full object-fill"
          />

          {/* Provider badge - theme aware */}
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-semibold text-white bg-black/50 dark:bg-black/50 backdrop-blur-md border border-white/20 dark:border-white/10">
            {game.providerCode}
          </div>

          {/* Favorite button - theme aware */}
          <button
            className="absolute top-2 right-2 p-1 rounded-full bg-white/80 dark:bg-black/40 text-gray-700 dark:text-white hover:bg-white dark:hover:bg-black/60 border border-gray-200 dark:border-white/10 transition-colors z-[1] shadow-sm dark:shadow-none"
            onClick={(e) => {
              e.stopPropagation();
              handleFavorite();
            }}
            aria-label="Favorite"
          >
            <Icon 
              icon={favorite ? "mdi:heart" : "mdi:heart-outline"} 
              width={18} 
              height={18} 
              className={`transition-colors duration-300 ${favorite ? "text-red-500" : "text-gray-700 dark:text-white"}`}
            />
          </button>

          {/* Hover overlay - theme aware */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 dark:from-black/80 via-black/5 dark:via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Play button - centered on hover */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.button
              className="pointer-events-auto flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-[#896cef] dark:bg-[#896cef] text-white font-semibold text-xs sm:text-sm shadow-lg hover:bg-[#7d61f0] dark:hover:bg-[#7d61f0] opacity-0 group-hover:opacity-100 transition-opacity"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={(e) => {
                e.stopPropagation();
                onPlay(game.game_code, game.providerCode, game.game_name);
              }}
            >
              <Icon icon="lucide:play" className="w-4 h-4" />
              <span className="hidden sm:inline">Play</span>
            </motion.button>
          </div>
        </div>

        {/* Game info footer - theme aware */}
        <div className="bg-white/90 dark:bg-black/60 backdrop-blur-sm px-3 py-2 flex items-center justify-between border-t border-gray-200/50 dark:border-white/5">
          <span className={`text-gray-900 dark:text-white ${titleTextClass} font-medium truncate pr-2`}>
            {game.game_name}
          </span>
          <span className="text-gray-600 dark:text-white/70 text-[10px] uppercase tracking-wide flex-shrink-0">
            {game.lang || 'EN'}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
