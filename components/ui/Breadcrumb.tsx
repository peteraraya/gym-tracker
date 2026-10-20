'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

/**
 * Componente de breadcrumb para navegación en rutas anidadas.
 * Mejora la orientación del usuario y el acceso rápido a niveles superiores.
 *
 * Ejemplo:
 *   <Breadcrumb items={[
 *     { label: 'Inicio', href: '/' },
 *     { label: 'Rutinas', href: '/routines' },
 *     { label: 'Press de Banca' },
 *   ]} />
 */
export function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  return (
    <nav
      aria-label="Ruta de navegación"
      className={`flex flex-wrap items-center gap-1 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 ${className}`}
    >
      <ol className="flex flex-wrap items-center gap-1" role="list">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} className="flex items-center gap-1">
              {index > 0 && (
                <ChevronRight
                  className="w-3 h-3 text-zinc-400 dark:text-zinc-500 shrink-0"
                  aria-hidden="true"
                />
              )}
              {isLast ? (
                <span
                  className="font-medium text-zinc-900 dark:text-zinc-100"
                  aria-current="page"
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href || '#'}
                  className="text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 rounded px-1"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
