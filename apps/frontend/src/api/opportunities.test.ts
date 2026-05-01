import { opportunitiesApi } from './opportunities';
import client from './client';
import { OpportunityType } from '../types/opportunity';
import type { Opportunity } from '../types/opportunity';

jest.mock('./client');

const mockedClient = client as jest.Mocked<typeof client>;

const mockOpportunity: Opportunity = {
  id: 'uuid-1',
  title: 'Tutoría de Cálculo',
  description: 'Descripción',
  type: OpportunityType.TUTORIA,
  isActive: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('opportunitiesApi', () => {
  describe('getAll', () => {
    it('fetches all opportunities without params', async () => {
      mockedClient.get.mockResolvedValue({ data: [mockOpportunity] });

      const result = await opportunitiesApi.getAll();

      expect(mockedClient.get).toHaveBeenCalledWith('/opportunities', { params: undefined });
      expect(result).toEqual([mockOpportunity]);
    });

    it('passes search and type query params', async () => {
      mockedClient.get.mockResolvedValue({ data: [mockOpportunity] });

      await opportunitiesApi.getAll({ search: 'cálculo', type: OpportunityType.TUTORIA });

      expect(mockedClient.get).toHaveBeenCalledWith('/opportunities', {
        params: { search: 'cálculo', type: OpportunityType.TUTORIA },
      });
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
