'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '../../contexts/TranslationContext';

interface InfoNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function InfoNavigation({ activeTab, onTabChange }: InfoNavigationProps) {
  const { t } = useTranslation();

  const tabs = [
    { key: 'contactus', label: t('info.navigation.contactUs') },
    { key: 'privacy', label: t('info.navigation.privacyPolicy') },
    { key: 'responsible', label: t('info.navigation.responsibleGaming') },
    { key: 'fairplay', label: t('info.navigation.fairPlay') },
    { key: 'gamesrules', label: t('info.navigation.gamesRules') },
    { key: 'terms', label: t('info.navigation.termsConditions') },
  ];

  return (
    <nav className="w-full lg:w-[240px] lg:border-r-2 border-[#70828F]">
      {/* Mobile: Horizontal scrollable tabs */}
      <div className="lg:hidden flex overflow-x-auto bg-[#221d35]">
        {tabs.map((tab) => (
          <motion.button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`flex-shrink-0 h-[65px] px-6 border-b-2 border-[#70828F] text-left ${
              activeTab === tab.key ? 'bg-[#896cef]' : 'bg-transparent hover:bg-white/5'
            }`}
          >
            <span className={`font-poppins font-bold text-[16px] text-white whitespace-nowrap`}>
              {tab.label}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Desktop: Vertical navigation */}
      <div className="hidden lg:block">
        {tabs.map((tab) => (
          <motion.button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`w-full h-[65px] px-6 border-b-2 border-[#70828F] text-left flex items-center ${
              activeTab === tab.key ? 'bg-[#896cef]' : 'bg-transparent hover:bg-white/5'
            }`}
            whileHover={{ scale: activeTab === tab.key ? 1 : 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className={`font-poppins font-bold text-[16px] text-white`}>
              {tab.label}
            </span>
          </motion.button>
        ))}
      </div>
    </nav>
  );
}