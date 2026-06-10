import axios from 'axios';
import { ethers } from 'ethers';
import { NewSportsGambitABI, SportsGambitABI } from 'src/abis';
import {
  NEW_CONTRACT_ADDRESS,
  NetworksForGambit,
  OldSportsGambitContracts,
  SportsGambitContracts,
} from 'src/constants/web3';
import { X_API_KEY } from 'src/constants/config';
import {
  Collateral,
  ExtendedTicket,
  GameInfo,
  LiveMarkets,
  LiveScore,
  Market,
  MarketData,
  MarketType,
  PlayerInfo,
  Quote,
  QuoteRequest,
  Sport,
  Ticket,
  UserHistory,
} from 'src/types/overtime';
import { Network } from 'src/types/web3';
import { sleep } from 'src/utils/general';
import {
  isAwayTeamMarket,
  isCorrectScoreMarkets,
  isDoubleChanceMarket,
  isEndingMethodMarket,
  isExactTotalMarkets,
  isHalfPeriodMarket,
  isHomeTeamMarket,
  isMethodOfVictoryMarket,
  isOddEvenMarket,
  isOverUnderMarket,
  isPlayerOverUnderMarket,
  isPlayersMarket,
  isQuarterPeriodMarket,
  isSpreadMarkets,
  isTeamMarket,
  isTeamMarketWithDraw,
  isWinningRoundMarket,
  isYesNoMarket,
} from 'src/utils/marketTypes';

import { NotFoundException } from '@nestjs/common';

const V2_API_URL = 'https://api.overtime.io/overtime-v2';

export const fetchUngroupedMarkets = async (networkId: Network) => {
  try {
    const res = await axios.get<Market[]>(
      `${V2_API_URL}/networks/${networkId}/markets/?status=open&ungroup=true&minMaturity=${Date.now() / 1000
      }`,
    );
    return res.data;
  } catch (err) {
    throw err;
  }
};

const fetchWithRetry = async (
  url: string,
  maxRetries: number = 5,
  delay: number = 1000,
) => {
  let attempts = 0;
  while (attempts < maxRetries) {
    try {
      console.log("api key", X_API_KEY);
      const response = await axios.get(url, {
        headers: {
          'x-api-key': X_API_KEY,
        },
      });
      return response.data;
    } catch (err) {
      attempts++;
      if (attempts === maxRetries) throw err;
      await sleep(delay);
    }
  }
};

export const fetchSportsWithRetry = async () => {
  try {
    const res: {
      [id: string]: Sport;
    } = await fetchWithRetry(`${V2_API_URL}/sports`);
    return res;
  } catch (err) {
    console.error('Failed to fetch sports:', err);
    throw err;
  }
};

export const fetchMarketTypesWithRetry = async () => {
  try {
    const res: {
      [id: string]: MarketType;
    } = await fetchWithRetry(`${V2_API_URL}/market-types`);
    return res;
  } catch (err) {
    console.error('Failed to fetch market types:', err);
    throw err;
  }
};

export const fetchMarketsWithRetry = async (networkId: number = 10) => {
  try {
    const res: {
      [sport: string]: { [leagueId: string]: Market[] };
    } = await fetchWithRetry(`${V2_API_URL}/networks/${networkId}/markets`);
    return res;
  } catch (err) {
    console.error('Failed to fetch markets:', err);
    throw err;
  }
};

export const fetchSports = async () => {
  try {
    const res = await axios.get<{
      [id: string]: Sport;
    }>(`${V2_API_URL}/sports`);
    return res.data;
  } catch (err) {
    console.error(err);
  }
};

export const fetchMarketTypes = async () => {
  try {
    const res = await axios.get<{
      [id: string]: MarketType;
    }>(`${V2_API_URL}/market-types`);
    return res.data;
  } catch (err) {
    console.error(err);
  }
};

export const fetchCollaterals = async (networkId: number = 10) => {
  try {
    const res = await axios.get<Collateral[]>(
      `${V2_API_URL}/networks/${networkId}/collaterals`,
    );
    return res.data;
  } catch (err) {
    console.error(err);
  }
};

export const fetchMarkets = async (networkId: number = 10) => {
  try {
    const res = await axios.get<MarketData>(
      `${V2_API_URL}/networks/${networkId}/markets`,
    );
    return res.data;
  } catch (err) {
    console.error(err);
  }
};

export const fetchMarketByGameId = async (
  networkId: number = 10,
  gameId: string,
) => {
  try {
    const res = await axios.get<Market>(
      `${V2_API_URL}/networks/${networkId}/markets/${gameId}`,
    );
    return res.data;
  } catch (err) {
    console.error(err);
  }
};

export const fetchLiveMarkets = async (networkId: number = 10) => {
  try {
    const res = await axios.get<LiveMarkets>(
      `${V2_API_URL}/networks/${networkId}/live-markets/`,
    );
    return res.data;
  } catch (err) {
    console.error(err);
  }
};

export const fetchUserHistory = async (
  networkId: number = 10,
  userAddress: string,
) => {
  let attempts = 0;
  const maxRetries = 3;

  while (attempts < maxRetries) {
    try {
      const res = await axios.get<UserHistory>(
        `${V2_API_URL}/networks/${networkId}/users/${userAddress}/history`,
      );
      return res.data;
    } catch (err) {
      attempts++;
      await sleep(1000);
    }
  }

  throw new Error('Failed to fetch user history after retries');
};

export const fetchQuote = async (
  networkId: number = 10,
  data: QuoteRequest,
) => {
  try {
    const res = await axios.post<Quote>(
      `${V2_API_URL}/networks/${networkId}/quote`,
      data,
    );
    return res.data;
  } catch (err) {
    console.error(err);
  }
};

export const fetchGamesInfo = async () => {
  try {
    const res = await axios.get<{ [gameId: string]: GameInfo }>(
      `${V2_API_URL}/games-info`,
    );
    return res.data;
  } catch (err) {
    console.error(err);
  }
};

export const fetchGameInfo = async (gameId: string) => {
  try {
    const res = await axios.get<GameInfo>(`${V2_API_URL}/games-info/${gameId}`);
    return res.data;
  } catch (err) {
    console.error(err);
  }
};

export const fetchAllGameInfo = async () => {
  try {
    const res = await axios.get<GameInfo[]>(`${V2_API_URL}/games-info`);
    return res.data;
  } catch (err) {
    console.error(err);
  }
};

export const fetchPlayersInfo = async () => {
  try {
    const res = await axios.get<{ [playerId: string]: PlayerInfo }>(
      `${V2_API_URL}/players-info`,
    );
    return res.data;
  } catch (err) {
    console.error(err);
  }
};

export const fetchPlayerInfo = async (playerId: string) => {
  try {
    const res = await axios.get<PlayerInfo>(
      `${V2_API_URL}/players-info/${playerId}`,
    );
    return res.data;
  } catch (err) {
    console.error(err);
  }
};

export const fetchLiveScores = async () => {
  try {
    const res = await axios.get<{ [liveScoreId: string]: LiveScore }>(
      `${V2_API_URL}/live-scores`,
    );
    return res.data;
  } catch (err) {
    console.error(err);
  }
};

export const fetchLiveScore = async (liveScoreId: string) => {
  try {
    const res = await axios.get<LiveScore>(
      `${V2_API_URL}/live-scores/${liveScoreId}`,
    );
    return res.data;
  } catch (err) {
    console.error(err);
  }
};

export const getUserTickets = async (
  networkId: Network,
  userAddress: string,
) => {
  try {
    if (!NetworksForGambit[networkId]) {
      throw new NotFoundException(
        `For now, we are not supporting Network id ${networkId}.`,
      );
    }
    const provider = new ethers.providers.JsonRpcProvider(
      NetworksForGambit[networkId].rpcUrl,
    );
    console.log(provider);
    const contract = new ethers.Contract(
      SportsGambitContracts[networkId],
      NewSportsGambitABI,
      provider,
    );

    const result = await contract.getUserKeys(userAddress);

    return result;
  } catch (err) {
    console.error('Error fetching user tickets:', err);
    return { status: 'error' };
  }
};

export const getUserTicketsFromContracts = async (
  networkId: Network,
  userAddress: string,
  ContractAddress: string,
) => {
  try {
    if (!NetworksForGambit[networkId]) {
      throw new NotFoundException(
        `For now, we are not supporting Network id ${networkId}.`,
      );
    }
    const provider = new ethers.providers.JsonRpcProvider(
      NetworksForGambit[networkId].rpcUrl,
    );

    const contract = new ethers.Contract(
      ContractAddress,
      SportsGambitABI,
      provider,
    );

    const result = await contract.getUserKeys(userAddress);
    console.log('getUserTicketsResult', result);
    return result;
  } catch (err) {
    console.error('Error fetching user tickets:', err);
    return { status: 'error' };
  }
};

export const getOldUserTickets = async (
  networkId: Network,
  userAddress: string,
) => {
  try {
    if (!NetworksForGambit[networkId]) {
      throw new NotFoundException(
        `For now, we are not supporting Network id ${networkId}.`,
      );
    }
    const provider = new ethers.providers.JsonRpcProvider(
      NetworksForGambit[networkId].rpcUrl,
    );
    console.log(provider);
    const contract = new ethers.Contract(
      OldSportsGambitContracts[networkId],
      SportsGambitABI,
      provider,
    );

    const result = await contract.getUserKeys(userAddress);

    return result;
  } catch (err) {
    console.error('Error fetching user tickets:', err);
    return { status: 'error' };
  }
};

export const bytes32ToAddress = (bytes32: string): string => {
  if (!/^0x[0-9a-fA-F]{64}$/.test(bytes32)) {
    throw new Error('Invalid bytes32 format');
  }

  const bytes32Clean = bytes32.slice(2);

  const address = '0x' + bytes32Clean.slice(-40);

  return address;
};

export const filterTicket = (
  tickets: Ticket[],
  criteria: { ticketId: string; wallet: string; networkId: number }[],
): ExtendedTicket[] => {
  const userTickets = criteria.flatMap(({ ticketId, wallet, networkId }) => {
    const found = tickets.find(
      (t) => t.id.toLowerCase() === ticketId.toLowerCase(),
    );
    if (!found) return []; // skip if not found
    return [{ ...found, wallet, networkId }];
  });

  return userTickets;
};

export const getTicketInfo = async (
  networkId: Network,
  transactionHash: string,
  maxRetries = 3,
) => {
  const rpcUrls = NetworksForGambit[networkId].rpcUrls;
  for (let i = 0; i < rpcUrls.length; i++) {
    const currentRpcUrl = rpcUrls[i];
    const provider = new ethers.providers.JsonRpcProvider(currentRpcUrl);

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const iface = new ethers.utils.Interface(NewSportsGambitABI);
        const txReceipt = await provider.getTransactionReceipt(transactionHash);

        if (!txReceipt) throw new Error('Invalid transaction receipt');

        const events = txReceipt.logs
          .map((log) => {
            try {
              return iface.parseLog(log);
            } catch (error) {
              return null; // Not matching this event
            }
          })
          .filter((event) => event !== null);

        if (events.length === 0) throw new Error('No events found');

        return {
          wallet: events[0].args[0],
          contract: NEW_CONTRACT_ADDRESS[networkId],
          ticketId: bytes32ToAddress(events[0].args[2]),
          txHash: transactionHash,
        };
      } catch (error) {
        console.error(
          `Attempt ${attempt + 1} failed using RPC URL: ${currentRpcUrl}`,
          error,
        );
        if (attempt === maxRetries - 1) {
          console.error(
            `All attempts failed using RPC URL: ${currentRpcUrl}. Switching to next URL.`,
          );
        }
        await sleep(1000);
      }
    }
  }

  throw new Error(
    'Failed to retrieve data after exhausting all RPC providers.',
  );
};

export const getMarketName = (
  market: Market,
  marketTypes: { [typeId: string]: MarketType },
  position: number,
  sports: {
    [id: string]: Sport;
  },
  omit?: ('Over' | 'PlayerName')[],
) => {
  if (!market || !marketTypes || Object.values(marketTypes).length === 0)
    return '';
  const {
    typeId,
    homeTeam,
    awayTeam,
    leagueId,
    playerProps: { playerName },
  } = market;
  const { name, key } = marketTypes[typeId];
  let title = name;
  if (isHalfPeriodMarket(typeId)) {
    title += ` Half`;
  } else if (isQuarterPeriodMarket(typeId)) {
    title += ` ${sports[leagueId].periodType[0].toUpperCase() + sports[leagueId].periodType.slice(1)}`;
  }
  if (isHomeTeamMarket(typeId)) {
    title += ` (${homeTeam})`;
  }
  if (isAwayTeamMarket(typeId)) {
    title += ` (${awayTeam})`;
  }
  if (
    (!omit || !omit.includes('Over')) &&
    isOverUnderMarket(typeId) &&
    market.odds.length > 1
  ) {
    title += position === 0 ? ' - Over' : ' - Under';
  }
  if (isSpreadMarkets(typeId)) {
    title += position === 0 ? ` - ${homeTeam}` : ` - ${awayTeam}`;
  }
  if (isPlayerOverUnderMarket(typeId) || isPlayersMarket(typeId)) {
    title += ` - ${playerName}`;
  }

  if (title.includes('Handicap')) {
    title = title.replace('Handicap', 'Spread');
  }

  if (key === 'winner2') {
    title = title.replace('Winner', 'Winner 3-Way (60 Min)');
  }

  return title;
};

export const getPositionName = (
  market: Market,
  position: number,
  showOverUnder: boolean = false,
) => {
  const {
    type,
    homeTeam,
    awayTeam,
    line,
    leagueId,
    positionNames,
    typeId,
    playerProps,
    odds,
  } = market;

  const combinedPositions = (market as any).combinedPositions ?? [];
  const selectedCombinedPositions =
    (market as any).selectedCombinedPositions ?? [];

  const cp =
    combinedPositions.length > 0 &&
      position < combinedPositions.length &&
      combinedPositions[position].length > 0
      ? combinedPositions[position]
      : selectedCombinedPositions.length > 0
        ? selectedCombinedPositions
        : null;

  if (cp) {
    if (type === 'winnerTotal') {
      const winnerMarket = cp[0];
      const totalMarket = cp[1];
      return `${winnerMarket.position === 0 ? homeTeam : awayTeam} & ${totalMarket.position === 0 ? 'Over' : 'Under'} ${totalMarket.line
        }`;
    }

    const first = cp[0].position;
    const second = cp[1].position;

    return `${first === 0 ? homeTeam : first === 1 ? awayTeam : 'Draw'} / ${second === 0 ? homeTeam : second === 1 ? awayTeam : 'Draw'
      }`;
  }

  let homeTitle = (line ?? 0).toString();
  let awayTitle = (line ?? 0).toString();
  let drawTitle = '';

  if (positionNames && positionNames.length > 0) {
    if (leagueId === 20000) {
      return positionNames[position].includes('_')
        ? positionNames[position]
          .split('_')[1]
          .replace(/^\w/, (c) => c.toUpperCase())
        : positionNames[position];
    }
    if (isExactTotalMarkets(typeId)) {
      const temp = positionNames[position].split('_');
      return temp[temp.length - 1];
    }
    if (isCorrectScoreMarkets(typeId)) {
      const positionName = positionNames[position]
        .split('_')
        .slice(0, -2)
        .join(' ');
      const score = positionNames[position].split('_').slice(-2).join(':');
      if (positionName === homeTeam.toLowerCase()) {
        return `Home ${score}`;
      } else if (positionName === awayTeam.toLowerCase()) {
        return `Away ${score}`;
      } else {
        return `Draw ${score}`;
      }
    }
    return positionNames[position]
      .split('_')
      .map((w) => w.replace(/^\w/, (c) => c.toUpperCase()))
      .join(' ');
  } else {
    if (isSpreadMarkets(typeId)) {
      awayTitle = (-1 * (line ?? 0)).toString();
    } else if (isDoubleChanceMarket(typeId)) {
      homeTitle = '1X';
      awayTitle = '12';
      drawTitle = 'X2';
    } else if (isYesNoMarket(typeId)) {
      homeTitle = 'Yes';
      awayTitle = 'No';
    } else if (isPlayerOverUnderMarket(typeId)) {
      if (odds && odds.length === 1) {
        homeTitle = `${homeTitle}+`;
      }
    } else if (isTeamMarket(typeId)) {
      homeTitle = homeTeam;
      awayTitle = awayTeam;
    } else if (isOddEvenMarket(typeId)) {
      homeTitle = 'Odd';
      awayTitle = 'Even';
    } else if (isPlayersMarket(typeId)) {
      if (!Array.isArray(playerProps)) {
        return playerProps.playerName;
      }
    } else if (isMethodOfVictoryMarket(typeId)) {
      const methods = [
        'Draw',
        `${homeTeam} (Decision)`,
        `${homeTeam} (KO/TKO/DQ)`,
        `${homeTeam} (Submission)`,
        `${awayTeam} (Decision)`,
        `${awayTeam} (KO/TKO/DQ)`,
        `${awayTeam} (Submission)`,
      ];
      return methods[position];
    } else if (isWinningRoundMarket(typeId)) {
      const methods = [
        'Draw',
        `By Decision`,
        `Round 1`,
        `Round 2`,
        `Round 3`,
        `Round 4`,
        `Round 5`,
      ];
      return methods[position];
    } else if (isEndingMethodMarket(typeId)) {
      const methods = ['Draw', `By Decision`, `KO/TKO/DQ`, `Submission`];
      return methods[position];
    } else if (isTeamMarketWithDraw(typeId)) {
      homeTitle = homeTeam;
      awayTitle = awayTeam;
      drawTitle = 'Draw';
    } else if (showOverUnder && isOverUnderMarket(typeId)) {
      homeTitle = `Over ${homeTitle}`;
      awayTitle = `Under ${awayTitle}`;
    }
  }

  if (position === 1) {
    return awayTitle;
  } else if (position === 2) {
    return drawTitle;
  } else {
    return homeTitle;
  }
};

export const findMatchingMarket = (
  gameId: string,
  typeId: number,
  line: number | undefined,
  playerId: number,
  markets: Market[],
): Market | undefined => {
  if (markets.length === 0) {
    return;
  }

  const matchingMarket = markets.find((market) => market.gameId === gameId);

  if (!matchingMarket) return;

  if (
    matchingMarket.typeId === typeId &&
    (!line || matchingMarket.line === line)
  ) {
    return matchingMarket;
  }

  const childMarket = matchingMarket.childMarkets?.find(
    ({ typeId: cTypeId, line: cLine, playerProps: { playerId: cPlayerId } }) =>
      cTypeId === typeId &&
      (!line || line === cLine) &&
      (!(isPlayerOverUnderMarket(typeId) || isPlayersMarket(typeId)) ||
        playerId === cPlayerId),
  );

  return childMarket;
};
