import * as dotenv from 'dotenv';
import { Network } from 'src/types/web3';

dotenv.config();

export const CACHE_TOKEN_OVERTIME_V2_MARKETS = 'overtime-v2-markets';
export const X_API_KEY = process.env.X_API_KEY ?? '';
export const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY ?? '';
export const FX1_IO_API_URL = process.env.FX1_IO_API_URL ?? '';
export const FX1_IO_API_KEY = process.env.FX1_IO_API_KEY ?? '';
export const RAPID_API_KEY = process.env.RAPID_API_KEY ?? '';
export const RAPID_API_TWITTER_NEWS_KEY =
  process.env.RAPID_API_TWITTER_NEWS_KEY ?? '';
export const RAPID_API_UFC_FIGHTERS_KEY =
  process.env.RAPID_API_UFC_FIGHTERS_KEY ?? '';
export const OPENAI_API_URL = process.env.OPENAI_API_URL ?? '';
export const OPENAI_MODEL = process.env.OPENAI_MODEL ?? '';
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY ?? '';
export const OPTIC_ODDS_API_KEY = process.env.OPTIC_ODDS_API_KEY ?? '';
export const GAMBIT_PROPS_CONTRACT_VERIFIER_PRIVATEKEY =
  process.env.GAMBIT_PROPS_CONTRACT_VERIFIER_PRIVATEKEY ?? '';

export const ENCRYPTION_SECRET = process.env.ENCRYPTION_SECRET ?? '';

export const TWITTER_API_KEY = process.env.TWITTER_API_KEY ?? '';
export const TWITTER_API_SECRET_KEY = process.env.TWITTER_API_SECRET_KEY ?? '';
export const TWITTER_ACCESS_TOKEN = process.env.TWITTER_ACCESS_TOKEN ?? '';
export const TWITTER_ACCESS_SECRET = process.env.TWITTER_ACCESS_SECRET ?? '';

export const PINATA_DOMAIN = process.env.PINATA_DOMAIN ?? '';
export const PINATA_API_KEY = process.env.PINATA_API_KEY ?? '';

export const HELIUS_RPC_API_KEY = process.env.HELIUS_RPC_API_KEY ?? '';
export const SOLANA_FEE_WALLET_PRIVATEKEY =
  process.env.SOLANA_FEE_WALLET_PRIVATEKEY ?? '';

export const TG_BOT_TOKEN = process.env.TG_BOT_TOKEN ?? '';
export const TG_WEBAPP_BOT_TOKEN = process.env.TG_WEBAPP_BOT_TOKEN ?? '';

export const DEFAULT_NETWORK = Network.Base;
