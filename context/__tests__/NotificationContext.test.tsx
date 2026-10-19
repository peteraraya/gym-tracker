jest.unmock('@/context/NotificationContext');

import { act, fireEvent, render, screen } from '@testing-library/react';
import { LocaleProvider } from '@/context/LocaleContext';
import { NotificationProvider, useToast } from '@/context/NotificationContext';

function NotificationHarness() {
  const { success, error } = useToast();

  return (
    <>
      <button onClick={() => success('Serie guardada', 1000)}>Success</button>
      <button onClick={() => error('Fallo al guardar', 1000)}>Error</button>
    </>
  );
}

describe('NotificationProvider', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it('shows queued notifications one at a time and starts their timer when visible', () => {
    jest.useFakeTimers();

    render(
      <LocaleProvider>
        <NotificationProvider>
          <NotificationHarness />
        </NotificationProvider>
      </LocaleProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Success' }));
    fireEvent.click(screen.getByRole('button', { name: 'Error' }));

    expect(screen.getByText('Serie guardada')).toBeInTheDocument();
    expect(screen.queryByText('Fallo al guardar')).not.toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(screen.queryByText('Serie guardada')).not.toBeInTheDocument();
    expect(screen.getByText('Fallo al guardar')).toBeInTheDocument();
  });
});
