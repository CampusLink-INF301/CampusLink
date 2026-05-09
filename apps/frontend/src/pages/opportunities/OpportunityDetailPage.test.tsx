import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { OpportunityDetailPage } from './OpportunityDetailPage';
import { opportunitiesApi } from '../../api/opportunities';
import { applicationsApi } from '../../api/applications';
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
jest.mock('../../api/applications', () => ({
  applicationsApi: {
    apply: jest.fn(),
    cancel: jest.fn(),
    getMine: jest.fn(),
    getByOpportunity: jest.fn(),
    finalize: jest.fn(),
    setFeedback: jest.fn(),
  },
}));
jest.mock('../../components/DeadlineWarning', () => ({ DeadlineWarning: () => <div data-testid="deadline-warning" /> }));

const mockedOppApi = opportunitiesApi as jest.Mocked<typeof opportunitiesApi>;
const mockedAppsApi = applicationsApi as jest.Mocked<typeof applicationsApi>;

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
  localStorage.setItem('token', 'token');
  localStorage.setItem('user', JSON.stringify({ id: 'u1', role: 'estudiante' }));
  mockedOppApi.getById.mockResolvedValue({
    id: 'opp-1',
    title: 'Tutoría',
    description: 'Desc',
    type: OpportunityType.TUTORIA,
    status: OpportunityStatus.DISPONIBLE,
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
    formFields: [],
    deadline: null,
  } as never);
  mockedAppsApi.apply.mockResolvedValue({ id: 'app-1' } as never);
});

describe('OpportunityDetailPage', () => {
  it('allows a student to apply', async () => {
    render(
      <MemoryRouter initialEntries={['/opportunities/opp-1']}>
        <Routes>
          <Route path="/opportunities/:id" element={<OpportunityDetailPage />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByTestId('btn-apply')).toBeInTheDocument());
    fireEvent.click(screen.getByTestId('btn-apply'));

    await waitFor(() => expect(mockedAppsApi.apply).toHaveBeenCalledWith('opp-1', undefined));
  });

  it('shows unavailable message when opportunity is not available', async () => {
    mockedOppApi.getById.mockResolvedValueOnce({
      id: 'opp-1',
      title: 'Tutoría',
      description: 'Desc',
      type: OpportunityType.TUTORIA,
      status: OpportunityStatus.FINALIZADO,
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
      formFields: [],
      deadline: null,
    } as never);

    render(
      <MemoryRouter initialEntries={['/opportunities/opp-1']}>
        <Routes>
          <Route path="/opportunities/:id" element={<OpportunityDetailPage />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByTestId('apply-unavailable')).toBeInTheDocument());
  });

  it('renders form fields and submits responses', async () => {
    mockedOppApi.getById.mockResolvedValueOnce({
      id: 'opp-1',
      title: 'Tutoría con formulario',
      description: 'Desc',
      type: OpportunityType.TUTORIA,
      status: OpportunityStatus.DISPONIBLE,
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
      formFields: [
        { id: 'q1', label: 'Nombre', type: 'text_short', required: true },
      ],
      deadline: null,
    } as never);

    render(
      <MemoryRouter initialEntries={['/opportunities/opp-1']}>
        <Routes>
          <Route path="/opportunities/:id" element={<OpportunityDetailPage />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByTestId('btn-apply')).toBeInTheDocument());
    fireEvent.click(screen.getByTestId('btn-apply'));

    await waitFor(() => expect(screen.getByRole('textbox')).toBeInTheDocument());
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Ana' } });
    fireEvent.click(screen.getByText('Enviar postulación'));

    await waitFor(() => expect(mockedAppsApi.apply).toHaveBeenCalledWith('opp-1', { q1: 'Ana' }));
  });

  it('shows an apply error message from the backend', async () => {
    mockedAppsApi.apply.mockRejectedValueOnce({ response: { data: { message: 'No se pudo postular.' } } });

    render(
      <MemoryRouter initialEntries={['/opportunities/opp-1']}>
        <Routes>
          <Route path="/opportunities/:id" element={<OpportunityDetailPage />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByTestId('btn-apply')).toBeInTheDocument());
    fireEvent.click(screen.getByTestId('btn-apply'));

    await waitFor(() => expect(screen.getByTestId('apply-error')).toHaveTextContent('No se pudo postular.'));
  });

  it('shows the deadline warning when the deadline is near', async () => {
    const soon = new Date(Date.now() + 30 * 60 * 1000).toISOString();
    mockedOppApi.getById.mockResolvedValueOnce({
      id: 'opp-1',
      title: 'Tutoría',
      description: 'Desc',
      type: OpportunityType.TUTORIA,
      status: OpportunityStatus.DISPONIBLE,
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
      formFields: [],
      deadline: soon,
    } as never);

    render(
      <MemoryRouter initialEntries={['/opportunities/opp-1']}>
        <Routes>
          <Route path="/opportunities/:id" element={<OpportunityDetailPage />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByTestId('deadline-warning')).toBeInTheDocument());
  });

  it('shows the not found message when the opportunity is missing', async () => {
    mockedOppApi.getById.mockResolvedValueOnce(null as never);

    render(
      <MemoryRouter initialEntries={['/opportunities/opp-1']}>
        <Routes>
          <Route path="/opportunities/:id" element={<OpportunityDetailPage />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByText('Oportunidad no encontrada.')).toBeInTheDocument());
  });
});