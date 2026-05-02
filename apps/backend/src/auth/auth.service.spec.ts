import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { User, UserRole } from './entities/user.entity';

jest.mock('bcrypt');

const mockUserRepo = {
  findOneBy: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('mock.jwt.token'),
};

const baseUser: User = {
  id: 'user-uuid-1',
  email: 'test@example.com',
  name: 'Test User',
  password: 'hashed-password',
  role: UserRole.ESTUDIANTE,
  createdAt: new Date('2024-01-01'),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: mockUserRepo },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('registers a new user and returns token', async () => {
      mockUserRepo.findOneBy.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      mockUserRepo.create.mockReturnValue(baseUser);
      mockUserRepo.save.mockResolvedValue(baseUser);

      const result = await service.register({
        email: 'test@example.com',
        name: 'Test User',
        password: 'plaintext',
        role: UserRole.ESTUDIANTE,
      });

      expect(result.token).toBe('mock.jwt.token');
      expect(result.user).not.toHaveProperty('password');
    });

    it('throws ConflictException when email already exists', async () => {
      mockUserRepo.findOneBy.mockResolvedValue(baseUser);

      await expect(
        service.register({
          email: 'test@example.com',
          name: 'Otro',
          password: '123',
          role: UserRole.ESTUDIANTE,
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('returns user and token on valid credentials', async () => {
      mockUserRepo.findOne.mockResolvedValue({ ...baseUser, password: 'hashed-password' });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login({
        email: 'test@example.com',
        password: 'plaintext',
      });

      expect(result.token).toBe('mock.jwt.token');
      expect(result.user).not.toHaveProperty('password');
    });

    it('throws UnauthorizedException when user not found', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);

      await expect(
        service.login({ email: 'no@existe.com', password: '123' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException when password is wrong', async () => {
      mockUserRepo.findOne.mockResolvedValue({ ...baseUser, password: 'hashed-password' });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({ email: 'test@example.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getMe', () => {
    it('returns user by id', async () => {
      mockUserRepo.findOneBy.mockResolvedValue(baseUser);

      const result = await service.getMe('user-uuid-1');

      expect(mockUserRepo.findOneBy).toHaveBeenCalledWith({ id: 'user-uuid-1' });
      expect(result).toEqual(baseUser);
    });

    it('throws NotFoundException when user does not exist', async () => {
      mockUserRepo.findOneBy.mockResolvedValue(null);

      await expect(service.getMe('no-existe')).rejects.toThrow(NotFoundException);
    });
  });
});
