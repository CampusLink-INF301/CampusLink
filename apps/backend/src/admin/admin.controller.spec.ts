import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { UserRole } from '../auth/entities/user.entity';

describe('AdminController', () => {
  let controller: AdminController;
  const mockAdminService = {
    findUsers: jest.fn(),
    suspendUser: jest.fn(),
    findOpportunities: jest.fn(),
    blockOpportunity: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        {
          provide: AdminService,
          useValue: mockAdminService,
        },
      ],
    }).compile();

    controller = module.get<AdminController>(AdminController);
  });

  it('delegates findUsers with page and search', async () => {
    mockAdminService.findUsers.mockResolvedValue({ items: [], total: 0 });

    const result = await controller.findUsers('2', 'ana');

    expect(mockAdminService.findUsers).toHaveBeenCalledWith({
      page: 2,
      search: 'ana',
    });
    expect(result).toEqual({ items: [], total: 0 });
  });

  it('delegates suspendUser using the requester id', async () => {
    mockAdminService.suspendUser.mockResolvedValue({ id: 'u-1' });

    const result = await controller.suspendUser(
      'u-1',
      { suspended: true },
      { user: { id: 'admin-1', role: UserRole.ADMIN, suspended: false } },
    );

    expect(mockAdminService.suspendUser).toHaveBeenCalledWith(
      'u-1',
      'admin-1',
      true,
    );
    expect(result).toEqual({ id: 'u-1' });
  });

  it('delegates findOpportunities with paging and search', async () => {
    mockAdminService.findOpportunities.mockResolvedValue({ items: [], total: 0 });

    const result = await controller.findOpportunities('3', 'beca');

    expect(mockAdminService.findOpportunities).toHaveBeenCalledWith({
      page: 3,
      search: 'beca',
    });
    expect(result).toEqual({ items: [], total: 0 });
  });

  it('delegates blockOpportunity', async () => {
    mockAdminService.blockOpportunity.mockResolvedValue({ id: 'opp-1' });

    const result = await controller.blockOpportunity('opp-1', { blocked: true });

    expect(mockAdminService.blockOpportunity).toHaveBeenCalledWith(
      'opp-1',
      true,
    );
    expect(result).toEqual({ id: 'opp-1' });
  });
});