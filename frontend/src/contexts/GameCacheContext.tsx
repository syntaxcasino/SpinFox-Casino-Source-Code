'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { IGame, IProvider } from '@/types';
import { fetchGameListAsync, fetchProviderListAsync } from '@/lib/api';

interface GameCache {
  [providerCode: string]: {
    games: IGame[];
    timestamp: number;
    loading: boolean;
  };
}

interface ProviderCache {
  providers: IProvider[];
  timestamp: number;
  loading: boolean;
}

interface GameCacheContextType {
  gameCache: GameCache;
  providerCache: ProviderCache;
  fetchProviders: () => Promise<IProvider[]>;
  fetchGames: (providerCode: string) => Promise<IGame[]>;
  fetchMultipleGames: (providerCodes: string[]) => Promise<{ [key: string]: IGame[] }>;
  clearCache: () => void;
  isLoading: (providerCode?: string) => boolean;
}

const GameCacheContext = createContext<GameCacheContextType | undefined>(undefined);

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

export function GameCacheProvider({ children }: { children: ReactNode }) {
  const [gameCache, setGameCache] = useState<GameCache>({});
  const [providerCache, setProviderCache] = useState<ProviderCache>({
    providers: [],
    timestamp: 0,
    loading: false
  });

  const isCacheValid = useCallback((timestamp: number) => {
    return Date.now() - timestamp < CACHE_DURATION;
  }, []);

  const fetchProviders = useCallback(async (): Promise<IProvider[]> => {
    // Check cache first
    if (providerCache.providers.length > 0 && isCacheValid(providerCache.timestamp) && !providerCache.loading) {
      return providerCache.providers;
    }

    // Prevent duplicate requests
    if (providerCache.loading) {
      return providerCache.providers;
    }

    setProviderCache(prev => ({ ...prev, loading: true }));

    try {
      const providers = await fetchProviderListAsync();
      const filteredProviders = providers.filter(
        (provider) => provider.code !== "SPRIBE" && provider.code !== "INOUT"
      );
      
      setProviderCache({
        providers: filteredProviders,
        timestamp: Date.now(),
        loading: false
      });
      
      return filteredProviders;
    } catch (error) {
      console.error("Error fetching providers:", error);
      setProviderCache(prev => ({ ...prev, loading: false }));
      return [];
    }
  }, [providerCache, isCacheValid]);

  const fetchGames = useCallback(async (providerCode: string): Promise<IGame[]> => {
    // Check cache first
    const cached = gameCache[providerCode];
    if (cached && isCacheValid(cached.timestamp) && !cached.loading) {
      return cached.games;
    }

    // Prevent duplicate requests
    if (cached?.loading) {
      return cached.games;
    }

    // Set loading state
    setGameCache(prev => ({
      ...prev,
      [providerCode]: {
        games: cached?.games || [],
        timestamp: cached?.timestamp || 0,
        loading: true
      }
    }));

    try {
      const games = await fetchGameListAsync(providerCode);
      
      setGameCache(prev => ({
        ...prev,
        [providerCode]: {
          games,
          timestamp: Date.now(),
          loading: false
        }
      }));
      
      return games;
    } catch (error) {
      console.error(`Error fetching games for ${providerCode}:`, error);
      setGameCache(prev => ({
        ...prev,
        [providerCode]: {
          games: cached?.games || [],
          timestamp: cached?.timestamp || 0,
          loading: false
        }
      }));
      return [];
    }
  }, [gameCache, isCacheValid]);

  const fetchMultipleGames = useCallback(async (providerCodes: string[]): Promise<{ [key: string]: IGame[] }> => {
    const results: { [key: string]: IGame[] } = {};
    
    // Check what's already cached and what needs to be fetched
    const toFetch: string[] = [];
    const cachedResults: { [key: string]: IGame[] } = {};
    
    for (const providerCode of providerCodes) {
      const cached = gameCache[providerCode];
      if (cached && isCacheValid(cached.timestamp) && !cached.loading) {
        cachedResults[providerCode] = cached.games;
        results[providerCode] = cached.games;
      } else if (!cached?.loading) {
        toFetch.push(providerCode);
      }
    }

    // Fetch missing data concurrently
    if (toFetch.length > 0) {
      try {
        const fetchPromises = toFetch.map(async (providerCode) => {
          const games = await fetchGames(providerCode);
          return { providerCode, games };
        });

        const fetchedResults = await Promise.all(fetchPromises);
        
        fetchedResults.forEach(({ providerCode, games }) => {
          results[providerCode] = games;
        });
      } catch (error) {
        console.error("Error fetching multiple game lists:", error);
      }
    }

    return results;
  }, [gameCache, fetchGames, isCacheValid]);

  const clearCache = useCallback(() => {
    setGameCache({});
    setProviderCache({
      providers: [],
      timestamp: 0,
      loading: false
    });
  }, []);

  const isLoading = useCallback((providerCode?: string) => {
    if (providerCode) {
      return gameCache[providerCode]?.loading || false;
    }
    return providerCache.loading;
  }, [gameCache, providerCache]);

  return (
    <GameCacheContext.Provider
      value={{
        gameCache,
        providerCache,
        fetchProviders,
        fetchGames,
        fetchMultipleGames,
        clearCache,
        isLoading
      }}
    >
      {children}
    </GameCacheContext.Provider>
  );
}

export function useGameCache() {
  const context = useContext(GameCacheContext);
  if (context === undefined) {
    throw new Error('useGameCache must be used within a GameCacheProvider');
  }
  return context;
}
