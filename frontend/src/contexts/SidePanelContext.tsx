'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SidePanelContextType {
  isCollapsed: boolean;
  toggleCollapse: () => void;
  setCollapsed: (collapsed: boolean) => void;
}

const SidePanelContext = createContext<SidePanelContextType | undefined>(undefined);

export function SidePanelProvider({ children }: { children: ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    // Check if we're on mobile (window width < 1024px) on initial render
    if (typeof window !== 'undefined') {
      return window.innerWidth < 1024;
    }
    return false; // Default to expanded on server
  });

  const toggleCollapse = () => {
    setIsCollapsed(prev => !prev);
  };

  const setCollapsed = (collapsed: boolean) => {
    setIsCollapsed(collapsed);
  };

  // Update CSS custom property for dynamic margin
  useEffect(() => {
    document.documentElement.style.setProperty('--side-panel-width', isCollapsed ? '80px' : '240px');
  }, [isCollapsed]);

  // Handle responsive behavior - collapse on mobile, expand on desktop
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      const isMobile = window.innerWidth < 1024;
      setIsCollapsed(isMobile);
    };

    // Initial check
    handleResize();

    // Add resize listener
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <SidePanelContext.Provider value={{ isCollapsed, toggleCollapse, setCollapsed }}>
      {children}
    </SidePanelContext.Provider>
  );
}

export function useSidePanel() {
  const context = useContext(SidePanelContext);
  if (context === undefined) {
    throw new Error('useSidePanel must be used within a SidePanelProvider');
  }
  return context;
}