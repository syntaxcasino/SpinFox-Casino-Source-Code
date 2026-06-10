import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Leaderboard } from '../admin/entities/leaderboard.entity';
import { User } from '../auth/entities/user.entity';
import { Bet } from '../admin/entities/bet.entity';
import { SportsBet } from '../sports/entities/sports-bet.entity';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class LeaderboardService {
  private readonly logger = new Logger(LeaderboardService.name);

  constructor(
    @InjectRepository(Leaderboard)
    private readonly leaderboardRepository: Repository<Leaderboard>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Bet)
    private readonly betRepository: Repository<Bet>,
    @InjectRepository(SportsBet)
    private readonly sportsBetRepository: Repository<SportsBet>,
  ) {}

  /**
   * Get leaderboard entries
   */
  async getLeaderboard(period: string = 'all-time', limit: number = 100, type: string = 'all'): Promise<any[]> {
    try {
      const where: any = { period };
      
      // Filter by type if specified
      if (type !== 'all') {
        where.type = type;
      }

      const leaderboard = await this.leaderboardRepository.find({
        where,
        order: { rank: 'ASC' },
        take: limit,
      });

      return leaderboard.map((entry) => ({
        id: entry.id.toString(),
        rank: entry.rank,
        username: entry.username,
        avatarUrl: entry.avatarUrl || `https://api.dicebear.com/9.x/thumbs/svg?seed=${entry.username}`,
        stake: parseFloat(entry.totalStake.toString()),
        wins: entry.totalWins,
        country: entry.country || 'Unknown',
      }));
    } catch (error) {
      this.logger.error(`Failed to get leaderboard: ${error.message}`);
      return [];
    }
  }

  /**
   * Get user's leaderboard position
   */
  async getUserPosition(userId: number, period: string = 'all-time', type: string = 'all'): Promise<any> {
    try {
      const where: any = { userId, period };
      
      // Filter by type if specified
      if (type !== 'all') {
        where.type = type;
      }

      const entry = await this.leaderboardRepository.findOne({
        where,
      });

      if (!entry) {
        return null;
      }

      return {
        id: entry.id.toString(),
        rank: entry.rank,
        username: entry.username,
        avatarUrl: entry.avatarUrl || `https://api.dicebear.com/9.x/thumbs/svg?seed=${entry.username}`,
        stake: parseFloat(entry.totalStake.toString()),
        wins: entry.totalWins,
        country: entry.country || 'Unknown',
        isCurrentUser: true,
      };
    } catch (error) {
      this.logger.error(`Failed to get user position: ${error.message}`);
      return null;
    }
  }

  /**
   * Update leaderboard - called periodically or manually
   */
  async updateLeaderboard(period: string = 'all-time'): Promise<void> {
    try {
      this.logger.log(`Updating ${period} leaderboard...`);

      // Calculate date range based on period
      const dateRange = this.getDateRange(period);

      // Get stats for each type
      const [casinoStats, sportsStats, allStats] = await Promise.all([
        this.calculateUserStats(dateRange, 'casino'),
        this.calculateUserStats(dateRange, 'sports'),
        this.calculateUserStats(dateRange, 'all'),
      ]);

      // Clear existing leaderboard for this period
      await this.leaderboardRepository.delete({ period });

      const allEntries: Array<{
        userId: number;
        username: string;
        avatarUrl: string | undefined;
        totalStake: number;
        totalWins: number;
        totalBets: number;
        totalWinAmount: number;
        country: string;
        rank: number;
        period: string;
        type: string;
      }> = [];

      // Create casino leaderboard
      const casinoSorted = casinoStats.sort((a, b) => b.totalStake - a.totalStake);
      const casinoEntries = casinoSorted.map((stat, index) => ({
        userId: stat.userId,
        username: stat.username,
        avatarUrl: stat.avatarUrl || undefined,
        totalStake: stat.totalStake,
        totalWins: stat.totalWins,
        totalBets: stat.totalBets,
        totalWinAmount: stat.totalWinAmount,
        country: stat.country,
        rank: index + 1,
        period,
        type: 'casino',
      }));
      allEntries.push(...casinoEntries);

      // Create sports leaderboard
      const sportsSorted = sportsStats.sort((a, b) => b.totalStake - a.totalStake);
      const sportsEntries = sportsSorted.map((stat, index) => ({
        userId: stat.userId,
        username: stat.username,
        avatarUrl: stat.avatarUrl || undefined,
        totalStake: stat.totalStake,
        totalWins: stat.totalWins,
        totalBets: stat.totalBets,
        totalWinAmount: stat.totalWinAmount,
        country: stat.country,
        rank: index + 1,
        period,
        type: 'sports',
      }));
      allEntries.push(...sportsEntries);

      // Create combined leaderboard
      const allSorted = allStats.sort((a, b) => b.totalStake - a.totalStake);
      const combinedEntries = allSorted.map((stat, index) => ({
        userId: stat.userId,
        username: stat.username,
        avatarUrl: stat.avatarUrl || undefined,
        totalStake: stat.totalStake,
        totalWins: stat.totalWins,
        totalBets: stat.totalBets,
        totalWinAmount: stat.totalWinAmount,
        country: stat.country,
        rank: index + 1,
        period,
        type: 'all',
      }));
      allEntries.push(...combinedEntries);

      // Save all to database
      await this.leaderboardRepository.save(allEntries);

      this.logger.log(`${period} leaderboard updated with ${casinoEntries.length} casino, ${sportsEntries.length} sports, ${combinedEntries.length} combined entries`);
    } catch (error) {
      this.logger.error(`Failed to update leaderboard: ${error.message}`);
    }
  }

  /**
   * Calculate user stats from bets (casino, sports, or both)
   */
  private async calculateUserStats(
    dateRange: { start?: Date; end?: Date },
    type: 'casino' | 'sports' | 'all' = 'all'
  ): Promise<Array<{
    userId: number;
    username: string;
    avatarUrl: string | null;
    totalStake: number;
    totalWins: number;
    totalBets: number;
    totalWinAmount: number;
    country: string;
  }>> {
    let casinoResults: any[] = [];
    let sportsResults: any[] = [];

    // Query casino bets if needed
    if (type === 'casino' || type === 'all') {
      const casinoBetsQuery = this.betRepository
        .createQueryBuilder('bet')
        .leftJoin('bet.user', 'user')
        .select('user.id', 'userId')
        .addSelect('SUM(bet.amount)', 'totalStake')
        .addSelect('COUNT(CASE WHEN bet.status = :won THEN 1 END)', 'totalWins')
        .addSelect('COUNT(*)', 'totalBets')
        .addSelect('SUM(CASE WHEN bet.status = :won THEN bet.winAmount ELSE 0 END)', 'totalWinAmount')
        .groupBy('user.id')
        .setParameter('won', 'won');

      if (dateRange.start) {
        casinoBetsQuery.andWhere('bet.createdAt >= :start', { start: dateRange.start });
      }
      if (dateRange.end) {
        casinoBetsQuery.andWhere('bet.createdAt <= :end', { end: dateRange.end });
      }

      casinoResults = await casinoBetsQuery.getRawMany();
    }

    // Query sports bets if needed
    if (type === 'sports' || type === 'all') {
      const sportsBetsQuery = this.sportsBetRepository
        .createQueryBuilder('bet')
        .select('bet.userId', 'userId')
        .addSelect('SUM(bet.amount)', 'totalStake')
        .addSelect('COUNT(CASE WHEN bet.status = :won THEN 1 END)', 'totalWins')
        .addSelect('COUNT(*)', 'totalBets')
        .addSelect('SUM(CASE WHEN bet.status = :won THEN bet.actualPayout ELSE 0 END)', 'totalWinAmount')
        .groupBy('bet.userId')
        .setParameter('won', 'won');

      if (dateRange.start) {
        sportsBetsQuery.andWhere('bet.createdAt >= :start', { start: dateRange.start });
      }
      if (dateRange.end) {
        sportsBetsQuery.andWhere('bet.createdAt <= :end', { end: dateRange.end });
      }

      sportsResults = await sportsBetsQuery.getRawMany();
    }

    // Merge results by userId
    const userStatsMap = new Map<number, {
      totalStake: number;
      totalWins: number;
      totalBets: number;
      totalWinAmount: number;
    }>();

    // Process casino bets
    for (const result of casinoResults) {
      const userId = parseInt(result.userId);
      userStatsMap.set(userId, {
        totalStake: parseFloat(result.totalStake || 0),
        totalWins: parseInt(result.totalWins || 0),
        totalBets: parseInt(result.totalBets || 0),
        totalWinAmount: parseFloat(result.totalWinAmount || 0),
      });
    }

    // Add sports bets to existing users or create new entries
    for (const result of sportsResults) {
      const userId = parseInt(result.userId);
      const existing = userStatsMap.get(userId);
      if (existing) {
        existing.totalStake += parseFloat(result.totalStake || 0);
        existing.totalWins += parseInt(result.totalWins || 0);
        existing.totalBets += parseInt(result.totalBets || 0);
        existing.totalWinAmount += parseFloat(result.totalWinAmount || 0);
      } else {
        userStatsMap.set(userId, {
          totalStake: parseFloat(result.totalStake || 0),
          totalWins: parseInt(result.totalWins || 0),
          totalBets: parseInt(result.totalBets || 0),
          totalWinAmount: parseFloat(result.totalWinAmount || 0),
        });
      }
    }

    // Get user details and create final stats array
    const stats: Array<{
      userId: number;
      username: string;
      avatarUrl: string | null;
      totalStake: number;
      totalWins: number;
      totalBets: number;
      totalWinAmount: number;
      country: string;
    }> = [];

    for (const [userId, userStats] of userStatsMap.entries()) {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (user) {
        stats.push({
          userId: user.id,
          username: user.username || user.email,
          avatarUrl: null,
          totalStake: userStats.totalStake,
          totalWins: userStats.totalWins,
          totalBets: userStats.totalBets,
          totalWinAmount: userStats.totalWinAmount,
          country: (user as any).country || 'Unknown',
        });
      }
    }

    return stats;
  }

  /**
   * Get date range based on period
   */
  private getDateRange(period: string): { start?: Date; end?: Date } {
    const now = new Date();
    const ranges: any = {
      daily: {
        start: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
        end: now,
      },
      weekly: {
        start: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        end: now,
      },
      monthly: {
        start: new Date(now.getFullYear(), now.getMonth(), 1),
        end: now,
      },
      'all-time': {},
    };

    return ranges[period] || {};
  }

  /**
   * Cron job to update leaderboards periodically
   */
  @Cron(CronExpression.EVERY_HOUR)
  async updateAllLeaderboards() {
    this.logger.log('Running scheduled leaderboard update...');
    await this.updateLeaderboard('all-time');
    await this.updateLeaderboard('monthly');
    await this.updateLeaderboard('weekly');
    await this.updateLeaderboard('daily');
  }
}

