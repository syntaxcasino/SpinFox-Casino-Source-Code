import { OddsFormat } from "@/store/oddsPreference";

export interface OddsData {
  american: number;
  decimal: number;
  normalizedImplied: number;
}

export const formatOdds = (
  odds: OddsData | number, 
  format: OddsFormat, 
  sourceFormat: OddsFormat = 'normalizedImplied'
): string => {
  console.log(typeof odds, format);
  
  // Handle if odds is just a number
  if (typeof odds === 'number') {
    // If source and target formats are the same, just return the value
    if (sourceFormat === format) {
      return odds.toFixed(2);
    }

    // Convert to decimal as intermediate format
    let decimalOdds: number;
    
    switch (sourceFormat) {
      case 'decimal':
        decimalOdds = odds;
        break;
      case 'normalizedImplied':
        decimalOdds = 1 / odds;
        break;
      case 'american':
        if (odds > 0) {
          decimalOdds = 1 + odds / 100;
        } else {
          decimalOdds = 1 + 100 / Math.abs(odds);
        }
        break;
      default:
        decimalOdds = 1 / odds; // Default to normalizedImplied
    }

    // Convert from decimal to target format
    switch (format) {
      case 'decimal':
        return decimalOdds.toFixed(2);
      case 'normalizedImplied':
        return (1 / decimalOdds).toFixed(2);
      case 'american':
        const american = decimalOdds >= 2 
          ? (decimalOdds - 1) * 100 
          : -100 / (decimalOdds - 1);
        return american >= 0 ? `+${american.toFixed(2)}` : american.toFixed(2);
      default:
        return decimalOdds.toFixed(2);
    }
  }

  // Handle OddsData object
  switch (format) {
    case 'american':
      return odds.american >= 0 ? `+${odds.american.toFixed(2)}` : `${odds.american.toFixed(2)}`;
    case 'decimal':
      return odds.decimal.toFixed(2);
    case 'normalizedImplied':
      return odds.normalizedImplied.toFixed(2);
    default:
      return odds.decimal.toFixed(2);
  }
};

export const getOddsFormatLabel = (format: OddsFormat): string => {
  switch (format) {
    case 'american':
      return 'American';
    case 'decimal':
      return 'Decimal';
    case 'normalizedImplied':
      return 'Normalized';
    default:
      return 'Decimal';
  }
};

export const getOddsFormatDescription = (format: OddsFormat): string => {
  switch (format) {
    case 'american':
      return 'Displays odds in American format (+150, -200)';
    case 'decimal':
      return 'Displays odds in decimal format (2.50, 1.50)';
    case 'normalizedImplied':
      return 'Displays normalized implied odds';
    default:
      return 'Displays odds in decimal format';
  }
};

