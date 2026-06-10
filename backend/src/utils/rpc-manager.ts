import axios from 'axios';
import { Logger } from '@nestjs/common';

interface ChainlistRPC {
  url: string;
  tracking?: string;
  trackingDetails?: string;
}

interface ChainlistChain {
  name: string;
  chain: string;
  rpc: string[];
  chainId: number;
}

interface RPCCache {
  rpcs: string[];
  timestamp: number;
  currentIndex: number;
}

class RPCManager {
  private logger = new Logger('RPCManager');
  private cache: Map<number, RPCCache> = new Map();
  private readonly CACHE_DURATION = 3600000; // 1 hour in milliseconds
  private readonly RPC_TEST_TIMEOUT = 5000; // 5 seconds timeout for testing RPC
  private readonly CHAINLIST_API = 'https://chainid.network/chains.json';
  
  // Fallback RPCs for common chains (used when Chainlist API fails)
  private readonly FALLBACK_RPCS: Record<number, string[]> = {
    // Ethereum Mainnet
    1: [
      'https://eth.llamarpc.com',
      'https://ethereum.publicnode.com',
      'https://rpc.ankr.com/eth',
      'https://eth.rpc.blxrbdn.com',
    ],
    // Ethereum Sepolia
    11155111: [
      'https://ethereum-sepolia.publicnode.com',
      'https://rpc.sepolia.org',
      'https://rpc2.sepolia.org',
    ],
    // Optimism
    10: [
      'https://mainnet.optimism.io',
      'https://optimism.publicnode.com',
      'https://rpc.ankr.com/optimism',
    ],
    // Optimism Sepolia
    11155420: [
      'https://sepolia.optimism.io',
      'https://optimism-sepolia.publicnode.com',
    ],
    // Arbitrum
    42161: [
      'https://arb1.arbitrum.io/rpc',
      'https://arbitrum.publicnode.com',
      'https://rpc.ankr.com/arbitrum',
    ],
    // Arbitrum Sepolia
    421614: [
      'https://sepolia-rollup.arbitrum.io/rpc',
      'https://arbitrum-sepolia.publicnode.com',
    ],
    // Base
    8453: [
      'https://mainnet.base.org',
      'https://base.publicnode.com',
      'https://rpc.ankr.com/base',
    ],
    // Base Sepolia
    84532: [
      'https://sepolia.base.org',
      'https://base-sepolia.publicnode.com',
    ],
  };

  /**
   * Fetches RPC list from Chainlist for a specific chain ID
   */
  private async fetchRPCsFromChainlist(chainId: number): Promise<string[]> {
    try {
      this.logger.debug(`Fetching RPC list from Chainlist for chain ${chainId}`);
      const response = await axios.get<ChainlistChain[]>(this.CHAINLIST_API, {
        timeout: 10000,
      });

      const chain = response.data.find((c) => c.chainId === chainId);
      
      if (!chain || !chain.rpc || chain.rpc.length === 0) {
        throw new Error(`No RPC endpoints found for chain ID ${chainId}`);
      }

      // Filter out RPCs that require API keys (contain ${...})
      const validRpcs = chain.rpc.filter(
        (rpc) => !rpc.includes('${') && rpc.startsWith('http')
      );

      if (validRpcs.length === 0) {
        throw new Error(`No public RPC endpoints available for chain ID ${chainId}`);
      }

      this.logger.debug(`Found ${validRpcs.length} public RPCs for chain ${chainId}`);
      return validRpcs;
    } catch (error) {
      this.logger.error(`Failed to fetch RPCs from Chainlist: ${error.message}`);
      throw error;
    }
  }

  /**
   * Tests if an RPC is available by making a simple eth_chainId call
   */
  private async testRPC(rpcUrl: string, expectedChainId?: number): Promise<boolean> {
    try {
      const response = await axios.post(
        rpcUrl,
        {
          jsonrpc: '2.0',
          method: 'eth_chainId',
          params: [],
          id: 1,
        },
        {
          timeout: this.RPC_TEST_TIMEOUT,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data && response.data.result) {
        const chainId = parseInt(response.data.result, 16);
        
        // If expectedChainId is provided, verify it matches
        if (expectedChainId && chainId !== expectedChainId) {
          this.logger.warn(
            `RPC ${rpcUrl} returned chain ID ${chainId}, expected ${expectedChainId}`
          );
          return false;
        }

        this.logger.debug(`RPC ${rpcUrl} is available (chain ID: ${chainId})`);
        return true;
      }
      return false;
    } catch (error) {
      this.logger.debug(`RPC ${rpcUrl} is not available: ${error.message}`);
      return false;
    }
  }

  /**
   * Gets cached RPCs or fetches new ones if cache is expired
   */
  private async getRPCList(chainId: number): Promise<string[]> {
    const cached = this.cache.get(chainId);
    const now = Date.now();

    // Return cached RPCs if still valid
    if (cached && now - cached.timestamp < this.CACHE_DURATION) {
      this.logger.debug(`Using cached RPCs for chain ${chainId}`);
      return cached.rpcs;
    }

    // Try to fetch new RPCs from Chainlist
    try {
      const rpcs = await this.fetchRPCsFromChainlist(chainId);
      
      // Update cache
      this.cache.set(chainId, {
        rpcs,
        timestamp: now,
        currentIndex: 0,
      });

      return rpcs;
    } catch (error) {
      // If Chainlist fails, use fallback RPCs
      if (this.FALLBACK_RPCS[chainId]) {
        this.logger.warn(
          `Chainlist fetch failed for chain ${chainId}, using fallback RPCs`
        );
        const fallbackRpcs = this.FALLBACK_RPCS[chainId];
        
        // Cache fallback RPCs
        this.cache.set(chainId, {
          rpcs: fallbackRpcs,
          timestamp: now,
          currentIndex: 0,
        });
        
        return fallbackRpcs;
      }
      
      // If no fallback RPCs available, throw error
      throw new Error(
        `Failed to get RPCs for chain ${chainId}: ${error.message} and no fallback RPCs available`
      );
    }
  }

  /**
   * Gets the next available RPC for a specific chain
   * Automatically rotates through RPCs and tests them
   */
  async getRPC(chainId: number, testConnection = true): Promise<string> {
    try {
      const rpcs = await this.getRPCList(chainId);
      const cached = this.cache.get(chainId);

      if (!cached) {
        throw new Error(`No cached data for chain ${chainId}`);
      }

      // Try each RPC starting from current index
      const totalRPCs = rpcs.length;
      let attempts = 0;

      while (attempts < totalRPCs) {
        const currentRPC = rpcs[cached.currentIndex];

        // Move to next RPC for future calls
        cached.currentIndex = (cached.currentIndex + 1) % totalRPCs;

        // Test RPC if required
        if (testConnection) {
          const isAvailable = await this.testRPC(currentRPC, chainId);
          if (isAvailable) {
            this.logger.debug(`Using RPC: ${currentRPC} for chain ${chainId}`);
            return currentRPC;
          }
        } else {
          this.logger.debug(`Using RPC (untested): ${currentRPC} for chain ${chainId}`);
          return currentRPC;
        }

        attempts++;
      }

      // If all RPCs failed, return the first one anyway
      this.logger.warn(
        `All RPCs failed for chain ${chainId}, returning first RPC anyway`
      );
      return rpcs[0];
    } catch (error) {
      this.logger.error(`Failed to get RPC for chain ${chainId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Gets multiple working RPCs for a chain (useful for fallback)
   */
  async getWorkingRPCs(
    chainId: number,
    count = 3
  ): Promise<string[]> {
    try {
      const rpcs = await this.getRPCList(chainId);
      const workingRPCs: string[] = [];

      for (const rpc of rpcs) {
        if (workingRPCs.length >= count) break;

        const isAvailable = await this.testRPC(rpc, chainId);
        if (isAvailable) {
          workingRPCs.push(rpc);
        }
      }

      // If no working RPCs found, return first N RPCs anyway (better than nothing)
      if (workingRPCs.length === 0) {
        this.logger.warn(
          `No working RPCs found for chain ${chainId} during testing, returning first ${count} RPCs anyway`
        );
        return rpcs.slice(0, count);
      }

      this.logger.debug(
        `Found ${workingRPCs.length} working RPCs for chain ${chainId}`
      );
      return workingRPCs;
    } catch (error) {
      this.logger.error(
        `Failed to get working RPCs for chain ${chainId}: ${error.message}`
      );
      // Instead of throwing, try to return fallback RPCs if available
      if (this.FALLBACK_RPCS[chainId]) {
        this.logger.warn(
          `Returning fallback RPCs for chain ${chainId} due to error`
        );
        return this.FALLBACK_RPCS[chainId].slice(0, count);
      }
      throw error;
    }
  }

  /**
   * Clears cache for a specific chain or all chains
   */
  clearCache(chainId?: number): void {
    if (chainId) {
      this.cache.delete(chainId);
      this.logger.debug(`Cache cleared for chain ${chainId}`);
    } else {
      this.cache.clear();
      this.logger.debug('All RPC cache cleared');
    }
  }

  /**
   * Manually adds RPCs to cache (useful for custom RPC lists)
   */
  setCustomRPCs(chainId: number, rpcs: string[]): void {
    this.cache.set(chainId, {
      rpcs,
      timestamp: Date.now(),
      currentIndex: 0,
    });
    this.logger.debug(`Custom RPCs set for chain ${chainId}`);
  }
}

// Export singleton instance
export const rpcManager = new RPCManager();

// Chain IDs for common networks
export const CHAIN_IDS = {
  ETHEREUM_MAINNET: 1,
  ETHEREUM_SEPOLIA: 11155111,
  OPTIMISM: 10,
  OPTIMISM_SEPOLIA: 11155420,
  ARBITRUM: 42161,
  ARBITRUM_SEPOLIA: 421614,
  BASE: 8453,
  BASE_SEPOLIA: 84532,
  POLYGON: 137,
  POLYGON_MUMBAI: 80001,
  BSC: 56,
  BSC_TESTNET: 97,
  AVALANCHE: 43114,
  AVALANCHE_FUJI: 43113,
};

/**
 * Helper function to get RPC for Ethereum Mainnet
 */
export async function getEthereumRPC(): Promise<string> {
  return rpcManager.getRPC(CHAIN_IDS.ETHEREUM_MAINNET);
}

/**
 * Helper function to get RPC for Ethereum Sepolia
 */
export async function getSepoliaRPC(): Promise<string> {
  return rpcManager.getRPC(CHAIN_IDS.ETHEREUM_SEPOLIA);
}

/**
 * Helper function to get RPC for Optimism
 */
export async function getOptimismRPC(): Promise<string> {
  return rpcManager.getRPC(CHAIN_IDS.OPTIMISM);
}

/**
 * Helper function to get RPC for Arbitrum
 */
export async function getArbitrumRPC(): Promise<string> {
  return rpcManager.getRPC(CHAIN_IDS.ARBITRUM);
}

/**
 * Helper function to get RPC for Base
 */
export async function getBaseRPC(): Promise<string> {
  return rpcManager.getRPC(CHAIN_IDS.BASE);
}

