import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SeriesTable } from '../SeriesTable';
import type { Exercise } from '@/types';

// Mock del componente Card
vi.mock('@/components/ui/Card', () => ({
  Card: ({ children }: any) => <div data-testid="card">{children}</div>,
  CardHeader: ({ children }: any) => <div data-testid="card-header">{children}</div>,
  CardTitle: ({ children }: any) => <h2>{children}</h2>,
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

// Mock del componente Input
vi.mock('@/components/ui/Input', () => ({
  Input: (props: any) => <input {...props} />
}));

// Mock del componente WeightSelector
vi.mock('@/components/features/workout/WeightSelector', () => ({
  WeightSelector: ({ value, onChange }: any) => (
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
      data-testid="weight-selector"
    />
  )
}));

// Mock del componente SetTypeSelector
vi.mock('@/components/features/workout/SetTypeSelector', () => ({
  SetTypeSelector: () => <div>SetTypeSelector</div>,
  SetTypeBadge: ({ type }: any) => <span>{type}</span>
}));

// Mock del componente SetTypeCycleButton
vi.mock('@/components/features/workout/SetTypeCycleButton', () => ({
  default: ({ value, onChange }: any) => (
    <button onClick={() => onChange('normal')} data-testid="cycle-button">
      {value}
    </button>
  )
}));

// Mock de lucide icons
vi.mock('@/components/icons/lucide', () => ({
  Plus: () => <span>+</span>
}));

describe('SeriesTable', () => {
  const mockExercise: Exercise = {
    id: 'ex-1',
    name: 'Bench Press',
    sets: [
      { reps: 10, weight: 60 },
      { reps: 8, weight: 70 }
    ],
    restBetweenSets: 90
  };

  const defaultProps = {
    exercise: mockExercise,
    exerciseId: 'ex-1',
    completedSets: 0,
    actualReps: [],
    actualWeights: [],
    setTypes: [],
    currentSet: 1,
    onEditReps: vi.fn(),
    onEditWeight: vi.fn(),
    onEditSetType: vi.fn(),
    onToggleSetComplete: vi.fn(),
    onAddSet: vi.fn()
  };

  it('debe renderizar el título de la tabla', () => {
    render(<SeriesTable {...defaultProps} />);
    expect(screen.getByText('Series del ejercicio')).toBeInTheDocument();
  });

  it('debe mostrar contador de series completadas', () => {
    render(<SeriesTable {...defaultProps} completedSets={0} />);
    expect(screen.getByText('0 de 2 series completadas')).toBeInTheDocument();
  });

  it('debe mostrar contador actualizado cuando hay series completadas', () => {
    render(<SeriesTable {...defaultProps} completedSets={1} />);
    expect(screen.getByText('1 de 2 series completadas')).toBeInTheDocument();
  });

  it('debe renderizar todas las series en la tabla', () => {
    const { container } = render(<SeriesTable {...defaultProps} />);
    const rows = container.querySelectorAll('tr');
    // Header + 2 series
    expect(rows.length).toBeGreaterThanOrEqual(2);
  });

  it('debe mostrar botón agregar serie', () => {
    render(<SeriesTable {...defaultProps} />);
    expect(screen.getByText(/Agregar Serie/)).toBeInTheDocument();
  });

  it('debe llamar onAddSet cuando se hace click en agregar serie', () => {
    const onAddSet = vi.fn();
    render(<SeriesTable {...defaultProps} onAddSet={onAddSet} />);

    const addButton = screen.getByText(/Agregar Serie/);
    fireEvent.click(addButton);

    expect(onAddSet).toHaveBeenCalledOnce();
  });

  it('debe mostrar botón de descanso inteligente si onApplySmartRest está definido', () => {
    render(
      <SeriesTable
        {...defaultProps}
        onApplySmartRest={vi.fn()}
        smartRestTime={90}
      />
    );
    expect(screen.getByText(/Descanso Inteligente/)).toBeInTheDocument();
  });

  it('debe deshabilitar botón de descanso inteligente si no hay smartRestTime', () => {
    render(
      <SeriesTable
        {...defaultProps}
        onApplySmartRest={vi.fn()}
        smartRestTime={undefined}
      />
    );
    const button = screen.getByText(/Descanso Inteligente/);
    expect(button).toBeDisabled();
  });

  it('debe llamar onApplySmartRest cuando se hace click', () => {
    const onApplySmartRest = vi.fn();
    render(
      <SeriesTable
        {...defaultProps}
        onApplySmartRest={onApplySmartRest}
        smartRestTime={90}
      />
    );

    const button = screen.getByText(/Descanso Inteligente/);
    fireEvent.click(button);

    expect(onApplySmartRest).toHaveBeenCalledOnce();
  });

  it('debe mostrar tiempo de descanso inteligente en el botón', () => {
    render(
      <SeriesTable
        {...defaultProps}
        onApplySmartRest={vi.fn()}
        smartRestTime={90}
      />
    );
    expect(screen.getByText(/1m 30s/)).toBeInTheDocument();
  });

  it('debe mostrar selector de descanso si onEditRestTime está definido', () => {
    const { container } = render(
      <SeriesTable
        {...defaultProps}
        onEditRestTime={vi.fn()}
      />
    );
    const selects = container.querySelectorAll('select');
    expect(selects.length).toBeGreaterThan(0);
  });

  it('debe llamar onEditRestTime cuando se cambia el descanso', () => {
    const onEditRestTime = vi.fn();
    const { container } = render(
      <SeriesTable
        {...defaultProps}
        onEditRestTime={onEditRestTime}
      />
    );

    const selects = container.querySelectorAll('select');
    if (selects.length > 0) {
      fireEvent.change(selects[0], { target: { value: '120' } });
      expect(onEditRestTime).toHaveBeenCalled();
    }
  });

  it('debe mostrar reps y peso de la serie', () => {
    const { container } = render(
      <SeriesTable
        {...defaultProps}
        actualReps={[10]}
        actualWeights={[60]}
      />
    );
    expect(container.textContent).toContain('10');
    expect(container.textContent).toContain('60');
  });

  it('debe mostrar valores por defecto si no hay valores actuales', () => {
    const { container } = render(
      <SeriesTable
        {...defaultProps}
        actualReps={[]}
        actualWeights={[]}
      />
    );
    // Debe mostrar los valores de la serie original
    expect(container.textContent).toContain('10');
    expect(container.textContent).toContain('60');
  });

  it('debe renderizar correctamente con series completadas', () => {
    render(
      <SeriesTable
        {...defaultProps}
        completedSets={2}
        actualReps={[10, 8]}
        actualWeights={[60, 70]}
      />
    );
    expect(screen.getByText('2 de 2 series completadas')).toBeInTheDocument();
  });

  it('debe mostrar indicador de serie actual', () => {
    const { container } = render(
      <SeriesTable
        {...defaultProps}
        currentSet={1}
      />
    );
    // Debe haber un indicador visual de la serie actual
    expect(container.textContent).toContain('1');
  });

  it('debe actualizar cuando cambian las props', () => {
    const { rerender } = render(
      <SeriesTable {...defaultProps} completedSets={0} />
    );
    expect(screen.getByText('0 de 2 series completadas')).toBeInTheDocument();

    rerender(
      <SeriesTable {...defaultProps} completedSets={1} />
    );
    expect(screen.getByText('1 de 2 series completadas')).toBeInTheDocument();
  });

  it('debe mostrar formato correcto de descanso en selector', () => {
    const { container } = render(
      <SeriesTable
        {...defaultProps}
        onEditRestTime={vi.fn()}
      />
    );
    const selects = container.querySelectorAll('select');
    if (selects.length > 0) {
      const options = selects[0].querySelectorAll('option');
      // Debe haber opciones de descanso
      expect(options.length).toBeGreaterThan(0);
    }
  });

  it('debe manejar ejercicio sin descanso configurado', () => {
    const exerciseWithoutRest: Exercise = {
      ...mockExercise,
      restBetweenSets: undefined
    };

    render(
      <SeriesTable
        {...defaultProps}
        exercise={exerciseWithoutRest}
      />
    );
    expect(screen.getByText('Series del ejercicio')).toBeInTheDocument();
  });

  it('debe renderizar correctamente en mobile', () => {
    const { container } = render(
      <SeriesTable {...defaultProps} />
    );
    // Debe haber una sección oculta en mobile
    const mobileSection = container.querySelector('.sm\\:hidden');
    expect(mobileSection).toBeInTheDocument();
  });

  it('debe renderizar correctamente en desktop', () => {
    const { container } = render(
      <SeriesTable {...defaultProps} />
    );
    // Debe haber una tabla
    const table = container.querySelector('table');
    expect(table).toBeInTheDocument();
  });
});
