import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { getDataSourceToken } from '@nestjs/typeorm';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { Application, ApplicationStatus } from './entities/application.entity';
import { Message } from './entities/message.entity';
import { NotificationsService } from '../notifications/notifications.service';
import {
  Opportunity,
  OpportunityType,
  OpportunityStatus,
} from '../opportunities/entities/opportunity.entity';
import { UserRole } from '../auth/entities/user.entity';

const mockAppQbChain = {
  leftJoinAndSelect: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  getMany: jest.fn(),
};

const mockAppRepo = {
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  createQueryBuilder: jest.fn().mockReturnValue(mockAppQbChain),
};

const mockMessageRepo = {
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
};

const mockOpportunityRepo = {
  findOne: jest.fn(),
};

const mockManager = {
  update: jest.fn().mockResolvedValue(undefined),
};

const mockDataSource = {
  transaction: jest
    .fn()
    .mockImplementation(async (fn: (m: typeof mockManager) => Promise<void>) =>
      fn(mockManager),
    ),
};

const futureDeadline = new Date(Date.now() + 86400 * 1000);
const pastDeadline = new Date(Date.now() - 86400 * 1000);

const publisher = {
  id: 'user-1',
  name: 'Docente',
  email: 'u@u.com',
  role: UserRole.DOCENTE,
  password: 'hashed',
  createdAt: new Date(),
  suspended: false,
};
const student = {
  id: 'user-2',
  name: 'Student',
  email: 's@s.com',
  role: UserRole.ESTUDIANTE,
  password: 'hashed',
  createdAt: new Date(),
  suspended: false,
};

const baseOpportunity: Opportunity = {
  id: 'opp-1',
  title: 'Tutoría de Cálculo',
  description: 'Descripción',
  type: OpportunityType.TUTORIA,
  requirements: null as unknown as string,
  deadline: null as unknown as Date,
  status: OpportunityStatus.DISPONIBLE,
  searchText: '',
  formFields: null,
  publisher,
  createdAt: new Date(),
  updatedAt: new Date(),
  computeSearchText: jest.fn(),
};

const baseApplication: Application = {
  id: 'app-1',
  user: student,
  opportunity: baseOpportunity,
  status: ApplicationStatus.POSTULADO,
  feedback: null,
  formResponses: null,
  createdAt: new Date(),
};

describe('ApplicationsService', () => {
  let service: ApplicationsService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const mockNotificationsService = {
      create: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationsService,
        { provide: getRepositoryToken(Application), useValue: mockAppRepo },
        { provide: getRepositoryToken(Message), useValue: mockMessageRepo },
        {
          provide: getRepositoryToken(Opportunity),
          useValue: mockOpportunityRepo,
        },
        { provide: getDataSourceToken(), useValue: mockDataSource },
        { provide: NotificationsService, useValue: mockNotificationsService },
      ],
    }).compile();

    service = module.get<ApplicationsService>(ApplicationsService);
  });

  describe('apply', () => {
    it('creates a new application', async () => {
      mockOpportunityRepo.findOne.mockResolvedValue(baseOpportunity);
      mockAppRepo.findOne.mockResolvedValue(null);
      mockAppRepo.create.mockReturnValue(baseApplication);
      mockAppRepo.save.mockResolvedValue(baseApplication);

      const result = await service.apply('user-2', { opportunityId: 'opp-1' });

      expect(mockAppRepo.create).toHaveBeenCalledWith({
        user: { id: 'user-2' },
        opportunity: { id: 'opp-1' },
        formResponses: null,
      });
      expect(result).toEqual(baseApplication);
    });

    it('throws NotFoundException when opportunity does not exist', async () => {
      mockOpportunityRepo.findOne.mockResolvedValue(null);

      await expect(
        service.apply('user-2', { opportunityId: 'no-existe' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException when opportunity is not DISPONIBLE', async () => {
      mockOpportunityRepo.findOne.mockResolvedValue({
        ...baseOpportunity,
        status: OpportunityStatus.EN_EVALUACION,
      });

      await expect(
        service.apply('user-2', { opportunityId: 'opp-1' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when deadline has passed', async () => {
      mockOpportunityRepo.findOne.mockResolvedValue({
        ...baseOpportunity,
        deadline: pastDeadline,
      });

      await expect(
        service.apply('user-2', { opportunityId: 'opp-1' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws ConflictException when already applied (active)', async () => {
      mockOpportunityRepo.findOne.mockResolvedValue(baseOpportunity);
      mockAppRepo.findOne.mockResolvedValue(baseApplication);

      await expect(
        service.apply('user-2', { opportunityId: 'opp-1' }),
      ).rejects.toThrow(ConflictException);
    });

    it('reactivates a cancelled application', async () => {
      const cancelled = {
        ...baseApplication,
        status: ApplicationStatus.CANCELADO,
      };
      mockOpportunityRepo.findOne.mockResolvedValue(baseOpportunity);
      mockAppRepo.findOne.mockResolvedValue(cancelled);
      mockAppRepo.save.mockResolvedValue({
        ...cancelled,
        status: ApplicationStatus.POSTULADO,
      });

      const result = await service.apply('user-2', { opportunityId: 'opp-1' });

      expect(result.status).toBe(ApplicationStatus.POSTULADO);
    });
  });

  describe('cancel', () => {
    it('cancels a POSTULADO application with no deadline', async () => {
      mockAppRepo.findOne.mockResolvedValue({ ...baseApplication });
      mockAppRepo.save.mockResolvedValue({
        ...baseApplication,
        status: ApplicationStatus.CANCELADO,
      });

      await service.cancel('user-2', 'app-1');

      expect(mockAppRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: ApplicationStatus.CANCELADO }),
      );
    });

    it('throws NotFoundException when application does not exist', async () => {
      mockAppRepo.findOne.mockResolvedValue(null);

      await expect(service.cancel('user-2', 'no-existe')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws ForbiddenException when user is not the owner', async () => {
      mockAppRepo.findOne.mockResolvedValue({ ...baseApplication });

      await expect(service.cancel('other-user', 'app-1')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('throws BadRequestException when application is not POSTULADO', async () => {
      mockAppRepo.findOne.mockResolvedValue({
        ...baseApplication,
        status: ApplicationStatus.EN_EVALUACION,
      });

      await expect(service.cancel('user-2', 'app-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('throws BadRequestException when deadline has passed', async () => {
      mockAppRepo.findOne.mockResolvedValue({
        ...baseApplication,
        opportunity: { ...baseOpportunity, deadline: pastDeadline },
      });

      await expect(service.cancel('user-2', 'app-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('allows cancellation when deadline is in the future', async () => {
      mockAppRepo.findOne.mockResolvedValue({
        ...baseApplication,
        opportunity: { ...baseOpportunity, deadline: futureDeadline },
      });
      mockAppRepo.save.mockResolvedValue({
        ...baseApplication,
        status: ApplicationStatus.CANCELADO,
      });

      await expect(service.cancel('user-2', 'app-1')).resolves.toBeUndefined();
    });
  });

  describe('findByOpportunity', () => {
    const enEvalOpp = {
      ...baseOpportunity,
      status: OpportunityStatus.EN_EVALUACION,
    };

    it('returns applications for publisher', async () => {
      mockOpportunityRepo.findOne.mockResolvedValue(enEvalOpp);
      mockAppRepo.find.mockResolvedValue([baseApplication]);

      const result = await service.findByOpportunity('opp-1', 'user-1');

      expect(result).toEqual([baseApplication]);
    });

    it('throws ForbiddenException for non-publisher', async () => {
      mockOpportunityRepo.findOne.mockResolvedValue(enEvalOpp);

      await expect(
        service.findByOpportunity('opp-1', 'other-user'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('returns applications for publisher when opportunity is DISPONIBLE', async () => {
      mockOpportunityRepo.findOne.mockResolvedValue(baseOpportunity);
      mockAppRepo.find.mockResolvedValue([baseApplication]);

      const result = await service.findByOpportunity('opp-1', 'user-1');

      expect(result).toEqual([baseApplication]);
    });
  });

  describe('finalize', () => {
    const enEvalOpp = {
      ...baseOpportunity,
      status: OpportunityStatus.EN_EVALUACION,
    };
    const enEvalApp1 = {
      ...baseApplication,
      id: 'app-1',
      status: ApplicationStatus.EN_EVALUACION,
    };
    const enEvalApp2 = {
      ...baseApplication,
      id: 'app-2',
      user: { ...student, id: 'user-3' },
      status: ApplicationStatus.EN_EVALUACION,
    };

    it('finalizes with accepted applicants → FINALIZADO', async () => {
      mockOpportunityRepo.findOne.mockResolvedValue(enEvalOpp);
      mockAppRepo.find.mockResolvedValue([enEvalApp1, enEvalApp2]);

      await service.finalize('opp-1', 'user-1', {
        acceptedApplicationIds: ['app-1'],
      });

      expect(mockManager.update).toHaveBeenCalledWith(
        Application,
        { id: 'app-1' },
        { status: ApplicationStatus.ACEPTADO },
      );
      expect(mockManager.update).toHaveBeenCalledWith(
        Application,
        { id: 'app-2' },
        { status: ApplicationStatus.NO_SELECCIONADO },
      );
      expect(mockManager.update).toHaveBeenCalledWith(
        Opportunity,
        { id: 'opp-1' },
        { status: OpportunityStatus.FINALIZADO },
      );
    });

    it('marks opportunity as DESIERTA when no one is accepted', async () => {
      mockOpportunityRepo.findOne.mockResolvedValue(enEvalOpp);
      mockAppRepo.find.mockResolvedValue([enEvalApp1]);

      await service.finalize('opp-1', 'user-1', { acceptedApplicationIds: [] });

      expect(mockManager.update).toHaveBeenCalledWith(
        Opportunity,
        { id: 'opp-1' },
        { status: OpportunityStatus.DESIERTA },
      );
    });

    it('throws ForbiddenException for non-publisher', async () => {
      mockOpportunityRepo.findOne.mockResolvedValue(enEvalOpp);

      await expect(
        service.finalize('opp-1', 'other-user', { acceptedApplicationIds: [] }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('throws BadRequestException when not EN_EVALUACION', async () => {
      mockOpportunityRepo.findOne.mockResolvedValue(baseOpportunity);

      await expect(
        service.finalize('opp-1', 'user-1', { acceptedApplicationIds: [] }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('setFeedback', () => {
    const finalizedOpp = {
      ...baseOpportunity,
      status: OpportunityStatus.FINALIZADO,
    };
    const finalizedApp = { ...baseApplication, opportunity: finalizedOpp };

    it('sets feedback on a finalized application', async () => {
      mockAppRepo.findOne.mockResolvedValue(finalizedApp);
      mockAppRepo.save.mockResolvedValue({
        ...finalizedApp,
        feedback: 'Buen trabajo',
      });

      const result = await service.setFeedback('app-1', 'user-1', {
        feedback: 'Buen trabajo',
      });

      expect(result.feedback).toBe('Buen trabajo');
    });

    it('throws ForbiddenException for non-publisher', async () => {
      mockAppRepo.findOne.mockResolvedValue(finalizedApp);

      await expect(
        service.setFeedback('app-1', 'other-user', { feedback: 'x' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('throws BadRequestException when opportunity is not finalized', async () => {
      mockAppRepo.findOne.mockResolvedValue({
        ...baseApplication,
        opportunity: {
          ...baseOpportunity,
          status: OpportunityStatus.EN_EVALUACION,
        },
      });

      await expect(
        service.setFeedback('app-1', 'user-1', { feedback: 'x' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findByUser', () => {
    it('returns applications for a given user with no filters', async () => {
      mockAppRepo.find.mockResolvedValue([baseApplication]);

      const result = await service.findByUser('user-2');

      expect(mockAppRepo.find).toHaveBeenCalledWith({
        where: { user: { id: 'user-2' } },
        relations: ['opportunity'],
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual([baseApplication]);
    });

    it('uses QueryBuilder when status filter is provided', async () => {
      mockAppQbChain.getMany.mockResolvedValue([baseApplication]);

      const result = await service.findByUser('user-2', {
        status: ApplicationStatus.POSTULADO,
      });

      expect(mockAppQbChain.andWhere).toHaveBeenCalledWith(
        'application.status = :status',
        { status: ApplicationStatus.POSTULADO },
      );
      expect(result).toEqual([baseApplication]);
    });

    it('filters by opportunity type when provided', async () => {
      mockAppQbChain.getMany.mockResolvedValue([baseApplication]);
      const { OpportunityType } =
        await import('../opportunities/entities/opportunity.entity');

      await service.findByUser('user-2', { type: OpportunityType.TUTORIA });

      expect(mockAppQbChain.andWhere).toHaveBeenCalledWith(
        'opportunity.type = :type',
        { type: OpportunityType.TUTORIA },
      );
    });
  });

  describe('state machine — postular → cancelar → re-postular', () => {
    it('full lifecycle: apply, cancel, reactivate', async () => {
      // Step 1: apply
      mockOpportunityRepo.findOne.mockResolvedValue(baseOpportunity);
      mockAppRepo.findOne.mockResolvedValue(null);
      mockAppRepo.create.mockReturnValue(baseApplication);
      mockAppRepo.save.mockResolvedValue(baseApplication);
      const applied = await service.apply('user-2', { opportunityId: 'opp-1' });
      expect(applied.status).toBe(ApplicationStatus.POSTULADO);

      // Step 2: cancel
      mockAppRepo.findOne.mockResolvedValue({ ...baseApplication });
      mockAppRepo.save.mockResolvedValue({
        ...baseApplication,
        status: ApplicationStatus.CANCELADO,
      });
      await service.cancel('user-2', 'app-1');
      expect(mockAppRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: ApplicationStatus.CANCELADO }),
      );

      // Step 3: re-apply (reactivation of CANCELADO app)
      const cancelledApp = {
        ...baseApplication,
        status: ApplicationStatus.CANCELADO,
      };
      mockOpportunityRepo.findOne.mockResolvedValue(baseOpportunity);
      mockAppRepo.findOne.mockResolvedValue(cancelledApp);
      mockAppRepo.save.mockResolvedValue({
        ...cancelledApp,
        status: ApplicationStatus.POSTULADO,
      });
      const reactivated = await service.apply('user-2', {
        opportunityId: 'opp-1',
      });
      expect(reactivated.status).toBe(ApplicationStatus.POSTULADO);
    });
  });

  describe('state machine — postular → finalize', () => {
    it('finalize with accepted and rejected applicants', async () => {
      const enEvalOpp = {
        ...baseOpportunity,
        status: OpportunityStatus.EN_EVALUACION,
      };
      const app1 = {
        ...baseApplication,
        id: 'app-1',
        status: ApplicationStatus.EN_EVALUACION,
      };
      const app2 = {
        ...baseApplication,
        id: 'app-2',
        status: ApplicationStatus.EN_EVALUACION,
      };
      mockOpportunityRepo.findOne.mockResolvedValue(enEvalOpp);
      mockAppRepo.find.mockResolvedValue([app1, app2]);

      await service.finalize('opp-1', 'user-1', {
        acceptedApplicationIds: ['app-1'],
      });

      expect(mockManager.update).toHaveBeenCalledWith(
        Application,
        { id: 'app-1' },
        { status: ApplicationStatus.ACEPTADO },
      );
      expect(mockManager.update).toHaveBeenCalledWith(
        Application,
        { id: 'app-2' },
        { status: ApplicationStatus.NO_SELECCIONADO },
      );
      expect(mockManager.update).toHaveBeenCalledWith(
        Opportunity,
        { id: 'opp-1' },
        { status: OpportunityStatus.FINALIZADO },
      );
    });
  });

  describe('getStats', () => {
    it('counts applications by status correctly', async () => {
      mockAppRepo.find.mockResolvedValue([
        { ...baseApplication, status: ApplicationStatus.ACEPTADO },
        { ...baseApplication, status: ApplicationStatus.POSTULADO },
        { ...baseApplication, status: ApplicationStatus.EN_EVALUACION },
        { ...baseApplication, status: ApplicationStatus.NO_SELECCIONADO },
        { ...baseApplication, status: ApplicationStatus.CANCELADO },
      ] as never);

      const result = await service.getStats('user-2');

      expect(result).toEqual({
        total: 5,
        aceptadas: 1,
        pendientes: 2,
        rechazadas: 1,
      });
    });

    it('returns zeros when user has no applications', async () => {
      mockAppRepo.find.mockResolvedValue([] as never);

      const result = await service.getStats('user-2');

      expect(result).toEqual({
        total: 0,
        aceptadas: 0,
        pendientes: 0,
        rechazadas: 0,
      });
    });
  });

  describe('getMessages', () => {
    const acceptedApplication = {
      ...baseApplication,
      status: ApplicationStatus.ACEPTADO,
    };

    const baseMessage = {
      id: 'msg-1',
      content: 'Hola',
      createdAt: new Date(),
      sender: student,
      application: acceptedApplication,
    };

    it('throws ForbiddenException for a non-participant user', async () => {
      mockAppRepo.findOne.mockResolvedValue(acceptedApplication);

      await expect(service.getMessages('other-user', 'app-1')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('throws BadRequestException when application status is not ACEPTADO', async () => {
      mockAppRepo.findOne.mockResolvedValue({ ...baseApplication });

      await expect(service.getMessages('user-2', 'app-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('returns messages for an accepted application (applicant)', async () => {
      mockAppRepo.findOne.mockResolvedValue(acceptedApplication);
      mockMessageRepo.find.mockResolvedValue([baseMessage] as never);

      const result = await service.getMessages('user-2', 'app-1');

      expect(mockMessageRepo.find).toHaveBeenCalledWith({
        where: { application: { id: 'app-1' } },
        relations: ['sender'],
        order: { createdAt: 'ASC' },
      });
      expect(result).toEqual([baseMessage]);
    });

    it('returns messages for an accepted application (publisher)', async () => {
      mockAppRepo.findOne.mockResolvedValue(acceptedApplication);
      mockMessageRepo.find.mockResolvedValue([baseMessage] as never);

      const result = await service.getMessages('user-1', 'app-1');

      expect(result).toEqual([baseMessage]);
    });
  });

  describe('sendMessage', () => {
    const acceptedApplication = {
      ...baseApplication,
      status: ApplicationStatus.ACEPTADO,
    };

    const createdMessage = {
      id: 'msg-new',
      content: 'Nuevo mensaje',
      createdAt: new Date(),
      sender: student,
      application: acceptedApplication,
    };

    it('throws ForbiddenException for a non-participant user', async () => {
      mockAppRepo.findOne.mockResolvedValue(acceptedApplication);

      await expect(
        service.sendMessage('other-user', 'app-1', { content: 'Hola' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('throws BadRequestException when application is not ACEPTADO', async () => {
      mockAppRepo.findOne.mockResolvedValue({ ...baseApplication });

      await expect(
        service.sendMessage('user-2', 'app-1', { content: 'Hola' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('creates and returns a new message', async () => {
      mockAppRepo.findOne.mockResolvedValue(acceptedApplication);
      mockMessageRepo.create.mockReturnValue(createdMessage);
      mockMessageRepo.save.mockResolvedValue(createdMessage as never);

      const result = await service.sendMessage('user-2', 'app-1', {
        content: 'Nuevo mensaje',
      });

      expect(mockMessageRepo.create).toHaveBeenCalledWith({
        application: { id: 'app-1' },
        sender: { id: 'user-2' },
        content: 'Nuevo mensaje',
      });
      expect(result).toEqual(createdMessage);
    });
  });
});
