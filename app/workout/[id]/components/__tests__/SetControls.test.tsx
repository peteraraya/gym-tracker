import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SetControls } from '../SetControls';

// Mock del componente Card
vi.mock('@/components/ui/Card', () => ({
  Card: ({ children }: any) => <div data-testid="card">{children}</div>,
  CardContent: ({ children }: any) => <div data-testid="card-content">{children}</div>
}));

// Mock del componente Button
vi.mock('@/components/ui/Button', () => ({
  Button: ({ children, onClick, disabled, variant, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} data-variant={variant} {...props}>
      {children}
    </button>
  )
}));

// Mock de lucide icons
vi.mock('@/components/icons/lucide', () => ({
  Plus: () => <span>+</span>,
  Minus: () => <span>-</span>
}));

describe('SetControls', () => {
  const defaultProps = {
    currentSet: 1,
    totalSets: 3,
    onSetChange: vi.fn()
  };

  it('debe renderizar el número de serie actual', () => {
    render(<SetControls {...defaultProps} />);
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('de 3')).toBeInTheDocument();
  });

  it('debe deshabilitar botón anterior en primera serie', () => {
    render(<SetControls {...defaultProps} currentSet={1} />);
    const prevButton = screen.getByText(/←/);
    expect(prevButton).toBeDisabled();
  });

  it('debe habilitar botón anterior en serie intermedia', () => {
    render(<SetControls {...defaultProps} currentSet={2} />);
    const prevButton = screen.getByText(/←/);
    expect(prevButton).not.toBeDisabled();
  });

  it('debe deshabilitar botón siguiente en última serie', () => {
    render(<SetControls {...defaultProps} currentSet={3} />);
    const nextButton = screen.getByText(/→/);
    expect(nextButton).toBeDisabled();
  });

  it('debe habilitar botón siguiente en serie intermedia', () => {
    render(<SetControls {...defaultProps} currentSet={2} />);
    const nextButton = screen.getByText(/→/);
    expect(nextButton).not.toBeDisabled();
  });

  it('debe llamar onSetChange con serie anterior cuando se hace click', () => {
    const onSetChange = vi.fn();
    render(
      <SetControls
        {...defaultProps}
        currentSet={2}
        onSetChange={onSetChange}
      />
    );

    const prevButton = screen.getByText(/←/);
    fireEvent.click(prevButton);

    expect(onSetChange).toHaveBeenCalledWith(1);
  });

  it('debe llamar onSetChange con serie siguiente cuando se hace click', () => {
    const onSetChange = vi.fn();
    render(
      <SetControls
        {...defaultProps}
        currentSet={2}
        onSetChange={onSetChange}
      />
    );

    const nextButton = screen.getByText(/→/);
    fireEvent.click(nextButton);

    expect(onSetChange).toHaveBeenCalledWith(3);
  });

  it('debe mostrar botón agregar si onAddSet está definido', () => {
    render(
      <SetControls
        {...defaultProps}
        onAddSet={vi.fn()}
      />
    );
    expect(screen.getByText(/Agregar/)).toBeInTheDocument();
  });

  it('debe mostrar botón eliminar si onRemoveSet está definido', () => {
    render(
      <SetControls
        {...defaultProps}
        onRemoveSet={vi.fn()}
      />
    );
    expect(screen.getByText(/Eliminar/)).toBeInTheDocument();
  });

  it('debe llamar onAddSet cuando se hace click en agregar', () => {
    const onAddSet = vi.fn();
    render(
      <SetControls
        {...defaultProps}
        onAddSet={onAddSet}
      />
    );

    const addButton = screen.getByText(/Agregar/);
    fireEvent.click(addButton);

    expect(onAddSet).toHaveBeenCalledOnce();
  });

  it('debe llamar onRemoveSet cuando se hace click en eliminar', () => {
    const onRemoveSet = vi.fn();
    render(
      <SetControls
        {...defaultProps}
        onRemoveSet={onRemoveSet}
      />
    );

    const removeButton = screen.getByText(/Eliminar/);
    fireEvent.click(removeButton);

    expect(onRemoveSet).toHaveBeenCalledOnce();
  });

  it('debe deshabilitar botón eliminar si solo hay una serie', () => {
    render(
      <SetControls
        {...defaultProps}
        totalSets={1}
        onRemoveSet={vi.fn()}
      />
    );

    const removeButton = screen.getByText(/Eliminar/);
    expect(removeButton).toBeDisabled();
  });

  it('debe deshabilitar todos los botones si disabled es true', () => {
    render(
      <SetControls
        {...defaultProps}
        currentSet={2}
        disabled={true}
        onAddSet={vi.fn()}
        onRemoveSet={vi.fn()}
      />
    );

    const prevButton = screen.getByText(/←/);
    const nextButton = screen.getByText(/→/);
    const addButton = screen.getByText(/Agregar/);
    const removeButton = screen.getByText(/Eliminar/);

    expect(prevButton).toBeDisabled();
    expect(nextButton).toBeDisabled();
    expect(addButton).toBeDisabled();
    expect(removeButton).toBeDisabled();
  });

  it('debe renderizar correctamente con una sola serie', () => {
    render(
      <SetControls
        {...defaultProps}
        totalSets={1}
        currentSet={1}
      />
    );

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('de 1')).toBeInTheDocument();

    const prevButton = screen.getByText(/←/);
    const nextButton = screen.getByText(/→/);

    expect(prevButton).toBeDisabled();
    expect(nextButton).toBeDisabled();
  });

  it('debe renderizar correctamente con muchas series', () => {
    render(
      <SetControls
        {...defaultProps}
        totalSets={10}
        currentSet={5}
      />
    );

    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('de 10')).toBeInTheDocument();

    const prevButton = screen.getByText(/←/);
    const nextButton = screen.getByText(/→/);

    expect(prevButton).not.toBeDisabled();
    expect(nextButton).not.toBeDisabled();
  });

  it('debe actualizar cuando cambian las props', () => {
    const { rerender } = render(
      <SetControls {...defaultProps} currentSet={1} />
    );
    expect(screen.getByText('1')).toBeInTheDocument();

    rerender(
      <SetControls {...defaultProps} currentSet={2} />
    );
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('debe no llamar onSetChange si el botón está deshabilitado', () => {
    const onSetChange = vi.fn();
    render(
      <SetControls
        {...defaultProps}
        currentSet={1}
        onSetChange={onSetChange}
      />
    );

    const prevButton = screen.getByText(/←/);
    fireEvent.click(prevButton);

    expect(onSetChange).not.toHaveBeenCalled();
  });
});
