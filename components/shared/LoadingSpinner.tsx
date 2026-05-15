'use client';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'white' | 'gray';
  message?: string;
  fullScreen?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4 border-2',
  md: 'w-8 h-8 border-3',
  lg: 'w-12 h-12 border-4',
  xl: 'w-16 h-16 border-4'
};

const colorClasses = {
  primary: 'border-blue-500 border-t-transparent',
  white: 'border-white border-t-transparent',
  gray: 'border-gray-400 border-t-transparent'
};

const messageSize = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
  xl: 'text-lg'
};

export function LoadingSpinner({
  size = 'md',
  color = 'primary',
  message,
  fullScreen = false,
  className = ''
}: LoadingSpinnerProps) {
  const spinner = (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div
        className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-spin`}
        role="status"
        aria-label="Cargando"
      />
      {message && (
        <p className={`${messageSize[size]} text-gray-600 dark:text-gray-400 font-medium`}>
          {message}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
}

// Variante inline para usar dentro de botones
export function InlineSpinner({ size = 'sm', color = 'white' }: Pick<LoadingSpinnerProps, 'size' | 'color'>) {
  return (
    <div
      className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-spin inline-block`}
      role="status"
      aria-label="Cargando"
    />
  );
}
