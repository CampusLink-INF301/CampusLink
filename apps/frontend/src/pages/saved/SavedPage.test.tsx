import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SavedPage } from './SavedPage';
import { savedApi } from '../../api/saved';
import { OpportunityType, OpportunityStatus } from '../../types/opportunity';
import type { Opportunity } from '../../types/opportunity';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

jest.mock('../../api/client');
jest.mock('../../api/saved');

const mockedSavedApi = savedApi as jest.Mocked<typeof savedApi>;

const mockOpportunity: Opportunity = {
  id: 'opp-1',
  title: 'Tutoría de Cálculo',
  description: 'Apoyo en cálculo diferencial',
  type: OpportunityType.TUTORIA,
  status: OpportunityStatus.DISPONIBLE,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
});

function renderPage() {
  return render(
    <MemoryRouter>
      <SavedPage />
    </MemoryRouter>,
  );
}

describe('SavedPage', () => {
  it('redirects to /login when no token', () => {
    mockedSavedApi.getMine.mockResolvedValue([] as never);

    renderPage();

    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('shows loading state while fetching', () => {
    localStorage.setItem('token', 'fake-token');
    mockedSavedApi.getMine.mockReturnValue(new Promise(() => {}));

    renderPage();

    expect(screen.getByText('Cargando guardados…')).toBeInTheDocument();
  });

  it('shows empty state when no saved opportunities', async () => {
    localStorage.setItem('token', 'fake-token');
    mockedSavedApi.getMine.mockResolvedValue([] as never);

    renderPage();

    await waitFor(() => {
      expect(
        screen.getByText('Aún no has guardado ninguna oportunidad.'),
      ).toBeInTheDocument();
    });
  });

  it('renders saved opportunities list when data is present', async () => {
    localStorage.setItem('token', 'fake-token');
    localStorage.setItem('user', JSON.stringify({ id: 'u1', role: 'estudiante' }));
    mockedSavedApi.getMine.mockResolvedValue([mockOpportunity] as never);

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Tutoría de Cálculo')).toBeInTheDocument();
    });
  });

  it('shows error when API fails', async () => {
    localStorage.setItem('token', 'fake-token');
    mockedSavedApi.getMine.mockRejectedValue(new Error('Network error') as never);

    renderPage();

    await waitFor(() => {
      expect(
        screen.getByText('No se pudieron cargar las oportunidades guardadas.'),
      ).toBeInTheDocument();
    });
  });
});
