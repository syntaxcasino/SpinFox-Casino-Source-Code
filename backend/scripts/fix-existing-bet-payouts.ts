/**
 * Script to fix potential payout for existing bets
 * Run this script once to update all existing bets with correct potential payout
 * 
 * Usage: ts-node scripts/fix-existing-bet-payouts.ts
 */

import { DataSource } from 'typeorm';
import { SportsBet } from '../src/sports/entities/sports-bet.entity';

// Calculate potential payout based on odds type
function calculatePotentialPayout(
  amount: number,
  odds: number,
  oddsType: string = 'normalizedImplied'
): number {
  switch (oddsType) {
    case 'decimal':
      return amount * odds;
    case 'normalizedImplied':
      return amount / odds;
    case 'american':
      if (odds > 0) {
        return amount * (1 + odds / 100);
      } else {
        return amount * (1 + 100 / Math.abs(odds));
      }
    default:
      return amount / odds; // Default to normalizedImplied
  }
}

async function fixExistingBetPayouts() {
  // Create database connection
  const dataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'spinfox',
    entities: [SportsBet],
    synchronize: false,
  });

  try {
    await dataSource.initialize();
    console.log('Database connection established');

    const betRepository = dataSource.getRepository(SportsBet);
    
    // Get all bets
    const allBets = await betRepository.find();
    console.log(`Found ${allBets.length} bets to process`);

    let updatedCount = 0;

    for (const bet of allBets) {
      // Calculate correct potential payout
      const correctPayout = calculatePotentialPayout(
        bet.amount,
        bet.odds,
        bet.oddsType || 'normalizedImplied'
      );

      // Only update if the value is different (with small tolerance for floating point)
      if (Math.abs(bet.potentialPayout - correctPayout) > 0.01) {
        console.log(
          `Bet #${bet.id}: Updating payout from ${bet.potentialPayout} to ${correctPayout}`
        );
        
        bet.potentialPayout = correctPayout;
        
        // If the bet was won and claimed, also update actualPayout
        if (bet.status === 'won' && bet.claimed) {
          bet.actualPayout = correctPayout;
          console.log(`  Also updated actualPayout to ${correctPayout}`);
        }
        
        await betRepository.save(bet);
        updatedCount++;
      }
    }

    console.log(`\nFixed ${updatedCount} bets out of ${allBets.length} total bets`);
  } catch (error) {
    console.error('Error fixing bet payouts:', error);
  } finally {
    await dataSource.destroy();
    console.log('Database connection closed');
  }
}

// Run the script
fixExistingBetPayouts();

