# 🔄 Cómo Ver los Cambios

## Los cambios SÍ están aplicados en el código

Verifiqué el archivo `app/workout/[id]/page.tsx` y los cambios están ahí:
- ✅ Checkbox para marcar/desmarcar series
- ✅ Input de reps editable
- ✅ Input de peso editable (ya estaba)
- ✅ Layout de 3 columnas (Reps | Peso | Descanso)

## Para ver los cambios en el navegador:

### Opción 1: Reiniciar el servidor (Recomendado)

1. **Detén el servidor actual** (si está corriendo)
   - En la terminal donde corre `npm run dev`
   - Presiona `Ctrl + C`

2. **Inicia el servidor nuevamente**
   ```bash
   npm run dev
   ```

3. **Recarga el navegador**
   - Presiona `Ctrl + Shift + R` (recarga forzada)
   - O `F5` varias veces

### Opción 2: Recarga forzada del navegador

Si el servidor ya está corriendo:

1. **En Chrome/Edge:**
   - `Ctrl + Shift + R` (Windows)
   - `Cmd + Shift + R` (Mac)

2. **O limpia caché:**
   - `Ctrl + Shift + Delete`
   - Selecciona "Caché"
   - Limpia y recarga

### Opción 3: Modo incógnito

1. Abre una ventana de incógnito
2. Ve a `http://localhost:3000`
3. Inicia un entrenamiento

## Qué deberías ver:

### Antes (sin cambios):
```
┌─────────────────────────┐
│ [1] Serie 1             │
│ Peso: [60kg]            │
│ Descanso: [90s]         │
└─────────────────────────┘
```

### Ahora (con cambios):
```
┌─────────────────────────┐
│ ☐ [1] Serie 1           │  ← Checkbox nuevo
│ Reps  Peso    Descanso  │  ← 3 columnas
│ [10]  [60kg]  [90s]     │  ← Input de reps nuevo
└─────────────────────────┘
```

## Si aún no ves los cambios:

### 1. Verifica que el archivo se guardó
```bash
# En la terminal, verifica la fecha de modificación
ls -la app/workout/[id]/page.tsx
```

### 2. Verifica que no hay errores de compilación
Mira la terminal donde corre `npm run dev` y busca errores.

### 3. Verifica la ruta
Asegúrate de estar en:
```
http://localhost:3000/workout/[id-de-rutina]
```

No en:
```
http://localhost:3000/routines
```

## Pasos para probar:

1. **Inicia el servidor**
   ```bash
   npm run dev
   ```

2. **Abre el navegador**
   ```
   http://localhost:3000
   ```

3. **Ve a Rutinas**
   - Click en "Rutinas" en el menú

4. **Selecciona una rutina**
   - Click en cualquier rutina

5. **Inicia entrenamiento**
   - Click en "Iniciar entrenamiento"

6. **Verifica los checkboxes**
   - Deberías ver un checkbox (☐) al lado de cada número de serie
   - Deberías ver 3 inputs: Reps | Peso | Descanso

## Troubleshooting

### Error: "Module not found"
```bash
npm install
npm run dev
```

### Error: "Port already in use"
```bash
# Mata el proceso en el puerto 3000
npx kill-port 3000
npm run dev
```

### Cambios no aparecen
```bash
# Limpia caché de Next.js
rm -rf .next
npm run dev
```

### En Windows (PowerShell)
```powershell
# Limpia caché
Remove-Item -Recurse -Force .next
npm run dev
```

---

**Resumen**: Los cambios están en el código. Solo necesitas reiniciar el servidor y recargar el navegador.
