/**
 * Calculate potential payout based on odds type
 * @param amount - Bet amount
 * @param odds - Odds value
 * @param oddsType - Type of odds ('decimal', 'normalizedImplied', or 'american')
 * @returns Potential payout including the original bet amount
 */
export function calculatePotentialPayout(
  amount: number,
  odds: number,
  oddsType: string = 'normalizedImplied'
): number {
  switch (oddsType) {
    case 'decimal':
      // For decimal odds: payout = amount * decimal odds
      // Example: $10 at 2.5 odds = $25 payout
      return amount * odds;

    case 'normalizedImplied':
      // For normalized implied odds: payout = amount / normalized odds
      // Example: $10 at 0.4 normalized odds = $25 payout
      // This is because normalizedImplied = 1 / decimal
      return amount / odds;

    case 'american':
      // For American odds:
      // Positive (+150): payout = amount * (1 + odds/100)
      // Negative (-200): payout = amount * (1 + 100/abs(odds))
      if (odds > 0) {
        return amount * (1 + odds / 100);
      } else {
        return amount * (1 + 100 / Math.abs(odds));
      }

    default:
      // Default to normalizedImplied for backward compatibility
      return amount / odds;
  }
}

/**
 * Convert between odds formats
 * @param odds - Odds value
 * @param fromType - Source odds type
 * @param toType - Target odds type
 * @returns Converted odds value
 */
export function convertOdds(
  odds: number,
  fromType: string,
  toType: string
): number {
  // First convert to decimal as intermediate format
  let decimalOdds: number;

  switch (fromType) {
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

  // Then convert from decimal to target format
  switch (toType) {
    case 'decimal':
      return decimalOdds;
    case 'normalizedImplied':
      return 1 / decimalOdds;
    case 'american':
      if (decimalOdds >= 2) {
        return (decimalOdds - 1) * 100;
      } else {
        return -100 / (decimalOdds - 1);
      }
    default:
      return 1 / decimalOdds; // Default to normalizedImplied
  }
}

