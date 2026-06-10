import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { PromotionsService } from './promotions.service';
import { Promotion } from '../admin/entities/promotion.entity';

@Controller('promotions')
export class PromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

  /**
   * GET /promotions
   * Get all active promotions
   */
  @Get()
  async getActivePromotions() {
    return this.promotionsService.getActivePromotions();
  }

  /**
   * GET /promotions/:id
   * Get promotion by ID
   */
  @Get(':id')
  async getPromotionById(@Param('id', ParseIntPipe) id: number) {
    return this.promotionsService.getPromotionById(id);
  }

  /**
   * POST /promotions
   * Create new promotion (admin only)
   */
  @Post()
  async createPromotion(@Body() data: Partial<Promotion>) {
    return this.promotionsService.createPromotion(data);
  }

  /**
   * PUT /promotions/:id
   * Update promotion (admin only)
   */
  @Put(':id')
  async updatePromotion(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: Partial<Promotion>,
  ) {
    return this.promotionsService.updatePromotion(id, data);
  }

  /**
   * DELETE /promotions/:id
   * Delete promotion (admin only)
   */
  @Delete(':id')
  async deletePromotion(@Param('id', ParseIntPipe) id: number) {
    const success = await this.promotionsService.deletePromotion(id);
    return { success };
  }

  /**
   * POST /promotions/initialize
   * Initialize default promotions
   */
  @Post('initialize')
  async initializeDefaultPromotions() {
    await this.promotionsService.initializeDefaultPromotions();
    return { success: true, message: 'Default promotions initialized' };
  }
}

