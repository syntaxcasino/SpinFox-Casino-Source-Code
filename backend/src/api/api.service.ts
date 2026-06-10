import { Injectable, HttpException, Logger } from "@nestjs/common";
import {
  IProvider,
  IGame,
  IGameListInterface,
  IGameResponse,
  IProviderListResponse,
} from "src/interfaces/external-api.interface";
import axios from "axios";

@Injectable()
export class ApiService {
  private readonly logger = new Logger(ApiService.name);
  private priceCache: Record<string, { value: number; timestamp: number }> = {};
  private readonly CACHE_TTL = 60_000;

  private baseUrl = "https://api.betvio777.com/api/v2";
  private coingeckoApi = "https://api.coingecko.com/api/v3/simple/price";

  // Retry helper with exponential backoff
  private async retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    initialDelay: number = 1000
  ): Promise<T> {
    let lastError: any;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        
        // Don't retry on client errors (4xx)
        if (axios.isAxiosError(error) && error.response && error.response.status >= 400 && error.response.status < 500) {
          throw error;
        }
        
        if (attempt < maxRetries) {
          const delay = initialDelay * Math.pow(2, attempt);
          this.logger.warn(`Request failed (attempt ${attempt + 1}/${maxRetries + 1}), retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError;
  }

  // ✅ Fetch ETH price in USD
  async getEthUsdPrice(): Promise<number> {
    return this.getTokenUsdPrice("ethereum");
  }

  // ✅ Fetch BTC price in USD
  async getBtcUsdPrice(): Promise<number> {
    return this.getTokenUsdPrice("bitcoin");
  }

  // ✅ Fetch SOL price in USD
  async getSolUsdPrice(): Promise<number> {
    return this.getTokenUsdPrice("solana");
  }

  // Generic CoinGecko price fetcher
  private async getTokenUsdPrice(tokenId: string): Promise<number> {
    try {
      const now = Date.now();
      const cache = this.priceCache[tokenId];
      if (cache && now - cache.timestamp < this.CACHE_TTL) {
        return cache.value;
      }
      const res = await axios.get(this.coingeckoApi, {
        params: {
          ids: tokenId,
          vs_currencies: "usd",
        },
        timeout: 5000,
      });

      if (!res.data || !res.data[tokenId] || !res.data[tokenId].usd) {
        throw new Error(`Invalid response from CoinGecko for ${tokenId}`);
      }

      const price = res.data[tokenId].usd;
      this.priceCache[tokenId] = { value: price, timestamp: now };
      return Number(price);
    } catch (err) {
      this.logger.error(
        `Failed to fetch USD price for ${tokenId}: ${err.message}`
      );
      throw err;
    }
  }

  async fetchProviderListAsync(
    agentCode: string,
    agentToken: string,
    gameType: string,
    retry: boolean = false
  ): Promise<IProvider[]> {
    const fetchFn = async () => {
      try {
        const response = await axios.post(
          `${this.baseUrl}/provider_list`,
          {
            agent_code: agentCode,
            agent_token: agentToken,
            game_type: gameType,
          },
          {
            timeout: 10000, // 10 second timeout
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        
        const result: IProviderListResponse = response.data;
        return result.providers;
      } catch (error) {
        this.logger.error(`Failed to fetch provider list: ${error.message}`);
        if (axios.isAxiosError(error)) {
          if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
            throw new HttpException('External API timeout - server is not responding', 504);
          }
          if (error.response) {
            throw new HttpException(
              `External API error: ${error.response.status} ${error.response.statusText}`,
              error.response.status
            );
          }
        }
        throw new HttpException("External API Error", 500);
      }
    };

    return retry ? this.retryWithBackoff(fetchFn) : fetchFn();
  }

  async fetchGameListAsync(
    agentCode: string,
    agentToken: string,
    providerCode: string,
    retry: boolean = false
  ): Promise<IGame[]> {
    const fetchFn = async () => {
      try {
        const response = await axios.post(
          `${this.baseUrl}/game_list`,
          {
            agent_code: agentCode,
            agent_token: agentToken,
            provider_code: providerCode,
            lang: "en",
          },
          {
            timeout: 10000, // 10 second timeout
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        
        const result: IGameListInterface = response.data;
        if (result && result.games) {
          result.games = result.games.filter((game) => game.status !== 0);
        }
        return result.games;
      } catch (error) {
        this.logger.error(`Failed to fetch game list for provider ${providerCode}: ${error.message}`);
        if (axios.isAxiosError(error)) {
          if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
            throw new HttpException('External API timeout - server is not responding', 504);
          }
          if (error.response) {
            throw new HttpException(
              `External API error: ${error.response.status} ${error.response.statusText}`,
              error.response.status
            );
          }
        }
        throw new HttpException("External API Error", 500);
      }
    };

    return retry ? this.retryWithBackoff(fetchFn) : fetchFn();
  }

  async fetchGameLaunchAsync(
    agentCode: string,
    agentToken: string,
    userCode: string,
    gameType: string,
    providerCode: string,
    gameCode: string,
    userBalance: number
  ): Promise<IGameResponse> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/game_launch`,
        {
          agent_code: agentCode,
          agent_token: agentToken,
          user_code: userCode,
          game_type: gameType,
          provider_code: providerCode,
          game_code: gameCode,
          lang: "en",
          user_balance: userBalance,
        },
        {
          timeout: 15000, // 15 second timeout (game launch may take longer)
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      
      const result: IGameResponse = response.data;
      return result;
    } catch (error) {
      this.logger.error(`Failed to launch game ${gameCode}: ${error.message}`);
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
          throw new HttpException('External API timeout - server is not responding', 504);
        }
        if (error.response) {
          throw new HttpException(
            `External API error: ${error.response.status} ${error.response.statusText}`,
            error.response.status
          );
        }
      }
      throw new HttpException("External API Error", 500);
    }
  }

  async fetchUserInfoAsync(
    agentCode: string,
    agentToken: string,
    userCode: string
  ): Promise<any> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/info`,
        {
          agent_code: agentCode,
          agent_token: agentToken,
          user_code: userCode,
        },
        {
          timeout: 10000, // 10 second timeout
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to fetch user info for ${userCode}: ${error.message}`);
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
          throw new HttpException('External API timeout - server is not responding', 504);
        }
        if (error.response) {
          throw new HttpException(
            `External API error: ${error.response.status} ${error.response.statusText}`,
            error.response.status
          );
        }
      }
      throw new HttpException("External API Error", 500);
    }
  }

  // Transfer mode APIs removed - Using seamless mode only
  // In seamless mode:
  // - Users are auto-created when launching games
  // - Balance is managed in OUR database, not on aggregator
  // - Aggregator calls OUR callbacks (user_balance, game_callback)
}
