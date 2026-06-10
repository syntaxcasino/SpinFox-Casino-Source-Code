import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { LeaderboardService } from './leaderboard.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('leaderboard')
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  /**
   * GET /leaderboard
   * Get leaderboard entries
   */
  @Get()
  async getLeaderboard(
    @Query('period') period: string = 'all-time',
    @Query('limit') limit: number = 100,
    @Query('type') type: string = 'all',
  ) {
    return this.leaderboardService.getLeaderboard(period, Number(limit), type);
  }

  /**
   * GET /leaderboard/my-position
   * Get current user's leaderboard position
   */
  @Get('my-position')
  @UseGuards(JwtAuthGuard)
  async getMyPosition(
    @Req() req: any,
    @Query('period') period: string = 'all-time',
    @Query('type') type: string = 'all',
  ) {
    const userId = req.user.userId;
    return this.leaderboardService.getUserPosition(userId, period, type);
  }

  /**
   * GET /leaderboard/update
   * Manually trigger leaderboard update (admin only)
   */
  @Get('update')
  async updateLeaderboard(@Query('period') period: string = 'all-time') {
    await this.leaderboardService.updateLeaderboard(period);
    return { success: true, message: `${period} leaderboard updated` };
  }
}

