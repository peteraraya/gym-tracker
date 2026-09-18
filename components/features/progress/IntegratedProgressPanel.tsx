'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { Card, CardContent } from '@/components/ui/Card';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart3,
  Zap,
  Activity,
  Trophy,
} from '@/components/icons/lucide';
import { useValidSessions } from '@/hooks/useValidSessions';
import { useTranslations } from '@/context/LocaleContext';
import type { WorkoutSession } from '@/types';

// ─── Types ───────────────────────────────────────────────────────────────────

type TimeRange = 'week' | 'month' | 'year';

interface SparkPoint {
  label: string;
  value: number;
}

interface PanelMetrics {
  volumeCurrent: number;
  volumeChange: number;
  volumeHistory: SparkPoint[];

  wilksCurrent: number;
  wilksChange: number;
  wilksHistory: SparkPoint[];

  densityCurrent: number;
  densityChange: number;
  densityHistory: SparkPoint[];

  consistencyCurrent: number;
  consistencyChange: number;
  consistencyHistory: SparkPoint[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function calcSessionVolume(session: WorkoutSession): number {
  return session.exercises.reduce((total, ex) => {
    const reps = ex.actualReps ?? [];
    const weights = ex.actualWeight ?? [];
    return total + reps.reduce((sum, r, i) => sum + r * (weights[i] ?? 0), 0);
  }, 0);
}

/** Epley 1RM formula */
function epley1RM(weight: number, reps: number): number {
  if (reps <= 0 || weight <= 0) return 0;
  if (reps === 1) return weight;
  return weight * (1 + reps / 30);
}

/** Best estimated 1RM across all exercises in a session */
function sessionBest1RM(session: WorkoutSession): number {
  let best = 0;
  for (const ex of session.exercises) {
    const reps = ex.actualReps ?? [];
    const weights = ex.actualWeight ?? [];
    for (let i = 0; i < reps.length; i++) {
      const rm = epley1RM(weights[i] ?? 0, reps[i] ?? 0);
      if (rm > best) best = rm;
    }
  }
  return best;
}

/** Duration in minutes (fallback to 60 when unknown) */
function sessionDurationMin(session: WorkoutSession): number {
  return session.totalDuration ? session.totalDuration / 60 : 60;
}

function pctChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

// ─── Metric computation by time range ────────────────────────────────────────

function computeMetrics(
  sessions: WorkoutSession[],
  range: TimeRange,
): PanelMetrics {
  const now = new Date();

  // Build buckets (oldest first for charts)
  const BUCKETS = range === 'week' ? 8 : range === 'month' ? 8 : 4;

  const getBucketKey = (date: Date): number => {
    if (range === 'week') {
      const msPerWeek = 7 * 24 * 60 * 60 * 1000;
      return Math.floor((now.getTime() - date.getTime()) / msPerWeek);
    }
    if (range === 'month') {
      return (
        (now.getFullYear() - date.getFullYear()) * 12 +
        (now.getMonth() - date.getMonth())
      );
    }
    // year
    return now.getFullYear() - date.getFullYear();
  };

  interface Bucket {
    volume: number;
    rm: number;
    durationMin: number;
    count: number;
  }

  const buckets: Bucket[] = Array.from({ length: BUCKETS }, () => ({
    volume: 0,
    rm: 0,
    durationMin: 0,
    count: 0,
  }));

  for (const s of sessions) {
    const key = getBucketKey(new Date(s.date));
    if (key >= 0 && key < BUCKETS) {
      const idx = BUCKETS - 1 - key; // reverse so idx=BUCKETS-1 is current
      buckets[idx].volume += calcSessionVolume(s);
      buckets[idx].rm = Math.max(buckets[idx].rm, sessionBest1RM(s));
      buckets[idx].durationMin += sessionDurationMin(s);
      buckets[idx].count += 1;
    }
  }

  // Label helper
  const bucketLabel = (idx: number): string => {
    const periodsAgo = BUCKETS - 1 - idx;
    if (range === 'week') {
      const d = new Date(now);
      d.setDate(d.getDate() - periodsAgo * 7);
      return `S${d.getDate()}/${d.getMonth() + 1}`;
    }
    if (range === 'month') {
      const d = new Date(now.getFullYear(), now.getMonth() - periodsAgo, 1);
      return d.toLocaleString('es', { month: 'short' });
    }
    return String(now.getFullYear() - periodsAgo);
  };

  const volumeHistory: SparkPoint[] = buckets.map((b, i) => ({
    label: bucketLabel(i),
    value: Math.round(b.volume),
  }));

  const wilksHistory: SparkPoint[] = buckets.map((b, i) => ({
    label: bucketLabel(i),
    value: Math.round(b.rm * 10) / 10,
  }));

  const densityHistory: SparkPoint[] = buckets.map((b, i) => ({
    label: bucketLabel(i),
    value: b.durationMin > 0 ? Math.round((b.volume / b.durationMin) * 10) / 10 : 0,
  }));

  const consistencyHistory: SparkPoint[] = buckets.map((b, i) => ({
    label: bucketLabel(i),
    value: b.count,
  }));

  const current = buckets[BUCKETS - 1];
  const prev = buckets[BUCKETS - 2] ?? { volume: 0, rm: 0, durationMin: 0, count: 0 };

  const prevDensity = prev.durationMin > 0 ? prev.volume / prev.durationMin : 0;
  const currDensity = current.durationMin > 0 ? current.volume / current.durationMin : 0;

  return {
    volumeCurrent: current.volume,
    volumeChange: pctChange(current.volume, prev.volume),
    volumeHistory,

    wilksCurrent: current.rm,
    wilksChange: pctChange(current.rm, prev.rm),
    wilksHistory,

    densityCurrent: currDensity,
    densityChange: pctChange(currDensity, prevDensity),
    densityHistory,

    consistencyCurrent: current.count,
    consistencyChange: pctChange(current.count, prev.count),
    consistencyHistory,
  };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface TrendBadgeProps {
  value: number;
  suffix?: string;
}
const TrendBadge = ({ value, suffix = '%' }: TrendBadgeProps) => {
  if (Math.abs(value) < 0.5) {
    return (
      <span className="inline-flex items-center gap-0.5 text-xs font-medium text-gray-500 dark:text-gray-400">
        <Minus className="w-3 h-3" />
        Estable
      </span>
    );
  }
  const positive = value > 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-xs font-medium ${
        positive
          ? 'text-emerald-600 dark:text-emerald-400'
          : 'text-red-600 dark:text-red-400'
      }`}
    >
      {positive ? (
        <TrendingUp className="w-3 h-3" />
      ) : (
        <TrendingDown className="w-3 h-3" />
      )}
      {positive ? '+' : ''}{value.toFixed(1)}{suffix}
    </span>
  );
};

interface MiniSparklineProps {
  data: SparkPoint[];
  color: string;
}
const MiniSparkline = ({ data, color }: MiniSparklineProps) => (
  <ResponsiveContainer width="100%" height={52}>
    <AreaChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
      <defs>
        <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor={color} stopOpacity={0.3} />
          <stop offset="95%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <Tooltip
        content={({ active, payload }) =>
          active && payload?.length ? (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-2 py-1 text-xs shadow">
              <p className="font-medium text-gray-900 dark:text-gray-100">{payload[0].value}</p>
              <p className="text-gray-500 dark:text-gray-400">{payload[0].payload.label}</p>
            </div>
          ) : null
        }
      />
      <Area
        type="monotone"
        dataKey="value"
        stroke={color}
        strokeWidth={2}
        fill={`url(#grad-${color.replace('#', '')})`}
        dot={false}
        animationDuration={600}
      />
    </AreaChart>
  </ResponsiveContainer>
);

// ─── Main Component ───────────────────────────────────────────────────────────

export const IntegratedProgressPanel: React.FC = () => {
  const [range, setRange] = useState<TimeRange>('month');
  const sessions = useValidSessions();
  const t = useTranslations('progress.panel');

  const metrics = useMemo(
    () => computeMetrics(sessions, range),
    [sessions, range],
  );

  const rangeOptions: { value: TimeRange; label: string }[] = [
    { value: 'week', label: t('week') },
    { value: 'month', label: t('month') },
    { value: 'year', label: t('year') },
  ];

  const cards = [
    {
      key: 'volume',
      icon: <BarChart3 className="w-5 h-5 text-indigo-500" />,
      title: t('monthlyVolume'),
      value: metrics.volumeCurrent > 0
        ? `${(metrics.volumeCurrent / 1000).toFixed(1)}t`
        : '—',
      rawValue: metrics.volumeCurrent,
      change: metrics.volumeChange,
      history: metrics.volumeHistory,
      color: '#1e8fff',
      href: '/calculators',
      unit: 'kg',
    },
    {
      key: 'wilks',
      icon: <Trophy className="w-5 h-5 text-amber-500" />,
      title: t('wilksScore'),
      value: metrics.wilksCurrent > 0
        ? metrics.wilksCurrent.toFixed(1)
        : '—',
      rawValue: metrics.wilksCurrent,
      change: metrics.wilksChange,
      history: metrics.wilksHistory,
      color: '#f59e0b',
      href: '/calculators',
      unit: 'kg 1RM',
    },
    {
      key: 'density',
      icon: <Zap className="w-5 h-5 text-emerald-500" />,
      title: t('workoutDensity'),
      value: metrics.densityCurrent > 0
        ? `${metrics.densityCurrent.toFixed(1)}`
        : '—',
      rawValue: metrics.densityCurrent,
      change: metrics.densityChange,
      history: metrics.densityHistory,
      color: '#10b981',
      href: '/calculators',
      unit: 'kg/min',
    },
    {
      key: 'consistency',
      icon: <Activity className="w-5 h-5 text-sky-500" />,
      title: t('consistency'),
      value: metrics.consistencyCurrent > 0
        ? String(metrics.consistencyCurrent)
        : '—',
      rawValue: metrics.consistencyCurrent,
      change: metrics.consistencyChange,
      history: metrics.consistencyHistory,
      color: '#0ea5e9',
      href: '/sessions',
      unit: t('sessions'),
    },
  ] as const;

  return (
    <div className="space-y-3">
      {/* Header + Time Range Selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-indigo-500" />
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            {t('title')}
          </h2>
        </div>
        <div className="flex rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 text-xs">
          {rangeOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setRange(opt.value)}
              className={`px-3 py-1.5 font-medium transition-colors ${
                range === opt.value
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Metric cards grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map((card) => (
          <Card
            key={card.key}
            className="overflow-hidden hover:shadow-md transition-shadow"
          >
            <CardContent className="p-3">
              {/* Icon + title */}
              <div className="flex items-center gap-1.5 mb-2">
                {card.icon}
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400 leading-tight">
                  {card.title}
                </span>
              </div>

              {/* Value + change */}
              <div className="flex items-end justify-between mb-1">
                <div>
                  <p className="text-xl font-bold text-gray-900 dark:text-gray-100 leading-none">
                    {card.value}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {card.unit}
                  </p>
                </div>
                {card.rawValue > 0 && (
                  <TrendBadge value={card.change} />
                )}
              </div>

              {/* Sparkline */}
              {card.rawValue > 0 && (
                <MiniSparkline data={card.history} color={card.color} />
              )}

              {/* No data state */}
              {card.rawValue === 0 && (
                <div className="h-14 flex items-center justify-center">
                  <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
                    {t('noData')}
                  </p>
                </div>
              )}

              {/* Detail link */}
              <Link
                href={card.href}
                className="block mt-2 text-xs text-indigo-600 dark:text-indigo-400 hover:underline text-right"
              >
                {t('viewDetail')} →
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Strength trend banner */}
      {sessions.length > 0 && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800">
          <TrendingUp className="w-4 h-4 text-indigo-500 shrink-0" />
          <p className="text-xs text-indigo-700 dark:text-indigo-300">
            {metrics.volumeChange > 5
              ? `${t('trendUp')} (+${metrics.volumeChange.toFixed(1)}%)`
              : metrics.volumeChange < -5
              ? `${t('trendDown')} (${metrics.volumeChange.toFixed(1)}%)`
              : t('trendStable')}
          </p>
        </div>
      )}
    </div>
  );
};

export default IntegratedProgressPanel;
