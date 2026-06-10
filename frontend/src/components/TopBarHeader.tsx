"use client";

import React, { use, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "../contexts/TranslationContext";
import { useSidePanel } from "../contexts/SidePanelContext";
import { useUser } from "../contexts/UserContext";
import { useNetwork } from "../contexts/NetworkContext";
import { useTheme } from "../contexts/ThemeContext";
import Image from "next/image";
import { usePathname } from "next/navigation";
import SearchDropdown from "./SearchDropdown";
import LoginModal from "./modals/LoginModal";
import RegisterModal from "./modals/RegisterModal";
import DepositModal from "./modals/DepositModal";
import { Sun, Moon, User, LogOut, Menu, Search as SearchIcon, UserPlus, LogIn } from "lucide-react";
// import {
//   useAppKit,
//   useAppKitAccount,
//   useDisconnect,
// } from "@reown/appkit/react";

export default function TopBarHeader() {
  const { t: tAuth } = useTranslation("auth");
  const { t: tWallet } = useTranslation("wallet");
  const { user, isLoggedIn, logout, checkAuth } = useUser();
  const { activeNetwork, toggleNetwork } = useNetwork();
  const { isCollapsed, toggleCollapse } = useSidePanel();
  const { theme, toggleTheme } = useTheme();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const pathname = usePathname();
  // const { open } = useAppKit();
  // const { address, isConnected } = useAppKitAccount();
  // const { disconnect } = useDisconnect();

  // const shortenAddress = (addr: string) =>
  //   addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "";

  useEffect(() => {
    // Only check auth if user is not already loaded
    if (!user) {
      checkAuth();
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Navigate to home page with search query
    if (searchQuery.trim()) {
      window.location.href = `/?query=${encodeURIComponent(
        searchQuery.trim()
      )}`;
    }
    setIsSearchOpen(false);
  };

  return (
    <>
      {/* Desktop Top Bar - Hidden on mobile */}
      <motion.header
        className="hidden lg:block fixed top-0 left-0 right-0 z-30 bg-light-bg-secondary dark:bg-dark-bg-secondary border-b border-light-border dark:border-dark-border transition-colors duration-300"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        style={{ left: isCollapsed ? "80px" : "240px" }}
      >
        <div className="flex items-center justify-between h-16 px-6">
          {/* Logo - Left side */}
          <div className="flex items-center">
            <Image
              src={theme === "dark" ? "/logo-dark.png" : "/logo-light.png"}
              alt="Logo"
              width={32} // Base width, will be auto-calculated
              height={32}
              className="h-8 w-auto max-w-[120px] object-contain"
              priority
            />
          </div>

          {/* Right side buttons - Login/Sign up or User Info */}
          <div className="flex items-center gap-4">
            {isLoggedIn && user ? (
              <>
                {/* Network Switcher */}
                <motion.button
                  onClick={toggleNetwork}
                  className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 transition-all ${
                    activeNetwork === 'mainnet'
                      ? 'bg-green-500/10 border-green-500 text-green-600 dark:text-green-400'
                      : 'bg-orange-500/10 border-orange-500 text-orange-600 dark:text-orange-400'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title={`Switch to ${activeNetwork === 'mainnet' ? 'Testnet' : 'Mainnet'}`}
                >
                  <span className={`inline-block w-2 h-2 rounded-full ${
                    activeNetwork === 'mainnet' ? 'bg-green-500' : 'bg-orange-500'
                  }`}></span>
                  <span className="font-poppins font-bold text-[11px]">
                    {activeNetwork === 'mainnet' ? 'MAINNET' : 'TESTNET'}
                  </span>
                </motion.button>
                <div className="w-px h-8 bg-light-border dark:bg-dark-border"></div>

                {/* Active Balance Display */}
                <div className="text-center">
                  <div className="font-poppins font-normal text-light-text dark:text-white text-[10px]">
                    {tWallet("balance")}
                  </div>
                  <div className="font-poppins font-bold text-light-text dark:text-white text-[12px]">
                    ${(activeNetwork === 'mainnet' ? user.realBalance : user.testBalance || 0).toFixed(2)}
                  </div>
                </div>
                <div className="w-px h-8 bg-light-border dark:bg-dark-border"></div>
                {/* Bonus Balance */}
                {/* <div className="text-center">
                  <div className="font-poppins font-normal text-white text-[12px]">{tAuth('bonusBalance')}</div>
                  <div className="font-poppins font-bold text-white text-[12px]">${user.bonusBalance.toFixed(2)}</div>
                </div> */}

                {/* Deposit Button */}
                <motion.button
                  className="py-2 px-4 bg-[#896cef] rounded-[5px] text-white font-bold text-[14px] hover:bg-[#896cef]/80 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setIsDepositModalOpen(true);
                  }}
                >
                  {tWallet("deposit")}
                </motion.button>

                {/* Profile Button */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 hover:bg-light-border dark:hover:bg-white/10 rounded-lg transition-colors"
                >
                  <User className="w-6 h-6 text-light-text dark:text-white" />
                </motion.button>

                {/* Custom Wallet Button */}
                {/* {isConnected ? (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="py-2 px-4 bg-[#2b2637] rounded-[5px] text-white font-bold text-[14px] hover:bg-[#3a3450]/80 transition-colors"
                    onClick={() => open()}
                  >
                    {shortenAddress(address || "")}
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="py-2 px-4 bg-[#896cef] rounded-[5px] text-white font-bold text-[14px] hover:bg-[#896cef]/80 transition-colors"
                    onClick={() => open()}
                  >
                    {tWallet("connectWallet") || "Connect Wallet"}
                  </motion.button>
                )} */}

                {/* Logout Button */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 hover:bg-light-border dark:hover:bg-white/10 rounded-lg transition-colors"
                  onClick={() => logout()}
                >
                  <LogOut className="w-6 h-6 text-light-text dark:text-white" />
                </motion.button>
              </>
            ) : (
              <>
                {/* Login Button */}

                <div className="w-px h-8 bg-light-border dark:bg-dark-border"></div>
                <motion.button
                  className="w-[110px] py-2 px-3 border-2 border-primary rounded-[5px] text-primary font-bold text-[14px] bg-transparent hover:bg-primary/20 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsLoginModalOpen(true)}
                >
                  {tAuth("login")}
                </motion.button>

                {/* Sign up Button */}
                <motion.button
                  className="w-[110px] py-2 px-3 bg-primary rounded-[5px] text-white font-bold text-[14px] hover:bg-primary-hover transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsRegisterModalOpen(true)}
                >
                  {tAuth("signUp")}
                </motion.button>
              </>
            )}

            {/* Theme Toggle Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              className="p-2 hover:bg-light-border dark:hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-light-text dark:text-white" />
              ) : (
                <Moon className="w-5 h-5 text-light-text dark:text-white" />
              )}
            </motion.button>

            {/* Search Button and Dropdown */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsSearchOpen(true)}
                className="p-2 hover:bg-light-border dark:hover:bg-white/10 rounded-lg transition-colors"
              >
                <SearchIcon className="w-5 h-5 text-light-text dark:text-white" />
              </motion.button>
              <SearchDropdown
                isOpen={isSearchOpen}
                onClose={() => setIsSearchOpen(false)}
                searchQuery={searchQuery}
                onSearchQueryChange={setSearchQuery}
                onSearchSubmit={handleSearch}
              />
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Header - Hidden on desktop */}
      <motion.header
        className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-light-bg-secondary dark:bg-dark-bg-secondary border-b border-light-border dark:border-dark-border transition-colors duration-300"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="flex items-center justify-between h-16 px-4">
          {/* Left block - Hamburger and Logo */}
          <div className="flex items-center space-x-3">
            {/* Hamburger Menu */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-1"
              onClick={toggleCollapse}
            >
              <Menu className="w-6 h-6 text-light-text dark:text-white" />
            </motion.button>

            {/* Logo */}
            <Image
              src={theme === "dark" ? "/logo-dark.png" : "/logo-light.png"}
              alt="Logo"
              width={100}
              height={30}
              className="h-6 w-auto max-w-[100px] object-contain"
              priority
            />
          </div>

          {/* Right block - Mobile auth buttons */}
          <div className="flex items-center gap-2">
            {isLoggedIn ? (
              <>
                <div className="text-center">
                  <div className="font-poppins font-normal text-light-text dark:text-white text-[12px]">
                    {tWallet("balance")}
                  </div>
                  <div className="font-poppins font-bold text-light-text dark:text-white text-[12px]">
                    ${user?.balance?.toFixed(2)}
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => logout()}
                  className="p-2 hover:bg-light-border dark:hover:bg-white/10 rounded-lg transition-colors"
                >
                  <LogOut className="w-5 h-5 text-light-text dark:text-white" />
                </motion.button>
              </>
            ) : (
              <>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 hover:bg-light-border dark:hover:bg-white/10 rounded-lg transition-colors"
                  onClick={() => setIsRegisterModalOpen(true)}
                >
                  <UserPlus className="w-5 h-5 text-light-text dark:text-white" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 hover:bg-light-border dark:hover:bg-white/10 rounded-lg transition-colors"
                  onClick={() => setIsLoginModalOpen(true)}
                >
                  <LogIn className="w-5 h-5 text-light-text dark:text-white" />
                </motion.button>
              </>
            )}
          </div>
        </div>
      </motion.header>

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onRegister={() => {
          setIsLoginModalOpen(false);
          setIsRegisterModalOpen(true);
        }}
      />

      {/* Register Modal */}
      <RegisterModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onLogin={() => {
          setIsRegisterModalOpen(false);
          setIsLoginModalOpen(true);
        }}
      />

      {/* Deposit Modal */}
      <DepositModal
        isOpen={isDepositModalOpen}
        onClose={() => setIsDepositModalOpen(false)}
      />
    </>
  );
}
