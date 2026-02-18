# Mejoras Pendientes - Gym Tracker 2026

## 🔴 Prioridad Alta (Críticas)

### 1. Ejecutar Migración de active_workouts
**Estado**: Pendiente  
**Impacto**: Alto - Los entrenamientos se pierden al recargar  
**Esfuerzo**: 5 minutos  

**Acción**:
- Ejecutar `supabase/migrations/2026-02-17_active_workouts_complete.sql` en Supabase Dashboard
- Ver instrucciones en `docs/ACTIVE_WORKOUTS_TABLE_SETUP.md`

**Beneficio**:
- Sincronización entre dispositivos
- Persistencia confiable de entrenamientos activos
- Backup automático en localStorage

---

### 2. Remover Logs de Debugging
**Estado**: Pendiente  
**Impacto**: Medio - Contaminan la consola en producción  
**Esfuerzo**: 30 minutos  

**Archivos a limpiar**:
- `context/WorkoutContext.tsx` - Remover todos los `console.log`
- `lib/storage/storage.ts` - Remover logs de debugging
- `lib/storage/localStorage.ts` - Remover logs de debugging
- `lib/supabase/service.ts` - Convertir `console.log` a `console.debug`

**Alternativa**: Usar una librería de logging con niveles (debug, info, warn, error)

---

### 3. Generar VAPID Keys de Producción
**Estado**: Usando keys de desarrollo  
**Impacto**: Alto - Seguridad de notificaciones push  
**Esfuerzo**: 5 minutos  

**Acción**:
```bash
npx web-push generate-vapid-keys
```

Actualizar en:
- `.env.production` (Vercel)
- Variables de entorno en Vercel Dashboard

---

### 4. Crear Tabla active_workouts en Producción
**Estado**: Solo existe en desarrollo  
**Impacto**: Alto - Funcionalidad crítica  
**Esfuerzo**: 5 minutos  

**Acción**:
- Ejecutar migración en base de datos de producción
- Verificar políticas RLS

---

## 🟡 Prioridad Media (Importantes)

### 5. Implementar Sistema de Notificaciones Inteligentes
**Estado**: Infraestructura lista, falta lógica  
**Impacto**: Alto - Engagement del usuario  
**Esfuerzo**: 2-3 horas  

**Características**:
- Recordatorio de entrenamiento (basado en horarios del usuario)
- Notificación al terminar descanso (ya implementado en Timer)
- Resumen semanal de progreso
- Celebración de logros desbloqueados
- Recordatorio si no entrena en X días

**Archivos a crear**:
- `lib/notifications/scheduler.ts` - Lógica de programación
- `lib/notifications/templates.ts` - Templates de notificaciones
- `app/api/notifications/schedule/route.ts` - API para programar

---

### 6. Mejorar AI Assistant con API Real
**Estado**: Sistema basado en reglas  
**Impacto**: Alto - Experiencia del usuario  
**Esfuerzo**: 4-6 horas  

**Opciones**:
1. **OpenAI GPT-4** (Recomendado)
   - Mejor calidad de respuestas
   - Costo: ~$0.03 por 1K tokens
   
2. **Anthropic Claude**
   - Excelente para conversaciones largas
   - Costo similar a OpenAI

3. **Ollama (Local)**
   - Gratis
   - Requiere servidor propio
   - Menor calidad

**Implementación**:
- Ya existe `lib/ai/assistant.ts` con infraestructura
- Solo falta agregar API key y activar
- Agregar contexto del usuario (rutinas, progreso, objetivos)

---

### 7. Agregar Imágenes/Videos de Ejercicios
**Estado**: Solo iconos  
**Impacto**: Alto - Educación del usuario  
**Esfuerzo**: 8-10 horas (búsqueda y optimización)  

**Opciones**:
1. **API de ejercicios** (ExerciseDB, Wger)
2. **Videos de YouTube** (embed)
3. **GIFs animados** (más ligeros)
4. **Ilustraciones propias** (mejor UX)

**Implementación**:
- Agregar campo `imageUrl` y `videoUrl` a ejercicios
- Componente `ExerciseMedia` para mostrar
- Lazy loading de imágenes
- Optimización con Next.js Image

---

### 8. Sistema de Plantillas de Rutinas
**Estado**: Solo rutinas recomendadas estáticas  
**Impacto**: Medio - Facilita creación de rutinas  
**Esfuerzo**: 3-4 horas  

**Características**:
- Guardar rutina como plantilla
- Compartir plantillas entre usuarios
- Marketplace de plantillas (futuro)
- Categorías: Fuerza, Hipertrofia, Resistencia, etc.
- Filtros por nivel, duración, equipamiento

**Archivos a crear**:
- `app/templates/page.tsx` - Página de plantillas
- `components/TemplateCard.tsx` - Card de plantilla
- `lib/templates.ts` - Lógica de plantillas

---

### 9. Gráficos de Progreso Mejorados
**Estado**: Básicos  
**Impacto**: Medio - Motivación del usuario  
**Esfuerzo**: 4-5 horas  

**Mejoras**:
- Gráfico de volumen por grupo muscular (tiempo)
- Gráfico de 1RM estimado por ejercicio
- Comparación de períodos (este mes vs mes pasado)
- Predicción de progreso (ML básico)
- Exportar gráficos como imagen

**Librería**: Recharts (ya usada) o Chart.js

---

### 10. Sistema de Amigos/Social
**Estado**: No existe  
**Impacto**: Alto - Engagement y retención  
**Esfuerzo**: 8-12 horas  

**Características**:
- Agregar amigos por código/email
- Ver entrenamientos de amigos (opcional)
- Competencias/Desafíos
- Tabla de clasificación
- Compartir logros en redes sociales

**Consideraciones**:
- Privacidad del usuario
- Políticas de moderación
- Notificaciones sociales

---

## 🟢 Prioridad Baja (Nice to Have)

### 11. Modo Offline Completo
**Estado**: PWA básica  
**Impacto**: Medio - UX en áreas sin conexión  
**Esfuerzo**: 3-4 horas  

**Mejoras**:
- Indicador visual de modo offline
- Cola de sincronización visible
- Resolución de conflictos manual
- Exportar datos offline

---

### 12. Integración con Wearables
**Estado**: No existe  
**Impacto**: Medio - Datos más precisos  
**Esfuerzo**: 12-16 horas  

**Dispositivos**:
- Apple Watch (HealthKit)
- Fitbit
- Garmin
- Google Fit

**Datos a sincronizar**:
- Frecuencia cardíaca
- Calorías quemadas
- Pasos
- Sueño

---

### 13. Sistema de Nutrición
**Estado**: Solo calculadora de calorías  
**Impacto**: Alto - Complementa entrenamiento  
**Esfuerzo**: 20-30 horas  

**Características**:
- Registro de comidas
- Contador de macros
- Recetas saludables
- Plan de alimentación
- Integración con MyFitnessPal

---

### 14. Análisis de Forma con IA
**Estado**: No existe  
**Impacto**: Alto - Prevención de lesiones  
**Esfuerzo**: 40-60 horas  

**Tecnología**:
- TensorFlow.js
- PoseNet / MoveNet
- Análisis de video en tiempo real
- Feedback de forma

**Desafíos**:
- Requiere cámara
- Procesamiento intensivo
- Precisión del modelo

---

### 15. Gamificación Avanzada
**Estado**: Logros básicos  
**Impacto**: Medio - Motivación  
**Esfuerzo**: 6-8 horas  

**Características**:
- Sistema de niveles (XP)
- Misiones diarias/semanales
- Recompensas virtuales
- Racha de entrenamientos
- Badges especiales
- Eventos temporales

---

### 16. Exportar/Importar Datos
**Estado**: Básico (JSON)  
**Impacto**: Medio - Portabilidad  
**Esfuerzo**: 2-3 horas  

**Formatos**:
- CSV (Excel)
- PDF (Reportes)
- JSON (Backup completo)
- Integración con Google Sheets

---

### 17. Modo Entrenador
**Estado**: No existe  
**Impacto**: Alto - Monetización  
**Esfuerzo**: 30-40 horas  

**Características**:
- Crear planes para clientes
- Asignar rutinas
- Ver progreso de clientes
- Chat con clientes
- Cobros/Suscripciones

---

### 18. Testing Automatizado
**Estado**: Infraestructura básica  
**Impacto**: Alto - Calidad del código  
**Esfuerzo**: 10-15 horas  

**Tipos de tests**:
- Unit tests (funciones puras)
- Integration tests (componentes)
- E2E tests (flujos completos)
- Performance tests

**Cobertura objetivo**: 70%+

---

### 19. Internacionalización Completa
**Estado**: Español por defecto, infraestructura i18n  
**Impacto**: Alto - Alcance global  
**Esfuerzo**: 8-12 horas  

**Idiomas prioritarios**:
1. Inglés (mercado más grande)
2. Portugués (Brasil)
3. Francés
4. Alemán

**Consideraciones**:
- Traducción de ejercicios
- Formatos de fecha/hora
- Unidades (kg/lb)

---

### 20. Optimización de Performance
**Estado**: Bueno, puede mejorar  
**Impacto**: Medio - UX  
**Esfuerzo**: 4-6 horas  

**Mejoras**:
- Code splitting más agresivo
- Lazy loading de imágenes
- Virtualización de listas largas
- Memoización de cálculos pesados
- Service Worker más inteligente
- Reducir bundle size

**Objetivo**: Lighthouse score 95+ en todas las categorías

---

## 🔧 Mejoras Técnicas

### 21. Migrar a TypeScript Estricto
**Estado**: TypeScript con `any` en algunos lugares  
**Impacto**: Medio - Calidad del código  
**Esfuerzo**: 6-8 horas  

**Acciones**:
- Habilitar `strict: true` en tsconfig.json
- Eliminar todos los `any`
- Agregar tipos faltantes
- Usar `unknown` en lugar de `any`

---

### 22. Implementar Error Boundary
**Estado**: No existe  
**Impacto**: Alto - UX en errores  
**Esfuerzo**: 2 horas  

**Características**:
- Capturar errores de React
- Mostrar UI de error amigable
- Logging de errores (Sentry)
- Botón de "Reportar error"

---

### 23. Agregar Monitoring y Analytics
**Estado**: No existe  
**Impacto**: Alto - Toma de decisiones  
**Esfuerzo**: 3-4 horas  

**Herramientas**:
- **Vercel Analytics** (gratis, básico)
- **Google Analytics 4** (gratis, completo)
- **Mixpanel** (eventos personalizados)
- **Sentry** (error tracking)

**Métricas clave**:
- Usuarios activos diarios/mensuales
- Retención (D1, D7, D30)
- Entrenamientos completados
- Tiempo en app
- Tasa de conversión (registro → primer entrenamiento)

---

### 24. CI/CD Pipeline
**Estado**: Deploy manual  
**Impacto**: Medio - Velocidad de desarrollo  
**Esfuerzo**: 3-4 horas  

**Implementar**:
- GitHub Actions
- Tests automáticos en PR
- Deploy automático a staging
- Deploy a producción con aprobación
- Rollback automático si falla

---

### 25. Documentación de API
**Estado**: No existe  
**Impacto**: Bajo - Solo si hay API pública  
**Esfuerzo**: 4-6 horas  

**Herramientas**:
- Swagger/OpenAPI
- Postman Collections
- Ejemplos de uso

---

## 📱 Mejoras Mobile

### 26. App Nativa (React Native)
**Estado**: Solo PWA  
**Impacto**: Alto - Mejor UX mobile  
**Esfuerzo**: 60-80 horas  

**Beneficios**:
- Mejor performance
- Acceso a APIs nativas
- Publicación en App Store/Play Store
- Notificaciones más confiables

**Alternativa**: Capacitor (ya configurado)

---

### 27. Gestos Táctiles
**Estado**: Básico  
**Impacto**: Medio - UX mobile  
**Esfuerzo**: 3-4 horas  

**Implementar**:
- Swipe para eliminar
- Pull to refresh
- Swipe entre ejercicios
- Long press para opciones

---

## 🎨 Mejoras de UI/UX

### 28. Animaciones y Transiciones
**Estado**: Básicas  
**Impacto**: Medio - Polish  
**Esfuerzo**: 4-6 horas  

**Mejoras**:
- Transiciones de página suaves
- Animaciones de carga
- Micro-interacciones
- Skeleton screens
- Confetti en logros

**Librería**: Framer Motion

---

### 29. Temas Personalizables
**Estado**: Light/Dark/Auto  
**Impacto**: Bajo - Personalización  
**Esfuerzo**: 3-4 horas  

**Opciones**:
- Colores de acento personalizables
- Temas predefinidos (Azul, Verde, Rojo, etc.)
- Modo alto contraste
- Tamaño de fuente ajustable

---

### 30. Accesibilidad (A11y)
**Estado**: Básica  
**Impacto**: Alto - Inclusión  
**Esfuerzo**: 6-8 horas  

**Mejoras**:
- ARIA labels completos
- Navegación por teclado
- Screen reader friendly
- Contraste de colores WCAG AAA
- Focus visible
- Skip links

---

## 💰 Monetización (Futuro)

### 31. Plan Premium
**Estado**: No existe  
**Impacto**: Alto - Sostenibilidad  
**Esfuerzo**: 20-30 horas  

**Características Premium**:
- Rutinas ilimitadas (free: 5)
- Análisis avanzado de progreso
- Exportar datos
- Sin anuncios
- Soporte prioritario
- Plantillas premium
- AI Assistant ilimitado

**Precio sugerido**: $4.99/mes o $49.99/año

---

### 32. Integración de Pagos
**Estado**: No existe  
**Impacto**: Alto - Monetización  
**Esfuerzo**: 8-12 horas  

**Opciones**:
- Stripe (recomendado)
- PayPal
- Mercado Pago (LATAM)

---

## 📊 Resumen por Prioridad

### Implementar Primero (1-2 semanas)
1. ✅ Ejecutar migración active_workouts
2. ✅ Remover logs de debugging
3. ✅ Generar VAPID keys de producción
4. ✅ Notificaciones inteligentes básicas
5. ✅ Error boundary

### Implementar Después (1 mes)
6. AI Assistant con API real
7. Imágenes de ejercicios
8. Sistema de plantillas
9. Gráficos mejorados
10. Testing automatizado

### Implementar Eventualmente (3-6 meses)
11. Sistema social
12. Integración wearables
13. Sistema de nutrición
14. Modo entrenador
15. Plan premium

---

## 🎯 Roadmap Sugerido

### Q1 2026 (Enero - Marzo)
- ✅ Completar PWA
- ✅ Notificaciones push
- ✅ AI Assistant básico
- ✅ Persistencia confiable
- ⏳ Imágenes de ejercicios
- ⏳ Testing automatizado

### Q2 2026 (Abril - Junio)
- Sistema de plantillas
- Gráficos avanzados
- Notificaciones inteligentes
- Internacionalización (Inglés)
- Analytics y monitoring

### Q3 2026 (Julio - Septiembre)
- Sistema social básico
- AI Assistant avanzado
- Gamificación mejorada
- App nativa (Capacitor)
- Plan premium

### Q4 2026 (Octubre - Diciembre)
- Sistema de nutrición
- Integración wearables
- Modo entrenador
- Marketplace de plantillas
- Expansión internacional

---

**Última actualización**: Febrero 2026  
**Mantenedor**: Equipo Gym Tracker
