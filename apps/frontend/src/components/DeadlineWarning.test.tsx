import { render, screen, act } from '@testing-library/react';
import { DeadlineWarning } from './DeadlineWarning';

jest.useFakeTimers();

afterEach(() => {
  jest.clearAllTimers();
});

describe('DeadlineWarning', () => {
  it('shows countdown when time remains', () => {
    const deadline = new Date(Date.now() + 30 * 60 * 1000).toISOString();

    render(<DeadlineWarning deadline={deadline} />);

    expect(screen.getByTestId('deadline-warning')).toBeInTheDocument();
    expect(screen.queryByTestId('deadline-expired')).not.toBeInTheDocument();
  });

  it('shows expired message when deadline has passed', () => {
    const deadline = new Date(Date.now() - 1000).toISOString();

    render(<DeadlineWarning deadline={deadline} />);

    expect(screen.getByTestId('deadline-expired')).toBeInTheDocument();
    expect(screen.queryByTestId('deadline-warning')).not.toBeInTheDocument();
  });

  it('calls onExpired callback when countdown reaches zero', () => {
    const onExpired = jest.fn();
    const deadline = new Date(Date.now() + 2000).toISOString();

    render(<DeadlineWarning deadline={deadline} onExpired={onExpired} />);

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(onExpired).toHaveBeenCalled();
  });

  it('shows hours when more than 60 minutes remain', () => {
    const deadline = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();

    render(<DeadlineWarning deadline={deadline} />);

    expect(screen.getByTestId('deadline-warning').textContent).toContain('2h');
  });
});
