import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ObjectLiteral, Repository } from 'typeorm';
import { User } from 'src/auth/entities/user.entity';
import { Transaction } from 'src/transaction/entities/transaction.entity';
import { Bet } from './entities/bet.entity';
import { Game } from './entities/game.entity';
import { Promotion } from './entities/promotion.entity';

type MockType<T extends ObjectLiteral = any> = {
  count: jest.Mock;
  createQueryBuilder: jest.Mock;
};

const createMockRepository = <T extends ObjectLiteral = any>(): MockType<T> => ({
  count: jest.fn(),
  createQueryBuilder: jest.fn(),
});

describe('AdminService', () => {
  let service: AdminService;
  let userRepository: MockType<User>;
  let transactionRepository: MockType<Transaction>;
  let betRepository: MockType<Bet>;
  let gameRepository: MockType<Game>;
  let promotionRepository: MockType<Promotion>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        { provide: getRepositoryToken(User), useValue: createMockRepository<User>() },
        { provide: getRepositoryToken(Transaction), useValue: createMockRepository<Transaction>() },
        { provide: getRepositoryToken(Bet), useValue: createMockRepository<Bet>() },
        { provide: getRepositoryToken(Game), useValue: createMockRepository<Game>() },
        { provide: getRepositoryToken(Promotion), useValue: createMockRepository<Promotion>() },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    userRepository = module.get<MockType<User>>(getRepositoryToken(User));
    transactionRepository = module.get<MockType<Transaction>>(getRepositoryToken(Transaction));
    betRepository = module.get<MockType<Bet>>(getRepositoryToken(Bet));
    gameRepository = module.get<MockType<Game>>(getRepositoryToken(Game));
    promotionRepository = module.get<MockType<Promotion>>(getRepositoryToken(Promotion));
  });

  describe('getOverview', () => {
    it('should return correct overview data', async () => {
      // Mock user count
      userRepository.count.mockResolvedValue(100);

      // Mock transaction sums
      const mockTxQB = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawOne: jest.fn(),
      };
      transactionRepository.createQueryBuilder.mockReturnValue(mockTxQB as any);
      mockTxQB.getRawOne.mockResolvedValueOnce({ sum: '5000' }); // deposits
      mockTxQB.getRawOne.mockResolvedValueOnce({ sum: '2000' }); // withdrawals

      // Mock bets
      betRepository.count.mockResolvedValue(50);
      const mockBetQB = {
        select: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ sum: '3500' }),
      };
      betRepository.createQueryBuilder.mockReturnValue(mockBetQB as any);

      // Mock games & promotions
      gameRepository.count.mockResolvedValue(10);
      promotionRepository.count.mockResolvedValue(5);

      const overview = await service.getOverview();

      expect(overview).toEqual({
        totalUsers: 100,
        totalDeposits: 5000,
        totalWithdrawals: 2000,
        totalBets: 50,
        totalWins: 3500,
        activeGames: 10,
        activePromotions: 5,
      });
    });
  });
});
