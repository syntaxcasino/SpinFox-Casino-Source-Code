'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useTranslation } from '../contexts/TranslationContext';

export default function FooterLanguageDropdown() {
  const { language, setLanguage, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: 'en', name: 'English', flag: '/flags/en.png' },
    { code: 'zh', name: '中文', flag: '/flags/zh.png' }
  ];

  const currentLang = languages.find(lang => lang.code === language) || languages[0];

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen]);

  const handleLanguageChange = (langCode: string) => {
    setLanguage(langCode);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className="relative w-24">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-[#2c2546] rounded-[5px] px-3 py-2 text-white hover:bg-[#2c2546]/80 transition-colors"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-center space-x-2">
          <Image
            src={currentLang.flag}
            alt={currentLang.name}
            width={16}
            height={16}
            className="w-4 h-4 rounded-full"
          />
          <span className="text-sm font-medium">{currentLang.code.toUpperCase()}</span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <Image
            src="/images/icons/shevron.png"
            alt="Dropdown"
            width={12}
            height={12}
            className="w-3 h-3"
          />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute bottom-full left-0 mb-2 w-full bg-[#2c2546] rounded-[5px] border border-[#896cef] shadow-lg z-50"
          >
            {languages.map((lang) => (
              <motion.button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className="w-full flex items-center space-x-2 px-3 py-2 text-white hover:bg-[#896cef]/20 transition-colors first:rounded-t-[5px] last:rounded-b-[5px]"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Image
                  src={lang.flag}
                  alt={lang.name}
                  width={16}
                  height={16}
                  className="w-4 h-4 rounded-full"
                />
                <span className="text-sm font-medium">{lang.code.toUpperCase()}</span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
