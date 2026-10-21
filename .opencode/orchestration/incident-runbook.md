# Runbook de Incidentes y Rollback

Proceso operativo para cuando algo falla en producción. Complementa la teoría de resiliencia de `cicd-expert-pipelines` con el **procedimiento real de quién hace qué, en qué orden**, coordinado por `orchestrator`.

> Adaptado a `react-base-app`: SPA estática desplegada en Vercel, **sin backend propio, sin Docker ni Kubernetes**. El equipo son 3 agentes (`designer`, `frontend`, `qa-tester`) — ver `/context/project-context.md`. Donde el runbook genérico asignaría un incidente de infraestructura a un agente `backend`/devops, acá lo asume `frontend` (es quien conoce el build de Vite y el consumo de la API de GitHub), y el rollback es el de Vercel, no un redeploy de imagen.

## Principio rector

En un incidente activo, **primero se restaura el servicio, después se investiga la causa raíz**. No se debate arquitectura ni se busca el fix "correcto" mientras el sitio está caído o roto — se mitiga rápido (rollback de deploy, feature flag) y se investiga con el sistema ya estable.

## Severidades

| Nivel | Definición | Tiempo de respuesta esperado |
|---|---|---|
| **SEV1 — Crítico** | El sitio no carga, un token/secreto quedó expuesto en el repo, o hay una vulnerabilidad activa (ej. XSS) explotable | Inmediato, todo lo demás se pausa |
| **SEV2 — Alto** | Una funcionalidad core del portafolio está rota o inaccesible (ej. el CV no renderiza, la integración con GitHub falla para todos los usuarios) | Mismo día |
| **SEV3 — Medio** | Una funcionalidad secundaria o un widget puntual falla, hay workaround (ej. el calendario de contribuciones no carga pero el resto del sitio funciona) | Próximo ciclo de trabajo |
| **SEV4 — Bajo** | Cosmético o edge case de bajo impacto | Backlog normal |

## Procedimiento — SEV1/SEV2

### 1. Detección y triage
- Quien detecta el incidente (reporte del propio Pedro, `qa-tester` en un chequeo, o un error visible en producción) lo declara con severidad estimada.
- `orchestrator` confirma la severidad y activa el flujo de incidente — esto tiene prioridad sobre cualquier trabajo en curso de los agentes involucrados.

### 2. Mitigación inmediata (antes de investigar la causa)
Opciones en orden de preferencia según el caso:
- **Rollback al deployment anterior en Vercel** — cada deploy queda versionado automáticamente; promover el deployment previo a producción es inmediato y no requiere rebuild.
- **Feature flag / desactivar el widget o sección afectada** (ej. ocultar temporalmente un componente que depende de la API de GitHub si esta empieza a fallar) si el resto del sitio puede seguir operando sin él.
- Si el secreto/token expuesto es la causa (SEV1), **revocar y rotar el secreto de inmediato**, independientemente de si ya se hizo rollback — un rollback de código no invalida un secreto ya filtrado en el historial de git.
- Se documenta la acción tomada y la hora exacta — es el primer insumo del post-mortem.

### 3. Asignación al agente responsable
`orchestrator` identifica el dominio del incidente y asigna diagnóstico al agente dueño:
- Error de consumo/validación de la API de GitHub (datos) → `frontend`
- Error de renderizado/UI/performance de carga → `frontend`
- Falla de build o del pipeline de despliegue (Vercel/GitHub Actions) → `frontend` (con la skill `cicd-expert-pipelines`)
- Un estado de error/vacío que nunca se diseñó y ahora causa una pantalla rota → `designer` (gap de especificación) + `frontend` (implementación del fix)
- Confirmación de que el incidente está resuelto y no regresó → `qa-tester`

### 4. Verificación de la mitigación
- El agente responsable confirma que la mitigación restauró el sitio (verificación real en el deployment de producción, no solo "debería estar bien").
- `qa-tester` valida con los criterios de aceptación de la feature afectada, si existen en `/specs`.

### 5. Causa raíz y fix definitivo
- Una vez estable el sitio, el agente responsable investiga la causa raíz sin la presión del incidente activo.
- El fix definitivo sigue el flujo normal (handoff, Definition of Done) — no se salta testing por haber sido un incidente urgente.

### 6. Post-mortem (obligatorio en SEV1, recomendado en SEV2)
Documento breve, sin buscar culpables, con:
- **Qué pasó** (línea de tiempo con horas exactas)
- **Impacto** (qué quedó roto/expuesto, duración)
- **Causa raíz**
- **Qué mitigó y qué resolvió definitivamente**
- **Acción preventiva** — y quién es responsable de implementarla, con la tarea creada, no solo mencionada

El post-mortem se registra en `/context/project-context.md` (sección "Decisiones de arquitectura registradas") si la causa raíz revela algo a corregir de forma permanente (ej. "falta manejo de rate limit en el hook de GitHub" pasa a ser una restricción conocida para el equipo, no solo un fix puntual).

## Procedimiento — SEV3/SEV4

- Se documenta como una tarea normal (usar `/specs/feature-spec-template.md` si el fix es sustancial, o un reporte directo de `qa-tester` si es puntual).
- Sigue el flujo estándar del `orchestrator`, sin el tratamiento de urgencia de SEV1/SEV2.

## Checklist rápido durante un incidente activo

- [ ] ¿Se declaró la severidad y se activó el flujo de incidente?
- [ ] ¿Se mitigó (rollback de deploy / feature flag / rotación de secreto) antes de buscar la causa raíz?
- [ ] ¿Se documentó la hora exacta de cada acción tomada?
- [ ] ¿Se asignó al agente dueño del dominio (`frontend`, o `designer` si es un gap de especificación), no al primero disponible?
- [ ] ¿`qa-tester` validó que el sitio está realmente estable en producción, no solo "parece estar bien"?
- [ ] ¿Se programó el post-mortem si es SEV1/SEV2?
