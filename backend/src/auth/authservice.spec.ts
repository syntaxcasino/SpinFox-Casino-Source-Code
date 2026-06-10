import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ApiService } from 'src/api/api.service';
import { MailerService } from 'src/mailer/mailer.service';

describe('AuthService', () => {
  let service: AuthService;

  const mockMailerService = { sendMail: jest.fn() };
  const mockJwtService = { sign: jest.fn(), verify: jest.fn() };
  const mockApiService = { request: jest.fn() };
  const mockUserRepository = { findOne: jest.fn(), save: jest.fn() };
  const mockRedisClient = { set: jest.fn(), get: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: MailerService, useValue: mockMailerService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ApiService, useValue: mockApiService },
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        { provide: 'REDIS_CLIENT', useValue: mockRedisClient }, // make sure the token matches
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call mailerService.sendMail with correct arguments', async () => {
    const email = 'test@example.com';

    await service.sendWelcomeEmail(email);

    expect(mockMailerService.sendMail).toHaveBeenCalledWith(
      email,
      '🎉 Welcome to SpinFox!',
      'Thanks for joining us!',
      expect.stringContaining('<div style="font-family: Arial, sans-serif')
    );
  });
});
