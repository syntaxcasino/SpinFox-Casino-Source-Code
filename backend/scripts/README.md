# Database Scripts

## Fix Existing Bet Payouts

This script fixes the `potentialPayout` and `actualPayout` values for existing bets that were created before the odds type system was implemented.

### Why is this needed?

Before the odds type system, all bets were calculated using the formula `amount * odds`, which is correct for decimal odds but incorrect for normalized implied odds. Since the system uses normalized implied odds by default, most existing bets have incorrect payout values.

### How to run:

1. Make sure you have the database environment variables set:
   ```bash
   DB_HOST=localhost
   DB_PORT=3306
   DB_USERNAME=root
   DB_PASSWORD=your_password
   DB_NAME=spinfox
   ```

2. Install ts-node if you haven't already:
   ```bash
   npm install -g ts-node
   ```

3. Run the script from the backend directory:
   ```bash
   cd SpinFoxBackend
   ts-node scripts/fix-existing-bet-payouts.ts
   ```

### What does it do?

1. Connects to the database
2. Retrieves all bets
3. For each bet:
   - Calculates the correct potential payout based on the odds type
   - Compares it with the stored value
   - If different, updates the bet
   - If the bet was won and claimed, also updates the actual payout
4. Reports how many bets were fixed

### Note:

This script is safe to run multiple times. It will only update bets where the calculated payout differs from the stored value by more than $0.01.

### Alternative:

If you prefer not to run this script, the frontend now calculates the potential payout on-the-fly, so it will display correctly even for old bets. However, running this script ensures:
- Database consistency
- Correct payouts when claiming winnings
- Accurate reporting and analytics

