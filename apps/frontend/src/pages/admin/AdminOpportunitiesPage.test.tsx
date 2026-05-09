import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AdminOpportunitiesPage } from './AdminOpportunitiesPage';
import { adminApi } from '../../api/admin';
import { OpportunityStatus, OpportunityType } from '../../types/opportunity';

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
  mockedApi.getOpportunities.mockResolvedValue({
    items: [{
      id: 'o1',
      title: 'Tutoría',
      description: 'Desc',
      type: OpportunityType.TUTORIA,
      status: OpportunityStatus.DISPONIBLE,
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
      publisher: { name: 'Publicador' },
    }],
    total: 1,
  } as never);
  mockedApi.blockOpportunity.mockResolvedValue({
    id: 'o1',
    title: 'Tutoría',
    description: 'Desc',
    type: OpportunityType.TUTORIA,
    status: OpportunityStatus.BLOQUEADA,
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
    publisher: { name: 'Publicador' },
  } as never);
});

function renderPage() {
  return render(
    <MemoryRouter>
      <AdminOpportunitiesPage />
    </MemoryRouter>,
  );
}

describe('AdminOpportunitiesPage', () => {
  it('loads and blocks opportunities', async () => {
    jest.spyOn(window, 'confirm').mockReturnValue(true);

    renderPage();

    await waitFor(() => expect(screen.getByText('Tutoría')).toBeInTheDocument());
    fireEvent.click(screen.getByTestId('btn-block-o1'));

    await waitFor(() => expect(mockedApi.blockOpportunity).toHaveBeenCalledWith('o1', true));
  });

  it('searches opportunities and paginates results', async () => {
    mockedApi.getOpportunities.mockResolvedValueOnce({
      items: Array.from({ length: 10 }, (_, index) => ({
        id: `o${index + 1}`,
        title: `Oportunidad ${index + 1}`,
        description: 'Desc',
        type: OpportunityType.TUTORIA,
        status: OpportunityStatus.DISPONIBLE,
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
        publisher: { name: 'Publicador' },
      })),
      total: 11,
    } as never);

    renderPage();

    await waitFor(() => expect(screen.getByTestId('admin-opps-next')).toBeInTheDocument());
    fireEvent.change(screen.getByTestId('admin-opp-search'), { target: { value: 'Tutoría' } });
    fireEvent.click(screen.getByTestId('admin-opp-btn-search'));
    fireEvent.click(screen.getByTestId('admin-opps-next'));

    await waitFor(() => expect(mockedApi.getOpportunities).toHaveBeenCalledWith(expect.objectContaining({ page: 2 })));
  });

  it('shows an error when loading opportunities fails', async () => {
    mockedApi.getOpportunities.mockRejectedValueOnce(new Error('boom'));

    renderPage();

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Error al cargar oportunidades.'));
  });

  it('redirects non-admin users', async () => {
    localStorage.setItem('user', JSON.stringify({ role: 'docente' }));

    renderPage();

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/'));
  });
});