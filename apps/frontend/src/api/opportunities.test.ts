import { opportunitiesApi } from './opportunities';
import client from './client';
import { OpportunityType, OpportunityStatus } from '../types/opportunity';
import type { Opportunity } from '../types/opportunity';

jest.mock('./client');

const mockedClient = client as jest.Mocked<typeof client>;

const mockOpportunity: Opportunity = {
  id: 'uuid-1',
  title: 'Tutoría de Cálculo',
  description: 'Descripción',
  type: OpportunityType.TUTORIA,
  status: OpportunityStatus.DISPONIBLE,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('opportunitiesApi', () => {
  describe('getAll', () => {
    it('fetches paginated opportunities without params', async () => {
      const paged = { items: [mockOpportunity], total: 1, hasMore: false };
      mockedClient.get.mockResolvedValue({ data: paged });

      const result = await opportunitiesApi.getAll();

      expect(mockedClient.get).toHaveBeenCalledWith('/opportunities', { params: undefined });
      expect(result).toEqual(paged);
    });

    it('passes search, type and pagination params', async () => {
      const paged = { items: [mockOpportunity], total: 1, hasMore: false };
      mockedClient.get.mockResolvedValue({ data: paged });

      await opportunitiesApi.getAll({ search: 'cálculo', type: OpportunityType.TUTORIA, limit: 20, offset: 0 });

      expect(mockedClient.get).toHaveBeenCalledWith('/opportunities', {
        params: { search: 'cálculo', type: OpportunityType.TUTORIA, limit: 20, offset: 0 },
      });
    });

    it('returns hasMore true when more items exist', async () => {
      const paged = { items: [mockOpportunity], total: 5, hasMore: true };
      mockedClient.get.mockResolvedValue({ data: paged });

      const result = await opportunitiesApi.getAll({ limit: 1, offset: 0 });

      expect(result.hasMore).toBe(true);
      expect(result.total).toBe(5);
    });
  });

  describe('getById', () => {
    it('fetches a single opportunity by id', async () => {
      mockedClient.get.mockResolvedValue({ data: mockOpportunity });

      const result = await opportunitiesApi.getById('uuid-1');

      expect(mockedClient.get).toHaveBeenCalledWith('/opportunities/uuid-1');
      expect(result).toEqual(mockOpportunity);
    });
  });

  describe('create', () => {
    it('posts a new opportunity', async () => {
      mockedClient.post.mockResolvedValue({ data: mockOpportunity });
      const payload = {
        title: 'Tutoría de Cálculo',
        description: 'Descripción',
        type: OpportunityType.TUTORIA,
      };

      const result = await opportunitiesApi.create(payload);

      expect(mockedClient.post).toHaveBeenCalledWith('/opportunities', payload);
      expect(result).toEqual(mockOpportunity);
    });
  });

  describe('update', () => {
    it('puts an updated opportunity', async () => {
      const updated = { ...mockOpportunity, title: 'Nuevo título' };
      mockedClient.put.mockResolvedValue({ data: updated });

      const result = await opportunitiesApi.update('uuid-1', { title: 'Nuevo título' });

      expect(mockedClient.put).toHaveBeenCalledWith('/opportunities/uuid-1', {
        title: 'Nuevo título',
      });
      expect(result).toEqual(updated);
    });
  });

  describe('remove', () => {
    it('deletes an opportunity', async () => {
      mockedClient.delete.mockResolvedValue({ data: null });

      await opportunitiesApi.remove('uuid-1');

      expect(mockedClient.delete).toHaveBeenCalledWith('/opportunities/uuid-1');
    });
  });
});
