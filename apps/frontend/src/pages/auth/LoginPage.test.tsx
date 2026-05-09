import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LoginPage } from './LoginPage';
import { authApi } from '../../api/auth';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

jest.mock('../../api/auth', () => ({
  authApi: {
    login: jest.fn(),
    register: jest.fn(),
    getMe: jest.fn(),
  },
}));

const mockedAuthApi = authApi as jest.Mocked<typeof authApi>;

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
});

function renderPage() {
  return render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>,
  );
}

describe('LoginPage', () => {
  it('logs in successfully', async () => {
    mockedAuthApi.login.mockResolvedValue({
      token: 'token-1',
      user: { id: 'u1', name: 'Ana', email: 'ana@test.com', role: 'estudiante' },
    } as never);

    renderPage();

    fireEvent.change(screen.getByTestId('login-email'), { target: { value: 'ana@test.com' } });
    fireEvent.change(screen.getByTestId('login-password'), { target: { value: 'Password123!' } });
    fireEvent.click(screen.getByTestId('btn-login'));

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/opportunities'));
    expect(localStorage.getItem('token')).toBe('token-1');
  });

  it('shows an error on failure', async () => {
    mockedAuthApi.login.mockRejectedValue(new Error('invalid'));

    renderPage();

    fireEvent.change(screen.getByTestId('login-email'), { target: { value: 'ana@test.com' } });
    fireEvent.change(screen.getByTestId('login-password'), { target: { value: 'wrongpass' } });
    fireEvent.click(screen.getByTestId('btn-login'));

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Credenciales inválidas.'));
  });
});