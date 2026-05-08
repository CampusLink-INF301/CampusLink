import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { JwtStrategy } from './jwt.strategy';
import { User, UserRole } from './entities/user.entity';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let configService: ConfigService;
  let userRepository: Repository<User>;

  beforeEach(() => {
    // Mock ConfigService
    configService = {
      get: jest.fn((key: string) => {
        if (key === 'JWT_SECRET') return 'test_jwt_secret_key';
        return undefined;
      }),
    } as unknown as ConfigService;

    // Mock Repository
    userRepository = {
      findOne: jest.fn(),
    } as unknown as Repository<User>;

    // Create strategy
    strategy = new JwtStrategy(configService, userRepository);
  });

  describe('validate', () => {
    it('should return user data when user exists', async () => {
      const mockUser: User = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        role: UserRole.ESTUDIANTE,
        suspended: false,
        password: '',
        createdAt: new Date(),
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);

      const result = await strategy.validate({ sub: 'user-123' });

      expect(result).toEqual({
        id: 'user-123',
        role: UserRole.ESTUDIANTE,
        suspended: false,
      });
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'user-123' },
      });
    });

    it('should return null when user does not exist', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      const result = await strategy.validate({ sub: 'nonexistent-user' });

      expect(result).toBeNull();
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'nonexistent-user' },
      });
    });

    it('should include suspended flag in return value', async () => {
      const mockSuspendedUser: User = {
        id: 'user-suspended',
        email: 'suspended@example.com',
        name: 'Suspended User',
        role: UserRole.DOCENTE,
        suspended: true,
        password: '',
        createdAt: new Date(),
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockSuspendedUser);

      const result = await strategy.validate({ sub: 'user-suspended' });

      expect(result).toEqual({
        id: 'user-suspended',
        role: UserRole.DOCENTE,
        suspended: true,
      });
    });

    it('should work with INSTITUCION role', async () => {
      const mockInstUser: User = {
        id: 'inst-123',
        email: 'inst@example.com',
        name: 'Institution',
        role: UserRole.INSTITUCION,
        suspended: false,
        password: '',
        createdAt: new Date(),
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockInstUser);

      const result = await strategy.validate({ sub: 'inst-123' });

      expect(result).toEqual({
        id: 'inst-123',
        role: UserRole.INSTITUCION,
        suspended: false,
      });
    });
  });
});
