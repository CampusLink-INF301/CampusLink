import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { Application, ApplicationStatus } from './entities/application.entity';
import { Opportunity, OpportunityType } from '../opportunities/entities/opportunity.entity';
import { UserRole } from '../auth/entities/user.entity';

const mockAppRepo = {
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
};

const mockOpportunityRepo = {
  findOneBy: jest.fn(),
};

const baseOpportunity: Opportunity = {
  id: 'opp-1',
  title: 'Tutoría de Cálculo',
  description: 'Descripción',
  type: OpportunityType.TUTORIA,
  requirements: null as unknown as string,
  deadline: null as unknown as Date,
  isActive: true,
  publisher: { id: 'user-1', name: 'User', email: 'u@u.com', role: UserRole.DOCENTE, password: 'hashed', createdAt: new Date() },
  createdAt: new Date(),
  updatedAt: new Date(),
};

const baseApplication: Application = {
  id: 'app-1',
  user: { id: 'user-2', name: 'Student', email: 's@s.com', role: UserRole.ESTUDIANTE, password: 'hashed', createdAt: new Date() },
  opportunity: baseOpportunity,
  status: ApplicationStatus.POSTULADO,
  createdAt: new Date(),
};

describe('ApplicationsService', () => {
  let service: ApplicationsService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationsService,
        { provide: getRepositoryToken(Application), useValue: mockAppRepo },
        { provide: getRepositoryToken(Opportunity), useValue: mockOpportunityRepo },
      ],
    }).compile();

    service = module.get<ApplicationsService>(ApplicationsService);
  });

  describe('apply', () => {
    it('creates a new application', async () => {
      mockOpportunityRepo.findOneBy.mockResolvedValue(baseOpportunity);
      mockAppRepo.findOne.mockResolvedValue(null);
      mockAppRepo.create.mockReturnValue(baseApplication);
      mockAppRepo.save.mockResolvedValue(baseApplication);

      const result = await service.apply('user-2', { opportunityId: 'opp-1' });

      expect(mockAppRepo.create).toHaveBeenCalledWith({
        user: { id: 'user-2' },
        opportunity: { id: 'opp-1' },
      });
      expect(result).toEqual(baseApplication);
    });

    it('throws NotFoundException when opportunity does not exist', async () => {
      mockOpportunityRepo.findOneBy.mockResolvedValue(null);

      await expect(service.apply('user-2', { opportunityId: 'no-existe' })).rejects.toThrow(NotFoundException);
    });

    it('throws ConflictException when already applied', async () => {
      mockOpportunityRepo.findOneBy.mockResolvedValue(baseOpportunity);
      mockAppRepo.findOne.mockResolvedValue(baseApplication);

      await expect(service.apply('user-2', { opportunityId: 'opp-1' })).rejects.toThrow(ConflictException);
    });
  });

  describe('findByUser', () => {
    it('returns applications for a given user', async () => {
      mockAppRepo.find.mockResolvedValue([baseApplication]);

      const result = await service.findByUser('user-2');

      expect(mockAppRepo.find).toHaveBeenCalledWith({
        where: { user: { id: 'user-2' } },
        relations: ['opportunity'],
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual([baseApplication]);
    });
  });
});
