import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { OpportunityCard } from './OpportunityCard';
import { OpportunityType } from '../types/opportunity';
import type { Opportunity } from '../types/opportunity';

const baseOpportunity: Opportunity = {
  id: 'uuid-1',
  title: 'Tutoría de Cálculo',
  description: 'Apoyo en cálculo diferencial e integral para estudiantes de primer año.',
  type: OpportunityType.TUTORIA,
  isActive: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

function renderCard(props: Partial<React.ComponentProps<typeof OpportunityCard>> = {}) {
  return render(
    <MemoryRouter>
      <OpportunityCard opportunity={baseOpportunity} {...props} />
    </MemoryRouter>,
  );
}

describe('OpportunityCard', () => {
  it('renders the opportunity title', () => {
    renderCard();
    expect(screen.getByText('Tutoría de Cálculo')).toBeInTheDocument();
  });

  it('renders the type label', () => {
    renderCard();
    expect(screen.getByText('Tutoría')).toBeInTheDocument();
  });

  it('renders the description', () => {
    renderCard();
    expect(screen.getByText(/Apoyo en cálculo/)).toBeInTheDocument();
  });

  it('truncates long descriptions', () => {
    const long = 'A'.repeat(130);
    renderCard({ opportunity: { ...baseOpportunity, description: long } });
    expect(screen.getByText(/A+…/)).toBeInTheDocument();
  });

  it('does not render delete button when onDelete is not provided', () => {
    renderCard();
    expect(screen.queryByLabelText('Eliminar oportunidad')).not.toBeInTheDocument();
  });

  it('renders delete button when onDelete is provided', () => {
    renderCard({ onDelete: jest.fn() });
    expect(screen.getByLabelText('Eliminar oportunidad')).toBeInTheDocument();
  });

  it('calls onDelete with the opportunity id', () => {
    const onDelete = jest.fn();
    renderCard({ onDelete });
    fireEvent.click(screen.getByLabelText('Eliminar oportunidad'));
    expect(onDelete).toHaveBeenCalledWith('uuid-1');
  });

  it('renders the deadline when provided', () => {
    renderCard({ opportunity: { ...baseOpportunity, deadline: '2024-12-31' } });
    expect(screen.getByText(/Fecha límite/)).toBeInTheDocument();
  });

  it('does not render deadline when not provided', () => {
    renderCard();
    expect(screen.queryByText(/Fecha límite/)).not.toBeInTheDocument();
  });

  it('renders edit link pointing to the correct route', () => {
    renderCard();
    const editLink = screen.getByLabelText('Editar oportunidad').closest('a');
    expect(editLink).toHaveAttribute('href', '/opportunities/uuid-1/edit');
  });
});
