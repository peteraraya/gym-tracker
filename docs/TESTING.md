# Testing Documentation - Gym Tracker

## 📋 Índice

1. [Estructura de Testing](#estructura-de-testing)
2. [Configuración](#configuración)
3. [Tipos de Tests](#tipos-de-tests)
4. [Ejecutar Tests](#ejecutar-tests)
5. [Patrones y Mejores Prácticas](#patrones-y-mejores-prácticas)
6. [Cobertura de Código](#cobertura-de-código)

---

## 🗂️ Estructura de Testing

```
__tests__/
├── helpers/              # Utilidades compartidas
│   ├── mockData.ts      # Factory de datos mock
│   └── testUtils.tsx    # Custom render y helpers
│
├── unit/                # Tests unitarios
│   ├── personalRecords.test.ts
│   ├── SessionFilters.test.tsx
│   └── ProgressDashboard.test.tsx
│
└── integration/         # Tests de integración
    ├── sessionsPage.test.tsx
    ├── sessionComparison.test.tsx
    └── sessionsApi.test.ts
```

### Arquitectura de Testing

**Patrón AAA (Arrange-Act-Assert)**
- **Arrange**: Preparar datos y mocks
- **Act**: Ejecutar la acción a probar
- **Assert**: Verificar resultados

**Factory Pattern para Mock Data**
- Funciones reutilizables para crear datos de prueba
- Sobrescritura fácil con `Partial<T>`

**Custom Render con Providers**
- Wrapper automático de contextos necesarios
- Configuración consistente entre tests

---

## ⚙️ Configuración

### Jest Config (`jest.config.js`)

```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    'context/**/*.{js,jsx,ts,tsx}',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
}

module.exports = createJestConfig(customJestConfig)
```

### Setup Global (`jest.setup.js`)

```javascript
import '@testing-library/jest-dom'

// Mocks globales
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  })),
})

// Mock de localStorage
global.localStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}

// Mock de next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => '/',
}))
```

---

## 🧪 Tipos de Tests

### 1. Tests Unitarios

Prueban funciones y componentes de forma aislada.

**Ejemplo: Testing de función pura**

```typescript
// __tests__/unit/personalRecords.test.ts
import { calculatePersonalRecords } from '@/lib/personalRecords'
import { createMockSession } from '@/__tests__/helpers/mockData'

describe('calculatePersonalRecords', () => {
  it('should return empty array for no sessions', () => {
    const result = calculatePersonalRecords([])
    expect(result).toEqual([])
  })

  it('should calculate PR correctly', () => {
    const session = createMockSession()
    const result = calculatePersonalRecords([session])
    
    expect(result[0]).toMatchObject({
      exerciseName: 'Bench Press',
      maxWeight: 80,
      reps: 10,
    })
  })
})
```

**Ejemplo: Testing de componente**

```typescript
// __tests__/unit/SessionFilters.test.tsx
import { render, screen } from '@/__tests__/helpers/testUtils'
import { SessionFilters } from '@/components/SessionFilters'
import userEvent from '@testing-library/user-event'

describe('SessionFilters', () => {
  it('should filter by search term', async () => {
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
    await user.type(searchInput, 'Bench Press')

    expect(mockOnChange).toHaveBeenCalled()
  })
})
```

### 2. Tests de Integración

Prueban la interacción entre múltiples componentes o módulos.

**Ejemplo: Testing de página completa**

```typescript
// __tests__/integration/sessionsPage.test.tsx
import SessionsPage from '@/app/sessions/page'

jest.mock('@/context/GymContext', () => ({
  useGym: () => ({
    sessions: mockSessions,
    routines: mockRoutines,
  }),
}))

describe('Sessions Page Integration', () => {
  it('should filter and display sessions', async () => {
    render(<SessionsPage />)

    const searchInput = screen.getByPlaceholderText(/buscar/i)
    await user.type(searchInput, 'Push Day')

    expect(screen.getByText('Push Day')).toBeInTheDocument()
    expect(screen.queryByText('Pull Day')).not.toBeInTheDocument()
  })
})
```

**Ejemplo: Testing de API Routes**

```typescript
// __tests__/integration/sessionsApi.test.ts
import { GET, POST } from '@/app/api/sessions/route'

describe('Sessions API', () => {
  it('should return 401 if not authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Not authenticated' },
    })

    const response = await GET()
    expect(response.status).toBe(401)
  })

  it('should create session successfully', async () => {
    const request = new NextRequest('http://localhost/api/sessions', {
      method: 'POST',
      body: JSON.stringify({ routineId: 'routine-1', exercises: [...] }),
    })

    const response = await POST(request)
    expect(response.status).toBe(201)
  })
})
```

---

## 🚀 Ejecutar Tests

### Comandos Disponibles

```bash
# Modo watch (desarrollo)
npm test

# Ejecutar todos los tests una vez
npm run test:ci

# Solo tests unitarios
npm run test:unit

# Solo tests de integración
npm run test:integration

# Generar reporte de cobertura
npm run test:coverage
```

### Ejecutar Tests Específicos

```bash
# Un archivo específico
npm test personalRecords.test.ts

# Por patrón
npm test -- --testNamePattern="filter"

# Un test específico
npm test -- -t "should calculate PR correctly"
```

### Modo Watch

```bash
npm test

# Opciones interactivas:
# p - Filtrar por nombre de archivo
# t - Filtrar por nombre de test
# a - Ejecutar todos los tests
# q - Salir
```

---

## 📚 Patrones y Mejores Prácticas

### 1. Factory Pattern para Mock Data

```typescript
// __tests__/helpers/mockData.ts
export const createMockSession = (overrides?: Partial<WorkoutSession>) => ({
  id: 'session-1',
  routineId: 'routine-1',
  date: new Date(),
  exercises: [...],
  ...overrides, // Permite sobrescribir cualquier campo
})

// Uso
const session = createMockSession({ id: 'custom-id', notes: 'Test' })
```

### 2. Custom Render Helper

```typescript
// __tests__/helpers/testUtils.tsx
const AllProviders = ({ children }) => {
  return (
    <GymContextProvider>
      <AuthContextProvider>
        {children}
      </AuthContextProvider>
    </GymContextProvider>
  )
}

export const customRender = (ui, options) => 
  render(ui, { wrapper: AllProviders, ...options })
```

### 3. User Interaction Testing

```typescript
import userEvent from '@testing-library/user-event'

it('should handle user input', async () => {
  const user = userEvent.setup()
  render(<Component />)

  const button = screen.getByRole('button', { name: /submit/i })
  await user.click(button)

  expect(mockFn).toHaveBeenCalled()
})
```

### 4. Async Testing

```typescript
import { waitFor } from '@testing-library/react'

it('should load data asynchronously', async () => {
  render(<Component />)

  await waitFor(() => {
    expect(screen.getByText('Loaded')).toBeInTheDocument()
  })
})
```

### 5. Mocking Modules

```typescript
// Mock de módulo completo
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(() => mockSupabase),
}))

// Mock parcial
jest.mock('@/context/GymContext', () => ({
  ...jest.requireActual('@/context/GymContext'),
  useGym: () => mockGymContext,
}))
```

### 6. Testing de Errores

```typescript
it('should handle errors gracefully', async () => {
  mockApi.mockRejectedValue(new Error('Network error'))

  render(<Component />)

  await waitFor(() => {
    expect(screen.getByText(/error/i)).toBeInTheDocument()
  })
})
```

---

## 📊 Cobertura de Código

### Umbrales de Cobertura

| Métrica      | Objetivo | Mínimo |
|--------------|----------|--------|
| Statements   | 80%      | 70%    |
| Branches     | 80%      | 70%    |
| Functions    | 80%      | 70%    |
| Lines        | 80%      | 70%    |

### Ver Reporte de Cobertura

```bash
npm run test:coverage

# Abrir reporte HTML
open coverage/lcov-report/index.html
```

### Interpretar el Reporte

- **Verde**: >80% cobertura
- **Amarillo**: 70-80% cobertura
- **Rojo**: <70% cobertura

### Excluir de Cobertura

```javascript
// jest.config.js
collectCoverageFrom: [
  'app/**/*.{js,jsx,ts,tsx}',
  '!**/*.d.ts',
  '!**/node_modules/**',
  '!**/.next/**',
],
```

---

## 🎯 Qué Testear

### ✅ Prioridad Alta

1. **Funciones de negocio críticas**
   - Cálculo de récords personales
   - Comparación de sesiones
   - Filtrado de datos

2. **Componentes con lógica compleja**
   - Filtros con múltiples criterios
   - Comparadores con cálculos

3. **API Routes**
   - Validación de entrada
   - Manejo de errores
   - Autenticación

4. **Flujos de usuario importantes**
   - Crear rutina
   - Completar workout
   - Ver progreso

### ⚠️ Prioridad Media

1. **Componentes de UI con estado**
   - Modales
   - Formularios
   - Dropdowns

2. **Helpers y utilidades**
   - Formateo de fechas
   - Transformaciones de datos

### ❌ No Testear

1. **Componentes puramente visuales**
   - Botones simples sin lógica
   - Cards estáticas

2. **Código de terceros**
   - Librerías externas
   - SDKs

3. **Configuración**
   - Next.config
   - Tailwind config

---

## 🐛 Debugging Tests

### Console.log en Tests

```typescript
it('should debug values', () => {
  const result = calculateSomething()
  console.log('Result:', result) // Visible en terminal
  expect(result).toBe(expected)
})
```

### Screen Debug

```typescript
import { screen } from '@testing-library/react'

it('should show DOM', () => {
  render(<Component />)
  screen.debug() // Imprime el DOM completo
  screen.debug(screen.getByRole('button')) // Imprime solo ese elemento
})
```

### Query Helper

```typescript
// Encontrar por diferentes criterios
screen.getByRole('button', { name: /submit/i })
screen.getByText(/hello world/i)
screen.getByTestId('custom-element')
screen.getByLabelText(/email/i)

// Query vs Get vs Find
screen.getByText() // Throw error si no existe
screen.queryByText() // Retorna null si no existe
screen.findByText() // Espera hasta encontrar (async)
```

---

## 📈 Mejores Prácticas

### DO ✅

- Usar `data-testid` solo cuando no hay mejor opción
- Preferir consultas por rol/texto accesible
- Mantener tests independientes
- Limpiar mocks entre tests
- Usar factories para datos de prueba
- Testear comportamiento, no implementación

### DON'T ❌

- Testear detalles de implementación
- Hacer tests dependientes entre sí
- Usar `setTimeout` para esperas
- Testear con selectores CSS frágiles
- Duplicar lógica de producción en tests

---

## 🔄 CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - run: npm ci
      - run: npm run test:ci
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

---

## 📚 Recursos Adicionales

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Next.js Testing](https://nextjs.org/docs/testing)

---

**Última actualización**: 30 de noviembre de 2025
