import { create } from "zustand";
import { SportsAPI } from "@/lib/api/sports";
import { AxiosResponse } from "axios";
import { MarketType } from "@/types/overtime-v2";

// Define mapping type for market types
export type MarketTypesMap = Record<string | number, MarketType>;

// Zustand state shape
type MarketTypesState = {
  marketTypes: MarketTypesMap;
  isLoadingMarketTypes: boolean;
  marketTypesError: string | null;
  fetchMarketTypes: () => Promise<void>;
};

export const useMarketTypesStore = create<MarketTypesState>((set) => ({
  marketTypes: {},
  isLoadingMarketTypes: false,
  marketTypesError: null,

  fetchMarketTypes: async () => {
    set({ isLoadingMarketTypes: true, marketTypesError: null });
    try {
      const response: AxiosResponse<MarketTypesMap> = await SportsAPI.get(
        `/sports/market-types`
      );

      const marketTypes = response.data;
      console.log("✅ Market Types:", marketTypes);

      set({ marketTypes, isLoadingMarketTypes: false });
    } catch (err: any) {
      console.error("❌ Failed to fetch market types:", err.message);
      set({
        marketTypesError: err.message,
        isLoadingMarketTypes: false,
      });
    }
  },
}));
