import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { RegisterPage } from './RegisterPage';
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
      <RegisterPage />
    </MemoryRouter>,
  );
}

describe('RegisterPage', () => {
  it('registers using the selected role', async () => {
    mockedAuthApi.register.mockResolvedValue({
      token: 'token-1',
      user: { id: 'u1', name: 'Ana', email: 'ana@test.com', role: 'docente' },
    } as never);

    renderPage();

    fireEvent.change(screen.getByTestId('register-name'), { target: { value: 'Ana' } });
    fireEvent.change(screen.getByTestId('register-email'), { target: { value: 'ana@test.com' } });
    fireEvent.change(screen.getByTestId('register-password'), { target: { value: 'Password123!' } });
    fireEvent.change(screen.getByTestId('register-role'), { target: { value: '1' } });
    fireEvent.click(screen.getByTestId('btn-register'));

    await waitFor(() => expect(mockedAuthApi.register).toHaveBeenCalledWith({
      name: 'Ana',
      email: 'ana@test.com',
      password: 'Password123!',
      role: 'docente',
    }));
    expect(mockNavigate).toHaveBeenCalledWith('/opportunities');
  });

  it('shows backend validation messages', async () => {
    mockedAuthApi.register.mockRejectedValue({
      response: { data: { message: ['Email en uso', 'Otro error'] } },
    });

    renderPage();

    fireEvent.change(screen.getByTestId('register-name'), { target: { value: 'Ana' } });
    fireEvent.change(screen.getByTestId('register-email'), { target: { value: 'ana@test.com' } });
    fireEvent.change(screen.getByTestId('register-password'), { target: { value: 'Password123!' } });
    fireEvent.click(screen.getByTestId('btn-register'));

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Email en uso Otro error'));
  });
});