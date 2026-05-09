import client from './client';
import { adminApi } from './admin';

jest.mock('./client');

const mockedClient = client as jest.Mocked<typeof client>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('adminApi', () => {
  it('gets users', async () => {
    mockedClient.get.mockResolvedValue({ data: { items: [], total: 0 } });

    await adminApi.getUsers({ page: 2, search: 'ana' });

    expect(mockedClient.get).toHaveBeenCalledWith('/admin/users', {
      params: { page: 2, search: 'ana' },
    });
  });

  it('suspends a user', async () => {
    mockedClient.patch.mockResolvedValue({ data: { id: 'u1' } });

    const result = await adminApi.suspendUser('u1', true);

    expect(mockedClient.patch).toHaveBeenCalledWith('/admin/users/u1/suspend', {
      suspended: true,
    });
    expect(result).toEqual({ id: 'u1' });
  });

  it('gets opportunities', async () => {
    mockedClient.get.mockResolvedValue({ data: { items: [], total: 0 } });

    await adminApi.getOpportunities({ search: 'beca' });

    expect(mockedClient.get).toHaveBeenCalledWith('/admin/opportunities', {
      params: { search: 'beca' },
    });
  });

  it('blocks an opportunity', async () => {
    mockedClient.patch.mockResolvedValue({ data: { id: 'opp-1' } });

    const result = await adminApi.blockOpportunity('opp-1', true);

    expect(mockedClient.patch).toHaveBeenCalledWith('/admin/opportunities/opp-1/block', {
      blocked: true,
    });
    expect(result).toEqual({ id: 'opp-1' });
  });
});