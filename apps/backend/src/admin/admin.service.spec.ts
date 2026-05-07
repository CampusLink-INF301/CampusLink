import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AdminService } from './admin.service';
import { User, UserRole } from '../auth/entities/user.entity';
import {
  Opportunity,
  OpportunityType,
  OpportunityStatus,
} from '../opportunities/entities/opportunity.entity';

const mockUserRepo = {
  findOne: jest.fn(),
  findAndCount: jest.fn(),
  save: jest.fn(),
};

const mockOppRepo = {
  findOne: jest.fn(),
  findAndCount: jest.fn(),
  save: jest.fn(),
};

const baseUser: User = {
  id: 'user-1',
  name: 'Test',
  email: 'test@test.com',
  password: 'hashed',
  role: UserRole.ESTUDIANTE,
  suspended: false,
  createdAt: new Date(),
};

const baseOpportunity: Opportunity = {
  id: 'opp-1',
  title: 'Tutoría',
  description: 'Desc',
  type: OpportunityType.TUTORIA,
  requirements: null as unknown as string,
  deadline: null as unknown as Date,
  status: OpportunityStatus.DISPONIBLE,
  searchText: '',
  publisher: baseUser,
  createdAt: new Date(),
  updatedAt: new Date(),
  computeSearchText: jest.fn(),
};

describe('AdminService', () => {
  let service: AdminService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        { provide: getRepositoryToken(User), useValue: mockUserRepo },
        { provide: getRepositoryToken(Opportunity), useValue: mockOppRepo },
      ],
    }).compile();
    service = module.get<AdminService>(AdminService);
  });

  describe('findUsers', () => {
    it('returns paginated user list', async () => {
      mockUserRepo.findAndCount.mockResolvedValue([[baseUser], 1]);

      const result = await service.findUsers({});

      expect(result.items).toEqual([baseUser]);
      expect(result.total).toBe(1);
    });

    it('applies search filter', async () => {
      mockUserRepo.findAndCount.mockResolvedValue([[], 0]);

      await service.findUsers({ search: 'test' });

      const calls = mockUserRepo.findAndCount.mock.calls as Array<
        [{ where: unknown }]
      >;
      expect(Array.isArray(calls[0][0].where)).toBe(true);
    });
  });

  describe('suspendUser', () => {
    it('suspends a user', async () => {
      mockUserRepo.findOne.mockResolvedValue({ ...baseUser });
      mockUserRepo.save.mockResolvedValue({ ...baseUser, suspended: true });

      const result = await service.suspendUser('user-1', 'admin-1', true);

      expect(result.suspended).toBe(true);
    });

    it('throws BadRequestException when suspending self', async () => {
      await expect(
        service.suspendUser('admin-1', 'admin-1', true),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws NotFoundException when user not found', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);

      await expect(
        service.suspendUser('no-existe', 'admin-1', true),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOpportunities', () => {
    it('returns paginated opportunity list', async () => {
      mockOppRepo.findAndCount.mockResolvedValue([[baseOpportunity], 1]);

      const result = await service.findOpportunities({});

      expect(result.items).toEqual([baseOpportunity]);
      expect(result.total).toBe(1);
    });
  });

  describe('blockOpportunity', () => {
    it('blocks an opportunity', async () => {
      mockOppRepo.findOne.mockResolvedValue({ ...baseOpportunity });
      mockOppRepo.save.mockResolvedValue({
        ...baseOpportunity,
        status: OpportunityStatus.BLOQUEADA,
      });

      const result = await service.blockOpportunity('opp-1', true);

      expect(result.status).toBe(OpportunityStatus.BLOQUEADA);
    });

    it('unblocks an opportunity back to DISPONIBLE', async () => {
      mockOppRepo.findOne.mockResolvedValue({
        ...baseOpportunity,
        status: OpportunityStatus.BLOQUEADA,
      });
      mockOppRepo.save.mockResolvedValue({
        ...baseOpportunity,
        status: OpportunityStatus.DISPONIBLE,
      });

      const result = await service.blockOpportunity('opp-1', false);

      expect(result.status).toBe(OpportunityStatus.DISPONIBLE);
    });

    it('throws NotFoundException when opportunity not found', async () => {
      mockOppRepo.findOne.mockResolvedValue(null);

      await expect(service.blockOpportunity('no-existe', true)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
