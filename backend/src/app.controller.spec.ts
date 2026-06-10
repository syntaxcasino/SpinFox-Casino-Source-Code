import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { ExecutionContext } from '@nestjs/common';

describe('AppController', () => {
  let appController: AppController;

  // Mock JwtAuthGuard
  const mockJwtAuthGuard = {
    canActivate: (context: ExecutionContext) => true,
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    appController = app.get<AppController>(AppController);
  });

  describe('getProfile', () => {
    it('should return the user object from request', () => {
      const mockUser = { id: 1, username: 'testUser' };
      const mockRequest = { user: mockUser } as any;

      const result = appController.getProfile(mockRequest);
      expect(result).toEqual(mockUser);
    });
  });
});
