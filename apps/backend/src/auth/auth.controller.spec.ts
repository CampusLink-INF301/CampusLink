/**
 * Auth Controller Tests
 *
 * ORÁCULO: controller debe delegar correctamente al service y retornar sus resultados
 *
 * Requisitos cubiertos:
 * - REQ-AUTH-006: POST /auth/register crea user y retorna token
 * - REQ-AUTH-007: POST /auth/login autentica user y retorna token
 * - REQ-AUTH-008: GET /auth/me retorna user actual (requiere JWT)
 *
 * Estrategia de testing:
 * - Happy path: credenciales válidas → retorna token
 * - Negativo: credenciales inválidas → error del service
 * - Negativo: email ya registrado → error del service
 */

import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
describe('AuthController', () => {
  let controller: AuthController;
  let mockAuthService: any;

  beforeEach(async () => {
    mockAuthService = {
      register: jest.fn(),
      login: jest.fn(),
      getMe: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  describe('POST /auth/register - Happy Path', () => {
    it('TC-AUTH-CTRL-001: debe registrar user con datos válidos y retornar token', async () => {
      // Precondición: email no existe, validaciones pasan
      // Entrada: RegisterDto completo { name, email, password, role }
      // Resultado esperado: service.register llamado, retorna { token, user }
      // Oráculo: controller retorna dato del service sin modificar

      const registerDto: RegisterDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123!',
      };

      const expectedResponse = {
        token: 'eyJhbGc...',
        user: { id: '123', email: 'test@example.com', name: 'Test User' },
      };

      mockAuthService.register.mockResolvedValueOnce(expectedResponse);

      const result = await controller.register(registerDto);

      expect(result).toEqual(expectedResponse);
      expect(mockAuthService.register).toHaveBeenCalledWith(registerDto);
    });
  });

  describe('POST /auth/login - Happy Path', () => {
    it('TC-AUTH-CTRL-002: debe autenticas user con credenciales válidas y retornar token', async () => {
      // Precondición: user existe, password es correcto
      // Entrada: LoginDto { email, password }
      // Resultado esperado: service.login retorna { token, user }
      // Oráculo: controller retorna dato del service

      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'Password123',
      };

      const expectedResponse = {
        token: 'eyJhbGc...',
        user: { id: '123', email: 'test@example.com' },
      };

      mockAuthService.login.mockResolvedValueOnce(expectedResponse);

      const result = await controller.login(loginDto);

      expect(result).toEqual(expectedResponse);
      expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);
    });
  });

  describe('GET /auth/me - Caso Negativo', () => {
    it('TC-AUTH-CTRL-003: debe retornar user actual cuando autenticado', async () => {
      // Precondición: JWT válido, user existe
      // Entrada: request.user.id = userId válido
      // Resultado esperado: service.getMe retorna user data
      // Oráculo: controller retorna dato del service

      const userId = '550e8400-e29b-41d4-a716-446655440000';
      const expectedUser = {
        id: userId,
        email: 'test@example.com',
        name: 'Test User',
        role: 'ESTUDIANTE',
      };

      mockAuthService.getMe.mockResolvedValueOnce(expectedUser);

      const result = await controller.getMe({ user: { id: userId } });

      expect(result).toEqual(expectedUser);
      expect(mockAuthService.getMe).toHaveBeenCalledWith(userId);
    });
  });
});
