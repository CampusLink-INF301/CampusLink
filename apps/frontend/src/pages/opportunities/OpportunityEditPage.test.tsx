import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { OpportunityEditPage } from './OpportunityEditPage';
import { opportunitiesApi } from '../../api/opportunities';
import { OpportunityType, OpportunityStatus } from '../../types/opportunity';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

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
jest.mock('../../components/OpportunityForm', () => ({
  OpportunityForm: ({ onSubmit, submitLabel }: { onSubmit: (payload: unknown) => Promise<void>; submitLabel: string }) => (
    <button data-testid="stub-opportunity-form" onClick={() => void onSubmit({ title: 'Editada' } as never)}>{submitLabel}</button>
  ),
}));

const mockedApi = opportunitiesApi as jest.Mocked<typeof opportunitiesApi>;

beforeEach(() => {
  jest.clearAllMocks();
  mockedApi.getById.mockResolvedValue({
    id: 'o1',
    title: 'Original',
    description: 'Desc',
    type: OpportunityType.TUTORIA,
    status: OpportunityStatus.DISPONIBLE,
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  } as never);
  mockedApi.update.mockResolvedValue({ id: 'o1' } as never);
});

describe('OpportunityEditPage', () => {
  it('loads and updates an opportunity', async () => {
    render(
      <MemoryRouter initialEntries={['/opportunities/o1/edit']}>
        <Routes>
          <Route path="/opportunities/:id/edit" element={<OpportunityEditPage />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByTestId('stub-opportunity-form')).toBeInTheDocument());
    fireEvent.click(screen.getByTestId('stub-opportunity-form'));

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/opportunities/o1'));
  });
});