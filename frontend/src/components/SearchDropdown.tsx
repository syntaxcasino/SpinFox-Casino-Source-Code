'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface SearchDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
}

export default function SearchDropdown({ 
  isOpen, 
  onClose, 
  searchQuery, 
  onSearchQueryChange, 
  onSearchSubmit 
}: SearchDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={dropdownRef}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="absolute right-0 top-full mt-2 z-50"
      >
        <form onSubmit={onSearchSubmit} className="flex items-center bg-[#0b0911] border border-[#2b2637] rounded-[5px] shadow-lg">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            placeholder="Search..."
            className="bg-[#2c2546] text-white px-3 py-2 rounded-l-[5px] border-none focus:outline-none focus:ring-1 focus:ring-[#896cef] w-64"
            autoFocus
          />
          <button
            type="submit"
            className="bg-[#896cef] hover:bg-[#896cef]/80 px-4 py-2 rounded-r-[5px] text-white text-[14px] font-bold transition-colors"
          >
            Go
          </button>
        </form>
      </motion.div>
    </AnimatePresence>
  );
}