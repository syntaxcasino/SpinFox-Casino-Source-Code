import { Network } from 'src/types/web3';

import { ALCHEMY_API_KEY, HELIUS_RPC_API_KEY } from './config';

export const zeroAddress =
  '0x0000000000000000000000000000000000000000' as const;

export const NetworksForGambit = {
  [Network.Solana]: {
    // Solana
    name: 'Solana',
    get rpcUrl() {
      return `https://mainnet.helius-rpc.com/?api-key=${HELIUS_RPC_API_KEY}`;
    },
    get rpcUrls() {
      return [
        `https://solana-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
        `https://mainnet.helius-rpc.com/?api-key=${HELIUS_RPC_API_KEY}`,
        `https://api.mainnet-beta.solana.com`,
      ];
    },
    chainId: Network.Solana,
  },
  [Network.Optimism]: {
    name: 'Optimism',
    get rpcUrl() {
      return `https://opt-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`;
    },
    get rpcUrls() {
      return [
        `https://opt-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
        'https://optimism.blockpi.network/v1/rpc/public',
        'https://optimism.llamarpc.com',
        'https://rpc.ankr.com/optimism',
        'https://optimism.meowrpc.com',
        'https://op-pokt.nodies.app',
        'https://optimism.drpc.org',
      ];
    },
    chainId: Network.Optimism,
  },
  [Network.Arbitrum]: {
    name: 'Arbitrum',
    get rpcUrl() {
      return `https://arb-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`;
    },
    get rpcUrls() {
      return [
        `https://arb-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
        'https://arbitrum.llamarpc.com',
        'https://arbitrum.meowrpc.com',
        'https://arb-pokt.nodies.app',
        'https://arbitrum-one.public.blastapi.io',
        'https://arbitrum-one-rpc.publicnode.com',
        'https://arbitrum.drpc.org',
      ];
    },
    chainId: Network.Arbitrum,
  },
  [Network.Base]: {
    name: 'Base',
    get rpcUrl() {
      return `https://base-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`;
    },
    get rpcUrls() {
      return [
        `https://base-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
        'https://base.blockpi.network/v1/rpc/public',
        'https://base.llamarpc.com',
        'https://rpc.ankr.com/base',
        'https://base.meowrpc.com',
        'https://base-pokt.nodies.app',
        'https://base.drpc.org',
      ];
    },
    chainId: Network.Base,
  },
  [Network.Sepolia]: {
    name: 'Sepolia',
    get rpcUrl() {
      return `https://1rpc.io/sepolia`;
    },
    get rpcUrls() {
      return [
        `https://eth-sepolia.alchemyapi.io/v2/${ALCHEMY_API_KEY}`,
        'https://rpc.sepolia.org',
      ];
    },
    chainId: Network.Sepolia,
  },
  [Network.Mainnet]: {
    name: 'Mainnet',
    get rpcUrl() {
      return `https://eth.llamarpc.com`;
    },
    get rpcUrls() {
      return [
        `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
        'https://ethereum.blockpi.network/v1/rpc/public',
        'https://eth.llamarpc.com',
      ];
    },
    chainId: Network.Mainnet,
  },
};

export const LastSportsGambitContracts = {
  // [Network.Optimism]: '0x246FA8478c5d69129385373D453518E9b05aEC75',
  // [Network.Arbitrum]: '0x35611b50334d3b10D23168B37969031026a348D5',
  [Network.Optimism]: '0x800F0d848e76723Fbef9B0eDc220A57f20D23a40',
  [Network.Arbitrum]: '0xd5616F4949Fe27BE6930161D45508808bf7fF0e6',
};

export const OldSportsGambitContracts = {
  [Network.Optimism]: '0x246FA8478c5d69129385373D453518E9b05aEC75',
  [Network.Arbitrum]: '0x35611b50334d3b10D23168B37969031026a348D5',
};

export const LastSportsGambitContracts1 = {
  // [Network.Optimism]: "0x233bf6F8dec8617d4be6d0Dfedd890F01b512125",
  // [Network.Optimism]: "0x246FA8478c5d69129385373D453518E9b05aEC75",
  // [Network.Arbitrum]: "0x35611b50334d3b10D23168B37969031026a348D5",
  // [Network.Optimism]: "0x800F0d848e76723Fbef9B0eDc220A57f20D23a40",
  [Network.Optimism]: '0xD539a3C5993a5b435fA5F380bd393d337b608901',
  // [Network.Arbitrum]: "0xd5616F4949Fe27BE6930161D45508808bf7fF0e6",
  [Network.Arbitrum]: '0xd3ee3b5eE7541dEF59396d9059A96C07d7C798ed',
};

export const SportsGambitContracts = {
  [Network.Optimism]: '0x5Fc7b28f5Cb513810F83b52E9EE74f5B6a932919',
  [Network.Arbitrum]: '0x5Fc7b28f5Cb513810F83b52E9EE74f5B6a932919',
};

// export type ContractAddresses = { [key in Network]: Address };

export const CONTRACT_ADDRESSES = [
  {
    [Network.Optimism]: '0x246FA8478c5d69129385373D453518E9b05aEC75',
    [Network.Arbitrum]: '0x35611b50334d3b10D23168B37969031026a348D5',
    // [Network.Base]: zeroAddress,
  },
  {
    [Network.Optimism]: '0x800F0d848e76723Fbef9B0eDc220A57f20D23a40',
    [Network.Arbitrum]: '0xd5616F4949Fe27BE6930161D45508808bf7fF0e6',
    // [Network.Base]: zeroAddress,
  },
  {
    [Network.Optimism]: '0xD539a3C5993a5b435fA5F380bd393d337b608901',
    [Network.Arbitrum]: '0xd3ee3b5eE7541dEF59396d9059A96C07d7C798ed',
    // [Network.Base]: zeroAddress,
  },
  // {
  //   [Network.Optimism]: "0x5Fc7b28f5Cb513810F83b52E9EE74f5B6a932919",
  //   [Network.Arbitrum]: "0x5Fc7b28f5Cb513810F83b52E9EE74f5B6a932919",
  //   // [Network.Base]: zeroAddress,
  // },
];

export const OLD_CONTRACT_ADDRESSES = [
  {
    [Network.Optimism]: '0x246FA8478c5d69129385373D453518E9b05aEC75',
    [Network.Arbitrum]: '0x35611b50334d3b10D23168B37969031026a348D5',
  },
  {
    [Network.Optimism]: '0x800F0d848e76723Fbef9B0eDc220A57f20D23a40',
    [Network.Arbitrum]: '0xd5616F4949Fe27BE6930161D45508808bf7fF0e6',
  },
  {
    [Network.Optimism]: '0xD539a3C5993a5b435fA5F380bd393d337b608901',
    [Network.Arbitrum]: '0xd3ee3b5eE7541dEF59396d9059A96C07d7C798ed',
  },
];

export const NEW_CONTRACT_ADDRESS = {
  [Network.Optimism]: '0x5Fc7b28f5Cb513810F83b52E9EE74f5B6a932919',
  [Network.Arbitrum]: '0x5Fc7b28f5Cb513810F83b52E9EE74f5B6a932919',
};

export interface TokenData {
  name: string;
  address: string;
  decimals: number;
  main?: boolean;
}

export type OptimismTokenType =
  | 'sUSD'
  | 'USDT'
  | 'ETH'
  | 'DAI'
  | 'USDC'
  | 'OP'
  | 'WETH'
  | 'ETH';
export type ArbitrumTokenType =
  | 'USDCe'
  | 'USDC'
  | 'USDT'
  | 'DAI'
  | 'USDT'
  | 'ARB'
  | 'WETH'
  | 'ETH';
export type BaseTokenType = 'USDC' | 'USDT' | 'WETH' | 'ETH';

export type TokenType = OptimismTokenType | ArbitrumTokenType;

export type Tokens<T extends string> = { [key in T]: TokenData };

export const tokens: { [key in Network]: Tokens<string> } = {
  [Network.Optimism]: {
    sUSD: {
      name: 'Sync sUSD',
      address: '0x8c6f28f2f1a3c87f0f938b96d27520d9751ec8d9',
      decimals: 18,
    },
    DAI: {
      name: 'Dai Stablecoin',
      address: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
      decimals: 18,
    },
    USDC: {
      name: 'USD coin',
      // address: "0x7F5c764cBc14f9669B88837ca1490cCa17c31607",
      address: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
      decimals: 6,
    },
    USDT: {
      name: 'Tether USD',
      address: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58',
      decimals: 6,
    },
    OP: {
      name: 'Optimism',
      address: '0x4200000000000000000000000000000000000042',
      decimals: 18,
      main: true,
    },
    ETH: {
      name: 'Ethereum',
      address: '0x4200000000000000000000000000000000000006',
      decimals: 18,
    },
    WETH: {
      name: 'Wrapped Ether',
      address: '0x4200000000000000000000000000000000000006',
      decimals: 18,
    },
  } as Tokens<OptimismTokenType>,

  [Network.Arbitrum]: {
    USDCe: {
      name: 'USDCe',
      address: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
      decimals: 6,
    },
    USDC: {
      name: 'USDC',
      address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
      decimals: 6,
    },
    DAI: {
      name: 'DAI',
      address: '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1',
      decimals: 18,
    },
    USDT: {
      name: 'USDT',
      address: '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9',
      decimals: 6,
    },
    ARB: {
      name: 'ARB',
      address: '0x912CE59144191C1204E64559FE8253a0e49E6548',
      decimals: 18,
      main: true,
    },
    WETH: {
      name: 'WETH',
      address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
      decimals: 18,
    },
    ETH: {
      name: 'ETH',
      address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
      decimals: 18,
    },
  } as Tokens<ArbitrumTokenType>,
  [Network.Base]: {
    USDC: {
      name: 'USDC',
      address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      decimals: 6,
    },
    USDT: {
      name: 'USDT',
      address: '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2',
      decimals: 6,
    },
    ETH: {
      name: 'ETH',
      address: '0x4200000000000000000000000000000000000006',
      decimals: 18,
    },
    WETH: {
      name: 'WETH',
      address: '0x4200000000000000000000000000000000000006',
      decimals: 18,
    },
  } as Tokens<BaseTokenType>,
  [Network.Sepolia]: {
    USDC: {
      name: 'USDC',
      address: '0x2d4c25F5bF7b2204F9B5535829e08B7f63E52FFa',
      decimals: 6,
    },
    USDT: {
      name: 'USDT',
      address: '0x24613014e71791e9A038ee60bf26f5E629a9990B',
      decimals: 6,
    },
    DAI: {
      name: 'DAI',
      address: '0xe43DaAa02Ae9e12D0101838E997aC7a737897eAa',
      decimals: 18,
    },
    ETH: {
      name: 'ETH',
      address: zeroAddress,
      decimals: 18,
    },
  },
  [Network.Mainnet]: {
    USDC: {
      name: 'USDC',
      address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      decimals: 6,
    },
    ETH: {
      name: 'ETH',
      address: zeroAddress,
      decimals: 18,
    },
  },
  [Network.Solana]: {
    USDC: {
      name: 'USDC',
      address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      decimals: 6,
    },
    SOL: {
      name: 'SOL',
      address: 'So11111111111111111111111111111111111111112',
      decimals: 9,
    },
  },
};

export const defaultTokenDecimals: { [key in Network]: number } = {
  [Network.Solana]: 9,
  [Network.Mainnet]: 18,
  [Network.Optimism]: 18,
  [Network.Arbitrum]: 6,
  [Network.Base]: 6,
  [Network.Sepolia]: 6,
};

export const PROPS_CONTRACT_ADDRESS = {
  [Network.Optimism]: '0x2898Fd213e1bE1602875EaaE6D28FB3E59657CB3',
  [Network.Arbitrum]: '0xF020762e6E5C322af934e8b6df82A2499726D735',
  [Network.Sepolia]: '0x6AF2ef389349E7143163FDee5ab9c0128674a38b',
  [Network.Base]: '0x8bbb6d8a3609a6f5d32123A9a6B0fafc4c9f3075',
};

export const AGENT_FACTORY = {
  [Network.Optimism]: '0xA4836a852091BfD42F264104057866B3E23Fd34d',
  [Network.Arbitrum]: '0xEB5BF217a468FCAe34a94A6C35B96ca20865b126',
  [Network.Base]: '0xe10004911174b7FB4483E65C338D011477AE4E2b',
};

export const availableNetworks = [
  Network.Optimism,
  Network.Arbitrum,
  Network.Base,
  Network.Sepolia,
];
