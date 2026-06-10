'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../contexts/TranslationContext';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';

export default function AdminSidePanel() {
  const { t: tAdmin } = useTranslation('admin');
  const pathname = usePathname();
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(true); // match ModernSideBar default
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Handle window resize to auto-expand on larger screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) { // lg breakpoint
        setIsExpanded(true);
      }
    };

    handleResize(); // Call on mount
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const menuItems = [
    { name: 'Dashboard', icon: '/images/icons/icons8-leaderboard-80.png', href: '/admin/dashboard', key: 'dashboard', gradient: 'from-purple-400 to-pink-400' },
    { name: tAdmin('menu.users'), icon: '/images/icons/users.png', href: '/admin', key: 'users', gradient: 'from-blue-400 to-cyan-400' },
    { name: 'Transactions', icon: '/images/icons/tournaments.png', href: '/admin/approve', key: 'transactions', gradient: 'from-indigo-400 to-purple-400' },
    { name: tAdmin('menu.leaderboard'), icon: '/images/icons/icons8-leaderboard-80.png', href: '/admin/leaderboard', key: 'leaderboard', gradient: 'from-yellow-400 to-orange-400' },
    { name: tAdmin('menu.promocode'), icon: '/images/icons/icons8-promotions-80.png', href: '/admin/promocode', key: 'promocode', gradient: 'from-green-400 to-emerald-400' },
    { name: tAdmin('menu.settings'), icon: '/images/icons/icons8-settings-80.png', href: '/admin/settings', key: 'settings', gradient: 'from-gray-400 to-slate-400' },
  ];

  const isActivePage = (href: string) => pathname === href;

  return (
    <>
      {/* Desktop Sidebar - Full Height */}
      <motion.div
        className="hidden lg:block fixed left-0 top-0 bottom-0 z-40"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1, width: isExpanded ? '280px' : '80px' }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        <div className="relative h-full">
          {/* Glassmorphism background */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-white/60 dark:from-[#1a0f3a] dark:to-[#0f0632] backdrop-blur-2xl border-r border-gray-300 dark:border-white/20 shadow-2xl"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-purple-500/3 to-pink-500/5 dark:from-primary/10 dark:via-purple-500/5 dark:to-pink-500/10 opacity-50"></div>

          {/* Sidebar Container */}
          <div className="relative h-full flex flex-col py-6 px-4">
            {/* Toggle Button */}
            <motion.button
              onClick={() => setIsExpanded(!isExpanded)}
              className="mb-8 p-3 rounded-xl bg-gray-200 hover:bg-gray-300 dark:bg-white/5 dark:hover:bg-white/10 transition-all border border-gray-300 dark:border-white/20 shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Menu className="w-5 h-5 text-gray-600 dark:text-white" />
            </motion.button>

            {/* Menu Items */}
            <nav className="flex-1 space-y-2 overflow-y-auto scrollbar-thin">
              {menuItems.map((item, index) => {
                const isActive = isActivePage(item.href);

                return (
                  <motion.div
                    key={item.key}
                    className="relative"
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    whileHover={{ x: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    <Link href={item.href} className="relative block">
                      <div
                        className={`relative flex items-center gap-4 p-3 rounded-xl transition-all duration-300 ${
                          isActive
                            ? 'bg-gradient-to-r from-primary/20 to-purple-600/20 border border-primary/30 shadow-lg'
                            : 'bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 border border-transparent'
                        }`}
                      >
                        {/* Icon */}
                        <div className="relative flex-shrink-0">
                          <Image
                            src={item.icon}
                            alt={item.name}
                            width={20}
                            height={20}
                            className="w-5 h-5"
                          />
                          {hoveredIndex === index && !isActive && (
                            <motion.div
                              className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-20 rounded-lg blur-md`}
                              initial={{ opacity: 0, scale: 0 }}
                              animate={{ opacity: 0.5, scale: 2 }}
                              exit={{ opacity: 0, scale: 0 }}
                            />
                          )}
                        </div>

                        {/* Label */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.span
                              initial={{ opacity: 0, width: 0 }}
                              animate={{ opacity: 1, width: 'auto' }}
                              exit={{ opacity: 0, width: 0 }}
                              transition={{ duration: 0.2 }}
                              className={`text-sm font-semibold whitespace-nowrap ${
                                isActive ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-white/70'
                              }`}
                            >
                              {item.name}
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Tooltip when collapsed */}
                      {!isExpanded && hoveredIndex === index && (
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          className="absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50"
                        >
                          <div className="bg-white dark:bg-black/90 backdrop-blur-md px-3 py-2 rounded-lg border border-gray-300 dark:border-white/20 shadow-xl whitespace-nowrap">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</p>
                          </div>
                        </motion.div>
                      )}
                    </Link>
                  </motion.div>
                );
              })}
            </nav>
          </div>
        </div>
      </motion.div>

      {/* Mobile Bottom Dock */}
      <motion.div
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 pb-safe"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="relative mx-4 mb-4">
          {/* Glassmorphism background */}
          <div className="absolute inset-0 bg-gradient-to-t from-white/90 to-white/80 dark:from-black/20 dark:to-black/10 backdrop-blur-2xl rounded-3xl border border-gray-300 dark:border-white/20 shadow-lg"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-purple-500/5 to-pink-500/5 dark:from-primary/10 dark:via-purple-500/10 dark:to-pink-500/10 rounded-3xl blur-xl opacity-50"></div>

          {/* Dock Container */}
          <div className="relative px-3 py-3">
            <div className="flex justify-between items-center">
              {menuItems.slice(0, 5).map((item, index) => {
                const isActive = isActivePage(item.href);

                return (
                  <motion.div key={item.key} whileTap={{ scale: 0.9 }}>
                    <Link href={item.href} className="relative flex flex-col items-center">
                      <div
                        className={`relative p-3 rounded-2xl transition-all ${
                          isActive ? 'bg-gray-200 dark:bg-white/10' : 'bg-transparent'
                        }`}
                      >
                        {/* Active indicator */}
                        {isActive && (
                          <motion.div
                            layoutId="mobileActiveTab"
                            className="absolute inset-0 bg-gradient-to-br from-primary/30 to-purple-600/30 rounded-2xl shadow-md"
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                          />
                        )}

                        <Image src={item.icon} alt={item.name} width={20} height={20} className="w-5 h-5 relative z-10" />
                      </div>

                      {/* Active dot */}
                      {isActive && (
                        <motion.div
                          layoutId="mobileActiveDot"
                          className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full"
                          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        />
                      )}
                    </Link>
                  </motion.div>
                );
              })}

              {/* More Menu */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsExpanded(!isExpanded)}
                className="relative p-3 rounded-2xl bg-gray-200 dark:bg-black/10"
              >
                <Menu className="w-5 h-5 text-gray-600 dark:text-white/70" />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Expanded Menu (Mobile) */}
        <AnimatePresence>
          {isExpanded && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsExpanded(false)}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              />

              {/* Expanded Panel */}
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 30 }}
                className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-black/20 backdrop-blur-2xl border-t border-gray-300 dark:border-white/20 rounded-t-3xl p-6 pb-safe shadow-2xl z-[60]"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Menu</h3>
                  <button
                    onClick={() => setIsExpanded(false)}
                    className="p-2 bg-gray-200 dark:bg-white/10 rounded-xl hover:bg-gray-300 dark:hover:bg-white/20 transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-600 dark:text-white" />
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  {menuItems.map((item) => {
                    const isActive = isActivePage(item.href);

                    return (
                      <Link
                        key={item.key}
                        href={item.href}
                        onClick={() => setIsExpanded(false)}
                        className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition-all ${
                          isActive
                            ? 'bg-gray-200 dark:bg-white/10 shadow-md'
                            : 'bg-gray-100 dark:bg-black/10 hover:bg-gray-200 dark:hover:bg-white/5'
                        }`}
                      >
                        <Image src={item.icon} alt={item.name} width={24} height={24} className={`w-6 h-6 ${isActive ? 'opacity-100' : ''}`} />
                        <span className={`text-xs ${isActive ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-600 dark:text-white/70'}`}>
                          {item.name}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}