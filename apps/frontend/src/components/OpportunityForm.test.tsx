import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { OpportunityForm } from './OpportunityForm';

describe('OpportunityForm', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('only shows allowed types for estudiante role', () => {
    localStorage.setItem('user', JSON.stringify({ id: 'u1', role: 'estudiante' }));
    render(<OpportunityForm onSubmit={jest.fn()} />);

    const options = screen.getAllByRole('option').map((o) => o.textContent);
    expect(options).toEqual(['Ayudantía', 'Grupo de Estudio', 'Tutoría']);
    expect(options).not.toContain('Trabajo Part-time');
    expect(options).not.toContain('Práctica');
    expect(options).not.toContain('Otro');
  });

  it('only shows allowed types for institucion role', () => {
    localStorage.setItem('user', JSON.stringify({ id: 'u1', role: 'institucion' }));
    render(<OpportunityForm onSubmit={jest.fn()} />);

    const options = screen.getAllByRole('option').map((o) => o.textContent);
    expect(options).toEqual(['Práctica', 'Voluntariado', 'Trabajo Part-time']);
  });

  it('submits payload with the current form state', async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    render(<OpportunityForm onSubmit={onSubmit} submitLabel="Publicar" />);

    fireEvent.change(screen.getByTestId('input-title'), { target: { value: 'Título' } });
    fireEvent.change(screen.getByTestId('input-description'), { target: { value: 'Descripción' } });
    fireEvent.change(screen.getByTestId('input-requirements'), { target: { value: 'Reqs' } });
    fireEvent.change(screen.getByTestId('input-deadline'), { target: { value: '2026-12-31' } });
    fireEvent.click(screen.getByTestId('btn-submit'));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Título',
      description: 'Descripción',
      requirements: 'Reqs',
      deadline: '2026-12-31',
    })));
  });

  it('shows an error when submit fails', async () => {
    const onSubmit = jest.fn().mockRejectedValue(new Error('boom'));
    render(<OpportunityForm onSubmit={onSubmit} submitLabel="Publicar" />);

    fireEvent.change(screen.getByTestId('input-title'), { target: { value: 'Título' } });
    fireEvent.change(screen.getByTestId('input-description'), { target: { value: 'Descripción' } });
    fireEvent.click(screen.getByTestId('btn-submit'));

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Ocurrió un error. Intenta de nuevo.'));
  });
});