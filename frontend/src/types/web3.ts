export enum Network {
  Solana = 0,
  Mainnet = 1,
  Optimism = 10,
  Arbitrum = 42161,
  Base = 8453,
  Sepolia = 11155111,
}

export type SupportingNetwork =
  | Network.Optimism
  | Network.Arbitrum
  | Network.Base
  | Network.Sepolia;
