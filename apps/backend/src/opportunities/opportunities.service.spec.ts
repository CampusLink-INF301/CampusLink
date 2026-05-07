import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { OpportunitiesService } from './opportunities.service';
import {
  Opportunity,
  OpportunityType,
  OpportunityStatus,
} from './entities/opportunity.entity';
import { Application } from '../applications/entities/application.entity';
import { UserRole } from '../auth/entities/user.entity';

const mockQbChain = {
  leftJoinAndSelect: jest.fn().mockReturnThis(),
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
  publisher,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  computeSearchText: jest.fn(),
};

describe('OpportunitiesService', () => {
  let service: OpportunitiesService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OpportunitiesService,
        { provide: getRepositoryToken(Opportunity), useValue: mockRepo },
        { provide: getRepositoryToken(Application), useValue: mockAppRepo },
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

      const result = await service.create(dto, 'user-1');

      expect(mockRepo.create).toHaveBeenCalledWith({
        ...dto,
        publisher: { id: 'user-1' },
      });
      expect(mockRepo.save).toHaveBeenCalledWith(created);
      expect(result).toEqual(created);
    });
  });

  describe('update', () => {
    it('updates an opportunity when the user is the publisher', async () => {
      mockRepo.findOne.mockResolvedValue({ ...baseOpportunity });
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
  });

  describe('remove', () => {
    it('removes an opportunity when the user is the publisher', async () => {
      mockRepo.findOne.mockResolvedValue(baseOpportunity);
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
  });
});
