import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { OpportunitiesListPage } from './OpportunitiesListPage';
import { opportunitiesApi } from '../../api/opportunities';
import { OpportunityType, OpportunityStatus } from '../../types/opportunity';
import type { Opportunity } from '../../types/opportunity';

jest.mock('../../api/client');
jest.mock('../../api/opportunities');
jest.useFakeTimers();

const mockedApi = opportunitiesApi as jest.Mocked<typeof opportunitiesApi>;

const mockOpp: Opportunity = {
  id: 'uuid-1',
  title: 'Tutoría de Cálculo',
  description: 'Apoyo en cálculo diferencial',
  type: OpportunityType.TUTORIA,
  status: OpportunityStatus.DISPONIBLE,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

const emptyPage = { items: [], total: 0, hasMore: false };
const onePage = { items: [mockOpp], total: 1, hasMore: false };

beforeAll(() => {
  global.IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof IntersectionObserver;
});

function renderPage() {
  return render(
    <MemoryRouter>
      <OpportunitiesListPage />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  mockedApi.getAll.mockResolvedValue(emptyPage);
});

afterEach(() => {
  jest.clearAllTimers();
});

describe('OpportunitiesListPage', () => {
  it('shows opportunity cards after loading', async () => {
    mockedApi.getAll.mockResolvedValue(onePage);

    renderPage();
    act(() => { jest.runAllTimers(); });

    await waitFor(() => {
      expect(screen.getByText('Tutoría de Cálculo')).toBeInTheDocument();
    });
  });

  it('shows empty state when no opportunities', async () => {
    mockedApi.getAll.mockResolvedValue(emptyPage);

    renderPage();
    act(() => { jest.runAllTimers(); });

    await waitFor(() => {
      expect(screen.getByTestId('empty-message')).toBeInTheDocument();
    });
  });

  it('resets and reloads when search is submitted', async () => {
    mockedApi.getAll.mockResolvedValue(onePage);

    renderPage();
    act(() => { jest.runAllTimers(); });
    await waitFor(() => expect(mockedApi.getAll).toHaveBeenCalled());

    const searchInput = screen.getByTestId('search-input');
    fireEvent.change(searchInput, { target: { value: 'cálculo' } });
    act(() => { jest.runAllTimers(); });

    await waitFor(() => {
      expect(mockedApi.getAll).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'cálculo' }),
      );
    });
  });

  it('clears filters when clear button is clicked', async () => {
    mockedApi.getAll.mockResolvedValue(emptyPage);

    renderPage();
    act(() => { jest.runAllTimers(); });
    await waitFor(() => expect(mockedApi.getAll).toHaveBeenCalled());

    const searchInput = screen.getByTestId('search-input');
    fireEvent.change(searchInput, { target: { value: 'algo' } });

    const clearBtn = screen.getByTestId('btn-clear');
    fireEvent.click(clearBtn);
    act(() => { jest.runAllTimers(); });

    await waitFor(() => {
      const lastCall = mockedApi.getAll.mock.calls.at(-1)?.[0];
      expect(lastCall?.search).toBeFalsy();
    });
  });
});
