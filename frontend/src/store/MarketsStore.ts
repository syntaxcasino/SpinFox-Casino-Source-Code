import { create } from "zustand";
import { SportsAPI } from "@/lib/api/sports";
import { AxiosResponse } from "axios";
import { StatusCodeEnum, GameMarket } from "@/types/overtime-v2";

export type MarketsData = {
  responseHash: string;
  markets?: GameMarket[] | string; // "no change" or list of markets
};

export type MarketsQueryParams = {
  ungroup: boolean;
  onlyBasicProperties: boolean;
  includeHashInResponse: boolean;
  responseHash?: string;
  status: StatusCodeEnum;
  onlyMainMarkets: boolean;
  includeProofs: boolean;
  minMaturity: number;
  maxMaturity?: number;
  includeFuturesInSport?: boolean;
  sport?: string;
};

type MarketsState = {
  markets?: GameMarket[];
  responseHash?: string;
  isLoadingMarkets: boolean;
  marketsError: string | null;
  fetchMarkets: (network: number, params: MarketsQueryParams) => Promise<void>;
};

export const useMarketsStore = create<MarketsState>((set, get) => ({
  markets: undefined,
  responseHash: undefined,
  isLoadingMarkets: false,
  marketsError: null,

  fetchMarkets: async (network: number, params: MarketsQueryParams) => {
    const { responseHash: prevHash, markets: prevMarkets } = get();

    set({ isLoadingMarkets: true, marketsError: null });

    try {
      const response: AxiosResponse<MarketsData> = await SportsAPI.get(
        `/sports/networks/${network}/markets`,
        {
          params: {
            ...params,
            responseHash: prevHash,
          },
        }
      );

      const { responseHash, markets } = response.data;

      // ✅ Narrow the type before assigning
      if (
        !markets ||
        markets === "no change" ||
        (Array.isArray(markets) && markets.length === 0)
      ) {
        console.log("✅ No market changes — reusing cached markets");
        set({
          markets: prevMarkets,
          isLoadingMarkets: false,
        });
        return;
      }

      // ✅ Only assign if it's an array
      if (Array.isArray(markets)) {
        set({
          markets,
          responseHash,
          isLoadingMarkets: false,
        });

        console.log("✅ Markets Updated", markets);
      } else {
        // fallback if unexpected string or null
        set({
          markets: prevMarkets,
          isLoadingMarkets: false,
        });
      }
    } catch (err: any) {
      set({
        marketsError: err.message,
        isLoadingMarkets: false,
      });
    }
  },
}));
