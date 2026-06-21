import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Navbar } from './Navbar';
import { notificationsApi } from '../api/notifications';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

jest.mock('../api/notifications', () => ({
  notificationsApi: {
    getUnreadCount: jest.fn(),
  },
}));

const mockedNotificationsApi = notificationsApi as jest.Mocked<typeof notificationsApi>;

function renderNavbar() {
  return render(
    <MemoryRouter>
      <Navbar />
    </MemoryRouter>,
  );
}

describe('Navbar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('shows the login link when there is no session', () => {
    renderNavbar();

    expect(screen.getByText('Ingresar')).toBeInTheDocument();
    expect(screen.queryByText('Salir')).not.toBeInTheDocument();
    expect(mockedNotificationsApi.getUnreadCount).not.toHaveBeenCalled();
  });

  it('renders publisher links, unread badge, and logs out', async () => {
    localStorage.setItem('token', 'token');
    localStorage.setItem('user', JSON.stringify({ id: 'u1', role: 'docente' }));
    mockedNotificationsApi.getUnreadCount.mockResolvedValue(123 as never);

    renderNavbar();

    await waitFor(() => expect(screen.getByText('99+')).toBeInTheDocument());
    expect(screen.getByText('+ Publicar')).toBeInTheDocument();
    expect(screen.getByText('Mis oportunidades')).toBeInTheDocument();
    expect(screen.getByText('Mi Perfil')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Salir'));

    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('shows publisher links for estudiante role', async () => {
    localStorage.setItem('token', 'token');
    localStorage.setItem('user', JSON.stringify({ id: 'u1', role: 'estudiante' }));
    mockedNotificationsApi.getUnreadCount.mockResolvedValue(0 as never);

    renderNavbar();

    await waitFor(() =>
      expect(screen.getByText('+ Publicar')).toBeInTheDocument(),
    );
    expect(screen.getByText('Mis oportunidades')).toBeInTheDocument();
  });

  it('renders admin links without fetching unread notifications', () => {
    localStorage.setItem('token', 'token');
    localStorage.setItem('user', JSON.stringify({ id: 'u1', role: 'admin' }));

    renderNavbar();

    expect(screen.getByText('Usuarios')).toBeInTheDocument();
    expect(screen.getByText('Oportunidades (Admin)')).toBeInTheDocument();
    expect(screen.queryByText('Mi Perfil')).not.toBeInTheDocument();
    expect(mockedNotificationsApi.getUnreadCount).not.toHaveBeenCalled();
  });
});