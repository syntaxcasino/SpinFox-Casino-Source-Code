import { Body, Controller, Post, Req, Request, UseGuards, UseInterceptors } from '@nestjs/common';
import { CasinoService } from './casino.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { EncryptResponseInterceptor } from "../utils/crypto.util";
import { AuthenticatedRequest } from 'src/utils/api';

@Controller('casino')
@UseInterceptors(EncryptResponseInterceptor)
export class CasinoController {

  constructor(private readonly casinoService: CasinoService) { }
  @Post('provider-list')
  async providerList() {
    return this.casinoService.providerList();
  }

  @Post('game-list')
  async gameList(@Request() req) {
    const provider_code = req.body.provider_code;
    return this.casinoService.gameList(provider_code);
  }

  @UseGuards(JwtAuthGuard)
  @Post('game-launch')
  async gameLaunch(@Request() req) {
    if (!req.user) {
      throw new Error('User not authenticated');
    }
    const balanceType = req.body.balanceType || 'realBalance'; // Allow frontend to specify which balance to use
    return this.casinoService.gameLaunch(req.body.provider_code, req.body.game_code, req.user.username, balanceType);
  }

  @UseGuards(JwtAuthGuard)
  @Post('userinfo')
  async userInfo(@Request() req) {
    if (!req.user) {
      throw new Error('User not authenticated');
    }
    return await this.casinoService.userInfo(req.user.username);
  }

  @UseGuards(JwtAuthGuard)
  @Post('deposit-user-balance')
  async depositUserBalance(@Body() req: { depositUserId: number, amount: number }) {
    return await this.casinoService.depositUserBalance(req.depositUserId, req.amount);
  }

  @UseGuards(JwtAuthGuard)
  @Post('setfavorites')
  async setFavorites(@Body() req: { favorites: string }, @Req() { user: { userId } }: AuthenticatedRequest,) {
    if (!userId) {
      throw new Error('User not authenticated');
    }
    return await this.casinoService.setFavorites(userId, req.favorites);
  }

  @UseGuards(JwtAuthGuard)
  @Post('transaction-history')
  async getTransactionHistory(
    @Request() req,
    @Body() body: { limit?: number; offset?: number }
  ) {
    if (!req.user) {
      throw new Error('User not authenticated');
    }
    const limit = body.limit || 50;
    const offset = body.offset || 0;
    return await this.casinoService.getTransactionHistory(req.user.userId, limit, offset);
  }
}
