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

const BRAND_GRADIENT = 'from-zinc-950 via-zinc-900 to-zinc-800';

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
    <div className={`relative overflow-hidden bg-linear-to-r ${gradient}`}>
      <div className="absolute inset-0 bg-linear-to-br from-white/5 to-transparent" />
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {icon && (
                <div className="p-3 bg-blue-500/15 backdrop-blur-sm rounded-xl shadow-lg border border-blue-400/30">
                  {icon}
                </div>
              )}
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-white/80 mt-1 text-sm sm:text-base">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>

            {actions && (
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                {actions}
              </div>
            )}

            {stats && (
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-white/20 shadow-md">
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
    </div>
  );
}
