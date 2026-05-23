'use client';

import { useSyncExternalStore } from 'react';

interface ClientOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const emptySubscribe = () => () => {};

/**
 * Componente que solo renderiza en el cliente para evitar errores de hidratación
 * con contenido dinámico como fechas, random, etc.
 */
export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  if (!isClient) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
