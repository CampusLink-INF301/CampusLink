import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationsController } from './applications.controller';
import { ApplicationsService } from './applications.service';
import { UserRole } from '../auth/entities/user.entity';

describe('ApplicationsController', () => {
  let controller: ApplicationsController;
  let applicationsService: ApplicationsService;

  const mockApplicationsService = {
    apply: jest.fn(),
    cancel: jest.fn(),
    findByUser: jest.fn(),
    findByOpportunity: jest.fn(),
    finalize: jest.fn(),
    setFeedback: jest.fn(),
  };

  const mockRequest = {
    user: {
      id: 'user-123',
      role: UserRole.ESTUDIANTE,
      suspended: false,
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApplicationsController],
      providers: [
        {
          provide: ApplicationsService,
          useValue: mockApplicationsService,
        },
      ],
    }).compile();

    controller = module.get(ApplicationsController);
    applicationsService = module.get(ApplicationsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('apply', () => {
    it('should call service.apply with userId and DTO', async () => {
      const createAppDto = {
        opportunityId: 'opp-123',
      };

      mockApplicationsService.apply.mockResolvedValue({
        id: 'app-1',
        userId: 'user-123',
        opportunityId: 'opp-123',
        status: 'POSTULADO',
      });

      const result = await controller.apply(createAppDto, mockRequest);

      expect(applicationsService.apply).toHaveBeenCalledWith(
        'user-123',
        createAppDto,
      );
      expect(result).toHaveProperty('status');
    });
  });

  describe('cancel', () => {
    it('should cancel an application', async () => {
      mockApplicationsService.cancel.mockResolvedValue(undefined);

      await controller.cancel('app-123', mockRequest);

      expect(applicationsService.cancel).toHaveBeenCalledWith('user-123', 'app-123');
    });
  });

  describe('getMyApplications', () => {
    it('should return user applications with query', async () => {
      const queryDto = { search: 'tutoria', type: undefined, status: undefined };
      const mockResult = {
        data: [
          {
            id: 'app-1',
            status: 'POSTULADO',
          },
        ],
        total: 1,
      };

      mockApplicationsService.findByUser.mockResolvedValue(mockResult);

      const result = await controller.getMyApplications(mockRequest, queryDto);

      expect(applicationsService.findByUser).toHaveBeenCalledWith(
        'user-123',
        queryDto,
      );
      expect(result).toHaveProperty('data');
    });
  });

  describe('getByOpportunity', () => {
    it('should return applications for an opportunity', async () => {
      const mockResult = [
        {
          id: 'app-1',
          userId: 'student-1',
          status: 'EN_REVISION',
        },
      ];

      mockApplicationsService.findByOpportunity.mockResolvedValue(mockResult);

      const result = await controller.getByOpportunity(
        'opp-123',
        mockRequest as any,
      );

      expect(applicationsService.findByOpportunity).toHaveBeenCalledWith(
        'opp-123',
        'user-123',
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('finalize', () => {
    it('should finalize opportunity selections', async () => {
      const finalizeDto = {
        acceptedApplicationIds: ['app-1', 'app-2'],
      };

      mockApplicationsService.finalize.mockResolvedValue(undefined);

      await controller.finalize('opp-123', finalizeDto, mockRequest as any);

      expect(applicationsService.finalize).toHaveBeenCalledWith(
        'opp-123',
        'user-123',
        finalizeDto,
      );
    });
  });

  describe('setFeedback', () => {
    it('should set feedback on an application', async () => {
      const feedbackDto = {
        feedback: 'Great profile!',
      };

      const mockResult = { id: 'app-1', feedback: 'Great profile!' };

      mockApplicationsService.setFeedback.mockResolvedValue(mockResult);

      const result = await controller.setFeedback(
        'app-1',
        feedbackDto,
        mockRequest as any,
      );

      expect(applicationsService.setFeedback).toHaveBeenCalledWith(
        'app-1',
        'user-123',
        feedbackDto,
      );
      expect(result).toHaveProperty('feedback');
    });
  });
});
