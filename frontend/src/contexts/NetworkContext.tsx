'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

type NetworkType = 'mainnet' | 'testnet';

interface NetworkContextType {
  activeNetwork: NetworkType;
  setActiveNetwork: (network: NetworkType) => void;
  toggleNetwork: () => void;
  getActiveChainId: () => number;
  getActiveBalance: (user: { realBalance: number; testBalance: number }) => number;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

// Default chain IDs for each network type
const MAINNET_CHAIN_IDS = {
  optimism: 10,
  ethereum: 1,
  arbitrum: 42161,
  base: 8453,
};

const TESTNET_CHAIN_IDS = {
  'optimism-sepolia': 11155420,
  'base-sepolia': 84532,
  sepolia: 11155111,
  'arbitrum-sepolia': 421614,
};

export function NetworkProvider({ children }: { children: ReactNode }) {
  // Initialize from localStorage or default to mainnet
  const [activeNetwork, setActiveNetworkState] = useState<NetworkType>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('activeNetwork');
      return (stored as NetworkType) || 'mainnet';
    }
    return 'mainnet';
  });

  // Persist to localStorage when network changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('activeNetwork', activeNetwork);
      console.log(`🌐 Network switched to: ${activeNetwork}`);
    }
  }, [activeNetwork]);

  const setActiveNetwork = (network: NetworkType) => {
    setActiveNetworkState(network);
  };

  const toggleNetwork = () => {
    setActiveNetworkState(prev => prev === 'mainnet' ? 'testnet' : 'mainnet');
  };

  // Get the appropriate chain ID based on active network
  const getActiveChainId = (): number => {
    if (activeNetwork === 'mainnet') {
      return MAINNET_CHAIN_IDS.optimism; // Default to Optimism mainnet
    } else {
      return TESTNET_CHAIN_IDS['base-sepolia']; // Default to Base Sepolia testnet
    }
  };

  // Get the active balance based on network
  const getActiveBalance = (user: { realBalance: number; testBalance: number }): number => {
    return activeNetwork === 'mainnet' ? user.realBalance : user.testBalance;
  };

  return (
    <NetworkContext.Provider 
      value={{ 
        activeNetwork, 
        setActiveNetwork, 
        toggleNetwork,
        getActiveChainId,
        getActiveBalance,
      }}
    >
      {children}
    </NetworkContext.Provider>
  );
}

export function useNetwork() {
  const context = useContext(NetworkContext);
  if (context === undefined) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
}

