'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from '../contexts/TranslationContext';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

interface LanguageDropdownProps {
  isCollapsed?: boolean;
}

const languages = [
  { code: 'en', label: 'English', flag: '/flags/en.png' },
  { code: 'zh', label: 'Chinese', flag: '/flags/zh.png' },
];

export const LanguageDropdown: React.FC<LanguageDropdownProps> = ({ isCollapsed = false }) => {
  const { language, setLanguage } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const currentLang = languages.find(l => l.code === language);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageSelect = (langCode: string) => {
    setLanguage(langCode);
    setIsOpen(false);
  };

  if (isCollapsed) {
    return (
      <div className="relative flex justify-center" ref={dropdownRef}>
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className="w-10 h-10 rounded-full bg-light-bg-tertiary dark:bg-[#2c2546] flex items-center justify-center hover:bg-primary/20 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Image
            src={currentLang?.flag || '/flags/en.png'}
            alt={currentLang?.label || 'English'}
            width={24}
            height={24}
            className="w-6 h-6 rounded-full"
          />
        </motion.button>
        
        {/* Dropdown menu for collapsed state */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-[-6%] -translate-x-1/2 mt-2 bg-light-bg-secondary dark:bg-[#2c2546] border border-light-border dark:border-transparent rounded-[5px] shadow-lg z-50 min-w-[45px]"
            >
              {languages.map((lang) => (
                <motion.button
                  key={lang.code}
                  onClick={() => handleLanguageSelect(lang.code)}
                  className="w-full px-3 py-2 text-left text-light-text dark:text-white hover:bg-primary/20 transition-colors first:rounded-t-[5px] last:rounded-b-[5px] flex items-center space-x-2 "
                  whileHover={{ backgroundColor: 'rgba(137, 108, 239, 0.2)' }}
                >
                  <Image
                    src={lang.flag}
                    alt={lang.label}
                    width={20}
                    height={20}
                    className="w-5 h-5 rounded-full"
                  />
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full rounded-[5px] px-3 py-2 bg-light-bg-tertiary dark:bg-[#2c2546] cursor-pointer hover:bg-primary/20 transition-colors flex items-center justify-between"
      >
        <div className="flex items-center space-x-2">
          <Image
            src={currentLang?.flag || '/flags/en.png'}
            alt={currentLang?.label || 'English'}
            width={24}
            height={24}
            className="w-6 h-6 rounded-full"
          />
          <span className="text-light-text dark:text-white text-[16px]">
            {currentLang?.label}
          </span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <Image
            src="/images/icons/shevron.png"
            alt="dropdown"
            width={12}
            height={12}
            className="w-3 h-3"
          />
        </motion.div>
      </div>
      
      {/* Dropdown menu for expanded state */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-1 bg-light-bg-secondary dark:bg-[#2c2546] border border-light-border dark:border-transparent rounded-[5px] shadow-lg z-50"
          >
            {languages.map((lang) => (
              <motion.button
                key={lang.code}
                onClick={() => handleLanguageSelect(lang.code)}
                className="w-full px-3 py-2 text-left text-light-text dark:text-white hover:bg-primary/20 transition-colors first:rounded-t-[5px] last:rounded-b-[5px] flex items-center space-x-2"
                whileHover={{ backgroundColor: 'rgba(137, 108, 239, 0.2)' }}
              >
                <Image
                  src={lang.flag}
                  alt={lang.label}
                  width={20}
                  height={20}
                  className="w-5 h-5 rounded-full"
                />
                <span className="text-[16px]">{lang.label}</span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
