import client from './client';
import { applicationsApi } from './applications';

jest.mock('./client');

const mockedClient = client as jest.Mocked<typeof client>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('applicationsApi', () => {
  it('applies with optional form responses', async () => {
    mockedClient.post.mockResolvedValue({ data: { id: 'app-1' } });

    const result = await applicationsApi.apply('opp-1', { q1: 'yes' });

    expect(mockedClient.post).toHaveBeenCalledWith('/applications', {
      opportunityId: 'opp-1',
      formResponses: { q1: 'yes' },
    });
    expect(result).toEqual({ id: 'app-1' });
  });

  it('cancels an application', async () => {
    mockedClient.delete.mockResolvedValue({ data: null });

    await applicationsApi.cancel('app-1');

    expect(mockedClient.delete).toHaveBeenCalledWith('/applications/app-1');
  });

  it('gets mine with params', async () => {
    mockedClient.get.mockResolvedValue({ data: [] });

    await applicationsApi.getMine({ search: 'cálculo' });

    expect(mockedClient.get).toHaveBeenCalledWith('/applications/mine', {
      params: { search: 'cálculo' },
    });
  });

  it('gets by opportunity', async () => {
    mockedClient.get.mockResolvedValue({ data: [] });

    await applicationsApi.getByOpportunity('opp-1');

    expect(mockedClient.get).toHaveBeenCalledWith('/applications/by-opportunity/opp-1');
  });

  it('finalizes selected applications', async () => {
    mockedClient.post.mockResolvedValue({ data: null });

    await applicationsApi.finalize('opp-1', ['app-1']);

    expect(mockedClient.post).toHaveBeenCalledWith('/applications/finalize/opp-1', {
      acceptedApplicationIds: ['app-1'],
    });
  });

  it('sets feedback', async () => {
    mockedClient.put.mockResolvedValue({ data: { id: 'app-1' } });

    const result = await applicationsApi.setFeedback('app-1', 'Buen perfil');

    expect(mockedClient.put).toHaveBeenCalledWith('/applications/app-1/feedback', {
      feedback: 'Buen perfil',
    });
    expect(result).toEqual({ id: 'app-1' });
  });
});