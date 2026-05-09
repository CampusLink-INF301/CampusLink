import { render, screen, fireEvent } from '@testing-library/react';
import { FormFiller } from './FormFiller';

const fields = [
  { id: 'short', label: 'Texto corto', type: 'text_short', required: true },
  { id: 'long', label: 'Texto largo', type: 'text_long', required: false },
  { id: 'num', label: 'Número', type: 'number', required: false },
  { id: 'date', label: 'Fecha', type: 'date', required: false },
  { id: 'single', label: 'Uno', type: 'select_single', required: false, options: ['A', 'B'] },
  { id: 'multi', label: 'Multi', type: 'select_multiple', required: false, options: ['X', 'Y'] },
];

describe('FormFiller', () => {
  it('renders inputs for each field type and updates responses', () => {
    const onChange = jest.fn();
    const { container } = render(<FormFiller fields={fields as never} responses={{}} onChange={onChange} />);

    fireEvent.change(screen.getAllByRole('textbox')[0], { target: { value: 'Hola' } });
    fireEvent.change(screen.getAllByRole('textbox')[1], { target: { value: 'Long' } });
    fireEvent.change(container.querySelector('input[type="number"]')!, { target: { value: '5' } });
    fireEvent.change(container.querySelector('input[type="date"]')!, { target: { value: '2026-05-08' } });
    fireEvent.change(container.querySelector('select')!, { target: { value: 'A' } });
    fireEvent.click(container.querySelector('input[type="checkbox"]')!);

    expect(onChange).toHaveBeenCalled();
  });

  it('toggles multi select options', () => {
    const onChange = jest.fn();
    const { container } = render(<FormFiller fields={fields as never} responses={{}} onChange={onChange} />);

    fireEvent.click(container.querySelectorAll('input[type="checkbox"]')[0]!);
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ multi: ['X'] }));
  });
});