import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Input, TextArea } from '@/components/ui/Input';

jest.mock('@/context/LocaleContext', () => ({
  useTranslations: () => (key: string) => (key === 'close' ? 'Cerrar' : key),
}));

function BottomSheetHarness() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>Abrir panel</button>
      <BottomSheet isOpen={open} title="Opciones" onClose={() => setOpen(false)}>
        <button type="button">Acción</button>
      </BottomSheet>
    </>
  );
}

describe('UI accessibility', () => {
  it('labels fields and associates validation errors', () => {
    render(
      <>
        <Input label="Nombre" name="name" error="Obligatorio" aria-describedby="name-help" />
        <TextArea label="Descripción" name="description" error="Obligatorio" />
      </>,
    );

    const input = screen.getByLabelText('Nombre');
    const textarea = screen.getByLabelText('Descripción');
    expect(input.getAttribute('aria-describedby')).toBe('name-help name-error');
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(textarea.getAttribute('aria-describedby')).toBe('description-error');
    expect(textarea.getAttribute('aria-invalid')).toBe('true');
  });

  it('gives the bottom sheet dialog semantics and restores focus when Escape closes it', () => {
    const scrollTo = jest.spyOn(window, 'scrollTo').mockImplementation(() => {});
    render(<BottomSheetHarness />);

    const opener = screen.getByRole('button', { name: 'Abrir panel' });
    opener.focus();
    fireEvent.click(opener);

    expect(screen.getByRole('dialog', { name: 'Opciones' })).not.toBeNull();
    const closeButton = screen.getByRole('button', { name: 'Cerrar Opciones' });
    const actionButton = screen.getByRole('button', { name: 'Acción' });
    expect(document.activeElement).toBe(closeButton);

    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(actionButton);
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(document.activeElement).toBe(closeButton);

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(opener);
    scrollTo.mockRestore();
  });
});
