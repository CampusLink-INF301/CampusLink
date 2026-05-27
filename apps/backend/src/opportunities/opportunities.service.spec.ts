import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { OpportunitiesService } from './opportunities.service';
import { NotificationsService } from '../notifications/notifications.service';
import {
  Opportunity,
  OpportunityType,
  OpportunityStatus,
} from './entities/opportunity.entity';
import { Application } from '../applications/entities/application.entity';
import { UserRole } from '../auth/entities/user.entity';

const mockQbChain = {
  leftJoin: jest.fn().mockReturnThis(),
  leftJoinAndSelect: jest.fn().mockReturnThis(),
  addSelect: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  addOrderBy: jest.fn().mockReturnThis(),
  take: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  getManyAndCount: jest.fn(),
  getMany: jest.fn(),
};

const mockRepo = {
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
  createQueryBuilder: jest.fn().mockReturnValue(mockQbChain),
};

const mockAppQbChain = {
  update: jest.fn().mockReturnThis(),
  set: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  execute: jest.fn().mockResolvedValue(undefined),
};

const mockAppRepo = {
  find: jest.fn(),
  count: jest.fn(),
  createQueryBuilder: jest.fn().mockReturnValue(mockAppQbChain),
};

const publisher = {
  id: 'user-1',
  name: 'Test User',
  email: 'test@test.com',
  role: UserRole.ESTUDIANTE,
  password: 'hashed',
  createdAt: new Date(),
  suspended: false,
};

const baseOpportunity: Opportunity = {
  id: 'uuid-1',
  title: 'Tutoría de Cálculo',
  description: 'Apoyo en cálculo diferencial',
  type: OpportunityType.TUTORIA,
  requirements: null as unknown as string,
  deadline: null as unknown as Date,
  status: OpportunityStatus.DISPONIBLE,
  searchText: 'tutoria de calculo apoyo en calculo diferencial',
  formFields: null,
  publisher,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  computeSearchText: jest.fn(),
};

describe('OpportunitiesService', () => {
  let service: OpportunitiesService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const mockNotificationsService = {
      createMany: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OpportunitiesService,
        { provide: getRepositoryToken(Opportunity), useValue: mockRepo },
        { provide: getRepositoryToken(Application), useValue: mockAppRepo },
        { provide: NotificationsService, useValue: mockNotificationsService },
      ],
    }).compile();

    service = module.get<OpportunitiesService>(OpportunitiesService);
  });

  describe('findAvailable', () => {
    it('returns paginated DISPONIBLE opportunities', async () => {
      mockRepo.find.mockResolvedValue([]);
      mockQbChain.getManyAndCount.mockResolvedValue([[baseOpportunity], 1]);

      const result = await service.findAvailable({});

      expect(result.items).toEqual([baseOpportunity]);
      expect(result.total).toBe(1);
      expect(result.hasMore).toBe(false);
    });

    it('sets hasMore true when offset + items.length < total', async () => {
      mockRepo.find.mockResolvedValue([]);
      mockQbChain.getManyAndCount.mockResolvedValue([[baseOpportunity], 5]);

      const result = await service.findAvailable({ limit: 1, offset: 0 });

      expect(result.hasMore).toBe(true);
    });

    it('searches using normalizeSearch on searchText (strips accents)', async () => {
      mockRepo.find.mockResolvedValue([]);
      mockQbChain.getManyAndCount.mockResolvedValue([[baseOpportunity], 1]);

      await service.findAvailable({ search: 'Práctica' });

      expect(mockQbChain.andWhere).toHaveBeenCalledWith(
        'opportunity.searchText ILIKE :search',
        { search: '%practica%' },
      );
    });

    it('applies type filter', async () => {
      mockRepo.find.mockResolvedValue([]);
      mockQbChain.getManyAndCount.mockResolvedValue([[], 0]);

      await service.findAvailable({ type: OpportunityType.TUTORIA });

      expect(mockQbChain.andWhere).toHaveBeenCalledWith(
        'opportunity.type = :type',
        { type: OpportunityType.TUTORIA },
      );
    });

    it('transitions DISPONIBLE opportunities with past deadline to EN_EVALUACION', async () => {
      const pastDeadline = new Date(Date.now() - 86400 * 1000);
      const expiredOpp = { ...baseOpportunity, deadline: pastDeadline };
      mockRepo.find.mockResolvedValue([expiredOpp]);
      mockRepo.save.mockResolvedValue({
        ...expiredOpp,
        status: OpportunityStatus.EN_EVALUACION,
      });
      mockQbChain.getManyAndCount.mockResolvedValue([[], 0]);

      await service.findAvailable({});

      expect(mockRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: OpportunityStatus.EN_EVALUACION }),
      );
    });
  });

  describe('findOne', () => {
    it('returns the opportunity when found', async () => {
      mockRepo.findOne.mockResolvedValue(baseOpportunity);

      const result = await service.findOne('uuid-1');

      expect(mockRepo.findOne).toHaveBeenCalledWith({
        where: { id: 'uuid-1' },
        relations: ['publisher'],
      });
      expect(result).toEqual(baseOpportunity);
    });

    it('throws NotFoundException when not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne('no-existe')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('creates and saves a new opportunity with publisher', async () => {
      const dto = {
        title: 'Nueva tutoría',
        description: 'Descripción',
        type: OpportunityType.TUTORIA,
      };
      const created = { ...baseOpportunity, ...dto };
      mockRepo.create.mockReturnValue(created);
      mockRepo.save.mockResolvedValue(created);

      const result = await service.create(dto, 'user-1', UserRole.DOCENTE);

      expect(mockRepo.create).toHaveBeenCalledWith({
        ...dto,
        formFields: null,
        publisher: { id: 'user-1' },
      });
      expect(mockRepo.save).toHaveBeenCalledWith(created);
      expect(result).toEqual(created);
    });

    it('throws BadRequestException when deadline is in the past', async () => {
      const dto = {
        title: 'Nueva tutoría',
        description: 'Descripción',
        type: OpportunityType.TUTORIA,
        deadline: '2024-01-01',
      };

      await expect(
        service.create(dto, 'user-1', UserRole.DOCENTE),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when role cannot publish that type', async () => {
      const dto = {
        title: 'Práctica',
        description: 'Descripción',
        type: OpportunityType.PRACTICA,
      };

      await expect(
        service.create(dto, 'user-1', UserRole.DOCENTE),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    it('updates an opportunity when the user is the publisher', async () => {
      mockRepo.findOne.mockResolvedValue({ ...baseOpportunity });
      mockAppRepo.count.mockResolvedValue(0);
      const updated = { ...baseOpportunity, title: 'Título actualizado' };
      mockRepo.save.mockResolvedValue(updated);

      const result = await service.update(
        'uuid-1',
        { title: 'Título actualizado' },
        'user-1',
      );

      expect(result.title).toBe('Título actualizado');
    });

    it('throws ForbiddenException when user is not the publisher', async () => {
      mockRepo.findOne.mockResolvedValue({ ...baseOpportunity });

      await expect(
        service.update('uuid-1', { title: 'x' }, 'other-user'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('throws NotFoundException when updating non-existent opportunity', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(
        service.update('no-existe', { title: 'x' }, 'user-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException when there are active applications', async () => {
      mockRepo.findOne.mockResolvedValue({ ...baseOpportunity });
      mockAppRepo.count.mockResolvedValue(2);

      await expect(
        service.update('uuid-1', { title: 'x' }, 'user-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when the opportunity is near the deadline', async () => {
      const nearDeadlineOpportunity = {
        ...baseOpportunity,
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
      };

      mockRepo.findOne.mockResolvedValue(nearDeadlineOpportunity);
      mockAppRepo.count.mockResolvedValue(0);

      await expect(
        service.update('uuid-1', { title: 'x' }, 'user-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when the new deadline is in the past', async () => {
      mockRepo.findOne.mockResolvedValue({ ...baseOpportunity });
      mockAppRepo.count.mockResolvedValue(0);

      await expect(
        service.update(
          'uuid-1',
          { title: 'x', deadline: '2024-01-01' },
          'user-1',
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('removes an opportunity when the user is the publisher', async () => {
      mockRepo.findOne.mockResolvedValue(baseOpportunity);
      mockAppRepo.find.mockResolvedValue([]);
      mockRepo.remove.mockResolvedValue(undefined);

      await service.remove('uuid-1', 'user-1');

      expect(mockRepo.remove).toHaveBeenCalledWith(baseOpportunity);
    });

    it('notifies applicants before removing an opportunity', async () => {
      const applicantA = { user: { id: 'u-2' } };
      const applicantB = { user: { id: 'u-3' } };
      mockRepo.findOne.mockResolvedValue(baseOpportunity);
      mockAppRepo.find.mockResolvedValue([applicantA, applicantB]);
      mockRepo.remove.mockResolvedValue(undefined);

      await service.remove('uuid-1', 'user-1');

      expect(mockRepo.remove).toHaveBeenCalledWith(baseOpportunity);
    });

    it('throws ForbiddenException when user is not the publisher', async () => {
      mockRepo.findOne.mockResolvedValue({ ...baseOpportunity });

      await expect(service.remove('uuid-1', 'other-user')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('throws NotFoundException when removing non-existent opportunity', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(service.remove('no-existe', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByPublisher', () => {
    it('returns items and total for a given publisher', async () => {
      mockQbChain.getManyAndCount.mockResolvedValue([[baseOpportunity], 1]);

      const result = await service.findByPublisher('user-1', {});

      expect(result.items).toEqual([baseOpportunity]);
      expect(result.total).toBe(1);
    });

    it('filters by search on title', async () => {
      mockQbChain.getManyAndCount.mockResolvedValue([[], 0]);

      await service.findByPublisher('user-1', { search: 'cálculo' });

      expect(mockQbChain.andWhere).toHaveBeenCalledWith(
        'opportunity.title ILIKE :search',
        { search: '%cálculo%' },
      );
    });

    it('filters by type', async () => {
      mockQbChain.getManyAndCount.mockResolvedValue([[], 0]);

      await service.findByPublisher('user-1', {
        type: OpportunityType.TUTORIA,
      });

      expect(mockQbChain.andWhere).toHaveBeenCalledWith(
        'opportunity.type = :type',
        { type: OpportunityType.TUTORIA },
      );
    });

    it('filters by status', async () => {
      mockQbChain.getManyAndCount.mockResolvedValue([[], 0]);

      await service.findByPublisher('user-1', {
        status: OpportunityStatus.DISPONIBLE,
      });

      expect(mockQbChain.andWhere).toHaveBeenCalledWith(
        'opportunity.status = :status',
        { status: OpportunityStatus.DISPONIBLE },
      );
    });

    it('paginates correctly on page 2', async () => {
      mockQbChain.getManyAndCount.mockResolvedValue([[baseOpportunity], 15]);

      await service.findByPublisher('user-1', { page: 2 });

      expect(mockQbChain.skip).toHaveBeenCalledWith(10);
      expect(mockQbChain.take).toHaveBeenCalledWith(10);
    });

    it('uses default sort when no sort params are provided', async () => {
      mockQbChain.getManyAndCount.mockResolvedValue([[baseOpportunity], 1]);

      await service.findByPublisher('user-1', {});

      expect(mockQbChain.orderBy).toHaveBeenCalledWith(
        'opportunity.createdAt',
        'DESC',
      );
    });
  });

  describe('clone', () => {
    it('clones an opportunity for the same publisher', async () => {
      mockRepo.findOne.mockResolvedValue(baseOpportunity);
      const cloned = {
        ...baseOpportunity,
        id: 'uuid-2',
        title: 'Tutoría de Cálculo (copia)',
      };
      mockRepo.create.mockReturnValue(cloned);
      mockRepo.save.mockResolvedValue(cloned);

      const result = await service.clone('uuid-1', 'user-1', UserRole.DOCENTE);

      expect(mockRepo.create).toHaveBeenCalledWith({
        title: 'Tutoría de Cálculo (copia)',
        description: baseOpportunity.description,
        type: baseOpportunity.type,
        requirements: baseOpportunity.requirements,
        formFields: baseOpportunity.formFields,
        publisher: { id: 'user-1' },
      });
      expect(result).toEqual(cloned);
    });

    it('throws ForbiddenException when cloning an opportunity from another publisher', async () => {
      mockRepo.findOne.mockResolvedValue(baseOpportunity);

      await expect(
        service.clone('uuid-1', 'other-user', UserRole.DOCENTE),
      ).rejects.toThrow(ForbiddenException);
    });

    it('throws NotFoundException when cloning a non-existent opportunity', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(
        service.clone('no-existe', 'user-1', UserRole.DOCENTE),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
