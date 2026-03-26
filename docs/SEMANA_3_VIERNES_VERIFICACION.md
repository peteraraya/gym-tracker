# 🔍 SEMANA 3 - VIERNES: VERIFICACIÓN Y BUILD

**Fecha**: 3 de marzo de 2026  
**Duración**: 2.5 horas  
**Objetivo**: Ejecutar tests completos y verificar build

---

## 1️⃣ EJECUTAR TESTS COMPLETOS

### Paso 1: Instalar Dependencias

```bash
npm install -D vitest @testing-library/react @testing-library/dom jsdom @vitejs/plugin-react
```

### Paso 2: Crear vitest.config.ts

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

### Paso 3: Actualizar package.json

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

### Paso 4: Ejecutar Tests

```bash
# Todos los tests
npm run test:run

# Con cobertura
npm run test:coverage

# Con UI
npm run test:ui
```

### Resultados Esperados

```
✓ ExerciseCard.test.tsx (18 tests)
✓ SetControls.test.tsx (20 tests)
✓ SeriesTable.test.tsx (22 tests)
✓ page.integration.test.tsx (20 tests)
✓ useWorkoutState.test.ts (30 tests)

Test Files  5 passed (5)
     Tests  110 passed (110)
  Start at  XX:XX:XX
  Duration  XXXms

Coverage:
  Statements   : 85.2%
  Branches     : 82.1%
  Functions    : 88.5%
  Lines        : 85.2%
```

---

## 2️⃣ VERIFICAR BUILD

### Paso 1: Verificar TypeScript

```bash
# Verificar errores de tipo
npx tsc --noEmit
```

**Resultado esperado**: Sin errores

### Paso 2: Ejecutar Build

```bash
# Build de producción
npm run build
```

**Resultado esperado**:
```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages (X/X)
✓ Finalizing page optimization
```

### Paso 3: Verificar Build Size

```bash
# Ver tamaño de chunks
ls -lh .next/static/chunks/

# Analizar bundle (si está disponible)
npm run analyze
```

**Objetivo**: Chunks < 200KB

### Paso 4: Verificar Errores

```bash
# Buscar errores en build
npm run build 2>&1 | grep -i error
```

**Resultado esperado**: Sin errores

### Paso 5: Verificar Warnings

```bash
# Buscar warnings
npm run build 2>&1 | grep -i warning
```

**Resultado esperado**: Mínimos warnings

---

## ✅ CHECKLIST DE VERIFICACIÓN

### Tests
- [ ] Instalar dependencias de test
- [ ] Crear vitest.config.ts
- [ ] Actualizar package.json
- [ ] Ejecutar `npm run test:run`
- [ ] Verificar 110 tests pasan
- [ ] Verificar cobertura 85%+
- [ ] Ejecutar `npm run test:coverage`
- [ ] Revisar reporte de cobertura

### Build
- [ ] Ejecutar `npx tsc --noEmit`
- [ ] Verificar sin errores de tipo
- [ ] Ejecutar `npm run build`
- [ ] Verificar build exitoso
- [ ] Verificar tamaño de chunks
- [ ] Verificar sin errores
- [ ] Verificar mínimos warnings
- [ ] Revisar `.next/static/chunks/`

---

## 📊 ESTADÍSTICAS ESPERADAS

### Tests
| Métrica | Valor |
|---------|-------|
| Tests Totales | 110 |
| Tests Pasados | 110 |
| Tests Fallidos | 0 |
| Cobertura | 85%+ |
| Duración | < 30s |

### Build
| Métrica | Valor |
|---------|-------|
| Errores de Tipo | 0 |
| Errores de Build | 0 |
| Warnings | < 5 |
| Tamaño Total | < 2MB |
| Chunks | < 200KB |

---

## 🐛 TROUBLESHOOTING

### Tests Fallan

**Problema**: Tests no pasan

**Solución**:
1. Verificar que vitest.config.ts existe
2. Verificar que mocks están correctos
3. Ejecutar `npm install` nuevamente
4. Revisar errores específicos

### Build Falla

**Problema**: Build no compila

**Solución**:
1. Ejecutar `npx tsc --noEmit` para ver errores de tipo
2. Revisar errores en consola
3. Verificar imports correctos
4. Verificar que no hay archivos rotos

### Errores de Tipo

**Problema**: TypeScript reporta errores

**Solución**:
1. Revisar tipos en archivos
2. Verificar imports de tipos
3. Ejecutar `npx tsc --noEmit` para detalles
4. Corregir errores reportados

### Warnings en Build

**Problema**: Demasiados warnings

**Solución**:
1. Revisar warnings específicos
2. Eliminar imports no usados
3. Verificar dependencias
4. Actualizar dependencias si es necesario

---

## 📈 RESULTADOS ESPERADOS

### Tests Completos
```
✓ 110 tests pasan
✓ 0 tests fallan
✓ 85%+ cobertura
✓ < 30 segundos
```

### Build Exitoso
```
✓ 0 errores de tipo
✓ 0 errores de build
✓ < 5 warnings
✓ Chunks < 200KB
```

---

## 🎯 PRÓXIMOS PASOS

### Si Todo Está Bien
1. Crear PR
2. Documentar PR
3. Completar Semana 3

### Si Hay Problemas
1. Revisar errores
2. Corregir problemas
3. Ejecutar tests nuevamente
4. Verificar build nuevamente

---

## 📝 NOTAS

1. **Tests**: Deben pasar todos antes de crear PR
2. **Build**: Debe compilar sin errores
3. **Cobertura**: Apuntar a 85%+
4. **Performance**: Chunks < 200KB

---

**Generado por**: Kiro  
**Fecha**: 3 de marzo de 2026

