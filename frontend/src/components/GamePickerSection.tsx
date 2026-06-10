"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "@/contexts/TranslationContext";
import Image from "next/image";
import { fadeInUp } from "@/utils/animations";
import { IGame } from "@/types";

export default function GamePickerSection() {
  const { t } = useTranslation();
  const [games, setGames] = useState<IGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [randomGame, setRandomGame] = useState<IGame | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(180); // Default offset
  const [containerWidth, setContainerWidth] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(3); // Start with center card
  const [allGames, setAllGames] = useState<IGame[]>([]); // Store all available games
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const loadRandomGames = async () => {
      try {
        setLoading(true);
        // Load more games for carousel functionality
        // const initialGames = await gameService.getRandomLandscapeGames(15); // Load more games
        // setAllGames(initialGames);
      } catch (error) {
        console.error("Error loading random games:", error);
      } finally {
        setLoading(false);
      }
    };

    loadRandomGames();
  }, []); // No dependencies on filters - GamePickerSection is not affected by filtering

  // Update display when allGames changes
  useEffect(() => {
    if (allGames.length > 0) {
      updateGamesDisplay(currentIndex);
    }
  }, [allGames]);

  const calculateOffset = useCallback(() => {
    if (containerRef.current) {
      const width = containerRef.current.offsetWidth;
      setContainerWidth(width);
      const calculatedOffset = Math.min(Math.max(width * 0.125, 60), 240);
      setOffset(calculatedOffset);
    }
  }, []);

  useEffect(() => {
    // Use setTimeout to ensure DOM is rendered
    const timer = setTimeout(() => {
      calculateOffset();
    }, 100);

    // Use ResizeObserver for better resize detection
    let resizeObserver: ResizeObserver | null = null;
    
    if (typeof window !== 'undefined' && 'ResizeObserver' in window) {
      resizeObserver = new ResizeObserver(() => {
        calculateOffset();
      });
      
      if (containerRef.current) {
        resizeObserver.observe(containerRef.current);
      }
    }

    return () => {
      clearTimeout(timer);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [calculateOffset]);

  // Separate effect for window resize - only run on client
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Only add event listener if ResizeObserver is not available
    if (!('ResizeObserver' in window)) {
      const handleResize = () => {
        calculateOffset();
      };
      (window as any).addEventListener('resize', handleResize);
      return () => (window as any).removeEventListener('resize', handleResize);
    }
  }, [calculateOffset]);

  const handleFindGame = () => {
    if (games.length > 0) {
      const randomIndex = Math.floor(Math.random() * games.length);
      setRandomGame(games[randomIndex]);
    }
  };

  // Carousel drag functionality - continuous rotation
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current || isAnimating) return;
    setIsDragging(true);
    setStartX(e.pageX);
    e.preventDefault();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    e.preventDefault();
    const currentX = e.pageX;
    const diff = currentX - startX;
    
    // Calculate rotation based on drag distance
    const rotationAmount = diff / (offset * 0.5); // Adjust sensitivity
    const newIndex = currentIndex - rotationAmount;
    
    // Handle infinite rotation
    let wrappedIndex = newIndex;
    if (newIndex < 0) {
      wrappedIndex = allGames.length + (newIndex % allGames.length);
    } else if (newIndex >= allGames.length) {
      wrappedIndex = newIndex % allGames.length;
    }
    
    // Update display in real-time during drag
    if (Math.abs(diff) > 5) { // Small threshold to prevent tiny movements
      updateGamesDisplay(wrappedIndex);
    }
    
    setDragOffset(diff);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    // Calculate final position based on drag distance
    const cardWidth = offset * 0.5; // More sensitive for better centering
    const cardsToMove = Math.round(dragOffset / cardWidth);
    
    if (cardsToMove !== 0) {
      // Snap to the nearest card position
      let newIndex = Math.round(currentIndex - cardsToMove);
      
      // Handle infinite looping
      if (newIndex < 0) {
        newIndex = allGames.length + (newIndex % allGames.length);
      } else if (newIndex >= allGames.length) {
        newIndex = newIndex % allGames.length;
      }
      
      setCurrentIndex(newIndex);
      setIsAnimating(true);
      
      // Animate to the final centered position
      setTimeout(() => {
        updateGamesDisplay(newIndex);
        setDragOffset(0);
        setIsAnimating(false);
      }, 300);
    } else {
      // Snap back to current position with smooth animation
      setIsAnimating(true);
      setTimeout(() => {
        setDragOffset(0);
        setIsAnimating(false);
      }, 300);
    }
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      handleMouseUp();
    }
  };

  // Touch support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!containerRef.current || isAnimating) return;
    setIsDragging(true);
    setStartX(e.touches[0].pageX);
    e.preventDefault();
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !containerRef.current) return;
    const currentX = e.touches[0].pageX;
    const diff = currentX - startX;
    
    // Calculate rotation based on drag distance - same as mouse
    const rotationAmount = diff / (offset * 0.5); // Adjust sensitivity
    const newIndex = currentIndex - rotationAmount;
    
    // Handle infinite rotation
    let wrappedIndex = newIndex;
    if (newIndex < 0) {
      wrappedIndex = allGames.length + (newIndex % allGames.length);
    } else if (newIndex >= allGames.length) {
      wrappedIndex = newIndex % allGames.length;
    }
    
    // Update display in real-time during drag
    if (Math.abs(diff) > 5) { // Small threshold to prevent tiny movements
      updateGamesDisplay(wrappedIndex);
    }
    
    setDragOffset(diff);
  };

  const handleTouchEnd = () => {
    handleMouseUp();
  };

  // Update games display based on current index
  const updateGamesDisplay = (targetIndex: number) => {
    // Get 7 games centered around target index
    const startIdx = Math.max(0, targetIndex - 3);
    const endIdx = Math.min(allGames.length, startIdx + 7);
    let displayGames = allGames.slice(startIdx, endIdx);
    
    // Create infinite loop effect by wrapping games
    if (displayGames.length < 7 && allGames.length >= 7) {
      const needed = 7 - displayGames.length;
      if (targetIndex < 3) {
        // At start, add games from end
        const fromEnd = allGames.slice(-needed);
        displayGames = [...fromEnd, ...displayGames];
      } else if (targetIndex >= allGames.length - 3) {
        // At end, add games from start
        const fromStart = allGames.slice(0, needed);
        displayGames = [...displayGames, ...fromStart];
      }
    }
    
    setGames(displayGames);
    
    // Update random game to center card
    const centerIdx = Math.min(3, displayGames.length - 1);
    if (displayGames[centerIdx]) {
      setRandomGame(displayGames[centerIdx]);
    }
  };

  // Carousel navigation functions
  const showNextCards = () => {
    let newIndex = currentIndex + 1;
    
    // Create infinite loop effect
    if (newIndex >= allGames.length) {
      newIndex = 0;
    }
    
    setCurrentIndex(newIndex);
    updateGamesDisplay(newIndex);
  };

  const showPreviousCards = () => {
    let newIndex = currentIndex - 1;
    
    // Create infinite loop effect
    if (newIndex < 0) {
      newIndex = allGames.length - 1;
    }
    
    setCurrentIndex(newIndex);
    updateGamesDisplay(newIndex);
  };

  const handlePlay = (game: IGame) => {
    console.log("Play game:", game);
  };

  const handleDemo = (game: IGame) => {
    console.log("Demo game:", game);
  };

  if (loading) {
    return (
      <motion.section
        className="mx-4 mt-10 text-center select-none"
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
      >
        <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-3 drop-shadow-lg">
          {t("home.gamePicker.title")}
        </h2>
        <p className="text-base md:text-xl text-white/90 mb-10 font-medium drop-shadow-md">
          {t("home.gamePicker.subtitle")}
        </p>
        <div className="relative flex justify-center items-center mb-10 h-[164px] md:h-[328px]">
          {/* Loading state with multiple card placeholders */}
          {[...Array(7)].map((_, index) => {
            const isCenter = index === 3;
            const cardOffset = index - 3;
            const absOffset = Math.abs(cardOffset);
            const scale = Math.max(0.6, 1 - (absOffset * 0.125));
            const translateX = cardOffset * offset;
            const zIndex = 7 - absOffset;
            
            return (
              <div
                key={index}
                className={`absolute bg-light-bg-secondary dark:bg-white/10 border border-light-border dark:border-white/20 rounded-2xl animate-pulse w-[227px] h-[164px] md:w-[454px] md:h-[328px] transition-all duration-300 ease-out ${isCenter ? 'shadow-2xl' : 'shadow-lg'}`}
                style={{
                  zIndex,
                  transform: `translateX(${translateX}px) scale(${scale})`,
                  filter: isCenter ? 'brightness(1)' : 'brightness(0.5)'
                }}
              />
            );
          })}
        </div>
        <motion.button
          className="bg-gradient-to-r from-[#896CEF] to-[#a874d7] text-white font-bold text-base rounded-xl w-[200px] h-[48px] flex items-center justify-center mx-auto shadow-xl"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {t("home.gamePicker.findGame")}
        </motion.button>
      </motion.section>
    );
  }

  return (
    <motion.section
      className="mx-4 mt-10 text-center select-none"
      initial="hidden"
      animate="visible"
      variants={fadeInUp}
    >
      {/* Title and subtitle */}
      <motion.h2 
        className="text-3xl md:text-4xl font-extrabold text-white mb-3 drop-shadow-lg"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        {t("home.gamePicker.title")}
      </motion.h2>
      <motion.p 
        className="text-base md:text-xl text-white/90 mb-10 font-medium drop-shadow-md"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        {t("home.gamePicker.subtitle")}
      </motion.p>

      {/* Landscape card stack with enhanced styling */}
      <div
        className={`relative flex justify-center items-center mb-10 h-[164px] md:h-[328px] select-none
          ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {games.map((game, index) => {
          const isCenter = index === 3;
          const cardOffset = index - 3; // -3 to +3
          const absOffset = Math.abs(cardOffset);
          
          // Calculate positioning and scaling based on available width
          const scale = Math.max(0.6, 1 - (absOffset * 0.125));
          const translateX = cardOffset * offset; // Dynamic offset based on container width
          const zIndex = 7 - absOffset; // Center card on top

          return (
            <motion.div
              key={game.id}
              className={`absolute rounded-2xl overflow-hidden ${isCenter ? 'group shadow-2xl ring-2 ring-primary/30' : 'shadow-lg'}
                w-[227px] h-[164px] md:w-[454px] md:h-[328px] select-none
                transition-all duration-300 ease-out
                ${isDragging || isAnimating ? '' : 'hover:scale-105'}
                ${isDragging && Math.abs(dragOffset) > 10 ? 'opacity-90' : 'opacity-100'}`}
              style={{
                zIndex,
                transform: `translateX(${translateX}px) scale(${scale})`,
                filter: isCenter ? 'brightness(1) drop-shadow(0 10px 40px rgba(137, 108, 239, 0.3))' : 'brightness(0.5)',
                cursor: isDragging ? 'grabbing' : (isCenter ? 'pointer' : 'pointer')
              }}
              onClick={() => !isDragging && setRandomGame(game)}
            >
              <div className="relative w-full h-full">
                <Image
                  src={game.banner}
                  alt={game.game_name}
                  width={454}
                  height={328}
                  className="w-full h-full object-cover rounded-2xl"
                />
                {/* Overlay with buttons and title on hover - only for center card */}
                {isCenter && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/30 bg-opacity-0 group-hover:bg-opacity-80 transition-all duration-300 flex flex-col items-center justify-center p-4 rounded-2xl">
                    {/* Buttons container - only visible on hover for center card */}
                    <div className="flex space-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <motion.button
                        className="py-2 px-5 md:py-3 md:px-7 bg-gradient-to-r from-[#896cef] to-[#a874d7] rounded-xl text-white font-bold text-xs md:text-base hover:shadow-[0_0_20px_rgba(137,108,239,0.5)] transition-all shadow-lg"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isDragging) {
                            handlePlay(game);
                          }
                        }}
                      >
                        Play
                      </motion.button>
                      <motion.button
                        className="py-2 px-5 md:py-3 md:px-7 border-2 border-[#896cef] rounded-xl text-white font-bold text-xs md:text-base bg-white/10 backdrop-blur-sm hover:bg-[#896cef]/30 transition-all shadow-lg"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isDragging) {
                            handleDemo(game);
                          }
                        }}
                      >
                        Demo
                      </motion.button>
                    </div>
                    {/* Game title at bottom - visible on hover for center card */}
                    <div className="absolute bottom-5 left-0 right-0 text-center cursor-pointer">
                      <h3 className="text-white font-bold text-base md:text-lg text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer drop-shadow-lg">
                        {game.game_name}
                      </h3>
                    </div>
                  </div>
                )}
                {/* Simple title overlay for non-center cards */}
                {!isCenter && (
                  <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center rounded-2xl cursor-pointer">
                    <h3 className="text-white font-bold text-sm md:text-base text-center opacity-0 hover:opacity-100 transition-opacity duration-300 cursor-pointer drop-shadow-lg">
                      {game.game_name}
                    </h3>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Find a game button */}
      <motion.button
        className="bg-gradient-to-r from-[#896CEF] to-[#a874d7] text-white font-bold text-base rounded-xl w-[200px] h-[48px] flex items-center justify-center mx-auto shadow-xl hover:shadow-[0_0_30px_rgba(137,108,239,0.5)] transition-all"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleFindGame}
      >
        {t("home.gamePicker.findGame")}
      </motion.button>
    </motion.section>
  );
}