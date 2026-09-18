'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Plus, Trash2 } from '@/components/icons/lucide';
import type { WeightEntry } from '@/types';
import { formatWeight, weightToUnit, type WeightUnit } from '@/lib/utils/weight';

interface WeightHistoryCardProps {
  entries: WeightEntry[];
  saving: boolean;
  onAdd: (date: string, weightKg: number) => Promise<void> | void;
  onDelete: (date: string) => Promise<void> | void;
}

const CHART_W = 120;
const CHART_H = 48;
const PAD = 4;

function WeightChart({ entries, unit }: { entries: WeightEntry[]; unit: WeightUnit }) {
  if (entries.length < 2) return null;

  const weights = entries.map((e) => weightToUnit(e.weight, unit));
  const min = Math.min(...weights);
  const max = Math.max(...weights);
  const range = max - min || 1;
  const points = entries
    .map((e, i) => {
      const x = PAD + (i / (entries.length - 1)) * (CHART_W - PAD * 2);
      const y =
        CHART_H - PAD - ((weightToUnit(e.weight, unit) - min) / range) * (CHART_H - PAD * 2);
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(' ');

  const firstDate = new Date(entries[0].date).toLocaleDateString(undefined, { day: '2-digit', month: 'short' });
  const lastDate = new Date(entries[entries.length - 1].date).toLocaleDateString(undefined, { day: '2-digit', month: 'short' });

  return (
    <div>
      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
        <span>Mín {min.toFixed(1)} {unit}</span>
        <span>Máx {max.toFixed(1)} {unit}</span>
      </div>
      <svg viewBox={`0 0 ${CHART_W} ${CHART_H}`} className="w-full h-24" role="img" aria-label="Evolución de peso corporal">
        <polyline
          points={points}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinejoin="round"
          strokeLinecap="round"
          className="text-blue-500"
        />
        {entries.map((e, i) => {
          const [x, y] = points.split(' ')[i].split(',').map(Number);
          return (
            <circle key={e.date} cx={x} cy={y} r={1.4} className="fill-blue-500" />
          );
        })}
      </svg>
      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
        <span>{firstDate}</span>
        <span>{lastDate}</span>
      </div>
    </div>
  );
}

export function WeightHistoryCard({ entries, saving, onAdd, onDelete }: WeightHistoryCardProps) {
  const [unit, setUnit] = useState<WeightUnit>('kg');
  const today = () => new Date().toISOString().split('T')[0];
  const [date, setDate] = useState<string>(today);
  const [weightInput, setWeightInput] = useState<string>('');

  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  const latest = sorted.length ? sorted[sorted.length - 1] : null;
  const first = sorted.length ? sorted[0] : null;
  const delta = latest && first ? latest.weight - first.weight : 0;
  const maxWeight = sorted.length ? Math.max(...sorted.map((e) => e.weight)) : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const kg = parseFloat(weightInput);
    if (!date || !Number.isFinite(kg) || kg <= 0) return;
    void onAdd(date, kg);
    setWeightInput('');
  };

  const unitToggle = (
    <div className="flex rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700 text-xs">
      {(['kg', 'lb'] as WeightUnit[]).map((u) => (
        <button
          key={u}
          type="button"
          onClick={() => setUnit(u)}
          aria-pressed={unit === u}
          className={`px-2.5 py-1 font-medium ${
            unit === u
              ? 'bg-blue-500 text-white'
              : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
          }`}
        >
          {u}
        </button>
      ))}
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle>Historial de Peso</CardTitle>
          {unitToggle}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {latest && (
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
              {formatWeight(latest.weight, unit)}
            </span>
            <span className={`text-sm font-medium ${delta >= 0 ? 'text-red-500' : 'text-green-500'}`}>
              {delta >= 0 ? '▲' : '▼'} {Math.abs(delta).toFixed(1)} {unit}
              {delta !== 0 && ` desde ${new Date(first!.date).toLocaleDateString()}`}
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3">
          <Input
            type="number"
            label="Peso"
            value={weightInput}
            onChange={(e) => setWeightInput(e.target.value)}
            placeholder={unit === 'kg' ? '70.0' : '154.3'}
            min="20"
            max="400"
            step="0.1"
            inputMode="decimal"
          />
          <Input
            type="date"
            label="Fecha"
            value={date}
            max={today()}
            onChange={(e) => setDate(e.target.value)}
          />
          <Button type="submit" variant="primary" disabled={saving} className="col-span-2 min-h-[44px]">
            <Plus className="w-4 h-4" /> Registrar pesaje
          </Button>
        </form>

        {saving && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Guardando...</p>
        )}

        <WeightChart entries={sorted.slice(-60)} unit={unit} />

        {entries.length > 0 ? (
          <div className="max-h-56 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-800">
            {sorted
              .slice()
              .reverse()
              .map((e) => (
                <div
                  key={e.date}
                  className="flex items-center justify-between px-3 py-2 bg-white dark:bg-zinc-900"
                >
                  <div>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      {formatWeight(e.weight, unit)}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {new Date(e.date).toLocaleDateString(undefined, {
                        weekday: 'short',
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void onDelete(e.date)}
                    aria-label={`Eliminar pesaje del ${new Date(e.date).toLocaleDateString()}`}
                    className="p-2 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
          </div>
        ) : (
          <div className="text-center py-6 text-sm text-zinc-500 dark:text-zinc-400">
            ⚖️ Aún no hay pesajes. Registra tu peso para ver tu evolución.
          </div>
        )}

        {entries.length > 1 && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Mín: {formatWeight(Math.min(...sorted.map((e) => e.weight)), unit)} · Máx:{' '}
            {formatWeight(maxWeight, unit)} · {entries.length} registros
          </p>
        )}
      </CardContent>
    </Card>
  );
}