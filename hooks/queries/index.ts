/**
 * hooks/queries — Hooks de React Query por dominio
 *
 * Cada hook encapsula queries + mutations de un recurso,
 * con invalidación de caché y actualización optimista.
 *
 * Uso recomendado: preferir estos hooks sobre llamadas directas
 * a `storageService` en páginas y componentes.
 */

export { useProfile } from "./useProfile";
export { useRoutines } from "./useRoutines";
export { useSessions } from "./useSessions";
