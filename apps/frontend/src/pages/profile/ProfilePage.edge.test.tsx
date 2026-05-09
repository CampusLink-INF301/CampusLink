import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ProfilePage } from './ProfilePage';
import { authApi } from '../../api/auth';
import { applicationsApi } from '../../api/applications';
import { ApplicationStatus } from '../../types/application';
import { OpportunityStatus, OpportunityType } from '../../types/opportunity';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

jest.mock('../../api/client');
jest.mock('../../api/auth');
jest.mock('../../api/applications');

const mockedAuthApi = authApi as jest.Mocked<typeof authApi>;
const mockedAppsApi = applicationsApi as jest.Mocked<typeof applicationsApi>;

const mockApplication = {
  id: 'app-1',
  status: ApplicationStatus.POSTULADO,
  feedback: null,
  createdAt: '2024-01-01T00:00:00Z',
  opportunity: {
    id: 'opp-1',
    title: 'Tutoría de Cálculo',
    description: 'Desc',
    type: OpportunityType.TUTORIA,
    status: OpportunityStatus.DISPONIBLE,
    deadline: null,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
};

function renderPage() {
  return render(
    <MemoryRouter>
      <ProfilePage />
    </MemoryRouter>,
  );
}

describe('ProfilePage edge cases', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('token', 'fake-token');
    localStorage.setItem('user', JSON.stringify({ id: 'u1', role: 'estudiante' }));
    mockedAuthApi.getMe.mockResolvedValue({
      id: 'u1',
      name: 'Ana García',
      email: 'ana@test.com',
      role: 'estudiante',
    } as never);
    mockedAppsApi.getMine.mockResolvedValue([mockApplication] as never);
    mockedAppsApi.cancel.mockResolvedValue(undefined as never);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('redirects to login when there is no token', async () => {
    localStorage.removeItem('token');

    renderPage();

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/login'));
  });

  it('shows a generic error when profile loading fails', async () => {
    mockedAuthApi.getMe.mockRejectedValue(new Error('boom'));

    renderPage();

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('No se pudo cargar el perfil. Intenta de nuevo.');
    });
  });

  it('clears credentials and redirects on 401', async () => {
    mockedAuthApi.getMe.mockRejectedValue({ isAxiosError: true, response: { status: 401 } });

    renderPage();

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/login'));
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });

  it('cancels an application and updates the status badge', async () => {
    jest.spyOn(window, 'confirm').mockReturnValue(true);

    renderPage();

    await waitFor(() => expect(screen.getByTestId('btn-cancel-application')).toBeInTheDocument());
    fireEvent.click(screen.getByTestId('btn-cancel-application'));

    await waitFor(() => expect(mockedAppsApi.cancel).toHaveBeenCalledWith('app-1'));
    await waitFor(() => expect(screen.getByTestId('application-status')).toHaveTextContent('Cancelado'));
  });

  it('does not cancel when the confirmation dialog is rejected', async () => {
    jest.spyOn(window, 'confirm').mockReturnValue(false);

    renderPage();

    await waitFor(() => expect(screen.getByTestId('btn-cancel-application')).toBeInTheDocument());
    fireEvent.click(screen.getByTestId('btn-cancel-application'));

    expect(mockedAppsApi.cancel).not.toHaveBeenCalled();
  });

  it('loads filtered applications when search and type change', async () => {
    renderPage();

    await waitFor(() => expect(screen.getByTestId('profile-search')).toBeInTheDocument());
    fireEvent.change(screen.getByTestId('profile-search'), { target: { value: 'cálculo' } });
    fireEvent.change(screen.getByTestId('profile-filter-type'), { target: { value: OpportunityType.TUTORIA } });

    await waitFor(() => {
      expect(mockedAppsApi.getMine).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'cálculo', type: OpportunityType.TUTORIA }),
      );
    });
  });
});