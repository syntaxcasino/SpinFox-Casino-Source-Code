
import { create } from "zustand";
import { SportsAPI } from "@/lib/api/sports";
import { ILiveTicket } from "@/types/sports-api";
import { AxiosResponse } from "axios";

type LiveBetsState = {
  liveBets: ILiveTicket[];
  isLoadingLiveBets: boolean;
  liveBetsError: string | null;
  fetchLiveBets: () => Promise<void>;
};

export const useLiveBetsStore = create<LiveBetsState>((set) => ({
  liveBets: [],
  isLoadingLiveBets: false,
  liveBetsError: null,
  fetchLiveBets: async () => {
    set({ isLoadingLiveBets: true, liveBetsError: null });
    try {
      const response: AxiosResponse<ILiveTicket[]> = await SportsAPI.get<ILiveTicket[]>("/opticodds-api/all-live-tickets");
      const _liveBets: ILiveTicket[] = response.data;
      const liveBets = _liveBets
            .filter(({ updatedAt }) => Date.now() - new Date(updatedAt).getTime() < 2 * 24 * 60 * 60 * 1000)
            .slice(0, 10)
      set({ liveBets, isLoadingLiveBets: false });
    } catch (err: any) {
      set({ liveBetsError: err.message, isLoadingLiveBets: false });
    }
  },
}));
