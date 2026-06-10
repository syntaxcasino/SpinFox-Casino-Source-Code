'use client';

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "../contexts/TranslationContext";
import { useUser } from "../contexts/UserContext";
import { useNetwork } from "../contexts/NetworkContext";
import { useTheme } from "../contexts/ThemeContext";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { fetchSweepableUsers } from "@/lib/api";
import LoginModal from "./modals/LoginModal";
import RegisterModal from "./modals/RegisterModal";
import ModernDepositModal from "./modals/ModernDepositModal";
import { Sun, Moon, User, LogOut, Wallet, Plus, Zap } from "lucide-react";
// import { useAppKit, useAppKitAccount } from "@reown/appkit/react";

export default function AdminTopBarHeader() {
  const { t: tAuth } = useTranslation("auth");
  const { t: tWallet } = useTranslation("wallet");
  const { user, isLoggedIn, logout, checkAuth } = useUser();
  const { activeNetwork, toggleNetwork } = useNetwork();
  const { theme, toggleTheme } = useTheme();
  
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  // const { open } = useAppKit();
  // const { address, isConnected } = useAppKitAccount();
  const router = useRouter();
  const pathname = usePathname();
  const [alertCount, setAlertCount] = useState(0);

  // const shortenAddress = (addr: string) =>
  //   addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "";

  const handleLogoClick = () => {
    router.push('/admin/dashboard');
  };

  // Authentication is handled by UserContext, no need to call checkAuth here

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        if (!pathname?.includes("sweepable")) {
          const sweepableUsers = await fetchSweepableUsers();
          setAlertCount(sweepableUsers ? sweepableUsers.length : 0);
        } else {
          setAlertCount(0);
        }
      } catch (e) {
        // ignore fetch errors for header badge
      }
    };
    init();
  }, [pathname]);

  return (
    <>
      {/* Glassmorphism Floating Header */}
      <motion.header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "backdrop-blur-xl bg-white/80 dark:bg-black/20 shadow-2xl"
            : "backdrop-blur-md bg-white/60 dark:bg-black/10"
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Gradient border effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-purple-500/10 to-pink-500/10 dark:from-primary/20 dark:via-purple-500/20 dark:to-pink-500/20 opacity-50 blur-xl"></div>
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/30 dark:via-primary/50 to-transparent"></div>

        <div className="relative mx-auto max-w-[1920px] px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo Section */}
            <motion.button 
              className="flex items-center gap-4 cursor-pointer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogoClick}
            >
              <Image
                src={theme === "dark" ? "/logo-dark.png" : "/logo-light.png"}
                alt="SpinFox"
                width={120}
                height={40}
                className="h-10 w-auto object-contain"
                quality={100}
                priority
              />
            </motion.button>

            

            {/* Right Section */}
            <div className="flex items-center gap-3">
              {isLoggedIn && user ? (
                <>
                  {/* Network Switcher & Balance */}
                  <motion.div
                    className="hidden md:flex items-center gap-3 bg-white/80 dark:bg-black/20 backdrop-blur-md rounded-2xl border border-gray-300 dark:border-white/10 px-4 py-2 shadow-sm"
                    whileHover={{ scale: 1.02 }}
                  >
                    {/* Network Toggle Button */}
                    <button
                      onClick={toggleNetwork}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all ${
                        activeNetwork === 'mainnet'
                          ? 'bg-green-500/20 text-green-600 dark:text-green-400'
                          : 'bg-orange-500/20 text-orange-600 dark:text-orange-400'
                      }`}
                      title={`Switch to ${activeNetwork === 'mainnet' ? 'Testnet' : 'Mainnet'}`}
                    >
                      <span className={`inline-block w-2 h-2 rounded-full ${
                        activeNetwork === 'mainnet' ? 'bg-green-500' : 'bg-orange-500'
                      }`}></span>
                      <span className="font-bold text-[10px] uppercase">
                        {activeNetwork}
                      </span>
                    </button>
                    
                    <div className="h-8 w-[1px] bg-gray-300 dark:bg-white/10"></div>
                    
                    {/* Active Balance */}
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-xl ${
                        activeNetwork === 'mainnet'
                          ? 'bg-gradient-to-br from-green-400/20 to-emerald-500/20'
                          : 'bg-gradient-to-br from-orange-400/20 to-amber-500/20'
                      }`}>
                        <Wallet className={`w-4 h-4 ${
                          activeNetwork === 'mainnet' 
                            ? 'text-green-500 dark:text-green-400'
                            : 'text-orange-500 dark:text-orange-400'
                        }`} />
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-500 dark:text-white/50">Balance</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                          ${(activeNetwork === 'mainnet' ? user.realBalance : user.testBalance || 0).toFixed(2)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="h-8 w-[1px] bg-gray-300 dark:bg-white/10"></div>
                    <motion.button
                      onClick={() => setIsDepositModalOpen(true)}
                      className="p-2 bg-gradient-to-r from-primary to-purple-600 rounded-xl hover:shadow-lg hover:shadow-primary/50 transition-all"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Plus className="w-4 h-4 text-white" />
                    </motion.button>
                  </motion.div>

                  {/* Wallet Connection */}
                  {/* {isConnected ? (
                    <motion.button
                      onClick={() => open()}
                      className="hidden lg:flex items-center gap-2 bg-white/80 dark:bg-black/20 backdrop-blur-md rounded-2xl border border-gray-300 dark:border-white/10 px-4 py-2 hover:border-primary/50 transition-all shadow-sm"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="w-2 h-2 rounded-full bg-green-500 dark:bg-green-400 animate-pulse"></div>
                      <span className="text-sm text-gray-900 dark:text-white font-medium">
                        {shortenAddress(address || "")}
                      </span>
                    </motion.button>
                  ) : (
                    <motion.button
                      onClick={() => open()}
                      className="hidden lg:flex items-center gap-2 bg-gradient-to-r from-primary to-purple-600 rounded-2xl px-4 py-2 hover:shadow-lg hover:shadow-primary/50 transition-all"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Wallet className="w-4 h-4 text-white" />
                      <span className="text-sm text-white font-medium">Connect</span>
                    </motion.button>
                  )} */}

                  {/* User Menu */}
                  <motion.button
                    className="relative p-2.5 bg-white/80 dark:bg-black/20 backdrop-blur-md rounded-2xl border border-gray-300 dark:border-white/10 hover:border-primary/50 transition-all group shadow-sm"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-600/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <User className="w-5 h-5 text-gray-700 dark:text-white relative z-10" />
                  </motion.button>

                  {/* Logout */}
                  <motion.button
                    onClick={() => logout()}
                    className="p-2.5 bg-white/80 dark:bg-black/20 backdrop-blur-md rounded-2xl border border-gray-300 dark:border-white/10 hover:border-red-500/50 transition-all group shadow-sm"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <LogOut className="w-5 h-5 text-gray-600 dark:text-white/70 group-hover:text-red-500 dark:group-hover:text-red-400 transition-colors" />
                  </motion.button>
                </>
              ) : (
                <>
                  {/* Login Button */}
                  <motion.button
                    onClick={() => setIsLoginModalOpen(true)}
                    className="hidden sm:flex items-center gap-2 px-6 py-2.5 bg-white/80 dark:bg-black/20 backdrop-blur-md rounded-2xl border border-gray-300 dark:border-white/10 hover:border-primary/50 transition-all text-gray-900 dark:text-white font-medium shadow-sm"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Login
                  </motion.button>

                  {/* Sign Up Button */}
                  <motion.button
                    onClick={() => setIsRegisterModalOpen(true)}
                    className="relative overflow-hidden px-6 py-2.5 rounded-2xl font-medium text-white group shadow-lg"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary via-purple-600 to-pink-600 animate-gradient"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-primary to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity blur-xl"></div>
                    <span className="relative flex items-center gap-2">
                      Sign Up
                      <Zap className="w-4 h-4" />
                    </span>
                  </motion.button>
                </>
              )}

              {/* Sweepable Alerts */}
              <div className={`${alertCount > 0 ? "block" : "hidden"} relative`}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2.5 bg-gradient-to-r from-primary to-purple-600 rounded-2xl text-white relative shadow-lg"
                  onClick={() => {
                    router.push("/admin/sweepable/users");
                    setAlertCount(0);
                  }}
                >
                  <Image
                    src="/images/icons/alert.png"
                    alt="Alerts"
                    width={24}
                    height={24}
                    className="w-6 h-6"
                  />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {alertCount}
                  </span>
                </motion.button>
              </div>

              {/* Theme Toggle */}
              <motion.button
                onClick={toggleTheme}
                className="p-2.5 bg-white/80 dark:bg-black/20 backdrop-blur-md rounded-2xl border border-gray-300 dark:border-white/10 hover:border-primary/50 transition-all shadow-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {theme === "dark" ? (
                  <Sun className="w-5 h-5 text-yellow-500 dark:text-yellow-300" />
                ) : (
                  <Moon className="w-5 h-5 text-indigo-600 dark:text-blue-300" />
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Modals */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onRegister={() => {
          setIsLoginModalOpen(false);
          setIsRegisterModalOpen(true);
        }}
      />

      <RegisterModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onLogin={() => {
          setIsRegisterModalOpen(false);
          setIsLoginModalOpen(true);
        }}
      />

      <ModernDepositModal
        isOpen={isDepositModalOpen}
        onClose={() => setIsDepositModalOpen(false)}
      />

      <style jsx global>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </>
  );
}
