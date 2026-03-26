# 🧪 SETUP TESTS - SEMANA 3

**Objetivo**: Configurar y ejecutar los tests creados

---

## 📦 INSTALACIÓN DE DEPENDENCIAS

### 1. Verificar que vitest está instalado

```bash
npm list vitest
```

Si no está instalado:

```bash
npm install -D vitest @testing-library/react @testing-library/dom
```

### 2. Verificar que @testing-library/react está instalado

```bash
npm list @testing-library/react
```

Si no está instalado:

```bash
npm install -D @testing-library/react
```

### 3. Verificar que jsdom está instalado (para DOM testing)

```bash
npm list jsdom
```

Si no está instalado:

```bash
npm install -D jsdom
```

---

## ⚙️ CONFIGURACIÓN DE VITEST

### 1. Crear archivo de configuración (si no existe)

**Archivo**: `vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: [],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '.next/',
        '**/*.test.ts',
        '**/*.test.tsx'
      ]
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    }
  }
});
```

### 2. Actualizar package.json

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:run": "vitest --run",
    "test:coverage": "vitest --coverage"
  }
}
```

---

## 🚀 EJECUTAR TESTS

### 1. Ejecutar todos los tests

```bash
npm run test:run
```

### 2. Ejecutar tests en modo watch

```bash
npm run test
```

### 3. Ejecutar tests con UI

```bash
npm run test:ui
```

### 4. Ejecutar tests con cobertura

```bash
npm run test:coverage
```

### 5. Ejecutar tests específicos

```bash
# Tests de ExerciseCard
npm run test:run -- ExerciseCard.test.tsx

# Tests de SetControls
npm run test:run -- SetControls.test.tsx

# Tests de SeriesTable
npm run test:run -- SeriesTable.test.tsx

# Tests de un directorio
npm run test:run -- app/workout/[id]/components/__tests__
```

---

## 📊 RESULTADOS ESPERADOS

### Cuando ejecutes los tests

```
✓ ExerciseCard.test.tsx (18 tests)
  ✓ debe renderizar el nombre del ejercicio
  ✓ debe mostrar la serie actual
  ✓ debe mostrar el equipamiento
  ... (15 más)

✓ SetControls.test.tsx (20 tests)
  ✓ debe renderizar el número de serie actual
  ✓ debe deshabilitar botón anterior en primera serie
  ... (18 más)

✓ SeriesTable.test.tsx (22 tests)
  ✓ debe renderizar el título de la tabla
  ✓ debe mostrar contador de series completadas
  ... (20 más)

Test Files  3 passed (3)
     Tests  60 passed (60)
  Start at  XX:XX:XX
  Duration  XXXms
```

---

## 🔍 VERIFICAR COBERTURA

### Ejecutar con cobertura

```bash
npm run test:coverage
```

### Resultado esperado

```
File                          | % Stmts | % Branch | % Funcs | % Lines |
------|---------|----------|---------|---------|
All files                     |   85.2 |    82.1 |    88.5 |    85.2 |
 app/workout/[id]/components |   85.2 |    82.1 |    88.5 |    85.2 |
  ExerciseCard.tsx            |   90.0 |    85.0 |    92.0 |    90.0 |
  SetControls.tsx             |   88.0 |    83.0 |    90.0 |    88.0 |
  SeriesTable.tsx             |   78.0 |    80.0 |    85.0 |    78.0 |
```

---

## 🐛 TROUBLESHOOTING

### Error: Cannot find module 'vitest'

**Solución**:
```bash
npm install -D vitest
```

### Error: Cannot find module '@testing-library/react'

**Solución**:
```bash
npm install -D @testing-library/react
```

### Error: Cannot find module 'jsdom'

**Solución**:
```bash
npm install -D jsdom
```

### Error: Cannot find module '@vitejs/plugin-react'

**Solución**:
```bash
npm install -D @vitejs/plugin-react
```

### Tests no se ejecutan

**Solución**:
1. Verificar que vitest.config.ts existe
2. Verificar que package.json tiene scripts de test
3. Ejecutar `npm install` para instalar dependencias

### Tests fallan con errores de módulos

**Solución**:
1. Verificar que los mocks están correctos
2. Verificar que los imports son correctos
3. Verificar que las rutas de alias (@) están configuradas

---

## 📝 PRÓXIMOS PASOS

### Miércoles
1. Crear tests de integración
2. Ejecutar todos los tests
3. Verificar cobertura

### Jueves
1. Documentar resultados
2. Crear guía de testing

### Viernes
1. Crear PR con tests
2. Documentar PR

---

## 💡 NOTAS

1. **Vitest**: Framework de testing rápido y moderno
2. **@testing-library/react**: Librería para testear componentes React
3. **jsdom**: Implementación de DOM para Node.js
4. **Cobertura**: Apuntar a 85%+ en rutas críticas

---

**Generado por**: Kiro  
**Fecha**: 27 de febrero de 2026

