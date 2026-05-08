import { Test, TestingModule } from '@nestjs/testing';
import { OpportunitiesController } from './opportunities.controller';
import { OpportunitiesService } from './opportunities.service';
import { OpportunityType } from './entities/opportunity.entity';
import { UserRole } from '../auth/entities/user.entity';

describe('OpportunitiesController', () => {
  let controller: OpportunitiesController;
  let opportunitiesService: OpportunitiesService;

  const mockOpportunitiesService = {
    findAvailable: jest.fn(),
    findByPublisher: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockRequest = {
    user: {
      id: 'user-123',
      role: UserRole.DOCENTE,
      suspended: false,
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OpportunitiesController],
      providers: [
        {
          provide: OpportunitiesService,
          useValue: mockOpportunitiesService,
        },
      ],
    }).compile();

    controller = module.get(OpportunitiesController);
    opportunitiesService = module.get(OpportunitiesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return available opportunities with query', async () => {
      const queryDto = { search: 'tutoria', type: OpportunityType.TUTORIA };
      const mockResult = {
        data: [
          { id: 'opp-1', title: 'Tutoría de Cálculo', type: OpportunityType.TUTORIA },
        ],
        total: 1,
      };

      mockOpportunitiesService.findAvailable.mockResolvedValue(mockResult);

      const result = await controller.findAll(queryDto);

      expect(opportunitiesService.findAvailable).toHaveBeenCalledWith(
        queryDto,
      );
      expect(result).toHaveProperty('data');
    });
  });

  describe('findMine', () => {
    it('should return publisher opportunities', async () => {
      const publisherHistoryDto = { page: 1, search: undefined, type: undefined };
      const mockResult = {
        data: [
          {
            id: 'opp-1',
            title: 'Mi Tutoría',
            publisherId: 'user-123',
            status: 'DISPONIBLE',
          },
        ],
        total: 1,
      };

      mockOpportunitiesService.findByPublisher.mockResolvedValue(mockResult);

      const result = await controller.findMine(publisherHistoryDto, mockRequest);

      expect(opportunitiesService.findByPublisher).toHaveBeenCalledWith(
        'user-123',
        publisherHistoryDto,
      );
      expect(result).toHaveProperty('data');
    });
  });

  describe('findOne', () => {
    it('should return a single opportunity', async () => {
      const mockOpp = {
        id: 'opp-123',
        title: 'Tutoría de Física',
        description: 'Ayuda con física',
        type: OpportunityType.TUTORIA,
        status: 'DISPONIBLE',
      };

      mockOpportunitiesService.findOne.mockResolvedValue(mockOpp);

      const result = await controller.findOne('opp-123');

      expect(opportunitiesService.findOne).toHaveBeenCalledWith('opp-123');
      expect(result).toEqual(mockOpp);
    });
  });

  describe('create', () => {
    it('should create a new opportunity', async () => {
      const createDto = {
        title: 'Nueva Tutoría',
        description: 'Descripción',
        type: OpportunityType.TUTORIA,
        requirements: 'Ninguno',
        deadline: new Date().toISOString(),
      };

      const mockCreated = { id: 'opp-new', ...createDto };

      mockOpportunitiesService.create.mockResolvedValue(mockCreated);

      const result = await controller.create(createDto, mockRequest);

      expect(opportunitiesService.create).toHaveBeenCalledWith(
        createDto,
        'user-123',
      );
      expect(result).toHaveProperty('id');
    });
  });

  describe('update', () => {
    it('should update an opportunity', async () => {
      const updateDto = {
        title: 'Tutoría Actualizada',
      };

      const mockUpdated = { id: 'opp-1', ...updateDto };

      mockOpportunitiesService.update.mockResolvedValue(mockUpdated);

      const result = await controller.update('opp-1', updateDto, mockRequest);

      expect(opportunitiesService.update).toHaveBeenCalledWith(
        'opp-1',
        updateDto,
        'user-123',
      );
      expect(result).toHaveProperty('title');
    });
  });

  describe('remove', () => {
    it('should delete an opportunity', async () => {
      mockOpportunitiesService.remove.mockResolvedValue(undefined);

      await controller.remove('opp-123', mockRequest);

      expect(opportunitiesService.remove).toHaveBeenCalledWith(
        'opp-123',
        'user-123',
      );
    });
  });
});
