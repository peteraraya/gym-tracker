'use client';

import { ReactNode } from 'react';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';

type ActionButtonVariant = 'edit' | 'duplicate' | 'delete' | 'start' | 'view';

interface ActionButtonProps {
  variant: ActionButtonVariant;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  children?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  icon?: ReactNode;
}

const variantStyles: Record<ActionButtonVariant, string> = {
  edit: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 border border-blue-200 dark:border-blue-800',
  duplicate: 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/30 border border-purple-200 dark:border-purple-800',
  delete: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30 border border-red-200 dark:border-red-800',
  start: 'bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl',
  view: 'bg-slate-50 dark:bg-slate-900/20 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900/30 border border-slate-200 dark:border-slate-800'
};

const defaultLabels: Record<ActionButtonVariant, string> = {
  edit: 'Editar',
  duplicate: 'Duplicar',
  delete: 'Eliminar',
  start: 'Iniciar',
  view: 'Ver'
};

export function ActionButton({
  variant,
  onClick,
  disabled = false,
  loading = false,
  children,
  size = 'sm',
  fullWidth = false,
  icon
}: ActionButtonProps) {
  const label = children || defaultLabels[variant];

  return (
    <Button
      variant="ghost"
      size={size}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${fullWidth ? 'w-full' : 'flex-1'} text-xs ${variantStyles[variant]} transition-all`}
    >
      {loading ? (
        <>
          <Spinner size="xs" />
          Cargando...
        </>
      
      ) : (
        <>
          {icon}
          {label}
        </>
      )}
    </Button>
  );
}
