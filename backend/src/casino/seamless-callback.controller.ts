import { Body, Controller, Post, Logger, HttpCode } from '@nestjs/common';
import { SeamlessCallbackService } from './seamless-callback.service';

@Controller('gold_api')
export class SeamlessCallbackController {
  private readonly logger = new Logger(SeamlessCallbackController.name);

  constructor(private readonly seamlessCallbackService: SeamlessCallbackService) {}

  /**
   * Endpoint: POST /gold_api/user_balance
   * Called by the aggregator to check user balance
   */
  @Post('user_balance')
  @HttpCode(200)
  async userBalance(@Body() body: any) {
    this.logger.log(`user_balance called for user: ${body.user_code}`);
    return await this.seamlessCallbackService.getUserBalance(body);
  }

  /**
   * Endpoint: POST /gold_api/game_callback
   * Called by the aggregator for each game transaction (bet/win)
   */
  @Post('game_callback')
  @HttpCode(200)
  async gameCallback(@Body() body: any) {
    this.logger.log(
      `game_callback called for user: ${body.user_code} | txn: ${body.slot?.txn_id} | type: ${body.slot?.txn_type}`,
    );
    // Uncomment below for debugging if needed:
    // this.logger.debug(`Full game_callback request:`, JSON.stringify(body, null, 2));
    return await this.seamlessCallbackService.handleGameCallback(body);
  }

  /**
   * Endpoint: POST /gold_api/money_callback
   * Called by the aggregator for deposit/withdrawal notifications
   */
  @Post('money_callback')
  @HttpCode(200)
  async moneyCallback(@Body() body: any) {
    this.logger.log(
      `money_callback called for user: ${body.user_code} | type: ${body.type}`,
    );
    return await this.seamlessCallbackService.handleMoneyCallback(body);
  }
}

