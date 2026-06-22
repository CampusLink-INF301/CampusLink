import { render, screen, fireEvent, within } from '@testing-library/react';
import { FormFieldBuilder } from './FormFieldBuilder';
import { OpportunityType } from '../types/opportunity';

function renderBuilder(initial = []) {
  const onChange = jest.fn();
  render(<FormFieldBuilder fields={initial as never} onChange={onChange} />);
  return { onChange };
}

describe('FormFieldBuilder', () => {
  beforeEach(() => {
    jest.spyOn(Math, 'random').mockReturnValue(0.12345678);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('adds a new question', () => {
    const { onChange } = renderBuilder();

    fireEvent.click(screen.getByRole('button', { name: /agregar pregunta/i }));

    expect(onChange).toHaveBeenCalledWith([
      expect.objectContaining({ label: '', type: 'text_short', required: false }),
    ]);
  });

  it('updates label and required flag', () => {
    const field = { id: 'f1', label: 'Pregunta', type: 'text_short', required: false };
    const { onChange } = renderBuilder([field]);

    fireEvent.change(screen.getByPlaceholderText(/escribe la pregunta/i), {
      target: { value: 'Nueva pregunta' },
    });
    fireEvent.click(screen.getByRole('checkbox'));

    expect(onChange).toHaveBeenNthCalledWith(1, [
      expect.objectContaining({ label: 'Nueva pregunta', required: false }),
    ]);
    expect(onChange).toHaveBeenNthCalledWith(2, [
      expect.objectContaining({ label: 'Pregunta', required: true }),
    ]);
  });

  it('adds and removes options for select fields', () => {
    const onChange = jest.fn();
    const field = {
      id: 'f1',
      label: 'Opciones',
      type: 'select_single' as const,
      required: true,
      options: ['A'],
    };
    render(<FormFieldBuilder fields={[field] as never} onChange={onChange} />);

    fireEvent.change(screen.getByPlaceholderText(/nueva opción/i), {
      target: { value: 'B' },
    });
    fireEvent.click(screen.getByRole('button', { name: /opción/i }));

    expect(onChange).toHaveBeenLastCalledWith([
      expect.objectContaining({ options: ['A', 'B'] }),
    ]);
  });

  it('moves questions and removes them', () => {
    const onChange = jest.fn();
    const fields = [
      { id: 'f1', label: 'Uno', type: OpportunityType.OTRO, required: false },
      { id: 'f2', label: 'Dos', type: OpportunityType.OTRO, required: false },
    ];
    render(<FormFieldBuilder fields={fields as never} onChange={onChange} />);

    fireEvent.click(screen.getAllByTitle('Subir')[1]);
    expect(onChange).toHaveBeenCalledWith([
      expect.objectContaining({ id: 'f2' }),
      expect.objectContaining({ id: 'f1' }),
    ]);

    fireEvent.click(screen.getAllByTitle('Eliminar pregunta')[0]);
    expect(onChange).toHaveBeenCalledWith([expect.objectContaining({ id: 'f2' })]);
  });

  it('ignores empty option input and can remove an option chip', () => {
    const onChange = jest.fn();
    const field = {
      id: 'f1',
      label: 'Opciones',
      type: 'select_single' as const,
      required: true,
      options: ['A', 'B'],
    };
    render(<FormFieldBuilder fields={[field] as never} onChange={onChange} />);

    fireEvent.click(screen.getByRole('button', { name: /opción/i }));
    expect(onChange).not.toHaveBeenCalled();

    const chip = screen.getByText('A').closest('.fb-chip');
    expect(chip).not.toBeNull();
    fireEvent.click(within(chip as HTMLElement).getByRole('button'));
    expect(onChange).toHaveBeenCalledWith([
      expect.objectContaining({ options: ['B'] }),
    ]);
  });

  it('clears select options when switching to a text field', () => {
    const onChange = jest.fn();
    const field = {
      id: 'f1',
      label: 'Opciones',
      type: 'select_single' as const,
      required: true,
      options: ['A'],
    };
    render(<FormFieldBuilder fields={[field] as never} onChange={onChange} />);

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'text_short' } });

    expect(onChange).toHaveBeenCalledWith([
      expect.objectContaining({ type: 'text_short', options: undefined }),
    ]);
  });
});