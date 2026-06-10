import { CombinedPosition, Market, StatusEnum, GameMarket } from "@/types/overtime-v2";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type SelectedTicket = {
  gameId: string;
  sportId: number; // use subLeagueId field from API for sportId
  typeId: number;
  maturity: number;
  status: StatusEnum;
  line?: number;
  playerId: number;
  odds: number; // use normalizedImplied odds field from API for odds
  merkleProof: string[]; // use proof from API for merkleProof
  position: number; // 0 = home/over, 1 = away/under, 2 = draw
  combinedPositions: CombinedPosition[][];
  live: boolean;
  homeTeam: string;
  awayTeam: string;
  tournamentName?: string;
  positionLabel: string; // e.g., "Home", "Away", "Draw", "Over", "Under"
  marketType?: string; // e.g., "Winner", "Totals", "Handicap"
};

type BetSlipState = {
  showBetSlip: boolean;
  isCollapsed: boolean;
  selectedTickets: SelectedTicket[];
  setShowBetSlip: (show: boolean) => void;
  setIsCollapsed: (collapsed: boolean) => void;
  toggleCollapsed: () => void;
  addTicket: (ticket: SelectedTicket) => void;
  removeTicket: (gameId: string) => void;
  removeTicketByMarket: (gameId: string, typeId: number, line?: number) => void;
  clearAllTickets: () => void;
  hasTicket: (gameId: string) => boolean;
};

export const useBetSlipStore = create<BetSlipState>()(
  persist(
    (set, get) => ({
      showBetSlip: true,
      isCollapsed: false,
      selectedTickets: [],

      setShowBetSlip: (show) => set({ showBetSlip: show }),

      setIsCollapsed: (collapsed) => set({ isCollapsed: collapsed }),

      toggleCollapsed: () => set((state) => ({ isCollapsed: !state.isCollapsed })),

      addTicket: (ticket) =>
        set((state) => {
          // Create unique market identifier (gameId + typeId + line)
          const marketKey = `${ticket.gameId}-${ticket.typeId}-${ticket.line || 0}`;
          
          // Check if this exact market already exists
          const existingIndex = state.selectedTickets.findIndex(
            (t) => `${t.gameId}-${t.typeId}-${t.line || 0}` === marketKey
          );

          if (existingIndex !== -1) {
            // Replace existing ticket with new one (allows changing position)
            const updatedTickets = [...state.selectedTickets];
            updatedTickets[existingIndex] = ticket;
            return { selectedTickets: updatedTickets };
          }

          // Add new ticket
          return { selectedTickets: [...state.selectedTickets, ticket] };
        }),

      removeTicket: (gameId) =>
        set((state) => ({
          selectedTickets: state.selectedTickets.filter((t) => t.gameId !== gameId),
        })),

      removeTicketByMarket: (gameId, typeId, line) =>
        set((state) => ({
          selectedTickets: state.selectedTickets.filter(
            (t) => !(t.gameId === gameId && t.typeId === typeId && t.line === line)
          ),
        })),

      clearAllTickets: () => set({ selectedTickets: [] }),

      hasTicket: (gameId) => {
        const state = get();
        return state.selectedTickets.some((t) => t.gameId === gameId);
      },
    }),
    {
      name: "betslip-storage",
      partialize: (state) => ({
        selectedTickets: state.selectedTickets,
        isCollapsed: state.isCollapsed,
      }),
    }
  )
);
