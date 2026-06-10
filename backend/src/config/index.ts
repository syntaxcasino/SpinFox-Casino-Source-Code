import { rpcManager, CHAIN_IDS } from '../utils/rpc-manager';

export type ChainConfig = {
  name: string;
  rpc: string | (() => Promise<string>);
  usdtAddress: string;
  usdcAddress: string;
  confirmations: number;
  startBlock?: number;
  chainId: number;
};

export const chains: ChainConfig[] = [
  // Mainnet chains
  {
    name: 'ethereum',
    rpc: async () => {
      return rpcManager.getRPC(CHAIN_IDS.ETHEREUM_MAINNET);
    },
    usdtAddress: process.env.ETHEREUM_USDT_ADDRESS ?? '',
    usdcAddress: process.env.ETHEREUM_USDC_ADDRESS ?? '',
    confirmations: Number(process.env.ETHEREUM_CONFIRMATIONS ?? 12),
    startBlock: process.env.ETHEREUM_START_BLOCK
      ? Number(process.env.ETHEREUM_START_BLOCK)
      : undefined,
    chainId: CHAIN_IDS.ETHEREUM_MAINNET,
  },
  {
    name: 'optimism',
    rpc: async () => {
      return rpcManager.getRPC(CHAIN_IDS.OPTIMISM);
    },
    usdtAddress: process.env.OPTIMISM_USDT_ADDRESS ?? '',
    usdcAddress: process.env.OPTIMISM_USDC_ADDRESS ?? '',
    confirmations: Number(process.env.OPTIMISM_CONFIRMATIONS ?? 3),
    startBlock: process.env.OPTIMISM_START_BLOCK
      ? Number(process.env.OPTIMISM_START_BLOCK)
      : undefined,
    chainId: CHAIN_IDS.OPTIMISM,
  },
  {
    name: 'arbitrum',
    rpc: async () => {
      return rpcManager.getRPC(CHAIN_IDS.ARBITRUM);
    },
    usdtAddress: process.env.ARBITRUM_USDT_ADDRESS ?? '',
    usdcAddress: process.env.ARBITRUM_USDC_ADDRESS ?? '',
    confirmations: Number(process.env.ARBITRUM_CONFIRMATIONS ?? 3),
    startBlock: process.env.ARBITRUM_START_BLOCK
      ? Number(process.env.ARBITRUM_START_BLOCK)
      : undefined,
    chainId: CHAIN_IDS.ARBITRUM,
  },
  {
    name: 'base',
    rpc: async () => {
      return rpcManager.getRPC(CHAIN_IDS.BASE);
    },
    usdtAddress: process.env.BASE_USDT_ADDRESS ?? '',
    usdcAddress: process.env.BASE_USDC_ADDRESS ?? '',
    confirmations: Number(process.env.BASE_CONFIRMATIONS ?? 3),
    startBlock: process.env.BASE_START_BLOCK
      ? Number(process.env.BASE_START_BLOCK)
      : undefined,
    chainId: CHAIN_IDS.BASE,
  },
  // Sepolia testnet chains
  {
    name: 'ethereum-sepolia',
    rpc: async () => {
      return rpcManager.getRPC(CHAIN_IDS.ETHEREUM_SEPOLIA);
    },
    usdtAddress: process.env.ETHEREUM_SEPOLIA_USDT_ADDRESS ?? '',
    usdcAddress: process.env.ETHEREUM_SEPOLIA_USDC_ADDRESS ?? '',
    confirmations: Number(process.env.ETHEREUM_SEPOLIA_CONFIRMATIONS ?? 3),
    startBlock: process.env.ETHEREUM_SEPOLIA_START_BLOCK
      ? Number(process.env.ETHEREUM_SEPOLIA_START_BLOCK)
      : undefined,
    chainId: CHAIN_IDS.ETHEREUM_SEPOLIA,
  },
  {
    name: 'optimism-sepolia',
    rpc: async () => {
      return rpcManager.getRPC(CHAIN_IDS.OPTIMISM_SEPOLIA);
    },
    usdtAddress: process.env.OPTIMISM_SEPOLIA_USDT_ADDRESS ?? '',
    usdcAddress: process.env.OPTIMISM_SEPOLIA_USDC_ADDRESS ?? '',
    confirmations: Number(process.env.OPTIMISM_SEPOLIA_CONFIRMATIONS ?? 2),
    startBlock: process.env.OPTIMISM_SEPOLIA_START_BLOCK
      ? Number(process.env.OPTIMISM_SEPOLIA_START_BLOCK)
      : undefined,
    chainId: CHAIN_IDS.OPTIMISM_SEPOLIA,
  },
  {
    name: 'arbitrum-sepolia',
    rpc: async () => {
      return rpcManager.getRPC(CHAIN_IDS.ARBITRUM_SEPOLIA);
    },
    usdtAddress: process.env.ARBITRUM_SEPOLIA_USDT_ADDRESS ?? '',
    usdcAddress: process.env.ARBITRUM_SEPOLIA_USDC_ADDRESS ?? '',
    confirmations: Number(process.env.ARBITRUM_SEPOLIA_CONFIRMATIONS ?? 2),
    startBlock: process.env.ARBITRUM_SEPOLIA_START_BLOCK
      ? Number(process.env.ARBITRUM_SEPOLIA_START_BLOCK)
      : undefined,
    chainId: CHAIN_IDS.ARBITRUM_SEPOLIA,
  },
  {
    name: 'base-sepolia',
    rpc: async () => {
      return rpcManager.getRPC(CHAIN_IDS.BASE_SEPOLIA);
    },
    usdtAddress: process.env.BASE_SEPOLIA_USDT_ADDRESS ?? '',
    usdcAddress: process.env.BASE_SEPOLIA_USDC_ADDRESS ?? '',
    confirmations: Number(process.env.BASE_SEPOLIA_CONFIRMATIONS ?? 2),
    startBlock: process.env.BASE_SEPOLIA_START_BLOCK
      ? Number(process.env.BASE_SEPOLIA_START_BLOCK)
      : undefined,
    chainId: CHAIN_IDS.BASE_SEPOLIA,
  },
];

/**
 * Helper function to get RPC URL from chain config
 * Handles both string and async function RPC configs
 */
export async function getRPCUrl(chain: ChainConfig): Promise<string> {
  if (typeof chain.rpc === 'function') {
    return await chain.rpc();
  }
  return chain.rpc;
}