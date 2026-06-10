export type NetworkType = 'mainnet' | 'testnet';

export interface NetworkConfig {
  id: string;
  label: string;
  icon: string;
  isTestnet: boolean;
}

// Mainnet networks
export const MAINNET_NETWORKS: NetworkConfig[] = [
  { id: 'ethereum', label: 'Ethereum', icon: '/chains/ethereum.png', isTestnet: false },
  { id: 'optimism', label: 'Optimism', icon: '/chains/optimism.svg', isTestnet: false },
  { id: 'arbitrum', label: 'Arbitrum', icon: '/chains/arbitrum.svg', isTestnet: false },
  { id: 'base', label: 'Base', icon: '/chains/base.svg', isTestnet: false },
  { id: 'solana', label: 'Solana', icon: '/chains/solana.png', isTestnet: false },
];

// Testnet networks
export const TESTNET_NETWORKS: NetworkConfig[] = [
  { id: 'ethereum-sepolia', label: 'Sepolia', icon: '/chains/ethereum.png', isTestnet: true },
  { id: 'optimism-sepolia', label: 'OP Sepolia', icon: '/chains/optimism.svg', isTestnet: true },
  { id: 'arbitrum-sepolia', label: 'Arb Sepolia', icon: '/chains/arbitrum.svg', isTestnet: true },
  { id: 'base-sepolia', label: 'Base Sepolia', icon: '/chains/base.svg', isTestnet: true },
];

// All networks combined
export const ALL_NETWORKS: NetworkConfig[] = [...MAINNET_NETWORKS, ...TESTNET_NETWORKS];

/**
 * Get networks based on the active network type
 * @param networkType - 'mainnet' or 'testnet'
 * @returns Array of network configurations
 */
export function getNetworksByType(networkType: NetworkType): NetworkConfig[] {
  return networkType === 'mainnet' ? MAINNET_NETWORKS : TESTNET_NETWORKS;
}

/**
 * Get network display name for deposit modal
 * @param networkId - Network identifier
 * @returns Display name for the network
 */
export function getNetworkDisplayName(networkId: string): string {
  const networkMap: { [key: string]: string } = {
    'ethereum': 'Ethereum',
    'optimism': 'Optimism', 
    'arbitrum': 'Arbitrum',
    'base': 'Base',
    'solana': 'Solana',
    'ethereum-sepolia': 'Sepolia',
    'optimism-sepolia': 'OP Sepolia',
    'arbitrum-sepolia': 'Arb Sepolia',
    'base-sepolia': 'Base Sepolia',
  };
  
  return networkMap[networkId] || networkId;
}

/**
 * Check if a network is a testnet
 * @param networkId - Network identifier
 * @returns true if testnet, false if mainnet
 */
export function isTestnetNetwork(networkId: string): boolean {
  return TESTNET_NETWORKS.some(network => network.id === networkId);
}

/**
 * Get networks for a specific coin based on active network type
 * @param coinId - Coin identifier (ETH, BTC, USDT, USDC, SOL)
 * @param networkType - 'mainnet' or 'testnet'
 * @returns Array of network names for the coin
 */
export function getCoinNetworks(coinId: string, networkType: NetworkType): string[] {
  const coinNetworkMap: { [key: string]: { mainnet: string[], testnet: string[] } } = {
    'ETH': {
      mainnet: ['Ethereum', 'Base', 'Optimism', 'Arbitrum'],
      testnet: ['Sepolia', 'Base Sepolia', 'OP Sepolia', 'Arb Sepolia']
    },
    'BTC': {
      mainnet: ['Segwit'],
      testnet: ['Segwit'] // Bitcoin testnet would be same network
    },
    'USDT': {
      mainnet: ['Ethereum', 'Base', 'Optimism', 'Arbitrum', 'Solana'],
      testnet: ['Sepolia', 'Base Sepolia', 'OP Sepolia', 'Arb Sepolia']
    },
    'USDC': {
      mainnet: ['Ethereum', 'Base', 'Optimism', 'Arbitrum', 'Solana'],
      testnet: ['Sepolia', 'Base Sepolia', 'OP Sepolia', 'Arb Sepolia']
    },
    'SOL': {
      mainnet: ['Solana'],
      testnet: ['Solana'] // Solana testnet would be same network
    }
  };

  const coinConfig = coinNetworkMap[coinId];
  if (!coinConfig) return [];

  return networkType === 'mainnet' ? coinConfig.mainnet : coinConfig.testnet;
}
