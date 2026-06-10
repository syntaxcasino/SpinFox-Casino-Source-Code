"use client";

import React, { useState, useRef, memo } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "@/contexts/TranslationContext";
import Image from "next/image";
import Link from "next/link";
import { fadeInUp } from "@/utils/animations";
import { Search, Grid3x3 } from "lucide-react";

interface Provider {
  key: string;
  label: string;
}

interface GameNavigationProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedProvider: string;
  onProviderChange: (provider: string) => void;
}

const GameNavigation = ({
  activeCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
  selectedProvider,
  onProviderChange,
}: GameNavigationProps) => {
  const { t } = useTranslation();
  const [showProvidersDropdown, setShowProvidersDropdown] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // --- Providers ---
  const providers: Provider[] = [
    { key: "all", label: t("games.providers.all") },
    { key: "PRAGMATIC", label: "PRAGMATIC" },
  ];

  const currentProviderLabel =
    providers.find((p) => p.key === selectedProvider)?.label ||
    t("games.providers.default");

  const handleProviderSelect = (key: string) => {
    onProviderChange(key);
    setShowProvidersDropdown(false);
  };

  // --- Section Component ---
  const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mr-8">
      <div className="text-light-text-secondary dark:text-gray-400 text-xs uppercase mb-2">{title}</div>
      <div className="flex flex-col space-y-1">{children}</div>
    </div>
  );

  const Item: React.FC<{ label: string; href?: string; onClick?: () => void }> = ({
    label,
    href,
    onClick,
  }) => {
    if (href)
      return (
        <Link
          href={href}
          onClick={onClick}
          className={`px-3 py-2 rounded-lg text-sm transition-colors ${activeCategory === label ? "text-primary font-bold" : "text-light-text dark:text-white hover:text-primary"
            }`}
        >
          {label}
        </Link>
      );
    return (
      <button
        onClick={onClick}
        className={`px-3 py-2 rounded-lg text-sm text-left w-full transition-colors ${activeCategory === label ? "text-primary font-bold" : "text-light-text dark:text-white hover:text-primary"
          }`}
      >
        {label}
      </button>
    );
  };

  return (
    <motion.nav
      className="bg-light-bg-secondary dark:bg-[#221d35] border border-light-border dark:border-transparent rounded-lg mx-4 z-[1] mt-10 px-4 py-4 transition-colors duration-300"
      initial="hidden"
      animate="visible"
      variants={fadeInUp}
    >
      {/* --- Desktop --- */}
      <div className="hidden lg:flex items-start">
        {/* Sections */}
        <Section title={t("menu.games")}>
          <Item label={t("menu.slots")} href="/slots" onClick={() => onCategoryChange("slots")} />
          <Item
            label={t("menu.liveCasino")}
            href="/live-casino"
            onClick={() => onCategoryChange("liveCasino")}
          />
          <Item
            label={t("menu.sports")}
            href="/sports"
            onClick={() => onCategoryChange("sports")}
          />
        </Section>

        <Section title={t("menu.promotions")}>
          <Item
            label={t("menu.leaderboard")}
            href="/leaderboard"
            onClick={() => onCategoryChange("leaderboard")}
          />
          <Item
            label={t("menu.tournaments")}
            href="/tournaments"
            onClick={() => onCategoryChange("tournaments")}
          />
          <Item label={t("menu.vipClub")} href="/vip" onClick={() => onCategoryChange("vipClub")} />
        </Section>

        <Section title={t("menu.wallet")}>
          <Item label={t("menu.wallet")} href="/wallet" onClick={() => onCategoryChange("wallet")} />
          <Item label={t("menu.settings")} href="/settings" onClick={() => onCategoryChange("settings")} />
        </Section>

        <div className="ml-auto flex flex-col gap-2">
          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t("games.searchPlaceholder")}
              className="bg-light-bg-tertiary dark:bg-dark-bg-secondary text-light-text dark:text-white placeholder-light-text-secondary dark:placeholder-gray-400 px-4 py-2 pr-10 rounded-lg text-sm w-[200px] focus:outline-none focus:ring-2 focus:ring-primary border border-light-border dark:border-transparent"
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-light-text-secondary dark:text-white/50" />
          </div>

          {/* Providers Dropdown */}
          {activeCategory === "slots" && (
            <div className="relative">
              <button
                onClick={() => setShowProvidersDropdown((prev) => !prev)}
                className="bg-light-bg-tertiary dark:bg-dark-bg-secondary text-light-text dark:text-white px-4 py-2 rounded-lg text-sm w-[200px] flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-primary border border-light-border dark:border-transparent"
              >
                <span>{currentProviderLabel}</span>
                <Grid3x3 className="w-4 h-4 text-light-text-secondary dark:text-white/50" />
              </button>
              {showProvidersDropdown && (
                <div className="absolute mt-1 bg-light-bg-secondary dark:bg-dark-bg-secondary border border-light-border dark:border-gray-700 rounded-lg w-[200px] z-10">
                  {providers.map((p) => (
                    <button
                      key={p.key}
                      onClick={() => handleProviderSelect(p.key)}
                      className={`w-full text-left px-4 py-2 text-light-text dark:text-white hover:bg-light-bg-tertiary dark:hover:bg-[#221d35] ${selectedProvider === p.key ? "bg-light-bg-tertiary dark:bg-[#221d35] font-bold" : ""
                        }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* --- Mobile --- */}
      <div className="lg:hidden flex flex-col space-y-4">
        {/* Horizontal scroll menu */}
        <div
          ref={scrollContainerRef}
          className="flex overflow-x-auto space-x-4 pb-2"
          style={{
            maskImage: "linear-gradient(to right, black 0%, black 80%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to right, black 0%, black 80%, transparent 100%)",
          }}
        >
          <Item label={t("menu.slots")} href="/slots" onClick={() => onCategoryChange("slots")} />
          <Item
            label={t("menu.liveCasino")}
            href="/live-casino"
            onClick={() => onCategoryChange("liveCasino")}
          />
          <Item
            label={t("menu.sports")}
            href="/sports"
            onClick={() => onCategoryChange("sports")}
          />
          <Item
            label={t("menu.leaderboard")}
            href="/leaderboard"
            onClick={() => onCategoryChange("leaderboard")}
          />
          <Item
            label={t("menu.tournaments")}
            href="/tournaments"
            onClick={() => onCategoryChange("tournaments")}
          />
          <Item label={t("menu.vipClub")} href="/vip" onClick={() => onCategoryChange("vipClub")} />
          <Item label={t("menu.wallet")} href="/wallet" onClick={() => onCategoryChange("wallet")} />
          <Item label={t("menu.settings")} href="/settings" onClick={() => onCategoryChange("settings")} />
        </div>

        {/* Search + Providers */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t("games.searchPlaceholder")}
              className="bg-light-bg-tertiary dark:bg-dark-bg-secondary text-light-text dark:text-white placeholder-light-text-secondary dark:placeholder-gray-400 px-4 py-2 pr-10 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-primary border border-light-border dark:border-transparent"
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-light-text-secondary dark:text-white/50" />
          </div>
          {activeCategory === "slots" && (
            <div className="relative flex-1">
              <button
                onClick={() => setShowProvidersDropdown((prev) => !prev)}
                className="bg-light-bg-tertiary dark:bg-dark-bg-secondary text-light-text dark:text-white px-4 py-2 rounded-lg text-sm w-full flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-primary border border-light-border dark:border-transparent"
              >
                <span>{currentProviderLabel}</span>
                <Grid3x3 className="w-4 h-4 text-light-text-secondary dark:text-white/50" />
              </button>
              {showProvidersDropdown && (
                <div className="absolute mt-1 bg-light-bg-secondary dark:bg-dark-bg-secondary border border-light-border dark:border-gray-700 rounded-lg w-full z-10">
                  {providers.map((p) => (
                    <button
                      key={p.key}
                      onClick={() => handleProviderSelect(p.key)}
                      className={`w-full text-left px-4 py-2 text-light-text dark:text-white hover:bg-light-bg-tertiary dark:hover:bg-[#221d35] ${selectedProvider === p.key ? "bg-light-bg-tertiary dark:bg-[#221d35] font-bold" : ""
                        }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.nav>
  );
};

export default memo(GameNavigation);


