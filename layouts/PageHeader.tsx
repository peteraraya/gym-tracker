import React, { ReactNode } from 'react';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  gradient?: string;
  actions?: ReactNode;
  stats?: ReactNode;
  children?: ReactNode;
}

const BRAND_GRADIENT = 'from-blue-500 via-blue-600 to-indigo-500';

export function PageHeader({
  title,
  subtitle,
  icon,
  gradient = BRAND_GRADIENT,
  actions,
  stats,
  children
}: PageHeaderProps) {
  return (
    <header className="relative overflow-hidden bg-zinc-950">
      <div className={`absolute inset-x-0 top-0 h-1 bg-linear-to-r ${gradient}`} />
      <div className="container mx-auto px-4 py-4 sm:px-6 sm:py-5">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {icon && (
                <div className="shrink-0 rounded-xl bg-blue-600 p-2.5 shadow-sm">
                  {icon}
                </div>
              )}
              <div>
                <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                  {title}
                </h1>
                {subtitle && (
                  <p className="mt-0.5 text-sm text-zinc-300">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>

            {actions && (
              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                {actions}
              </div>
            )}

            {stats && (
              <div className="flex items-center gap-3 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5">
                {stats}
              </div>
            )}
          </div>

          {children && (
            <div className="mt-4">
              {children}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
