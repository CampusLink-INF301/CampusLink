import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { OpportunityCreatePage } from './OpportunityCreatePage';
import { opportunitiesApi } from '../../api/opportunities';

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
    <button data-testid="stub-opportunity-form" onClick={() => void onSubmit({ id: 'o1', title: 'Nueva' } as never)}>{submitLabel}</button>
  ),
}));

const mockedApi = opportunitiesApi as jest.Mocked<typeof opportunitiesApi>;

beforeEach(() => {
  jest.clearAllMocks();
  mockedApi.create.mockResolvedValue({ id: 'o1' } as never);
});

describe('OpportunityCreatePage', () => {
  it('creates and redirects to detail', async () => {
    render(
      <MemoryRouter>
        <OpportunityCreatePage />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByTestId('stub-opportunity-form'));

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/opportunities/o1'));
  });
});