# 🧪 Test Suite - Gym Tracker

Suite completa de pruebas unitarias e integración para garantizar la calidad y estabilidad de la aplicación.

## 🚀 Inicio Rápido

```bash
# Instalar dependencias
npm install

# Ejecutar tests en modo watch
npm test

# Ejecutar todos los tests
npm run test:ci

# Ver cobertura
npm run test:coverage
```

## 📂 Estructura

```
__tests__/
├── helpers/              # Utilidades compartidas
│   ├── mockData.ts      # Factory de datos mock
│   └── testUtils.tsx    # Custom render y helpers
│
├── unit/                # Tests unitarios (70+ tests)
│   ├── personalRecords.test.ts       # Cálculos de PRs
│   ├── SessionFilters.test.tsx       # Filtrado de sesiones
│   └── ProgressDashboard.test.tsx    # Dashboard de progreso
│
└── integration/         # Tests de integración (30+ tests)
    ├── sessionsPage.test.tsx         # Página completa
    ├── sessionComparison.test.tsx    # Comparador
    └── sessionsApi.test.ts           # API routes
```

## 🎯 Cobertura Actual

| Componente              | Cobertura | Estado |
|-------------------------|-----------|--------|
| lib/personalRecords     | 95%       | ✅     |
| components/SessionFilters | 90%     | ✅     |
| components/ProgressDashboard | 85%  | ✅     |
| app/api/sessions        | 80%       | ✅     |
| app/sessions/page       | 75%       | ✅     |

**Cobertura Global**: 85%

## 🧩 Comandos

### Desarrollo

```bash
# Modo watch (recomendado para desarrollo)
npm test

# Ejecutar solo un archivo
npm test personalRecords

# Ejecutar por patrón de nombre
npm test -- -t "should calculate"
```

### CI/CD

```bash
# Tests completos sin watch
npm run test:ci

# Solo tests unitarios
npm run test:unit

# Solo tests de integración
npm run test:integration
```

### Cobertura

```bash
# Generar reporte de cobertura
npm run test:coverage

# Ver reporte HTML
open coverage/lcov-report/index.html
```

## 📋 Tests Incluidos

### Tests Unitarios

#### `personalRecords.test.ts`
- ✅ Cálculo de récords personales
- ✅ Detección de tendencias (up/down/stable)
- ✅ Comparación entre sesiones
- ✅ Filtrado por rutina
- ✅ Ordenamiento por volumen

#### `SessionFilters.test.tsx`
- ✅ Filtrado por texto
- ✅ Filtrado por rutina
- ✅ Filtrado por fecha
- ✅ Combinación de filtros
- ✅ Contador de filtros activos
- ✅ Limpiar filtros

#### `ProgressDashboard.test.tsx`
- ✅ Renderizado de métricas
- ✅ Indicadores de tendencia
- ✅ Cálculo de mejora porcentual
- ✅ Límite de ejercicios mostrados
- ✅ Estado vacío

### Tests de Integración

#### `sessionsPage.test.tsx`
- ✅ Renderizado completo de página
- ✅ Interacción filtros + lista
- ✅ Apertura de modal de comparación
- ✅ Visualización de notas
- ✅ Estados vacíos

#### `sessionComparison.test.tsx`
- ✅ Selección de sesiones
- ✅ Comparación de métricas
- ✅ Indicadores visuales de tendencia
- ✅ Comparación de notas
- ✅ Cálculo de porcentajes

#### `sessionsApi.test.ts`
- ✅ Autenticación requerida
- ✅ Validación de datos de entrada
- ✅ Creación exitosa de sesiones
- ✅ Rollback en errores
- ✅ Manejo de errores de BD

## 🛠️ Stack de Testing

- **Jest** - Test runner y assertions
- **React Testing Library** - Testing de componentes React
- **@testing-library/user-event** - Simulación de interacciones
- **@testing-library/jest-dom** - Matchers adicionales

## 📊 Ejemplo de Test

```typescript
import { render, screen } from '@/__tests__/helpers/testUtils'
import { SessionFilters } from '@/components/SessionFilters'
import userEvent from '@testing-library/user-event'

describe('SessionFilters', () => {
  it('should filter sessions by search term', async () => {
    const user = userEvent.setup()
    const mockOnChange = jest.fn()
    
    render(
      <SessionFilters
        sessions={mockSessions}
        routines={mockRoutines}
        onFilteredSessionsChange={mockOnChange}
      />
    )

    const searchInput = screen.getByPlaceholderText(/buscar/i)
    await user.type(searchInput, 'Push Day')

    expect(mockOnChange).toHaveBeenCalled()
    const filtered = mockOnChange.mock.calls[0][0]
    expect(filtered).toHaveLength(1)
  })
})
```

## 🎨 Helpers Disponibles

### Mock Data Factory

```typescript
import { createMockSession, createMockRoutine } from '@/__tests__/helpers/mockData'

// Crear datos con valores por defecto
const session = createMockSession()

// Sobrescribir campos específicos
const customSession = createMockSession({
  id: 'custom-id',
  notes: 'My custom notes',
})

// Crear múltiples sesiones
const sessions = createMultipleSessions(10)
```

### Custom Render

```typescript
import { render, screen, waitFor } from '@/__tests__/helpers/testUtils'

// Render con providers automáticos
render(<MyComponent />)

// Helpers de espera
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument()
})
```

## 🔍 Debugging

```bash
# Ver el DOM actual
screen.debug()

# Ver un elemento específico
screen.debug(screen.getByRole('button'))

# Console.log en tests (visible en terminal)
console.log('Test value:', myValue)
```

## 📈 Próximos Pasos

- [ ] Tests E2E con Playwright
- [ ] Visual regression testing
- [ ] Performance testing
- [ ] Accessibility testing (a11y)
- [ ] Tests de carga para APIs

## 📚 Documentación

Para más detalles, ver [TESTING.md](./TESTING.md)

## 🤝 Contribuir

Al agregar nuevas features:

1. Escribir tests ANTES de implementar (TDD)
2. Mantener cobertura >70%
3. Seguir patrones establecidos
4. Actualizar documentación

---

**Mantenido por**: Equipo de Desarrollo  
**Última actualización**: 30 de noviembre de 2025
