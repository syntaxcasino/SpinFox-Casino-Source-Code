
import { create } from "zustand";
import { SportsAPI } from "@/lib/api/sports";
import { AxiosResponse } from "axios";
import { Sport } from "@/types/overtime-v2";

type AllSportsData = Record<number, Sport>;

type AllSportsState = {
  allSports: AllSportsData;
  isLoadingAllSports: boolean;
  allSportsError: string | null;
  fetchAllSports: () => Promise<void>;
};

export const useAllSportsStore = create<AllSportsState>((set) => ({
  allSports: {},
  isLoadingAllSports: false,
  allSportsError: null,
  fetchAllSports: async () => {
    set({ isLoadingAllSports: true, allSportsError: null });
    try {
      const response: AxiosResponse<AllSportsData> = await SportsAPI.get<Record<number, Sport>>(
        `/sports/sports`
      );
      const allSports: AllSportsData = response.data;
      set({ allSports, isLoadingAllSports: false });
    } catch (err: any) {
      set({ allSportsError: err.message, isLoadingAllSports: false });
    }
  },
}));
