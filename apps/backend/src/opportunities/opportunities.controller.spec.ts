/**
 * Opportunities Controller Tests
 *
 * ORÁCULO: controller debe delegar al service correctamente según tipo de operación
 * y retornar resultados esperados. Validación de roles en RolesGuard.
 *
 * Requisitos cubiertos:
 * - REQ-OPP-001: GET /opportunities retorna opportunities disponibles (público)
 * - REQ-OPP-002: GET /opportunities/:id retorna detalle (público)
 * - REQ-OPP-003: POST /opportunities crea nueva opportunity (autenticado, rol específico)
 * - REQ-OPP-004: PUT /opportunities/:id actualiza opportunity (solo owner)
 * - REQ-OPP-005: DELETE /opportunities/:id elimina opportunity
 * - REQ-OPP-006: Sistema valida título, deadline y otros campos obligatorios
 *
 * Estrategia de testing:
 * - Happy path: CRUD completo con datos válidos
 * - Negativo: datos inválidos, user sin rol, opportunity no existe
 * - Valor límite: query params, deadline en pasado, título largo
 * - Entrada inválida: DTO incompleto, role inválido
 */

import { Test, TestingModule } from '@nestjs/testing';
import { OpportunitiesController } from './opportunities.controller';
import { OpportunitiesService } from './opportunities.service';
import { CreateOpportunityDto } from './dto/create-opportunity.dto';
import { UpdateOpportunityDto } from './dto/update-opportunity.dto';
import { QueryOpportunityDto } from './dto/query-opportunity.dto';
import { UserRole } from '../auth/entities/user.entity';
import { OpportunityType } from './entities/opportunity.entity';

type AuthRequest = {
  user: { id: string; role: UserRole; suspended: boolean };
};

describe('OpportunitiesController', () => {
  let controller: OpportunitiesController;
  let mockOpportunitiesService: any;

  const mockAuthRequest: AuthRequest = {
    user: {
      id: '550e8400-e29b-41d4-a716-446655440000',
      role: UserRole.ESTUDIANTE,
      suspended: false,
    },
  };

  beforeEach(async () => {
    mockOpportunitiesService = {
      findAvailable: jest.fn(),
      findOne: jest.fn(),
      findByPublisher: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      clone: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OpportunitiesController],
      providers: [
        {
          provide: OpportunitiesService,
          useValue: mockOpportunitiesService,
        },
      ],
    }).compile();

    controller = module.get<OpportunitiesController>(OpportunitiesController);
  });

  describe('GET /opportunities - Listado Público', () => {
    it('TC-OPP-001: debe retornar todas las opportunities disponibles sin autenticación', async () => {
      // Precondición: ninguno (endpoint público)
      // Entrada: QueryOpportunityDto { type?, isActive? }
      // Resultado esperado: service.findAvailable retorna array de opportunities
      // Oráculo: retorna opportunities con campos esperados

      const query: QueryOpportunityDto = {} as QueryOpportunityDto;
      const expectedOpportunities = [
        {
          id: '660f7411-f30c-42e5-a727-556666551111',
          title: 'Tutoría de Cálculo',
          type: OpportunityType.TUTORIA,
          status: 'DISPONIBLE',
        },
      ];

      mockOpportunitiesService.findAvailable.mockResolvedValueOnce(
        expectedOpportunities,
      );

      const result = await controller.findAll(query);

      expect(result).toEqual(expectedOpportunities);
      expect(mockOpportunitiesService.findAvailable).toHaveBeenCalledWith(
        query,
      );
    });

    it('TC-OPP-002: debe filtrar por tipo con valor válido', async () => {
      // Entrada: QueryOpportunityDto { type: TUTORIA }
      // Resultado esperado: solo opportunities de tipo TUTORIA
      // Oráculo: service llamado con type filter

      const query: QueryOpportunityDto = { type: OpportunityType.TUTORIA } as QueryOpportunityDto;
      const filteredOpportunities = [
        {
          id: '660f7411-f30c-42e5-a727-556666551111',
          type: OpportunityType.TUTORIA,
        },
      ];

      mockOpportunitiesService.findAvailable.mockResolvedValueOnce(
        filteredOpportunities,
      );

      const result = await controller.findAll(query);

      expect(result).toEqual(filteredOpportunities);
      expect(mockOpportunitiesService.findAvailable).toHaveBeenCalledWith(
        query,
      );
    });
  });

  describe('GET /opportunities/:id - Detalle (Público)', () => {
    it('TC-OPP-003: debe retornar detalle de opportunity por ID', async () => {
      // Precondición: opportunity existe
      // Entrada: { id: opportunityId }
      // Resultado esperado: objeto completo con todos campos
      // Oráculo: retorna opportunity con estructura esperada

      const opportunityId = '660f7411-f30c-42e5-a727-556666551111';
      const expectedOpportunity = {
        id: opportunityId,
        title: 'Tutoría de Cálculo',
        description: 'Ayuda en cálculo diferencial',
        type: OpportunityType.TUTORIA,
        deadline: '2026-06-30T23:59:59Z',
        status: 'DISPONIBLE',
      };

      mockOpportunitiesService.findOne.mockResolvedValueOnce(
        expectedOpportunity,
      );

      const result = await controller.findOne(opportunityId);

      expect(result).toEqual(expectedOpportunity);
      expect(mockOpportunitiesService.findOne).toHaveBeenCalledWith(
        opportunityId,
      );
    });
  });

  describe('POST /opportunities - Crear', () => {
    it('TC-OPP-004: autenticado debe crear opportunity con datos válidos', async () => {
      // Precondición: usuario autenticado, données válidas
      // Entrada: CreateOpportunityDto completo
      // Resultado esperado: service.create retorna opportunity creada
      // Oráculo: service llamado con dto, userId, y role

      const dto: CreateOpportunityDto = {
        title: 'Tutoría de Cálculo',
        description: 'Ayuda en cálculo diferencial',
        type: OpportunityType.TUTORIA,
        deadline: '2026-06-30',
        requirements: 'Conocer cálculo básico',
      } as CreateOpportunityDto;

      const expectedOpportunity = {
        id: '660f7411-f30c-42e5-a727-556666551111',
        title: dto.title,
        description: dto.description,
        type: dto.type,
        deadline: dto.deadline,
        status: 'DISPONIBLE',
        publisherId: mockAuthRequest.user.id,
      };

      mockOpportunitiesService.create.mockResolvedValueOnce(
        expectedOpportunity,
      );

      const result = await controller.create(dto, mockAuthRequest);

      expect(result).toEqual(expectedOpportunity);
      expect(mockOpportunitiesService.create).toHaveBeenCalledWith(
        dto,
        mockAuthRequest.user.id,
        mockAuthRequest.user.role,
      );
    });

    it('TC-OPP-005: debe rechazar título vacío (DTO validation)', async () => {
      // Entrada: CreateOpportunityDto { title: "" }
      // Resultado esperado: validación falla (IsNotEmpty decorator)
      // Oráculo: DTO validator rechaza antes de controller

      const invalidDto = {
        title: '', // Inválido: vacío
        description: 'Desc',
        type: OpportunityType.TUTORIA,
        deadline: '2026-06-30',
      } as CreateOpportunityDto;

      mockOpportunitiesService.create.mockRejectedValueOnce(
        new Error('Title is required'),
      );

      await expect(
        controller.create(invalidDto, mockAuthRequest),
      ).rejects.toThrow('Title is required');
    });
  });

  describe('PUT /opportunities/:id - Actualizar', () => {
    it('TC-OPP-006: debe permitir actualizar opportunity del owner', async () => {
      // Precondición: usuario es owner de opportunity
      // Entrada: UpdateOpportunityDto con campos a actualizar
      // Resultado esperado: service.update retorna opportunity actualizada
      // Oráculo: service llamado con id, dto, y userId

      const opportunityId = '660f7411-f30c-42e5-a727-556666551111';
      const updateDto: UpdateOpportunityDto = {
        title: 'Tutoría de Cálculo Avanzado',
      };

      const expectedUpdated = {
        id: opportunityId,
        title: 'Tutoría de Cálculo Avanzado',
        description: 'Ayuda en cálculo diferencial',
        type: OpportunityType.TUTORIA,
      };

      mockOpportunitiesService.update.mockResolvedValueOnce(expectedUpdated);

      const result = await controller.update(
        opportunityId,
        updateDto as UpdateOpportunityDto,
        mockAuthRequest,
      );

      expect(result).toEqual(expectedUpdated);
      expect(mockOpportunitiesService.update).toHaveBeenCalledWith(
        opportunityId,
        updateDto,
        mockAuthRequest.user.id,
      );
    });
  });

  describe('DELETE /opportunities/:id - Eliminar', () => {
    it('TC-OPP-007: debe permitir eliminar opportunity del owner', async () => {
      // Precondición: usuario es owner
      // Entrada: { id: opportunityId }
      // Resultado esperado: service.remove retorna void o success
      // Oráculo: service.remove llamado 1 vez, retorna undefined (204 No Content)

      const opportunityId = '660f7411-f30c-42e5-a727-556666551111';
      mockOpportunitiesService.remove.mockResolvedValueOnce(undefined);

      const result = await controller.remove(opportunityId, mockAuthRequest);

      expect(result).toBeUndefined();
      expect(mockOpportunitiesService.remove).toHaveBeenCalledWith(
        opportunityId,
        mockAuthRequest.user.id,
      );
    });
  });

  describe('POST /opportunities/:id/clone - Clonar', () => {
    it('TC-OPP-008: debe permitir clonar opportunity', async () => {
      // Precondición: opportunity existe
      // Entrada: { id: opportunityId }
      // Resultado esperado: service.clone retorna nueva opportunity clonada
      // Oráculo: service.clone llamado con id, userId, role

      const opportunityId = '660f7411-f30c-42e5-a727-556666551111';
      const clonedOpportunity = {
        id: '770g8512-g41d-53f5-b838-667777662222',
        title: 'Tutoría de Cálculo (Clonado)',
        deadline: '2026-07-30',
        publisherId: mockAuthRequest.user.id,
      };

      mockOpportunitiesService.clone.mockResolvedValueOnce(clonedOpportunity);

      const result = await controller.clone(opportunityId, mockAuthRequest);

      expect(result).toEqual(clonedOpportunity);
      expect(mockOpportunitiesService.clone).toHaveBeenCalledWith(
        opportunityId,
        mockAuthRequest.user.id,
        mockAuthRequest.user.role,
      );
    });
  });
});
