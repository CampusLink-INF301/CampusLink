import client from './client';
import { authApi } from './auth';

jest.mock('./client');

const mockedClient = client as jest.Mocked<typeof client>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('authApi', () => {
  it('logs in and returns data', async () => {
    mockedClient.post.mockResolvedValue({ data: { token: 't', user: { id: 'u1' } } });

    const result = await authApi.login({ email: 'a@test.com', password: '12345678' });

    expect(mockedClient.post).toHaveBeenCalledWith('/auth/login', {
      email: 'a@test.com',
      password: '12345678',
    });
    expect(result).toEqual({ token: 't', user: { id: 'u1' } });
  });

  it('registers and returns data', async () => {
    mockedClient.post.mockResolvedValue({ data: { token: 't', user: { id: 'u1' } } });

    const result = await authApi.register({
      name: 'Ana',
      email: 'ana@test.com',
      password: 'Password123!',
      role: 'estudiante',
    });

    expect(mockedClient.post).toHaveBeenCalledWith('/auth/register', {
      name: 'Ana',
      email: 'ana@test.com',
      password: 'Password123!',
      role: 'estudiante',
    });
    expect(result).toEqual({ token: 't', user: { id: 'u1' } });
  });

  it('gets the current user', async () => {
    mockedClient.get.mockResolvedValue({ data: { id: 'u1', email: 'a@test.com' } });

    const result = await authApi.getMe();

    expect(mockedClient.get).toHaveBeenCalledWith('/auth/me');
    expect(result).toEqual({ id: 'u1', email: 'a@test.com' });
  });
});