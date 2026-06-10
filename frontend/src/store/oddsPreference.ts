import { create } from "zustand";
import { persist } from "zustand/middleware";

export type OddsFormat = 'decimal' | 'american' | 'normalizedImplied';

type OddsPreferenceState = {
  oddsFormat: OddsFormat;
  setOddsFormat: (format: OddsFormat) => void;
};

export const useOddsPreferenceStore = create<OddsPreferenceState>()(
  persist(
    (set) => ({
      oddsFormat: 'decimal',
      setOddsFormat: (format) => set({ oddsFormat: format }),
    }),
    {
      name: "odds-preference-storage",
    }
  )
);

