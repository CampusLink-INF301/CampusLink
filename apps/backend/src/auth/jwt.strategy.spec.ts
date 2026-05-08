import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from './jwt.strategy';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User, UserRole } from './entities/user.entity';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let mockUserRepository: any;

  const mockUser = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    role: UserRole.ESTUDIANTE,
    suspended: false,
  };

  beforeEach(async () => {
    mockUserRepository = {
      findOne: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn((key: string) => {
        if (key === 'JWT_SECRET') return 'test-jwt-secret-key';
        return null;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  describe('Happy Path - Entrada Válida', () => {
    it('TC-JWT-001: debe retornar user data para payload válido con user existente', async () => {
      // Precondición: user existe en BD, payload tiene sub válido
      // Entrada: payload = { sub: validUserId }
      // Pasos: llamar validate(payload)
      // Resultado esperado: retorna { id, role, suspended }
      // Oráculo: expect(result).toEqual(expectedUser)

      const payload = { sub: mockUser.id };
      mockUserRepository.findOne.mockResolvedValueOnce(mockUser);

      const result = await strategy.validate(payload);

      expect(result).toEqual({
        id: mockUser.id,
        role: mockUser.role,
        suspended: mockUser.suspended,
      });
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockUser.id },
      });
    });

    it('TC-JWT-002: debe retornar user data con suspended=true si user está suspendido', async () => {
      // Precondición: user existe pero está suspendido
      // Entrada: payload = { sub: suspendedUserId }
      // Resultado esperado: retorna user data con suspended=true
      // Oráculo: resultado.suspended === true

      const suspendedUser = { ...mockUser, suspended: true };
      const payload = { sub: mockUser.id };
      mockUserRepository.findOne.mockResolvedValueOnce(suspendedUser);

      const result = await strategy.validate(payload);

      expect(result).not.toBeNull();
      if (result) {
        expect(result.suspended).toBe(true);
      }
    });
  });

  describe('Casos Negativos - Entrada Inválida', () => {
    it('TC-JWT-003: debe retornar null cuando user NO existe en BD', async () => {
      // Precondición: payload tiene sub válido pero user no existe
      // Entrada: payload = { sub: nonExistentUserId }
      // Pasos: llamar validate(payload)
      // Resultado esperado: retorna null
      // Oráculo: expect(result).toBeNull()

      const payload = { sub: '550e8400-e29b-41d4-a716-000000000000' };
      mockUserRepository.findOne.mockResolvedValueOnce(null);

      const result = await strategy.validate(payload);

      expect(result).toBeNull();
    });

    it('TC-JWT-004: debe manejar error de BD sin crash', async () => {
      // Precondición: BD retorna error
      // Entrada: payload = { sub: anyId }
      // Pasos: llamar validate(payload)
      // Resultado esperado: error se propaga (no se catchea aquí)
      // Oráculo: expect fn to throw

      const payload = { sub: mockUser.id };
      const dbError = new Error('Database connection failed');
      mockUserRepository.findOne.mockRejectedValueOnce(dbError);

      await expect(strategy.validate(payload)).rejects.toThrow('Database connection failed');
    });
  });

  describe('Valores Límite - Boundary Testing', () => {
    it('TC-JWT-005: debe aceptar UUID válido con formato estándar', async () => {
      // Entrada: payload.sub = UUID válido (36 chars con hyphens)
      // Resultado esperado: busca user con ese ID
      // Oráculo: findOne fue llamado 1 vez con ese ID

      const validUUID = '550e8400-e29b-41d4-a716-446655440000';
      const payload = { sub: validUUID };
      mockUserRepository.findOne.mockResolvedValueOnce(mockUser);

      await strategy.validate(payload);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: validUUID },
      });
      expect(mockUserRepository.findOne).toHaveBeenCalledTimes(1);
    });
  });
});
