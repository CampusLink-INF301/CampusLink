import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { ILike } from 'typeorm';
import { OpportunitiesService } from './opportunities.service';
import { Opportunity, OpportunityType } from './entities/opportunity.entity';
import { UserRole } from '../auth/entities/user.entity';

const mockRepo = {
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
};

const publisher = { id: 'user-1', name: 'Test User', email: 'test@test.com', role: UserRole.ESTUDIANTE, password: 'hashed', createdAt: new Date() };

const baseOpportunity: Opportunity = {
  id: 'uuid-1',
  title: 'Tutoría de Cálculo',
  description: 'Apoyo en cálculo diferencial',
  type: OpportunityType.TUTORIA,
  requirements: null as unknown as string,
  deadline: null as unknown as Date,
  isActive: true,
  publisher,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

describe('OpportunitiesService', () => {
  let service: OpportunitiesService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OpportunitiesService,
        { provide: getRepositoryToken(Opportunity), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<OpportunitiesService>(OpportunitiesService);
  });

  describe('findAll', () => {
    it('returns active opportunities without filters', async () => {
      mockRepo.find.mockResolvedValue([baseOpportunity]);

      const result = await service.findAll({});

      expect(mockRepo.find).toHaveBeenCalledWith({
        where: { isActive: true },
        order: { createdAt: 'DESC' },
        relations: ['publisher'],
      });
      expect(result).toEqual([baseOpportunity]);
    });

    it('applies type filter', async () => {
      mockRepo.find.mockResolvedValue([baseOpportunity]);

      await service.findAll({ type: OpportunityType.TUTORIA });

      expect(mockRepo.find).toHaveBeenCalledWith({
        where: { isActive: true, type: OpportunityType.TUTORIA },
        order: { createdAt: 'DESC' },
        relations: ['publisher'],
      });
    });

    it('applies search filter with ILike', async () => {
      mockRepo.find.mockResolvedValue([baseOpportunity]);

      await service.findAll({ search: 'cálculo' });

      expect(mockRepo.find).toHaveBeenCalledWith({
        where: { isActive: true, title: ILike('%cálculo%') },
        order: { createdAt: 'DESC' },
        relations: ['publisher'],
      });
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

      await expect(service.findOne('no-existe')).rejects.toThrow(NotFoundException);
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

      expect(mockRepo.create).toHaveBeenCalledWith({ ...dto, publisher: { id: 'user-1' } });
      expect(mockRepo.save).toHaveBeenCalledWith(created);
      expect(result).toEqual(created);
    });
  });

  describe('update', () => {
    it('updates an opportunity when the user is the publisher', async () => {
      mockRepo.findOne.mockResolvedValue({ ...baseOpportunity });
      const updated = { ...baseOpportunity, title: 'Título actualizado' };
      mockRepo.save.mockResolvedValue(updated);

      const result = await service.update('uuid-1', { title: 'Título actualizado' }, 'user-1');

      expect(result.title).toBe('Título actualizado');
    });

    it('throws ForbiddenException when user is not the publisher', async () => {
      mockRepo.findOne.mockResolvedValue({ ...baseOpportunity });

      await expect(service.update('uuid-1', { title: 'x' }, 'other-user')).rejects.toThrow(ForbiddenException);
    });

    it('throws NotFoundException when updating non-existent opportunity', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(service.update('no-existe', { title: 'x' }, 'user-1')).rejects.toThrow(NotFoundException);
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

      await expect(service.remove('uuid-1', 'other-user')).rejects.toThrow(ForbiddenException);
    });

    it('throws NotFoundException when removing non-existent opportunity', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(service.remove('no-existe', 'user-1')).rejects.toThrow(NotFoundException);
    });
  });
});
