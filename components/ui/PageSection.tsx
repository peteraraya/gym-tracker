'use client';

import { ReactNode } from 'react';

interface PageSectionProps {
  title?: string;
  subtitle?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
}

export function PageSection({
  title,
  subtitle,
  icon,
  actions,
  children,
  className = '',
  noPadding = false
}: PageSectionProps) {
  return (
    <section className={`${noPadding ? '' : 'mb-8'} ${className}`}>
      {/* Header */}
      {(title || subtitle || actions) && (
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 flex-1">
            {icon && (
              <div className="text-gray-600 dark:text-gray-400">
                {icon}
              </div>
            )}
            <div className="flex-1">
              {title && (
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {actions && (
            <div className="flex gap-2 shrink-0 ml-4">
              {actions}
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div>
        {children}
      </div>
    </section>
  );
}

// Variante con card
export function PageSectionCard({
  title,
  subtitle,
  icon,
  actions,
  children,
  className = ''
}: PageSectionProps) {
  return (
    <PageSection
      title={title}
      subtitle={subtitle}
      icon={icon}
      actions={actions}
      className={className}
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        {children}
      </div>
    </PageSection>
  );
}
