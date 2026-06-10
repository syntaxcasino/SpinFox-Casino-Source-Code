import { Network } from './web3';

export type Sport = {
  sport: string;
  id: number;
  label: string;
  opticOddsName: string;
  provider: 'rundown' | 'enetpulse';
  scoringType: 'points' | 'goals' | 'rounds' | 'sets' | '<empty>';
  matchResolveType: 'overtime' | 'regular' | '<empty>';
  periodType:
    | 'quarter'
    | 'half'
    | 'period'
    | 'round'
    | 'inning'
    | 'set'
    | '<empty>';
  isDrawAvailable: boolean;
  live: boolean;
  isLiveTestnet: boolean;
};

export type MarketType = {
  id: number;
  key: string;
  name: string;
  resultType: number;
  tooltipKey?: string;
};

export type Collateral = {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  default: boolean;
};

enum StatusEnum {
  OPEN = 0,
  PAUSED = 1,
  RESOLVED = 10,
  CANCELLED = 255,
}

export enum StatusCodeEnum {
  OPEN = 'open',
  PAUSED = 'paused',
  RESOLVED = 'resolved',
  CANCELLED = 'cancelled',
  ONGOING = 'ongoing',
}

// Player Props
type PlayerProps = {
  playerId: number;
  playerName: string;
  playerScore?: number;
};

// Combined Position
type CombinedPosition = {
  typeId: number;
  position: number;
  line: number;
};

// Odds
type Odds = {
  american: number;
  decimal: number;
  normalizedImplied: number;
};

// Market
export type Market = {
  gameId: string;
  sport: string;
  leagueId: number;
  leagueName: string;
  subLeagueId: number;
  typeId: number;
  type: string;
  line?: number;
  maturity: number;
  maturityDate: string;
  homeTeam: string;
  awayTeam: string;
  status: StatusEnum;
  isOpen: boolean;
  isResolved: boolean;
  isCancelled: boolean;
  isPaused: boolean;
  isOneSideMarket: boolean;
  isPlayerPropsMarket: boolean;
  isOneSidePlayerPropsMarket: boolean;
  isYesNoPlayerPropsMarket: boolean;
  playerProps: PlayerProps;
  combinedPositions: CombinedPosition[][];
  odds: Odds[];
  proof: string[];
  childMarkets?: Market[];
  statusCode: StatusCodeEnum;
  positionNames?: string[];
};

export type LiveMarket = Market & {
  homeScore: number;
  awayScore: number;
  gameClock: number;
  gamePeriod: string;
  homeScoreByPeriod: number[];
  awayScoreByPeriod: number[];
};

export type LiveMarkets = {
  markets: LiveMarket[];
  errors: string[];
};

export type TicketMarket = {
  gameId: string;
  sport: string;
  leagueId: number;
  leagueName: string;
  subLeagueId: number;
  typeId: number;
  type: string;
  line?: number;
  maturity: number;
  maturityDate: string;
  homeTeam: string;
  awayTeam: string;
  isOpen: boolean;
  isResolved: boolean;
  isCancelled: boolean;
  isWinning: boolean;
  isOneSideMarket: boolean;
  isPlayerPropsMarket: boolean;
  isOneSidePlayerPropsMarket: boolean;
  isYesNoPlayerPropsMarket: boolean;
  playerProps: PlayerProps;
  selectedCombinedPositions: CombinedPosition[];
  position: number;
  positionName?: string;
  odd: Odds;
  positionNames?: string[];
  gameStatus: string;
  isGameFinished: boolean;
  homeScore?: number | string;
  awayScore?: number | string;
  homeScoreByPeriod: number[];
  awayScoreByPeriod: number[];
};

export type Ticket = {
  id: string;
  timestamp: number;
  collateral: string;
  account: string;
  buyInAmount: number;
  fees: number;
  totalQuote: number;
  payout: number;
  numOfMarkets: number;
  expiry: number;
  isResolved: boolean;
  isPaused: boolean;
  isCancelled: boolean;
  isLost: boolean;
  isUserTheWinner: boolean;
  isExercisable: boolean;
  isClaimable: boolean;
  isOpen: boolean;
  finalPayout: number;
  isLive: boolean;
  isFreeBet?: boolean;
  sportMarkets: TicketMarket[];
};

export type UserHistory = {
  open: Ticket[];
  claimable: Ticket[];
  closed: Ticket[];
};

export type TradeData = {
  gameId: string;
  sportId: number; // subLeagueId from Market
  typeId: number;
  maturity: number;
  status: StatusEnum;
  line?: number;
  playerId: number;
  odds: number[] | string[] | bigint[]; // normalized implied odds from Market
  merkleProof: string[]; // proof from Market
  position: number;
  combinedPositions: CombinedPosition[][];
  live: boolean; // Always false. The quote endpoint is not used for live markets.
};

export type QuoteRequest = {
  buyInAmount: number;
  tradeData: TradeData[];
  collateral?: string;
};

type PayoutData = {
  THALES?: number;
  ETH?: number;
  WETH?: number;
  usd: number;
  payoutCollateral: 'THALES' | 'ETH' | 'WETH';
};

type ProfitData = {
  THALES?: number;
  ETH?: number;
  WETH?: number;
  usd: number;
  percentage: number;
};

type LiquidityData = {
  ticketLiquidityInUsd: number;
};

type QuoteData = {
  totalQuote?: Odds;
  payout?: PayoutData;
  potentialProfit?: ProfitData;
  buyInAmountInUsd?: number;
  error?: string;
};

export type Quote = {
  quoteData: QuoteData;
  liquidityData: LiquidityData;
};

type TeamInfo = {
  name: string;
  isHome: boolean;
  score: number;
  scoreByPeriod: number[];
};

export type GameInfo = {
  lastUpdate: number;
  gameStatus: string;
  isGameFinished: boolean;
  tournamentName?: string;
  tournamentRound?: string;
  teams: TeamInfo[];
};

export type PlayerInfo = {
  playerName: string;
};

export type LiveScore = {
  period: number;
  gameStatus: string;
  displayClock: string;
  homeScore: number;
  awayScore: number;
  homeScoreByPeriod: number[];
  awayScoreByPeriod: number[];
};

export type MarketData = { [sport: string]: { [leagueId: string]: Market[] } };

export enum Field {
  Left = 0,
  Right = 1,
  Middle = 2,
  Home = Left,
  Away = Right,
  Draw = Middle,
  X = Draw,
  Over = Left,
  Under = Right,
}

export interface TicketData {
  market: Market;
  field: Field;
  paid?: number;
}

export interface ExtendedTicket extends Ticket {
  wallet: string;
  networkId: Network;
}
