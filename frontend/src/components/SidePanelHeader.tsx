'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSidePanel } from '../contexts/SidePanelContext';
import { useTranslation } from '../contexts/TranslationContext';
import { useUser } from '../contexts/UserContext';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { LanguageDropdown } from './LanguageDropdown';
import LoginModal from './modals/LoginModal';
import { IUser } from '@/types';
import RegisterModal from './modals/RegisterModal';
import Link from 'next/link';
import { 
  Home, 
  Gamepad2, 
  Trophy, 
  Gift, 
  Crown, 
  Award, 
  Settings, 
  Wallet,
  ChevronLeft,
  ChevronRight,
  Facebook,
  Mail
} from 'lucide-react';

interface UserInfoCardProps {
  user: IUser;
}

export default function SidePanelHeader() {
  const { t: tMenu } = useTranslation('menu');
  const { t: tfooter } = useTranslation('footer');
  const { user, isLoggedIn, logout } = useUser();
  const { isCollapsed, toggleCollapse } = useSidePanel();

  const pathname = usePathname();

  const menuItems = [
    { name: tMenu('home'), icon: Home, href: '/', key: 'home' },
    { name: tMenu('slots'), icon: Gamepad2, href: '/slots', key: 'slots' },
    { name: tMenu('sports'), icon: Trophy, href: '/sports', key: 'sports' },
    { name: tMenu('promotions'), icon: Gift, href: '/promotions', key: 'promotions' },
    { name: tMenu('leaderboard'), icon: Crown, href: '/leaderboard', key: 'leaderboard' },
    { name: tMenu('tournaments'), icon: Award, href: '/tournaments', key: 'tournaments' },
    { name: tMenu('settings'), icon: Settings, href: '/settings', key: 'settings' },
    { name: tMenu('wallet'), icon: Wallet, href: '/wallet', key: 'wallet' },
  ];


  const footerLinks = [
    { name: tfooter('privacyPolicy'), href: '/info?tab=privacy' },
    { name: tfooter('responsibleGaming'), href: '/info?tab=responsible' },
    { name: tfooter('fairPlay'), href: '/info?tab=fairplay' },
    { name: tfooter('gamesRules'), href: '/info?tab=gamesrules' },
    { name: tfooter('termsConditions'), href: '/info?tab=terms' },
  ];

  const panelVariants = {
    expanded: {
      width: 240,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    collapsed: {
      width: 80,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    }
  };

  const contentVariants = {
    expanded: {
      opacity: 1,
      x: 0,
      transition: {
        delay: 0.2,
        duration: 0.3
      }
    },
    collapsed: {
      opacity: 0,
      x: -20,
      transition: {
        duration: 0.2
      }
    }
  };

  const isActivePage = (href: string) => {
    return pathname === href;
  };

  return (
    <>
      {/* Backdrop for mobile */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-30 bg-black/50"
            onClick={toggleCollapse}
          />
        )}
      </AnimatePresence>

      <motion.aside
        className={`fixed left-0 top-0 bottom-0 z-40 bg-light-bg-secondary dark:bg-[#171424] border-r border-light-border dark:border-dark-border overflow-y-auto transition-colors duration-300 ${isCollapsed ? '-translate-x-full lg:translate-x-0' : 'translate-x-0'
          }`}
        initial={false}
        animate={isCollapsed ? "collapsed" : "expanded"}
        variants={panelVariants}
      >
        <div className="relative min-h-full flex flex-col">
          {/* Collapse Toggle Button - Flexbox centered in collapsed state */}
          <div className={`absolute top-4 left-0 right-0 flex justify-center ${!isCollapsed ? 'hidden' : ''}`}>
            <motion.button
              onClick={toggleCollapse}
              className="p-2 rounded-lg hover:bg-light-border dark:hover:bg-white/10 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <motion.div
                animate={{ rotate: isCollapsed ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronRight className="w-6 h-6 text-light-text dark:text-white" />
              </motion.div>
            </motion.button>
          </div>
          {!isCollapsed && (
            <motion.button
              onClick={toggleCollapse}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-light-border dark:hover:bg-white/10 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <motion.div
                animate={{ rotate: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronLeft className="w-6 h-6 text-light-text dark:text-white" />
              </motion.div>
            </motion.button>
          )}

          {/* Navigation Items - Adjusted padding for collapsed state */}
          <nav className="flex-1 px-4 py-4 pt-20">
            <div className="space-y-1">
              {menuItems.map((item) => {
                const isActive = isActivePage(item.href);
                return (
                  <motion.div
                    key={item.key}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link
                      href={item.href}
                      className={`flex items-center space-x-3 p-3 rounded-lg hover:bg-light-bg-tertiary dark:hover:bg-[#2c2546]/50 transition-colors group ${isActive ? 'bg-light-bg-tertiary dark:bg-[#2c2546] font-bold' : ''
                        }`}
                    >
                      {/* Icon */}
                      <div className="flex-shrink-0 w-[25px] h-[25px] flex items-center justify-center">
                        <item.icon 
                          className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-light-text-secondary dark:text-white/70 group-hover:text-primary'} transition-colors`}
                        />
                      </div>

                      {/* Text */}
                      <AnimatePresence>
                        {!isCollapsed && (
                          <motion.span
                            variants={contentVariants}
                            initial="collapsed"
                            animate="expanded"
                            exit="collapsed"
                            className={`text-[16px] text-light-text dark:text-white whitespace-nowrap ${isActive ? 'font-bold' : ''
                              }`}
                          >
                            {item.name}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </nav>

          {/* Horizontal Separator - Hidden when collapsed */}
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: '1px' }}
                exit={{ opacity: 0, height: 0 }}
                className="h-px bg-[#2b2637] mx-4"
              />
            )}
          </AnimatePresence>

          {/* Footer Links - Hidden when logged in, visible on desktop when not logged in */}
          <div className={`px-4 py-4 ${isCollapsed ? 'pt-4' : ''} ${isLoggedIn ? 'hidden' : 'hidden lg:block'}`}>
            <div className="space-y-3">
              {footerLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block text-light-text dark:text-white text-[16px] hover:text-primary transition-colors"
                >
                  <AnimatePresence>
                    {!isCollapsed && (
                      <motion.span
                        variants={contentVariants}
                        initial="collapsed"
                        animate="expanded"
                        exit="collapsed"
                      >
                        {link.name}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              ))}
            </div>
          </div>

          {/* Horizontal Separator - Hidden when collapsed */}
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: '1px' }}
                exit={{ opacity: 0, height: 0 }}
                className="h-px bg-light-border dark:bg-dark-border mx-4"
              />
            )}
          </AnimatePresence>

          {/* Language Dropdown Section - Adjusted for collapsed state */}
          <div className={`px-4 py-4 ${isCollapsed ? 'pt-4' : ''}`}>
            <div className="bg-light-bg-tertiary dark:bg-[#2c2546] rounded-[5px] p-2">
              <LanguageDropdown isCollapsed={isCollapsed} />
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  );
}