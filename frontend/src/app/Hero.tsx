"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "../contexts/TranslationContext";
import Image from "next/image";
import { fadeInUp, buttonHover } from "@/utils/animations";
import GameNavigation from "@/components/GameNavigation";
import SearchResultsSection from "@/components/SearchResultsSection";
import SportsCard from "@/components/ui/SportsCard";
import { useMarketsStore } from "@/store/MarketsStore";
// import { useAppKitNetwork } from "@reown/appkit/react";
import { MarketsQueryParams } from "@/store/MarketsStore";
import { StatusCodeEnum } from "@/types/overtime-v2";
import { usePathname } from "next/navigation";
import { Trophy, ChevronRight } from "lucide-react";
import Link from "next/link";
export default function Hero() {
  const { t: tHome } = useTranslation('home');
  const pathname = usePathname();
  const [card1Slide, setCard1Slide] = useState(0);
  const [card2Slide, setCard2Slide] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const card1IntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Game filtering state (default values only, no URL sync)
  const [activeCategory, setActiveCategory] = useState("lobby");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProvider, setSelectedProvider] = useState("all");

  // Sports betting state
  const { markets, isLoadingMarkets, fetchMarkets } = useMarketsStore();
  // const { chainId } = useAppKitNetwork();

  const card1Slides = [
    { bgImage: "/hero-1.png", bgImageMobile: "/hero-1-mobile.png", translationKey: "slide1" },
    { bgImage: "/hero-2.png", bgImageMobile: "/hero-2-mobile.png", translationKey: "slide2" },
    { bgImage: "/hero-3.png", bgImageMobile: "/hero-3-mobile.png", translationKey: "slide3" },
  ];

  const card2Slides = ["slide1", "slide2", "slide3"];
  const steps = ["step1", "step2", "step3"];

  // Auto-slide functionality for Card 1
  useEffect(() => {
    if (!isPaused) {
      card1IntervalRef.current = setInterval(() => {
        setCard1Slide((prev) => (prev + 1) % card1Slides.length);
      }, 3000);
    }
    return () => {
      if (card1IntervalRef.current) clearInterval(card1IntervalRef.current);
    };
  }, [isPaused, card1Slides.length]);

  const handleCard1Navigation = useCallback((direction: "prev" | "next") => {
    setCard1Slide((prev) =>
      direction === "prev" ? (prev === 0 ? card1Slides.length - 1 : prev - 1) : (prev + 1) % card1Slides.length
    );
  }, [card1Slides.length]);

  const handleCard2Navigation = useCallback((direction: "prev" | "next") => {
    setCard2Slide((prev) =>
      direction === "prev" ? (prev === 0 ? card2Slides.length - 1 : prev - 1) : (prev + 1) % card2Slides.length
    );
  }, [card2Slides.length]);

  const handleStepNavigation = useCallback((stepIndex: number) => {
    setCurrentStep(stepIndex);
  }, []);

  const handleTouchStart = useCallback(() => {
    setIsPaused(true);
  }, []);

  const handleTouchEnd = useCallback(() => {
    setTimeout(() => setIsPaused(false), 1000);
  }, []);

  // Stabilize GameNavigation props
  const onCategoryChange = (href: string) => {
    return pathname === href;
  };

  const onSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const onProviderChange = useCallback((provider: string) => {
    setSelectedProvider(provider);
  }, []);

  const showAllSections = activeCategory === "lobby" && !searchQuery && selectedProvider === "all";

  // Fetch sports markets for dashboard
  useEffect(() => {
    const networkId = 10; // Default to Optimism mainnet
    const params: MarketsQueryParams = {
      ungroup: true,
      onlyBasicProperties: true,
      includeHashInResponse: false,
      status: StatusCodeEnum.OPEN,
      onlyMainMarkets: true,
      includeProofs: false,
      minMaturity: Math.floor(Date.now() / 1000),
    };
    fetchMarkets(Number(networkId), params);
  }, [fetchMarkets]);

  // Get featured sports matches (first 6)
  const featuredSportsMatches = markets?.slice(0, 6) || [];

  return (
    <section className="bg-light-bg dark:bg-dark-bg-secondary min-h-screen transition-colors duration-300">
      {showAllSections && (
        <div className="mx-auto px-4 pt-8">
          {/* --- HERO SLIDES --- */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Card 1 - Main Carousel */}
            <motion.div
              className="relative lg:w-2/3 h-[420px] rounded-2xl overflow-hidden shadow-2xl"
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {/* Enhanced gradient background with animated overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#5c258e] via-[#a874d7] to-[#896cef]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent" />
              
              {/* Animated glow effect */}
              <motion.div 
                className="absolute inset-0 opacity-50"
                animate={{
                  background: [
                    'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.15) 0%, transparent 50%)',
                    'radial-gradient(circle at 80% 50%, rgba(255,255,255,0.15) 0%, transparent 50%)',
                    'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.15) 0%, transparent 50%)',
                  ]
                }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              />

              <Image
                src={card1Slides[card1Slide].bgImage}
                alt={`Hero ${card1Slide + 1}`}
                width={0}
                height={0}
                sizes="100vw"
                className="hidden lg:block absolute right-0 top-0 h-full w-auto object-contain object-right z-10 drop-shadow-2xl"
                priority
              />
              <Image
                src={card1Slides[card1Slide].bgImageMobile}
                alt={`Hero Mobile ${card1Slide + 1}`}
                width={0}
                height={0}
                sizes="50vw"
                className="lg:hidden absolute bottom-0 right-[-14%] w-1/2 h-1/2 object-contain object-bottom z-10 drop-shadow-2xl"
                priority
              />
              
              <motion.div
                className="relative z-10 h-full flex items-center px-8 md:px-12"
                key={card1Slide}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                <div className="max-w-2xl text-center md:text-left">
                  <motion.h1 
                    className="text-4xl md:text-5xl font-extrabold text-white mb-5 drop-shadow-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                  >
                    {tHome(`hero.card1.${card1Slides[card1Slide].translationKey}.title`)}
                  </motion.h1>
                  <motion.p 
                    className="text-lg md:text-xl font-semibold text-white/95 mb-8 drop-shadow-md"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                  >
                    {tHome(`hero.card1.${card1Slides[card1Slide].translationKey}.subtitle`)}
                  </motion.p>
                </div>
              </motion.div>
              
              {/* Enhanced Navigation Arrows */}
              <div className="hidden md:flex absolute bottom-6 right-6 gap-3 z-20">
                <motion.button
                  className="w-12 h-12 rounded-xl bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all backdrop-blur-md border border-white/30 shadow-lg"
                  onClick={() => handleCard1Navigation("prev")}
                  whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(255,255,255,0.2)" }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                  </svg>
                </motion.button>
                <motion.button
                  className="w-12 h-12 rounded-xl bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all backdrop-blur-md border border-white/30 shadow-lg"
                  onClick={() => handleCard1Navigation("next")}
                  whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(255,255,255,0.2)" }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </motion.button>
              </div>
              
              {/* Enhanced Pagination Dots */}
              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-3 z-20">
                {card1Slides.map((_, index) => (
                  <motion.button
                    key={index}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === card1Slide 
                        ? "bg-white w-8 shadow-lg" 
                        : "bg-white/40 hover:bg-white/60 w-2"
                    }`}
                    onClick={() => setCard1Slide(index)}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                  />
                ))}
              </div>
            </motion.div>

            {/* Card 2 - Secondary Banner */}
            <motion.div
              className="hidden lg:block relative lg:w-1/3 h-[420px] rounded-2xl overflow-hidden shadow-2xl"
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
            >
              {/* Enhanced gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#876aed] via-[#5c3fb8] to-[#30119b]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent" />
              
              {/* Modern badge */}
              <div className="absolute top-5 left-5 bg-gradient-to-r from-[#896cef] to-[#6b52d1] text-white px-5 py-2.5 font-bold text-sm rounded-xl shadow-lg backdrop-blur-sm border border-white/20 z-20">
                {tHome('hero.card2.badge')}
              </div>
              
              <div className="relative z-10 h-full flex">
                <div className="xl:w-2/3 lg:w-full flex items-center px-8 pt-4">
                  <motion.div
                    key={card2Slide}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  >
                    <h2 className="text-2xl xl:text-3xl font-bold text-white mb-5 drop-shadow-lg">
                      {tHome(`hero.card2.${card2Slides[card2Slide]}.title`)}
                    </h2>
                    <p className="text-base text-white/95 leading-relaxed drop-shadow-md">
                      {tHome(`hero.card2.${card2Slides[card2Slide]}.content`)}
                    </p>
                  </motion.div>
                </div>
                
                <div className="w-1/3 hidden xl:flex items-center justify-center">
                  <motion.div
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Image
                      src="/50.png"
                      alt="Decorative"
                      width={140}
                      height={140}
                      className="rounded-full shadow-2xl ring-4 ring-white/20"
                    />
                  </motion.div>
                </div>
                
                {/* Enhanced Navigation Arrows */}
                <div className="absolute hidden xl:flex bottom-6 right-6 gap-3">
                  <motion.button
                    className="w-12 h-12 rounded-xl bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all backdrop-blur-md border border-white/30 shadow-lg"
                    onClick={() => handleCard2Navigation("prev")}
                    whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(255,255,255,0.2)" }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                    </svg>
                  </motion.button>
                  <motion.button
                    className="w-12 h-12 rounded-xl bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all backdrop-blur-md border border-white/30 shadow-lg"
                    onClick={() => handleCard2Navigation("next")}
                    whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(255,255,255,0.2)" }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {/* Sports Betting Section - Only show in lobby */}
      {showAllSections && (
        <div className="mx-4 mt-10">
          {/* Sports Betting Promo Banner */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="relative mb-6 overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-primary-hover to-primary p-8 md:p-10 shadow-2xl"
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.3 }}
          >
            {/* Animated gradient overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent" />
            
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <motion.div 
                  className="p-4 bg-white/15 backdrop-blur-md rounded-2xl shadow-lg border border-white/20"
                  whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.05 }}
                  transition={{ duration: 0.5 }}
                >
                  <Trophy className="w-9 h-9 text-white drop-shadow-lg" />
                </motion.div>
                <div>
                  <h2 className="text-2xl md:text-4xl font-extrabold text-white drop-shadow-lg mb-1">Sports Betting</h2>
                  <p className="text-sm md:text-lg text-white/95 font-medium drop-shadow-md">Bet on your favorite teams and win big!</p>
                </div>
              </div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link 
                  href="/sports"
                  className="flex items-center gap-2 px-8 py-4 bg-white text-primary hover:bg-white/95 rounded-xl transition-all font-bold text-sm md:text-base shadow-2xl hover:shadow-white/20"
                >
                  Place Your Bets
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </motion.div>
            </div>
            
            {/* Enhanced Decorative Elements */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
            <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
            
            {/* Animated sparkles */}
            <motion.div
              className="absolute top-10 right-20 w-2 h-2 bg-white rounded-full"
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1.5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 1,
              }}
            />
            <motion.div
              className="absolute bottom-20 right-40 w-2 h-2 bg-white rounded-full"
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1.5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 1,
                delay: 0.5,
              }}
            />
          </motion.div>

          {/* Sports Matches Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div>
                <h3 className="text-xl font-bold text-light-text dark:text-white">Featured Matches</h3>
                <p className="text-sm text-light-text-secondary dark:text-white/60">Live and upcoming events</p>
              </div>
            </div>
            <Link 
              href="/sports"
              className="flex items-center gap-2 text-primary hover:text-primary-hover transition-colors font-medium text-sm"
            >
              View All Sports
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {isLoadingMarkets ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-light-bg-secondary dark:bg-dark-bg-secondary border border-light-border dark:border-dark-border rounded-xl h-[200px] animate-pulse" />
              ))}
            </div>
          ) : featuredSportsMatches.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {featuredSportsMatches.map((market) => (
                <SportsCard
                  key={market.gameId}
                  market={market}
                  isGrid={true}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-light-bg-secondary dark:bg-dark-bg-secondary border border-light-border dark:border-dark-border rounded-xl">
              <Trophy className="w-12 h-12 text-light-text-secondary dark:text-white/30 mx-auto mb-3" />
              <p className="text-light-text-secondary dark:text-white/50">No live matches at the moment</p>
              <Link 
                href="/sports"
                className="inline-block mt-4 text-primary hover:text-primary-hover underline text-sm"
              >
                Browse all sports
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Game navigation & results */}
      {/* <GameNavigation
        activeCategory={activeCategory}
        onCategoryChange={onCategoryChange}
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        selectedProvider={selectedProvider}
        onProviderChange={onProviderChange}
      /> */}
      <SearchResultsSection
        activeCategory={activeCategory}
        searchQuery={searchQuery}
        selectedProvider={selectedProvider}
      />
    </section>
  );
}
