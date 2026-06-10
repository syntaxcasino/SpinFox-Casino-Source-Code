import { create } from "zustand";
import { SportsAPI } from "@/lib/api/sports";
import { AxiosResponse } from "axios";
import { Market } from "@/types/overtime-v2";

type DetailedMarketState = {
  detailedMarket?: Market;
  isLoadingDetailedMarket: boolean;
  detailedMarketError: string | null;
  fetchDetailedMarket: (network: number, gameId: string) => Promise<void>;
};

export const useDetailedMarketStore = create<DetailedMarketState>((set) => ({
  detailedMarket: undefined,
  isLoadingDetailedMarket: false,
  detailedMarketError: null,

  fetchDetailedMarket: async (network: number, gameId: string) => {
    set({ isLoadingDetailedMarket: true, detailedMarketError: null });

    try {
      const response: AxiosResponse<Market> = await SportsAPI.get(
        `/sports/networks/${network}/markets/${gameId}`
      );

      const detailedMarket = response.data;

      // ✅ Set the market data safely
      set({
        detailedMarket,
        isLoadingDetailedMarket: false,
      });

      console.log("✅ Detailed Market Updated", detailedMarket);
    } catch (err: any) {
      console.error("❌ Failed to fetch detailed market:", err);

      set({
        detailedMarketError: err.message || "Failed to load market details",
        isLoadingDetailedMarket: false,
      });
    }
  },
}));
