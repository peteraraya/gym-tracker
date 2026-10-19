import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';

function ModalHarness() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>Abrir</button>
      <Modal isOpen={open} title="Confirmar" onClose={() => setOpen(false)}>
        <button type="button">Primera acción</button>
        <button type="button">Última acción</button>
      </Modal>
    </>
  );
}

describe('Modal accessibility', () => {
  it('traps keyboard focus and restores focus to the opener on Escape', () => {
    render(<ModalHarness />);

    const opener = screen.getByRole('button', { name: 'Abrir' });
    opener.focus();
    fireEvent.click(opener);

    const closeButton = screen.getByRole('button', { name: 'Cerrar Confirmar' });
    const lastAction = screen.getByRole('button', { name: 'Última acción' });

    expect(screen.getByRole('dialog', { name: 'Confirmar' })).toBeInTheDocument();
    expect(closeButton).toHaveFocus();

    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(lastAction).toHaveFocus();
    lastAction.focus();
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(closeButton).toHaveFocus();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(opener).toHaveFocus();
  });
});
