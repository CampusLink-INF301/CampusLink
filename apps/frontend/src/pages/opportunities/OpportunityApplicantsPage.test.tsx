import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { OpportunityApplicantsPage } from './OpportunityApplicantsPage';
import { applicationsApi } from '../../api/applications';
import { ApplicationStatus } from '../../types/application';
import { OpportunityStatus, OpportunityType } from '../../types/opportunity';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

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

jest.mock('../../api/opportunities', () => ({
  opportunitiesApi: {
    closeApplications: jest.fn(),
  },
}));

const mockedApi = applicationsApi as jest.Mocked<typeof applicationsApi>;

const baseApp = {
  id: 'app-1',
  status: ApplicationStatus.POSTULADO,
  feedback: null,
  formResponses: { q1: 'yes' },
  user: { name: 'Ana', email: 'ana@test.com' },
  opportunity: {
    id: 'opp-1',
    title: 'Tutoría',
    description: 'Desc',
    type: OpportunityType.TUTORIA,
    status: OpportunityStatus.EN_EVALUACION,
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
    formFields: [{ id: 'q1', label: 'Pregunta', type: 'text_short', required: true }],
  },
};

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
  localStorage.setItem('token', 'token');
  mockedApi.getByOpportunity.mockResolvedValue([baseApp] as never);
  mockedApi.finalize.mockResolvedValue(undefined as never);
  mockedApi.setFeedback.mockResolvedValue({ ...baseApp, feedback: 'OK' } as never);
});

describe('OpportunityApplicantsPage', () => {
  it('allows selecting applicants and finalizing', async () => {
    render(
      <MemoryRouter initialEntries={['/my-opportunities/opp-1/applicants']}>
        <Routes>
          <Route path="/my-opportunities/:id/applicants" element={<OpportunityApplicantsPage />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByTestId('chk-app-1')).toBeInTheDocument());
    fireEvent.click(screen.getByTestId('chk-app-1'));
    fireEvent.click(screen.getByTestId('btn-finalize'));

    const dialog = await waitFor(() => screen.getByRole('dialog'));
    fireEvent.click(within(dialog).getByRole('button', { name: /finalizar/i }));

    await waitFor(() => expect(mockedApi.finalize).toHaveBeenCalledWith('opp-1', ['app-1']));
  });

  it('lets the publisher save feedback after finalization', async () => {
    mockedApi.getByOpportunity.mockResolvedValueOnce([
      { ...baseApp, opportunity: { ...baseApp.opportunity, status: OpportunityStatus.FINALIZADO } },
    ] as never);

    render(
      <MemoryRouter initialEntries={['/my-opportunities/opp-1/applicants']}>
        <Routes>
          <Route path="/my-opportunities/:id/applicants" element={<OpportunityApplicantsPage />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByTestId('feedback-app-1')).toBeInTheDocument());
    fireEvent.change(screen.getByTestId('feedback-app-1'), { target: { value: 'Buen candidato' } });
    fireEvent.click(screen.getByTestId('btn-save-feedback-app-1'));

    await waitFor(() => expect(mockedApi.setFeedback).toHaveBeenCalledWith('app-1', 'Buen candidato'));
  });
});