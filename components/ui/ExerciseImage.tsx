'use client';

import Image from 'next/image';
import { useState } from 'react';

interface ExerciseImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
}

/**
 * Componente de imagen optimizada para ejercicios.
 * - Usa next/image con lazy loading por defecto.
 * - Placeholder blur para evitar CLS (Cumulative Layout Shift).
 * - Fallback silencioso si la imagen no carga.
 */
export function ExerciseImage({
  src,
  alt,
  width = 200,
  height = 200,
  className = '',
  priority = false,
}: ExerciseImageProps) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div
        className={`flex items-center justify-center bg-zinc-200 dark:bg-zinc-800 rounded-lg ${className}`}
        style={{ width, height }}
        aria-label={`Imagen no disponible: ${alt}`}
      >
        <span className="text-zinc-400 dark:text-zinc-500 text-xs">Sin imagen</span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={`rounded-lg ${className}`}
      loading={priority ? 'eager' : 'lazy'}
      placeholder="blur"
      blurDataURL="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
      onError={() => setError(true)}
      priority={priority}
    />
  );
}
