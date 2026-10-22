'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Children } from 'react';

interface CalculatorShellProps {
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  gradientStart: string;
  gradientEnd: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export default function CalculatorShell({
  title,
  subtitle,
  icon,
  gradientStart,
  gradientEnd,
  children,
  footer,
}: CalculatorShellProps) {
  return (
    <Card className="w-full max-w-2xl md:max-w-4xl mx-auto bg-zinc-900 text-zinc-100 rounded-2xl shadow-2xl overflow-hidden border border-zinc-800">
      <CardHeader className="bg-zinc-950 p-5 border-b border-zinc-800 flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${gradientStart} ${gradientEnd} shadow-lg`}>
            {icon}
          </div>
          <div>
            <CardTitle className="text-xl font-bold tracking-tight mb-0">{title}</CardTitle>
            {subtitle && <p className="text-xs text-zinc-400 mt-0.5">{subtitle}</p>}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5 space-y-6">
        {children}
      </CardContent>

      {footer && (
        <div className="bg-zinc-950 border-t border-zinc-800 p-5">
          {footer}
        </div>
      )}
    </Card>
  );
}
