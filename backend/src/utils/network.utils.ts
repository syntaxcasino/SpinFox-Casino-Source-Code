/**
 * Network utility functions to determine if a chain is mainnet or testnet
 */

export type ChainType = 'ethereum' | 'optimism' | 'arbitrum' | 'base' | 'ethereum-sepolia' | 'optimism-sepolia' | 'arbitrum-sepolia' | 'base-sepolia' | 'solana' | 'segwit';

// Mainnet chain IDs
const MAINNET_CHAIN_IDS = [
  1,     // Ethereum Mainnet
  10,    // Optimism
  56,    // BSC
  137,   // Polygon
  8453,  // Base
  42161, // Arbitrum One
  43114, // Avalanche C-Chain
  250,   // Fantom
];

// Testnet chain IDs
const TESTNET_CHAIN_IDS = [
  5,     // Goerli
  11155111, // Sepolia
  420,   // Optimism Goerli
  84531, // Base Goerli
  84532, // Base Sepolia
  80001, // Mumbai (Polygon Testnet)
  97,    // BSC Testnet
  421613, // Arbitrum Goerli
  421614, // Arbitrum Sepolia
  43113, // Avalanche Fuji Testnet
  4002,  // Fantom Testnet
];

// Mainnet chain names
const MAINNET_CHAINS: ChainType[] = [
  'ethereum',
  'optimism',
  'arbitrum',
  'base',
  'solana',
  'segwit', // Bitcoin
];

// Testnet chain names
const TESTNET_CHAINS: ChainType[] = [
  'ethereum-sepolia',
  'optimism-sepolia',
  'arbitrum-sepolia',
  'base-sepolia',
];

// Solana networks
const SOLANA_MAINNET = 'mainnet-beta';
const SOLANA_TESTNET = 'testnet';
const SOLANA_DEVNET = 'devnet';

/**
 * Determines if a chain ID is a mainnet network
 * @param chainId - The chain ID to check
 * @returns true if mainnet, false if testnet
 */
export function isMainnet(chainId: number | string): boolean {
  const id = typeof chainId === 'string' ? parseInt(chainId, 10) : chainId;
  return MAINNET_CHAIN_IDS.includes(id);
}

/**
 * Determines if a chain ID is a testnet network
 * @param chainId - The chain ID to check
 * @returns true if testnet, false if mainnet
 */
export function isTestnet(chainId: number | string): boolean {
  const id = typeof chainId === 'string' ? parseInt(chainId, 10) : chainId;
  return TESTNET_CHAIN_IDS.includes(id);
}

/**
 * Determines if a Solana network is mainnet
 * @param network - The Solana network name
 * @returns true if mainnet, false if testnet/devnet
 */
export function isSolanaMainnet(network: string): boolean {
  return network === SOLANA_MAINNET;
}

/**
 * Determines if a Solana network is testnet or devnet
 * @param network - The Solana network name
 * @returns true if testnet or devnet, false if mainnet
 */
export function isSolanaTestnet(network: string): boolean {
  return network === SOLANA_TESTNET || network === SOLANA_DEVNET;
}

/**
 * Gets the balance field name based on network type
 * @param chainId - The chain ID or network identifier
 * @returns 'realBalance' for mainnet, 'testBalance' for testnet
 */
export function getBalanceField(chainId: number | string): 'realBalance' | 'testBalance' {
  const id = typeof chainId === 'string' ? parseInt(chainId, 10) : chainId;
  
  // If it's not a valid number, default to testnet for safety
  if (isNaN(id)) {
    return 'testBalance';
  }
  
  return isMainnet(id) ? 'realBalance' : 'testBalance';
}

/**
 * Gets the balance field name for Solana network
 * @param network - The Solana network name
 * @returns 'realBalance' for mainnet, 'testBalance' for testnet/devnet
 */
export function getSolanaBalanceField(network: string): 'realBalance' | 'testBalance' {
  return isSolanaMainnet(network) ? 'realBalance' : 'testBalance';
}

/**
 * Determines if a chain name is mainnet
 * @param chain - The chain name
 * @returns true if mainnet, false if testnet
 */
export function isChainMainnet(chain: ChainType | string): boolean {
  return MAINNET_CHAINS.includes(chain as ChainType);
}

/**
 * Determines if a chain name is testnet
 * @param chain - The chain name
 * @returns true if testnet, false if mainnet
 */
export function isChainTestnet(chain: ChainType | string): boolean {
  return TESTNET_CHAINS.includes(chain as ChainType);
}

/**
 * Gets the balance field name based on chain name
 * @param chain - The chain name
 * @returns 'realBalance' for mainnet, 'testBalance' for testnet
 */
export function getBalanceFieldByChain(chain: ChainType | string): 'realBalance' | 'testBalance' {
  return isChainMainnet(chain) ? 'realBalance' : 'testBalance';
}

