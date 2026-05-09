import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AdminUsersPage } from './AdminUsersPage';
import { adminApi } from '../../api/admin';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

jest.mock('../../api/admin', () => ({
  adminApi: {
    getUsers: jest.fn(),
    suspendUser: jest.fn(),
    getOpportunities: jest.fn(),
    blockOpportunity: jest.fn(),
  },
}));

const mockedApi = adminApi as jest.Mocked<typeof adminApi>;

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
  localStorage.setItem('token', 'token');
  localStorage.setItem('user', JSON.stringify({ role: 'admin' }));
  mockedApi.getUsers.mockResolvedValue({
    items: [{ id: 'u1', name: 'Ana', email: 'ana@test.com', role: 'estudiante', suspended: false, createdAt: '2026-01-01' }],
    total: 1,
  } as never);
  mockedApi.suspendUser.mockResolvedValue({ id: 'u1', name: 'Ana', email: 'ana@test.com', role: 'estudiante', suspended: true, createdAt: '2026-01-01' } as never);
});

function renderPage() {
  return render(
    <MemoryRouter>
      <AdminUsersPage />
    </MemoryRouter>,
  );
}

describe('AdminUsersPage', () => {
  it('loads and suspends users', async () => {
    jest.spyOn(window, 'confirm').mockReturnValue(true);

    renderPage();

    await waitFor(() => expect(screen.getByText('Ana')).toBeInTheDocument());
    fireEvent.click(screen.getByTestId('btn-suspend-u1'));

    await waitFor(() => expect(mockedApi.suspendUser).toHaveBeenCalledWith('u1', true));
  });

  it('searches users and paginates results', async () => {
    mockedApi.getUsers.mockResolvedValueOnce({
      items: Array.from({ length: 10 }, (_, index) => ({
        id: `u${index + 1}`,
        name: `Usuario ${index + 1}`,
        email: `u${index + 1}@test.com`,
        role: 'estudiante',
        suspended: false,
        createdAt: '2026-01-01',
      })),
      total: 11,
    } as never);

    renderPage();

    await waitFor(() => expect(screen.getByTestId('admin-users-next')).toBeInTheDocument());
    fireEvent.change(screen.getByTestId('admin-user-search'), { target: { value: 'Ana' } });
    fireEvent.click(screen.getByTestId('admin-user-btn-search'));
    fireEvent.click(screen.getByTestId('admin-users-next'));

    await waitFor(() => expect(mockedApi.getUsers).toHaveBeenCalledWith(expect.objectContaining({ page: 2 })));
  });

  it('shows an error when loading users fails', async () => {
    mockedApi.getUsers.mockRejectedValueOnce(new Error('boom'));

    renderPage();

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Error al cargar usuarios.'));
  });

  it('redirects non-admin users', async () => {
    localStorage.setItem('user', JSON.stringify({ role: 'estudiante' }));

    renderPage();

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/'));
  });
});