import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ProfilePage } from './ProfilePage';
import { authApi } from '../../api/auth';
import { applicationsApi } from '../../api/applications';
import { ApplicationStatus } from '../../types/application';
import { OpportunityType, OpportunityStatus } from '../../types/opportunity';

jest.mock('../../api/client');
jest.mock('../../api/auth');
jest.mock('../../api/applications');

const mockedAuthApi = authApi as jest.Mocked<typeof authApi>;
const mockedAppsApi = applicationsApi as jest.Mocked<typeof applicationsApi>;

const mockUser = { id: 'u1', name: 'Ana García', email: 'ana@test.com', role: 'estudiante' };

const mockApp = {
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

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.setItem('token', 'fake-token');
  localStorage.setItem('user', JSON.stringify(mockUser));
  mockedAuthApi.getMe.mockResolvedValue(mockUser as never);
  mockedAppsApi.getMine.mockResolvedValue([mockApp] as never);
  mockedAppsApi.getStats.mockResolvedValue({ total: 1, aceptadas: 0, pendientes: 1, rechazadas: 0 } as never);
});

afterEach(() => {
  localStorage.clear();
});

function renderPage() {
  return render(
    <MemoryRouter>
      <ProfilePage />
    </MemoryRouter>,
  );
}

describe('ProfilePage', () => {
  it('renders user info after loading', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Ana García')).toBeInTheDocument();
      expect(screen.getByText('ana@test.com')).toBeInTheDocument();
    });
  });

  it('renders application cards', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Tutoría de Cálculo')).toBeInTheDocument();
    });
  });

  it('shows cancel button for POSTULADO with no past deadline', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByTestId('btn-cancel-application')).toBeInTheDocument();
    });
  });

  it('does not show cancel button for EN_EVALUACION status', async () => {
    mockedAppsApi.getMine.mockResolvedValue([
      { ...mockApp, status: ApplicationStatus.EN_EVALUACION },
    ] as never);

    renderPage();

    await waitFor(() => {
      expect(screen.queryByTestId('btn-cancel-application')).not.toBeInTheDocument();
    });
  });

  it('displays feedback when present', async () => {
    mockedAppsApi.getMine.mockResolvedValue([
      {
        ...mockApp,
        status: ApplicationStatus.ACEPTADO,
        feedback: 'Excelente trabajo',
        opportunity: { ...mockApp.opportunity, status: OpportunityStatus.FINALIZADO },
      },
    ] as never);

    renderPage();

    await waitFor(() => {
      expect(screen.getByTestId('application-feedback')).toHaveTextContent('Excelente trabajo');
    });
  });

  it('renders filter controls for search, type, and status', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByTestId('profile-search')).toBeInTheDocument();
      expect(screen.getByTestId('profile-filter-type')).toBeInTheDocument();
      expect(screen.getByTestId('profile-filter-status')).toBeInTheDocument();
    });
  });

  it('calls getMine with status filter when status filter changes', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByTestId('profile-filter-status')).toBeInTheDocument());

    const select = screen.getByTestId('profile-filter-status');
    fireEvent.change(select, { target: { value: ApplicationStatus.POSTULADO } });

    await waitFor(() => {
      expect(mockedAppsApi.getMine).toHaveBeenCalledWith(
        expect.objectContaining({ status: ApplicationStatus.POSTULADO }),
      );
    });
  });

  it('shows empty state when no applications', async () => {
    mockedAppsApi.getMine.mockResolvedValue([] as never);

    renderPage();

    await waitFor(() => {
      expect(screen.getByTestId('no-applications')).toBeInTheDocument();
    });
  });
});
