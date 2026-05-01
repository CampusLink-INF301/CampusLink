import { render, screen, fireEvent } from '@testing-library/react';
import { SearchBar } from './SearchBar';
import { OpportunityType } from '../types/opportunity';

describe('SearchBar', () => {
  it('renders the search input and filter select', () => {
    render(<SearchBar onSearch={jest.fn()} />);
    expect(screen.getByTestId('search-input')).toBeInTheDocument();
    expect(screen.getByTestId('filter-type')).toBeInTheDocument();
  });

  it('calls onSearch with the typed value on submit', () => {
    const onSearch = jest.fn();
    render(<SearchBar onSearch={onSearch} />);

    fireEvent.change(screen.getByTestId('search-input'), {
      target: { value: 'cálculo' },
    });
    fireEvent.click(screen.getByTestId('btn-search'));

    expect(onSearch).toHaveBeenCalledWith('cálculo', undefined);
  });

  it('calls onSearch with type when a filter is selected', () => {
    const onSearch = jest.fn();
    render(<SearchBar onSearch={onSearch} />);

    fireEvent.change(screen.getByTestId('filter-type'), {
      target: { value: OpportunityType.TUTORIA },
    });
    fireEvent.click(screen.getByTestId('btn-search'));

    expect(onSearch).toHaveBeenCalledWith('', OpportunityType.TUTORIA);
  });

  it('resets inputs and calls onSearch on clear', () => {
    const onSearch = jest.fn();
    render(<SearchBar onSearch={onSearch} />);

    fireEvent.change(screen.getByTestId('search-input'), {
      target: { value: 'algo' },
    });
    fireEvent.click(screen.getByTestId('btn-clear'));

    expect((screen.getByTestId('search-input') as HTMLInputElement).value).toBe('');
    expect(onSearch).toHaveBeenLastCalledWith('', undefined);
  });

  it('prevents default form submission', () => {
    const onSearch = jest.fn();
    render(<SearchBar onSearch={onSearch} />);

    const form = screen.getByTestId('btn-search').closest('form')!;
    const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
    fireEvent(form, submitEvent);

    expect(onSearch).toHaveBeenCalled();
  });
});
