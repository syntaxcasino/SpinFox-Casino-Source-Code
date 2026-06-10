import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Promotion } from '../admin/entities/promotion.entity';

@Injectable()
export class PromotionsService {
  private readonly logger = new Logger(PromotionsService.name);

  constructor(
    @InjectRepository(Promotion)
    private readonly promotionRepository: Repository<Promotion>,
  ) {}

  /**
   * Get all active promotions
   */
  async getActivePromotions(): Promise<Promotion[]> {
    try {
      const now = new Date();
      
      const promotions = await this.promotionRepository
        .createQueryBuilder('promotion')
        .where('promotion.active = :active', { active: true })
        .andWhere(
          '(promotion.startDate IS NULL OR promotion.startDate <= :now)',
          { now: now.toISOString().split('T')[0] }
        )
        .andWhere(
          '(promotion.endDate IS NULL OR promotion.endDate >= :now)',
          { now: now.toISOString().split('T')[0] }
        )
        .orderBy('promotion.priority', 'DESC')
        .addOrderBy('promotion.createdAt', 'DESC')
        .getMany();

      return promotions;
    } catch (error) {
      this.logger.error(`Failed to get active promotions: ${error.message}`);
      return [];
    }
  }

  /**
   * Get promotion by ID
   */
  async getPromotionById(id: number): Promise<Promotion | null> {
    try {
      return await this.promotionRepository.findOne({ where: { id } });
    } catch (error) {
      this.logger.error(`Failed to get promotion by ID: ${error.message}`);
      return null;
    }
  }

  /**
   * Create new promotion
   */
  async createPromotion(data: Partial<Promotion>): Promise<Promotion> {
    try {
      const promotion = this.promotionRepository.create(data);
      return await this.promotionRepository.save(promotion);
    } catch (error) {
      this.logger.error(`Failed to create promotion: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update promotion
   */
  async updatePromotion(id: number, data: Partial<Promotion>): Promise<Promotion | null> {
    try {
      await this.promotionRepository.update(id, data);
      return await this.getPromotionById(id);
    } catch (error) {
      this.logger.error(`Failed to update promotion: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete promotion
   */
  async deletePromotion(id: number): Promise<boolean> {
    try {
      const result = await this.promotionRepository.delete(id);
      return (result.affected ?? 0) > 0;
    } catch (error) {
      this.logger.error(`Failed to delete promotion: ${error.message}`);
      return false;
    }
  }

  /**
   * Initialize default promotions if none exist
   */
  async initializeDefaultPromotions(): Promise<void> {
    try {
      const count = await this.promotionRepository.count();
      
      if (count === 0) {
        this.logger.log('Initializing default promotions...');
        
        const defaultPromotions = [
          {
            name: 'Welcome Bonus',
            title: 'SpinFox Welcome Offer',
            subtitle: 'Big bonus + free spins to kickstart your play',
            type: 'welcome',
            badge: 'NEW PLAYER',
            bonus: '100% match up to $500',
            spins: '50 Free Spins',
            buttonText: 'Claim Now',
            ctaLabel: 'Claim Offer',
            imageSrc: '/images/promo-slots.jpg',
            overlayImageSrc: '/images/promo-overlay.png',
            href: '/signup',
            description: 'Get started with an amazing welcome package!',
            terms: 'Wagering requirements apply. 18+',
            active: true,
            priority: 100,
          },
          {
            name: 'First Deposit Bonus',
            title: 'Double Your First Deposit',
            subtitle: 'Get 100% bonus on your first deposit',
            type: 'deposit',
            badge: 'DEPOSIT BONUS',
            bonus: '100% up to $1000',
            spins: '100 Free Spins',
            buttonText: 'Deposit Now',
            ctaLabel: 'Get Bonus',
            imageSrc: '/images/promo-deposit.jpg',
            overlayImageSrc: '/images/promo-overlay-2.png',
            href: '/wallet',
            description: 'Double your first deposit and play with more!',
            terms: 'Min deposit $20. Wagering x35. 18+',
            active: true,
            priority: 90,
          },
          {
            name: 'Weekly Cashback',
            title: 'Weekly Cashback',
            subtitle: 'Get 10% cashback on your losses every week',
            type: 'cashback',
            badge: 'CASHBACK',
            bonus: '10% Cashback',
            buttonText: 'Learn More',
            ctaLabel: 'Get Cashback',
            imageSrc: '/images/promo-cashback.jpg',
            overlayImageSrc: '/images/promo-overlay-3.png',
            href: '/promotions',
            description: 'Recover 10% of your net losses every week!',
            terms: 'Max cashback $500. Wagering x1. 18+',
            active: true,
            priority: 80,
          },
        ];

        await this.promotionRepository.save(defaultPromotions);
        this.logger.log(`Created ${defaultPromotions.length} default promotions`);
      }
    } catch (error) {
      this.logger.error(`Failed to initialize default promotions: ${error.message}`);
    }
  }
}

