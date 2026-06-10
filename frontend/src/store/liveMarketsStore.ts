
import { create } from "zustand";
import { SportsAPI } from "@/lib/api/sports";
import { AxiosResponse } from "axios";
import { IPropsMarket } from "@/types/sports-api";

type LiveMarketsData = { [league: string]: IPropsMarket[] };

type LiveMarketsState = {
  liveMarkets: LiveMarketsData;
  isLoadingLiveMarkets: boolean;
  liveMarketsError: string | null;
  fetchLiveMarkets: () => Promise<void>;
};

export const useLiveMarketsStore = create<LiveMarketsState>((set) => ({
  liveMarkets: {},
  isLoadingLiveMarkets: false,
  liveMarketsError: null,
  fetchLiveMarkets: async () => {
    set({ isLoadingLiveMarkets: true, liveMarketsError: null });
    try {
      const response: AxiosResponse<LiveMarketsData> = await SportsAPI.get<{ [league: string]: IPropsMarket[] }>(
        "/opticodds-api/all-live-events"
      );
      const liveMarkets: LiveMarketsData = response.data;
      set({ liveMarkets, isLoadingLiveMarkets: false });
    } catch (err: any) {
      set({ liveMarketsError: err.message, isLoadingLiveMarkets: false });
    }
  },
}));
