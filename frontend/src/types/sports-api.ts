import { Network } from "./overtime";

export interface ITeam {
  id: string;
  name: string;
  abbreviation: string;
  logo: string;
}

export interface IFixture {
  id: string;
  gameId: string;
  maturityDate: string;
  home: ITeam;
  away: ITeam;
  sport: string;
  league: string;
}

export interface ILiveFixture extends IFixture {
  gameClock: string;
  gamePeriod: string;
  homeScore: number;
  awayScore: number;
  homeScoreByPeriod: Record<string, number>;
  awayScoreByPeriod: Record<string, number>;
}

export interface IFixturesResponse {
  data: IFixture[];
}

export interface IFixtureTeamPlayerResponse {
  data: IFixtureTeamPlayer;
  message?: string;
}

export interface IFixtureTeamPlayer {
  fixture: IFixture;
  odds: IPlayerOdd[];
  players: {
    home: IPlayer[];
    away: IPlayer[];
  };
}

export interface IPlayer {
  id: string;
  name: string;
  position: string;
  logo: string;
  team: ITeam;
  odds?: IPlayerOdd[];
}

export interface IPlayerOdd {
  id: string;
  line: string;
  marketId: string;
  market: string;
  price: number;
  points: number;
  name: string;
  isMain?: boolean;
  selectionLine?: string | null;
  teamId?: string | null;
}

export interface IPlayerOddItem {
  title: string;
  lines: {
    id: string;
    price: number;
    points: number;
    line: string;
  }[];
}

export interface IPropsTicket {
  fixture: IFixture;
  player: IPlayer | null;
  odd: IPlayerOdd;
}

export interface IPropsMarket {
  fixture: IFixture;
  odds: IPlayerOdd[];
}

export interface ILivePropsMarket {
  fixture: ILiveFixture;
  odds: IPlayerOdd[];
}

export interface IQuote {
  maxBet: number;
}

export interface ISignBetData {
  signature: string;
  userBetId: string;
  betAmount: number;
  totalDecimalOdds: number;
  profit: number;
  deadline: number;
}
export interface ISignBetDataResponse {
  data?: ISignBetData;
  result: boolean;
  message: string;
}

export enum PropsOddResult {
  Pending = 0,
  Lost = 1,
  Win = 2,
  Cancelled = 3,
}

export type PropDataForHistory = {
  id: number;
  api: string;
  sport: string;
  league: string;
  fixtureId: string;
  playerId: string;
  oddId: string;
  oddMarket: string;
  oddName: string;
  maturityDate: string;
  result: PropsOddResult;
  home: string;
  away: string;
  createdAt: string;
  updatedAt: string;
  decimalOdd: number;
  actualPoint: number;
  predictPoint: number;
};

export interface IPropsUserBetHistoryTicket {
  id: number;
  collateral: string;
  userBetId: string;
  parlayBetId: string;
  maturityDate: string;
  betAmount: number;
  profit: number;
  totalDecimalOdds: number;
  network: Network;
  userAddress: string;
  claimed: boolean;
  status: PropsOddResult;
  txHash: string;
  ipfsHash: string;
  isBoostBet: boolean;
  isBonusBet: boolean;
  createdAt: string;
  props: PropDataForHistory[];
}

export interface ILiveTicket extends IPropsUserBetHistoryTicket {
  username: string;
  betType: "AI_AGENT" | "COPY_TRADER" | "GENERAL" | "AI_INSIGHTS";
  updatedAt: string;
}

export interface IPropsTicketsHistory {
  open: IPropsUserBetHistoryTicket[];
  claimable: IPropsUserBetHistoryTicket[];
  won: IPropsUserBetHistoryTicket[];
  lost: IPropsUserBetHistoryTicket[];
}

interface IInPlayData {
  period: string | null;
  clock: string | null;
}

interface ITeamScore {
  total: number | null;
  periods?: Record<string, any> | null;
}

export interface ILiveScore {
  fixtureId: string;
  home: ITeamScore;
  away: ITeamScore;
  in_play_data: IInPlayData | null;
}
