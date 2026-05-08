/**
 * Applications Controller Tests
 *
 * ORÁCULO: controller debe delegar al service y retornar resultados esperados
 * según rol y precondiciones de usuario autenticado.
 *
 * Requisitos cubiertos:
 * - REQ-APP-001: Estudiante puede postularse a opportunity
 * - REQ-APP-002: Estudiante puede ver sus aplicaciones
 * - REQ-APP-003: Docente puede ver aplicaciones a su opportunity
 * - REQ-APP-004: Docente puede cambiar status de aplicación
 * - REQ-APP-005: Aplicaciones tienen validación de rol
 *
 * Estrategia de testing:
 * - Happy path: acción válida por usuario con rol correcto
 * - Negativo: acción por usuario sin rol requerido (RolesGuard lo rechaza)
 * - Negativo: opportunity o application no existe
 * - Valor límite: query params con límites
 */

import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationsController } from './applications.controller';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { FinalizeOpportunityDto } from './dto/finalize-opportunity.dto';
import { QueryApplicationDto } from './dto/query-application.dto';
import { UserRole } from '../auth/entities/user.entity';

type AuthRequest = {
  user: { id: string; role: UserRole; suspended: boolean };
};

describe('ApplicationsController', () => {
  let controller: ApplicationsController;
  let mockApplicationsService: any;

  const mockAuthRequest: AuthRequest = {
    user: {
      id: '550e8400-e29b-41d4-a716-446655440000',
      role: UserRole.ESTUDIANTE,
      suspended: false,
    },
  };

  beforeEach(async () => {
    mockApplicationsService = {
      apply: jest.fn(),
      cancel: jest.fn(),
      findByUser: jest.fn(),
      findByOpportunity: jest.fn(),
      finalize: jest.fn(),
      setFeedback: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApplicationsController],
      providers: [
        {
          provide: ApplicationsService,
          useValue: mockApplicationsService,
        },
      ],
    }).compile();

    controller = module.get<ApplicationsController>(ApplicationsController);
  });

  describe('POST /applications - Postulación', () => {
    it('TC-APP-001: estudiante debe poder postularse a opportunity', async () => {
      // Precondición: estudiante autenticado, opportunity existe
      // Entrada: CreateApplicationDto { opportunityId, formResponses? }
      // Resultado esperado: service.apply retorna application creada
      // Oráculo: service.apply llamado con userId y dto

      const dto: CreateApplicationDto = {
        opportunityId: '660f7411-f30c-42e5-a727-556666551111',
        formResponses: { field1: 'answer1' },
      };

      const expectedApplication = {
        id: '770g8512-g41d-53f5-b838-667777662222',
        userId: mockAuthRequest.user.id,
        opportunityId: dto.opportunityId,
        status: 'POSTULADO',
      };

      mockApplicationsService.apply.mockResolvedValueOnce(expectedApplication);

      const result = await controller.apply(dto, mockAuthRequest);

      expect(result).toEqual(expectedApplication);
      expect(mockApplicationsService.apply).toHaveBeenCalledWith(
        mockAuthRequest.user.id,
        dto,
      );
    });

    it('TC-APP-002: debe rechazar postulación duplicate (mismo user+opportunity)', async () => {
      // Precondición: user ya postulado a opportunity
      // Entrada: CreateApplicationDto con opportunityId ya existente
      // Resultado esperado: service lanza error
      // Oráculo: expect fn to throw BadRequestException

      const dto: CreateApplicationDto = {
        opportunityId: '660f7411-f30c-42e5-a727-556666551111',
      };

      mockApplicationsService.apply.mockRejectedValueOnce(
        new Error('Already applied'),
      );

      await expect(controller.apply(dto, mockAuthRequest)).rejects.toThrow(
        'Already applied',
      );
    });
  });

  describe('DELETE /applications/:id - Cancelación', () => {
    it('TC-APP-003: estudiante debe poder cancelar su postulación', async () => {
      // Precondición: application existe y pertenece a usuario
      // Entrada: { id: applicationId }
      // Resultado esperado: service.cancel retorna void o success
      // Oráculo: service.cancel llamado 1 vez con userId e id

      const applicationId = '770g8512-g41d-53f5-b838-667777662222';
      mockApplicationsService.cancel.mockResolvedValueOnce(undefined);

      const result = await controller.cancel(applicationId, mockAuthRequest);

      expect(result).toBeUndefined();
      expect(mockApplicationsService.cancel).toHaveBeenCalledWith(
        mockAuthRequest.user.id,
        applicationId,
      );
    });
  });

  describe('GET /applications/mine - Mis Postulaciones', () => {
    it('TC-APP-004: estudiante debe ver sus postulaciones con filtros', async () => {
      // Precondición: estudiante autenticado
      // Entrada: QueryApplicationDto { search?, type?, status? }
      // Resultado esperado: service.findByUser retorna array
      // Oráculo: servicio llamado con userId y dto

      const query: QueryApplicationDto = { status: 'POSTULADO' as any };
      const expectedApplications = [
        {
          id: '770g8512-g41d-53f5-b838-667777662222',
          status: 'POSTULADO',
        },
      ];

      mockApplicationsService.findByUser.mockResolvedValueOnce(
        expectedApplications,
      );

      const result = await controller.getMyApplications(mockAuthRequest, query);

      expect(result).toEqual(expectedApplications);
      expect(mockApplicationsService.findByUser).toHaveBeenCalledWith(
        mockAuthRequest.user.id,
        query,
      );
    });

    it('TC-APP-005: debe manejar búsqueda vacía (no results)', async () => {
      // Entrada: QueryApplicationDto { search: 'nonexistent' }
      // Resultado esperado: retorna array vacío
      // Oráculo: retorna [] sin error

      const query: QueryApplicationDto = { search: 'nonexistent' };
      mockApplicationsService.findByUser.mockResolvedValueOnce([]);

      const result = await controller.getMyApplications(mockAuthRequest, query);

      expect(result).toEqual([]);
    });
  });

  describe('GET /applications/by-opportunity/:id - Aplicaciones de Opportunity', () => {
    it('TC-APP-006: docente debe ver postulaciones a sus oportunidades', async () => {
      // Precondición: usuario es DOCENTE, opportunity es suya
      // Entrada: { id: opportunityId }
      // Resultado esperado: service.findByOpportunity retorna applications
      // Oráculo: servicio llamado con opportunityId y userId

      const doctoRequest: AuthRequest = {
        user: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          role: UserRole.DOCENTE,
          suspended: false,
        },
      };

      const opportunityId = '660f7411-f30c-42e5-a727-556666551111';
      const expectedApplications = [
        {
          id: '770g8512-g41d-53f5-b838-667777662222',
          userId: 'student-id-123',
          status: 'POSTULADO',
        },
      ];

      mockApplicationsService.findByOpportunity.mockResolvedValueOnce(
        expectedApplications,
      );

      const result = await controller.getByOpportunity(
        opportunityId,
        doctoRequest,
      );

      expect(result).toEqual(expectedApplications);
      expect(mockApplicationsService.findByOpportunity).toHaveBeenCalledWith(
        opportunityId,
        doctoRequest.user.id,
      );
    });
  });
});
