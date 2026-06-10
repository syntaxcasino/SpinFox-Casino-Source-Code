import { OddsType } from '@/types/overtime';

export const isValidOdd = (odd: { price: number }) => odd.price >= -2900 && odd.price <= 2900;

export function convertOddsFormat(american: number, type: OddsType): number {
  if (type === 'american') {
    return american;
  }

  let decimalOdds: number;
  if (american > 0) {
    decimalOdds = american / 100 + 1;
  } else {
    decimalOdds = 1 + 100 / Math.abs(american);
  }

  if (type === 'decimal') {
    return parseFloat(decimalOdds.toFixed(2));
  }

  const impliedProbability = 1 / decimalOdds;
  return parseFloat(impliedProbability.toFixed(2));
}

export const getPoslihedOddValue = (value: number, oddType: OddsType) => {
  if (oddType == 'american') {
    if (value > 0) return '+' + Math.round(value).toString();
    else return Math.round(value).toString();
  } else if (oddType === 'decimal') {
    return value.toFixed(2);
  } else {
    return value.toFixed(2);
  }
};