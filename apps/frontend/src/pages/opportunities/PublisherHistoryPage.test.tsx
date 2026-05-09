import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PublisherHistoryPage } from './PublisherHistoryPage';
import { opportunitiesApi } from '../../api/opportunities';
import { OpportunityStatus, OpportunityType } from '../../types/opportunity';

jest.mock('../../api/opportunities', () => ({
  opportunitiesApi: {
    getAll: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    getMine: jest.fn(),
  },
}));

const mockedApi = opportunitiesApi as jest.Mocked<typeof opportunitiesApi>;

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
  localStorage.setItem('token', 'token');
  localStorage.setItem('user', JSON.stringify({ id: 'u1', role: 'docente' }));
  mockedApi.getMine.mockResolvedValue({
    items: [{
      id: 'opp-1',
      title: 'Tutoría',
      description: 'Desc',
      type: OpportunityType.TUTORIA,
      status: OpportunityStatus.EN_EVALUACION,
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
      publisher: { id: 'u1', name: 'Docente' },
    }],
    total: 1,
  } as never);
  mockedApi.remove.mockResolvedValue(undefined as never);
});

describe('PublisherHistoryPage', () => {
  it('loads published opportunities and can search', async () => {
    render(
      <MemoryRouter>
        <PublisherHistoryPage />
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByText('Tutoría')).toBeInTheDocument());
    fireEvent.change(screen.getByTestId('history-search'), { target: { value: 'Tutoría' } });
    fireEvent.click(screen.getByTestId('history-btn-search'));

    await waitFor(() => expect(mockedApi.getMine).toHaveBeenCalled());
  });

  it('can clear filters', async () => {
    render(
      <MemoryRouter>
        <PublisherHistoryPage />
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByTestId('history-btn-clear')).toBeInTheDocument());
    fireEvent.change(screen.getByTestId('history-search'), { target: { value: 'Algo' } });
    fireEvent.change(screen.getByTestId('history-filter-type'), { target: { value: OpportunityType.AYUDANTIA } });
    fireEvent.change(screen.getByTestId('history-filter-status'), { target: { value: OpportunityStatus.FINALIZADO } });
    fireEvent.click(screen.getByTestId('history-btn-clear'));

    expect(screen.getByTestId('history-search')).toHaveValue('');
    expect(screen.getByTestId('history-filter-type')).toHaveValue('');
    expect(screen.getByTestId('history-filter-status')).toHaveValue('');
  });

  it('shows applicants links and can delete an opportunity', async () => {
    jest.spyOn(window, 'confirm').mockReturnValue(true);
    mockedApi.getMine.mockResolvedValueOnce({
      items: [
        {
          id: 'opp-1',
          title: 'Tutoría',
          description: 'Desc',
          type: OpportunityType.TUTORIA,
          status: OpportunityStatus.EN_EVALUACION,
          createdAt: '2026-01-01',
          updatedAt: '2026-01-01',
          publisher: { id: 'u1', name: 'Docente' },
        },
        {
          id: 'opp-2',
          title: 'Ayudantía',
          description: 'Desc',
          type: OpportunityType.AYUDANTIA,
          status: OpportunityStatus.DISPONIBLE,
          createdAt: '2026-01-01',
          updatedAt: '2026-01-01',
          publisher: { id: 'u1', name: 'Docente' },
        },
      ],
      total: 2,
    } as never);

    render(
      <MemoryRouter>
        <PublisherHistoryPage />
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByTestId('link-applicants-opp-1')).toBeInTheDocument());
    fireEvent.click(screen.getAllByRole('button', { name: /eliminar oportunidad/i })[0]);

    await waitFor(() => expect(mockedApi.remove).toHaveBeenCalledWith('opp-1'));
  });

  it('shows pagination controls when there are multiple pages', async () => {
    mockedApi.getMine.mockResolvedValueOnce({
      items: Array.from({ length: 10 }, (_, index) => ({
        id: `opp-${index + 1}`,
        title: `Oportunidad ${index + 1}`,
        description: 'Desc',
        type: OpportunityType.TUTORIA,
        status: OpportunityStatus.DISPONIBLE,
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
        publisher: { id: 'u1', name: 'Docente' },
      })),
      total: 12,
    } as never);

    render(
      <MemoryRouter>
        <PublisherHistoryPage />
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByTestId('history-next')).toBeInTheDocument());
    fireEvent.click(screen.getByTestId('history-next'));

    expect(mockedApi.getMine).toHaveBeenCalled();
  });
});