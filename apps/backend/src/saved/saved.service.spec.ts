import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { SavedService } from './saved.service';
import { SavedOpportunity } from './entities/saved-opportunity.entity';
import {
  Opportunity,
  OpportunityType,
  OpportunityStatus,
} from '../opportunities/entities/opportunity.entity';
import { UserRole } from '../auth/entities/user.entity';

const mockSavedRepo = {
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
};

const mockOpportunityRepo = {
  findOneBy: jest.fn(),
};

const publisher = {
  id: 'user-1',
  name: 'Docente',
  email: 'u@u.com',
  role: UserRole.DOCENTE,
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

const baseSaved: SavedOpportunity = {
  id: 'saved-1',
  user: { id: 'user-2' } as never,
  opportunity: baseOpportunity,
  createdAt: new Date(),
};

describe('SavedService', () => {
  let service: SavedService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SavedService,
        { provide: getRepositoryToken(SavedOpportunity), useValue: mockSavedRepo },
        { provide: getRepositoryToken(Opportunity), useValue: mockOpportunityRepo },
      ],
    }).compile();

    service = module.get<SavedService>(SavedService);
  });

  describe('save', () => {
    it('saves a new opportunity for a user', async () => {
      mockOpportunityRepo.findOneBy.mockResolvedValue(baseOpportunity);
      mockSavedRepo.findOne.mockResolvedValue(null);
      mockSavedRepo.create.mockReturnValue(baseSaved);
      mockSavedRepo.save.mockResolvedValue(baseSaved);

      await service.save('user-2', 'opp-1');

      expect(mockSavedRepo.create).toHaveBeenCalledWith({
        user: { id: 'user-2' },
        opportunity: { id: 'opp-1' },
      });
      expect(mockSavedRepo.save).toHaveBeenCalledWith(baseSaved);
    });

    it('is idempotent when opportunity is already saved', async () => {
      mockOpportunityRepo.findOneBy.mockResolvedValue(baseOpportunity);
      mockSavedRepo.findOne.mockResolvedValue(baseSaved);

      await service.save('user-2', 'opp-1');

      expect(mockSavedRepo.save).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when opportunity does not exist', async () => {
      mockOpportunityRepo.findOneBy.mockResolvedValue(null);

      await expect(service.save('user-2', 'no-existe')).rejects.toThrow(NotFoundException);
    });
  });

  describe('unsave', () => {
    it('removes the saved record when it exists', async () => {
      mockSavedRepo.findOne.mockResolvedValue(baseSaved);
      mockSavedRepo.remove.mockResolvedValue(undefined);

      await service.unsave('user-2', 'opp-1');

      expect(mockSavedRepo.remove).toHaveBeenCalledWith(baseSaved);
    });

    it('does nothing when the record does not exist', async () => {
      mockSavedRepo.findOne.mockResolvedValue(null);

      await service.unsave('user-2', 'opp-1');

      expect(mockSavedRepo.remove).not.toHaveBeenCalled();
    });
  });

  describe('findMine', () => {
    it('returns mapped opportunity objects for a user', async () => {
      mockSavedRepo.find.mockResolvedValue([baseSaved]);

      const result = await service.findMine('user-2');

      expect(mockSavedRepo.find).toHaveBeenCalledWith({
        where: { user: { id: 'user-2' } },
        relations: ['opportunity', 'opportunity.publisher'],
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual([baseOpportunity]);
    });

    it('returns empty array when user has no saved opportunities', async () => {
      mockSavedRepo.find.mockResolvedValue([]);

      const result = await service.findMine('user-2');

      expect(result).toEqual([]);
    });
  });

  describe('getSavedIds', () => {
    it('returns an array of opportunity id strings', async () => {
      mockSavedRepo.find.mockResolvedValue([baseSaved]);

      const result = await service.getSavedIds('user-2');

      expect(result).toEqual(['opp-1']);
    });

    it('returns empty array when user has no saved opportunities', async () => {
      mockSavedRepo.find.mockResolvedValue([]);

      const result = await service.getSavedIds('user-2');

      expect(result).toEqual([]);
    });
  });
});
