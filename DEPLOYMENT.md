Despliegue continuo (CI/CD) — Resumen

Objetivo: desplegar automáticamente a producción cuando se hace `push` a la rama `main`.

Qué añadí
- Workflow: `.github/workflows/deploy.yml` — construye con `npm run build` y ejecuta `npx vercel --prod`.

Secrets / Variables de entorno necesarias (añadir en GitHub repo → Settings → Secrets & variables → Actions)
- `VERCEL_TOKEN` — token de despliegue (Vercel Personal Token).
- `NEXT_PUBLIC_ENABLE_DATABASE` — `true` / `false` según corresponda en producción.
- `NEXT_PUBLIC_SUPABASE_URL` — URL de Supabase de producción.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — anon/public key de Supabase de producción.

Notas rápidas
- Puedes usar la integración de Vercel/GitHub en vez de esta Action si prefieres que Vercel gestione los despliegues directamente.
- Para builds que dependan de variables server-side añade también los valores en el dashboard de Vercel.

Si quieres que añada tests, linting o un paso de preview deploy para ramas feature, lo configuro.
