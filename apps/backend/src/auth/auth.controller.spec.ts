import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UserRole } from './entities/user.entity';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    getMe: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get(AuthController);
    authService = module.get(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should call authService.register with RegisterDto', async () => {
      const registerDto: RegisterDto = {
        email: 'new@example.com',
        name: 'New User',
        password: 'SecurePass123!',
        role: UserRole.ESTUDIANTE,
      };

      mockAuthService.register.mockResolvedValue({
        id: 'user-123',
        email: 'new@example.com',
        name: 'New User',
        role: UserRole.ESTUDIANTE,
      });

      const result = await controller.register(registerDto);

      expect(authService.register).toHaveBeenCalledWith(registerDto);
      expect(result).toHaveProperty('id');
    });
  });

  describe('login', () => {
    it('should call authService.login with LoginDto', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      mockAuthService.login.mockResolvedValue({
        access_token: 'jwt_token_here',
      });

      const result = await controller.login(loginDto);

      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(result).toHaveProperty('access_token');
    });
  });

  describe('getMe', () => {
    it('should return user data for authenticated user', async () => {
      const userId = 'user-123';
      const mockUserData = {
        id: userId,
        email: 'test@example.com',
        name: 'Test User',
        role: UserRole.ESTUDIANTE,
        suspended: false,
      };

      mockAuthService.getMe.mockResolvedValue(mockUserData);

      const result = await controller.getMe({ user: { id: userId } });

      expect(authService.getMe).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockUserData);
    });
  });
});
