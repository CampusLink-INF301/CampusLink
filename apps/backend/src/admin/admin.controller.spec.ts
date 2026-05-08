import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { UserRole } from '../auth/entities/user.entity';

describe('AdminController', () => {
  let controller: AdminController;
  let adminService: AdminService;

  const mockAdminService = {
    findUsers: jest.fn(),
    suspendUser: jest.fn(),
    findOpportunities: jest.fn(),
    blockOpportunity: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        {
          provide: AdminService,
          useValue: mockAdminService,
        },
      ],
    }).compile();

    controller = module.get(AdminController);
    adminService = module.get(AdminService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findUsers', () => {
    it('should call adminService.findUsers with pagination', async () => {
      const mockResult = {
        data: [
          {
            id: 'user-1',
            email: 'user@example.com',
            name: 'User',
            role: UserRole.ESTUDIANTE,
            suspended: false,
          },
        ],
        total: 1,
        page: 1,
      };

      mockAdminService.findUsers.mockResolvedValue(mockResult);

      const result = await controller.findUsers('1', 'user');

      expect(adminService.findUsers).toHaveBeenCalledWith({
        page: 1,
        search: 'user',
      });
      expect(result).toHaveProperty('data');
    });
  });

  describe('suspendUser', () => {
    it('should call adminService.suspendUser with correct params', async () => {
      const userId = 'user-123';
      const adminId = 'admin-456';
      const mockResult = { id: userId, suspended: true };

      mockAdminService.suspendUser.mockResolvedValue(mockResult);

      const result = await controller.suspendUser(
        userId,
        { suspended: true },
        {
          user: {
            id: adminId,
            role: UserRole.ADMIN,
            suspended: false,
          },
        },
      );

      expect(adminService.suspendUser).toHaveBeenCalledWith(
        userId,
        adminId,
        true,
      );
      expect(result).toHaveProperty('suspended');
    });
  });

  describe('findOpportunities', () => {
    it('should call adminService.findOpportunities', async () => {
      const mockResult = {
        data: [{ id: 'opp-1', title: 'Oportunidad', status: 'DISPONIBLE' }],
        total: 1,
        page: 1,
      };

      mockAdminService.findOpportunities.mockResolvedValue(mockResult);

      const result = await controller.findOpportunities('1', 'Oportunidad');

      expect(adminService.findOpportunities).toHaveBeenCalledWith({
        page: 1,
        search: 'Oportunidad',
      });
      expect(result).toHaveProperty('data');
    });
  });

  describe('blockOpportunity', () => {
    it('should call adminService.blockOpportunity', async () => {
      const oppId = 'opp-123';
      const mockResult = { id: oppId, blocked: true };

      mockAdminService.blockOpportunity.mockResolvedValue(mockResult);

      const result = await controller.blockOpportunity(oppId, { blocked: true });

      expect(adminService.blockOpportunity).toHaveBeenCalledWith(oppId, true);
      expect(result).toHaveProperty('blocked');
    });
  });
});
