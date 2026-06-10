import { createHash } from 'crypto';

import moment from 'moment';
import { availableNetworks } from '../constants/web3';
import { Network } from '../types/web3';
import { OddsType } from 'src/types/odd';

export const getRandomItemFromArray = (array: any[]) => {
  if (array.length === 0) {
    return null;
  }

  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
};

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const getUniqueKeys = (object: object) =>
  Array.from(new Set(Object.keys(object)));

export const getDaysFromPeriod = (period: string): number => {
  const unit = period.slice(-1);
  const value = parseInt(period.slice(0, -1), 10);

  switch (unit) {
    case 'D':
      return value;
    case 'W':
      return value * 7;
    case 'M':
      return value * 30;
    case 'Y':
      return value * 365;
    default:
      throw new Error('Invalid period format');
  }
};

export const getStartDateByType = (type: '1D' | '7D' | '30D' | '1Y'): Date => {
  switch (type) {
    case '1D': // Today
      return moment().startOf('day').toDate();

    case '7D': // First day of this week
      return moment().startOf('week').toDate();

    case '30D': // First day of this month
      return moment().startOf('month').toDate();

    case '1Y': // First day of this year
      return moment().startOf('year').toDate();

    default:
      throw new Error('Invalid type');
  }
};

export function getMinMaturity(): number {
  const now = Math.floor(Date.now() / 1000); // current time in seconds
  return now; // Return current time to show only future events
}

export function getSha256Hash(messages: string[]): string {
  const concatenatedMessages = messages.join(''); // Combine messages into a single string
  return createHash('sha256').update(concatenatedMessages).digest('hex'); // Return SHA-256 hash
}

export function convertOddsFormat(
  american: number,
  type: 'american' | 'decimal' | 'normalizedImplied' | 'polymarket',
): number {
  if (type === 'american') {
    return american;
  }

  let decimalOdds: number;
  if (type === 'polymarket') {
    decimalOdds = (american != 0) ? 1 / american : 0
    return parseFloat(decimalOdds.toFixed(2));
  }
  if (american > 0) {
    decimalOdds = american / 100 + 1;
  } else {
    decimalOdds = 1 + 100 / Math.abs(american);
  }

  if (type === 'decimal') {
    return parseFloat(decimalOdds.toFixed(2)); // Return Decimal Odds
  }

  // For 'normalized', calculate the implied probability as a percentage
  const impliedProbability = 1 / decimalOdds;
  return parseFloat(impliedProbability.toFixed(2)); // Return Normalized Odds (percentage)
}

export function generate31LengthHash(input: string): string {
  const hash = createHash('sha256');
  hash.update(input);
  const hashedString = hash.digest('hex'); // Default output format is hexadecimal
  return hashedString.slice(0, 31); // Get first 31 characters
}

export const getCorrectNetwork = (network: Network) =>
  network !== 10 && network !== 42161 ? 10 : network;

export const isSupportedNetwork = (network: Network) => {
  return availableNetworks.includes(network);
};

export const isAllowedCollateral = (collateral: string) => {
  const allowedTokens = ['sUSD', 'USDC', 'USDT', 'ETH'];
  return allowedTokens.includes(collateral);
};

export const fromWei = (value: bigint, decimals = 18) => {
  return (
    Number((BigInt(value) * BigInt(10 ** 6)) / BigInt(10 ** decimals)) / 10 ** 6
  );
};

export const normalizedToDecimal = (normalized: number): number => {
  return 1 / normalized;
};

export const normalizedToAmerican = (normalized: number): number => {
  const decimal = normalizedToDecimal(normalized);
  if (decimal >= 2) {
    return (decimal - 1) * 100;
  } else {
    return -100 / (decimal - 1);
  }
};

export const americanToNormalized = (american: number): number => {
  if (american > 0) {
    return 100 / (american + 100);
  } else {
    return -american / (-american + 100);
  }
};

export const extractPointFromOddName = (oddName: string) => {
  const match = oddName.match(/\d+(?:\.\d+)?$/);
  return match ? parseFloat(match[0]) : 0;
};

export const chunkArray = (array: any[], size: number) => {
  return Array.from({ length: Math.ceil(array.length / size) }, (_, i) =>
    array.slice(i * size, i * size + size),
  );
};

export function convertDecimalToAmerican(decimal: number): number {
  if (decimal < 1) {
    throw new Error('Decimal odds must be greater than 1.');
  }

  if (decimal === 1) {
    return -50000;
  }

  if (decimal > 2) {
    // For Decimal odds greater than 2
    return Math.round((decimal - 1) * 100);
  } else {
    // For Decimal odds less than or equal to 2
    return Math.round(-100 / (decimal - 1));
  }
}

export const decimalToNormalized = (decimal: number): number => {
  return 1 / decimal;
};

export const getTotalOddsForPropsOpticodds = (
  tickets: any[],
  oddsType: OddsType,
  boost: number = 100,
) => {
  const totalDecimalOdds = tickets.reduce(
    (acc, { odd: { price } }) => acc * convertOddsFormat(price, 'decimal'),
    1,
  );

  const boostedDecimalOdds = (totalDecimalOdds * boost) / 100;

  const boostedAmericanOdds = convertDecimalToAmerican(boostedDecimalOdds);
  const boostedNormalizedOdds = decimalToNormalized(boostedDecimalOdds);

  if (oddsType === 'american') return boostedAmericanOdds;
  else if (oddsType === 'decimal') return boostedDecimalOdds;
  else if (oddsType === 'normalizedImplied') return boostedNormalizedOdds;
  else return 0;
};
