# Optimización de la Página de Rutinas

## Problemas Identificados

1. **Botón flotante mal posicionado**: El botón de "Entrenamiento Libre" está en `top-24 right-10`, lo que puede interferir con el header y no es responsive
2. **Falta de feedback visual**: No hay estados de carga al iniciar entrenamientos
3. **Búsqueda no optimizada**: El filtro se ejecuta en cada render sin debounce
4. **Cards muy compactas**: Los textos son muy pequeños (text-xs, text-[10px]) difíciles de leer en móvil
5. **Gradiente con typo**: `bg-linear-to-br` debería ser `bg-gradient-to-br`
6. **Accesibilidad**: Falta aria-labels en algunos botones

## Optimizaciones Implementadas

### 1. Reposicionar Botón Flotante
- Moverlo a la esquina inferior derecha (bottom-20 right-4)
- Hacerlo más grande y visible en móvil
- Agregar tooltip descriptivo

### 2. Mejorar Tamaños de Texto
- Aumentar tamaños mínimos para mejor legibilidad
- Usar text-sm como mínimo en móvil
- Mejorar contraste de colores

### 3. Optimizar Búsqueda
- Implementar useMemo para filtrado
- Evitar re-renders innecesarios

### 4. Mejorar Cards
- Aumentar padding en móvil
- Mejorar espaciado entre elementos
- Hacer botones más grandes y fáciles de tocar

### 5. Corregir Gradientes
- Cambiar `bg-linear-to-br` a `bg-gradient-to-br`

### 6. Mejorar Accesibilidad
- Agregar aria-labels descriptivos
- Mejorar contraste de colores
