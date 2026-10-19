import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick, style }) => {
  return (
    <div
      className={`rounded-2xl border border-zinc-200 bg-white p-4 transition-colors transition-shadow hover:border-blue-200 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-blue-900 dark:hover:shadow-zinc-950/40 sm:p-5 ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
      onClick={onClick}
      style={style}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return <div className={`mb-4 ${className}`}>{children}</div>;
};

export const CardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return <h3 className={`text-xl font-bold text-zinc-900 dark:text-zinc-100 ${className}`}>{children}</h3>;
};

export const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return <div className={`text-zinc-700 dark:text-zinc-300 ${className}`}>{children}</div>;
};
