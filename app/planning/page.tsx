'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { PageHeader, PageLayout, PageContent } from '@/layouts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { usePlanning } from '@/hooks/usePlanning';
import { useGym } from '@/context/GymContext';
import { EXERCISE_DATABASE } from '@/data/exercises';
import {
  DEFAULT_VOLUME_LANDMARKS,
  RECOMMENDED_FREQUENCY,
  GOAL_LABELS,
  STATUS_LABELS,
  DAYS,
  DAY_LABELS,
  DAY_LABELS_SHORT,
  getActualSetsThisWeek,
  type PlanningGoal,
  type Mesocycle,
  type WeeklyPlan,
  type DayKey,
} from '@/types/planning';
import { APP_CONFIG } from '@/config/app.config';
import type { Routine } from '@/types';

// ─── Sub-componentes ──────────────────────────────────────────────────────────

const MUSCLE_GROUPS = Object.keys(DEFAULT_VOLUME_LANDMARKS);

function VolumeBar({
  actual,
  target,
  mev,
  mav,
  mrv,
  color,
}: {
  actual: number;
  target: number;
  mev: number;
  mav: number;
  mrv: number;
  color: string;
}) {
  const max = Math.max(mrv, actual, target, 1);
  const pct = (v: number) => `${Math.min((v / max) * 100, 100)}%`;

  let statusColor = 'bg-yellow-400';
  if (actual >= mev && actual <= mrv) statusColor = 'bg-green-500';
  if (actual > mrv) statusColor = 'bg-red-500';
  if (actual === 0) statusColor = 'bg-gray-300 dark:bg-gray-600';

  return (
    <div className="relative h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
      {/* Zona MAV (verde claro) */}
      <div
        className="absolute inset-y-0 bg-green-100 dark:bg-green-900/30 rounded-full"
        style={{ left: pct(mev), width: `${Math.min(((mav - mev) / max) * 100, 100)}%` }}
      />
      {/* Barra de series reales */}
      <div
        className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${statusColor}`}
        style={{ width: pct(actual) }}
      />
      {/* Marcador de target */}
      {target > 0 && (
        <div
          className="absolute inset-y-0 w-0.5 bg-blue-500"
          style={{ left: pct(target) }}
        />
      )}
    </div>
  );
}

function MuscleGroupRow({
  muscleGroup,
  label,
  color,
  target,
  actual,
  projected,
  landmarks,
  onUpdateTarget,
}: {
  muscleGroup: string;
  label: string;
  color: string;
  target: { targetSets: number; targetFrequency: number; targetRPE?: number };
  actual: number;
  projected: number; // series que cubren las rutinas agendadas
  landmarks: (typeof DEFAULT_VOLUME_LANDMARKS)[string];
  onUpdateTarget: (field: 'targetSets' | 'targetFrequency' | 'targetRPE', value: number) => void;
}) {
  const freq = RECOMMENDED_FREQUENCY[muscleGroup] ?? { min: 1, max: 3 };
  const gap = actual - target.targetSets; // positivo = hiciste más, negativo = falta
  const projectedGap = projected - target.targetSets; // desfase de lo planeado en rutinas

  // Estado de la semana actual
  const actualStatus =
    actual === 0 ? 'empty'
    : actual < landmarks.mev ? 'below'
    : actual > landmarks.mrv ? 'over'
    : actual <= landmarks.mav ? 'ok'
    : 'above';

  const statusCfg: Record<string, { label: string; cls: string }> = {
    empty: { label: '—', cls: 'text-gray-400' },
    below: { label: 'Sub-MEV', cls: 'text-yellow-500' },
    ok:    { label: 'En MAV ✓', cls: 'text-green-500' },
    above: { label: 'Sobre MAV', cls: 'text-blue-400' },
    over:  { label: 'Sobre MRV', cls: 'text-red-500' },
  };
  const { label: statusLabel, cls: statusCls } = statusCfg[actualStatus];

  // Alertas de rutinas vs target
  const hasProjected = projected > 0;
  const projectedShort = target.targetSets > 0 && hasProjected && projected < target.targetSets;
  const projectedOver = target.targetSets > 0 && hasProjected && projected > target.targetSets;
  const projectedMissing = target.targetSets > 0 && !hasProjected;

  // Estado local para edición del campo targetSets
  const [editingValue, setEditingValue] = useState<string>(String(target.targetSets ?? ''));
  useEffect(() => {
    setEditingValue(String(target.targetSets ?? ''));
  }, [target.targetSets]);

  const onInputChange = (val: string) => {
    if (/^\d*$/.test(val)) setEditingValue(val);
    else setEditingValue(val.replace(/\D/g, ''));
  };

  const commit = () => {
    const parsed = editingValue === '' ? 0 : parseInt(editingValue, 10);
    const safe = Number.isNaN(parsed) ? 0 : Math.max(0, Math.min(parsed, landmarks.mrv));
    onUpdateTarget('targetSets', safe);
    setEditingValue(String(safe));
  };

  return (
    <div className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-200 dark:hover:border-gray-700 transition-colors p-3 space-y-2.5">
      {/* Fila superior: nombre + estado + frecuencia */}
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex-1 truncate">{label}</span>
        <span className={`text-[10px] font-semibold ${statusCls}`}>{statusLabel}</span>
        <select
          value={target.targetFrequency}
          onChange={(e) => onUpdateTarget('targetFrequency', Number(e.target.value))}
          className="text-[11px] bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-600 dark:text-gray-400"
        >
          {Array.from({ length: freq.max - freq.min + 1 }, (_, i) => freq.min + i).map(n => (
            <option key={n} value={n}>{n}×/sem</option>
          ))}
        </select>
      </div>

      {/* Barra de volumen */}
      <div>
        <VolumeBar
          actual={actual}
          target={target.targetSets}
          mev={landmarks.mev}
          mav={landmarks.mav}
          mrv={landmarks.mrv}
          color={color}
        />
        <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
          <span>MEV {landmarks.mev}</span>
          <span>MAV {landmarks.mav_max}</span>
          <span>MRV {landmarks.mrv}</span>
        </div>
      </div>

      {/* Fila de stats: Real | Rutinas | Target | GAP */}
      <div className="grid grid-cols-4 gap-2">
        {/* Real */}
        <div className="text-center bg-gray-50 dark:bg-gray-800 rounded-lg py-1.5 px-1">
          <div className="text-base font-bold text-gray-900 dark:text-gray-100 leading-tight">{actual}</div>
          <div className="text-[9px] text-gray-400 uppercase tracking-wider mt-0.5">Real</div>
        </div>

        {/* Rutinas proyectadas */}
        <div className={`text-center rounded-lg py-1.5 px-1 ${
          hasProjected
            ? projectedShort
              ? 'bg-amber-50 dark:bg-amber-900/20'
              : projectedOver
              ? 'bg-blue-50 dark:bg-blue-900/20'
              : 'bg-green-50 dark:bg-green-900/20'
            : 'bg-gray-50 dark:bg-gray-800'
        }`}>
          <div className={`text-base font-bold leading-tight ${
            hasProjected
              ? projectedShort ? 'text-amber-600 dark:text-amber-400'
                : projectedOver ? 'text-blue-600 dark:text-blue-400'
                : 'text-green-600 dark:text-green-400'
              : 'text-gray-400'
          }`}>
            {hasProjected ? projected : '—'}
          </div>
          <div className="text-[9px] text-gray-400 uppercase tracking-wider mt-0.5">Rutinas</div>
        </div>

        {/* Target (editable) */}
        <div className="text-center">
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={editingValue}
            onChange={(e) => onInputChange(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
            className="w-full text-center text-base font-bold bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-indigo-700 dark:text-indigo-300"
          />
          <div className="text-[9px] text-gray-400 uppercase tracking-wider mt-0.5">Target</div>
        </div>

        {/* GAP */}
        <div className="text-center bg-gray-50 dark:bg-gray-800 rounded-lg py-1.5 px-1">
          {target.targetSets > 0 ? (
            <>
              <div className={`text-base font-bold leading-tight ${
                gap === 0 ? 'text-green-600 dark:text-green-400'
                : gap > 0 ? 'text-blue-600 dark:text-blue-400'
                : 'text-rose-500 dark:text-rose-400'
              }`}>
                {gap > 0 ? `+${gap}` : gap < 0 ? gap : '✓'}
              </div>
              <div className="text-[9px] text-gray-400 uppercase tracking-wider mt-0.5">
                {gap > 0 ? 'extra' : gap < 0 ? 'falta' : 'ok'}
              </div>
            </>
          ) : (
            <>
              <div className="text-base font-bold text-gray-300 dark:text-gray-600 leading-tight">—</div>
              <div className="text-[9px] text-gray-400 uppercase tracking-wider mt-0.5">Gap</div>
            </>
          )}
        </div>
      </div>

      {/* Aviso de desfase entre rutinas y target */}
      {target.targetSets > 0 && (projectedMissing || projectedShort || projectedOver) && (
        <div className={`flex items-start gap-1.5 text-[11px] rounded-lg px-2.5 py-2 ${
          projectedMissing
            ? 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
            : projectedShort
            ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400'
            : 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
        }`}>
          <span className="shrink-0 mt-px">
            {projectedMissing ? '💡' : projectedShort ? '⚠️' : 'ℹ️'}
          </span>
          <span>
            {projectedMissing
              ? `No tienes rutinas agendadas con ejercicios de ${label}. Asigna rutinas en la agenda semanal.`
              : projectedShort
              ? `Tus rutinas aportan ${projected} series de ${label}. Agrega ${Math.abs(projectedGap)} series más para alcanzar el target de ${target.targetSets}.`
              : `Tus rutinas aportan ${projected} series de ${label}, ${projectedGap} más que el target (${target.targetSets}). Considera reducir el volumen.`
            }
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Modal crear mesociclo ───────────────────────────────────────────────────

function CreateMesocycleModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (p: { name: string; goal: PlanningGoal; weeks: number; startDate: string; progressionScheme: Mesocycle['progressionScheme']; notes?: string }) => void;
}) {
  const today = new Date().toISOString().split('T')[0];
  const [name, setName] = useState('');
  const [goal, setGoal] = useState<PlanningGoal>('hypertrophy');
  const [weeks, setWeeks] = useState(6);
  const [startDate, setStartDate] = useState(today);
  const [scheme, setScheme] = useState<Mesocycle['progressionScheme']>('linear');
  const [notes, setNotes] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Nuevo mesociclo</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre</label>
          <input
            className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Ej: Mesociclo hipertrofia mayo"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Objetivo</label>
            <select
              className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={goal}
              onChange={e => setGoal(e.target.value as PlanningGoal)}
            >
              {(Object.entries(GOAL_LABELS) as [PlanningGoal, string][]).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Duración</label>
            <select
              className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={weeks}
              onChange={e => setWeeks(Number(e.target.value))}
            >
              {[4, 5, 6, 7, 8].map(w => <option key={w} value={w}>{w} semanas</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Inicio</label>
            <input
              type="date"
              className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Progresión</label>
            <select
              className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={scheme}
              onChange={e => setScheme(e.target.value as Mesocycle['progressionScheme'])}
            >
              <option value="linear">Lineal</option>
              <option value="undulating">Ondulante</option>
              <option value="block">Por bloques</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notas (opcional)</label>
          <textarea
            className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={2}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Ej: Énfasis en piernas y espalda"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="ghost" className="flex-1" onClick={onClose}>Cancelar</Button>
          <Button
            variant="primary"
            className="flex-1"
            disabled={!name.trim() || !startDate}
            onClick={() => { onCreate({ name: name.trim(), goal, weeks, startDate, progressionScheme: scheme, notes: notes || undefined }); onClose(); }}
          >
            Crear mesociclo
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Agenda semanal de rutinas ────────────────────────────────────────────────

function WeeklyScheduleEditor({
  meso,
  weekPlan,
  routines,
  onSchedule,
  onUnschedule,
  onToggleRest,
  onSync,
}: {
  meso: Mesocycle;
  weekPlan: WeeklyPlan;
  routines: Routine[];
  onSchedule: (day: DayKey, routineId: string) => void;
  onUnschedule: (day: DayKey, routineId: string) => void;
  onToggleRest: (day: DayKey) => void;
  onSync: () => void;
}) {
  const [addingDay, setAddingDay] = useState<DayKey | null>(null);

  // Calcular grupos musculares cubiertos por las rutinas de un día
  const getMuscleGroupsForRoutines = (routineIds: string[]): string[] => {
    const groups = new Set<string>();
    routineIds.forEach(rid => {
      const r = routines.find(ro => ro.id === rid);
      if (!r) return;
      r.exercises.forEach(ex => {
        const dbEx = EXERCISE_DATABASE.find(e => e.id === ex.id || e.name === ex.name);
        if (dbEx?.muscleGroup) groups.add(dbEx.muscleGroup);
      });
    });
    return Array.from(groups);
  };

  const totalScheduled = DAYS.reduce((count, day) => {
    const ds = weekPlan.dailySchedule?.[day];
    return count + (ds?.isRest ? 0 : (ds?.routineIds.length ?? 0) > 0 ? 1 : 0);
  }, 0);

  return (
    <div className="space-y-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">🗓️ Agenda de rutinas</h4>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {totalScheduled} día{totalScheduled !== 1 ? 's' : ''} con rutina · {7 - totalScheduled} de descanso/libre
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onSync}
          className="text-xs text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
        >
          ↗ Sincronizar con Planificador
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-7 gap-2">
        {DAYS.map(day => {
          const ds = weekPlan.dailySchedule?.[day] ?? { routineIds: [], isRest: false };
          const assignedRoutines = ds.routineIds.map(id => routines.find(r => r.id === id)).filter(Boolean) as Routine[];
          const musclesCovered = getMuscleGroupsForRoutines(ds.routineIds);
          const isRest = ds.isRest ?? false;

          return (
            <div
              key={day}
              className={`rounded-xl border-2 p-2 flex flex-col gap-2 transition-colors ${
                isRest
                  ? 'border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30 opacity-60'
                  : assignedRoutines.length > 0
                  ? 'border-blue-200 dark:border-blue-800 bg-blue-50/30 dark:bg-blue-900/10'
                  : 'border-dashed border-gray-200 dark:border-gray-700'
              }`}
            >
              {/* Header del día */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                  {DAY_LABELS_SHORT[day]}
                </span>
                <button
                  onClick={() => onToggleRest(day)}
                  title={isRest ? 'Quitar descanso' : 'Marcar como descanso'}
                  className={`text-[10px] px-1.5 py-0.5 rounded-md transition-colors ${
                    isRest
                      ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                      : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {isRest ? '💤' : '—'}
                </button>
              </div>

              {!isRest && (
                <>
                  {/* Rutinas asignadas */}
                  {assignedRoutines.map(r => (
                    <div
                      key={r.id}
                      className="flex items-start justify-between gap-1 bg-white dark:bg-gray-800 rounded-lg px-2 py-1 shadow-sm border border-gray-100 dark:border-gray-700"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-semibold text-gray-800 dark:text-gray-200 truncate leading-tight">
                          {r.name}
                        </p>
                        {musclesCovered.length > 0 && (
                          <div className="flex flex-wrap gap-0.5 mt-0.5">
                            {musclesCovered.slice(0, 3).map(mg => (
                              <span
                                key={mg}
                                className="text-[9px] px-1 rounded"
                                style={{
                                  backgroundColor: APP_CONFIG.muscleGroupColors[mg as keyof typeof APP_CONFIG.muscleGroupColors]
                                    ? `${APP_CONFIG.muscleGroupColors[mg as keyof typeof APP_CONFIG.muscleGroupColors]}22`
                                    : '#6b728022',
                                  color: APP_CONFIG.muscleGroupColors[mg as keyof typeof APP_CONFIG.muscleGroupColors] ?? '#6b7280',
                                }}
                              >
                                {APP_CONFIG.muscleGroupLabels[mg as keyof typeof APP_CONFIG.muscleGroupLabels] ?? mg}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => onUnschedule(day, r.id)}
                        className="text-gray-300 hover:text-red-400 text-xs leading-none shrink-0 mt-0.5"
                      >
                        ×
                      </button>
                    </div>
                  ))}

                  {/* Botón agregar rutina */}
                  {addingDay === day ? (
                    <div className="space-y-1">
                      <select
                        autoFocus
                        className="w-full text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        defaultValue=""
                        onChange={e => {
                          if (e.target.value) {
                            onSchedule(day, e.target.value);
                            setAddingDay(null);
                          }
                        }}
                        onBlur={() => setAddingDay(null)}
                      >
                        <option value="" disabled>Selecciona rutina…</option>
                        {routines
                          .filter(r => !ds.routineIds.includes(r.id))
                          .map(r => (
                            <option key={r.id} value={r.id}>{r.name}</option>
                          ))
                        }
                      </select>
                    </div>
                  ) : (
                    <button
                      onClick={() => setAddingDay(day)}
                      className="text-[11px] text-blue-500 hover:text-blue-600 dark:text-blue-400 flex items-center gap-1 px-1"
                      disabled={routines.length === 0}
                    >
                      <span className="text-base leading-none">+</span>
                      <span>{routines.length === 0 ? 'Sin rutinas' : 'Agregar rutina'}</span>
                    </button>
                  )}
                </>
              )}

              {isRest && (
                <p className="text-[10px] text-gray-400 text-center py-1">Descanso</p>
              )}
            </div>
          );
        })}
      </div>

      {routines.length === 0 && (
        <p className="text-xs text-gray-400 text-center py-2">
          Aún no tienes rutinas. <a href="/routines" className="text-blue-500 underline">Crea una rutina</a> primero.
        </p>
      )}
    </div>
  );
}

// ─── Helper: series proyectadas desde rutinas agendadas ──────────────────────

function getProjectedSetsFromSchedule(
  weekPlan: WeeklyPlan,
  routines: Routine[]
): Record<string, number> {
  const sets: Record<string, number> = {};
  Object.values(weekPlan.dailySchedule ?? {}).forEach(ds => {
    if (ds.isRest) return;
    ds.routineIds.forEach(rid => {
      const routine = routines.find(r => r.id === rid);
      if (!routine) return;
      routine.exercises.forEach(ex => {
        const dbEx = EXERCISE_DATABASE.find(e => e.id === ex.id || e.name === ex.name);
        if (!dbEx?.muscleGroup) return;
        // Contar series efectivas (excluir warmup)
        const effectiveSets = ex.sets.filter(s => s.type !== 'warmup').length || ex.sets.length;
        sets[dbEx.muscleGroup] = (sets[dbEx.muscleGroup] ?? 0) + effectiveSets;
      });
    });
  });
  return sets;
}

// ─── Vista semanal ────────────────────────────────────────────────────────────

function WeeklyView({
  meso,
  weekPlan,
  actualSets,
  routines,
  onUpdateTarget,
  onToggleDeload,
}: {
  meso: Mesocycle;
  weekPlan: WeeklyPlan;
  actualSets: Record<string, number>;
  routines: Routine[];
  onUpdateTarget: (mg: string, field: 'targetSets' | 'targetFrequency' | 'targetRPE', value: number) => void;
  onToggleDeload: () => void;
}) {
  const totalTarget = Object.values(weekPlan.muscleGroupTargets).reduce((s, t) => s + t.targetSets, 0);
  const totalActual = Object.values(actualSets).reduce((s, v) => s + v, 0);

  // Series proyectadas desde las rutinas agendadas esta semana
  const projectedSets = getProjectedSetsFromSchedule(weekPlan, routines);
  const totalProjected = Object.values(projectedSets).reduce((s, v) => s + v, 0);
  const hasSchedule = Object.values(weekPlan.dailySchedule ?? {}).some(ds => !ds.isRest && ds.routineIds.length > 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-gray-900 dark:text-gray-100">
            Semana {weekPlan.weekNumber}
          </h3>
          {weekPlan.isDeload && (
            <span className="px-2 py-0.5 text-xs font-semibold bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full">
              💤 Descarga
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Resumen series */}
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>Real <strong className="text-gray-800 dark:text-gray-200">{totalActual}</strong></span>
            {hasSchedule && (
              <>
                <span className="text-gray-300 dark:text-gray-700">·</span>
                <span>Rutinas <strong className="text-indigo-600 dark:text-indigo-400">{totalProjected}</strong></span>
              </>
            )}
            <span className="text-gray-300 dark:text-gray-700">·</span>
            <span>Target <strong className="text-gray-800 dark:text-gray-200">{totalTarget}</strong></span>
          </div>
          <button
            onClick={onToggleDeload}
            className="text-xs px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
          >
            {weekPlan.isDeload ? 'Quitar descarga' : 'Marcar descarga'}
          </button>
        </div>
      </div>

      {/* Leyenda */}
      {!hasSchedule && (
        <div className="text-xs text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-lg px-3 py-2">
          💡 Asigna rutinas en la <strong>Agenda de rutinas</strong> de abajo para ver qué volumen cubren respecto al target.
        </div>
      )}

      <div className="space-y-2">
        {MUSCLE_GROUPS.map(mg => {
          const label = APP_CONFIG.muscleGroupLabels[mg as keyof typeof APP_CONFIG.muscleGroupLabels] ?? mg;
          const color = APP_CONFIG.muscleGroupColors[mg as keyof typeof APP_CONFIG.muscleGroupColors] ?? '#6b7280';
          const target = weekPlan.muscleGroupTargets[mg] ?? { targetSets: 0, targetFrequency: 2 };
          const landmarks = meso.volumeLandmarks[mg] ?? DEFAULT_VOLUME_LANDMARKS[mg];
          return (
            <MuscleGroupRow
              key={mg}
              muscleGroup={mg}
              label={label}
              color={color}
              target={target}
              actual={actualSets[mg] ?? 0}
              projected={projectedSets[mg] ?? 0}
              landmarks={landmarks}
              onUpdateTarget={(field, value) => onUpdateTarget(mg, field, value)}
            />
          );
        })}
      </div>
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function PlanningPage() {
  const planning = usePlanning();
  const { sessions, routines } = useGym();
  const [showCreate, setShowCreate] = useState(false);
  const [selectedMesoId, setSelectedMesoId] = useState<string | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<number>(1);

  // Calcular series reales de esta semana
  const actualSets = getActualSetsThisWeek(sessions, EXERCISE_DATABASE);

  // Mesociclo seleccionado para ver detalle
  const viewMeso = selectedMesoId
    ? planning.data.mesocycles.find(m => m.id === selectedMesoId)
    : null;

  const weekPlan = viewMeso?.weeklyPlans.find(w => w.weekNumber === selectedWeek) ?? null;

  // Semana actual del mesociclo activo
  const currentWeekPlan = planning.getCurrentWeekPlan();

  return (
    <ProtectedRoute>
      <PageLayout>
        <PageHeader
          title="Planificación"
          subtitle="Mesociclos, volumen semanal y progresión de entrenamientos"
          icon={<span className="text-3xl">📅</span>}
          gradient="from-indigo-700 via-purple-700 to-blue-800"
        />

        <PageContent maxWidth="4xl">
          {/* Modales */}
          {showCreate && (
            <CreateMesocycleModal
              onClose={() => setShowCreate(false)}
              onCreate={(params) => {
                const meso = planning.createMesocycle(params);
                setSelectedMesoId(meso.id);
                setSelectedWeek(1);
              }}
            />
          )}

          <div className="space-y-4">
            {/* ── Panel de resumen activo ─────────────────────────────────── */}
            {planning.activeMesocycle && (
              <Card className="border-2 border-blue-400 dark:border-blue-600 bg-blue-50/40 dark:bg-blue-900/10">
                <CardContent className="py-3 px-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">Mesociclo activo</span>
                        <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full font-medium">
                          {GOAL_LABELS[planning.activeMesocycle.goal]}
                        </span>
                      </div>
                      <p className="font-bold text-gray-900 dark:text-gray-100 mt-0.5">
                        {planning.activeMesocycle.name}
                      </p>
                      {currentWeekPlan && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Semana {currentWeekPlan.weekNumber} de {planning.activeMesocycle.weeks}
                          {currentWeekPlan.isDeload && ' · 💤 Descarga'}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedMesoId(planning.activeMesocycle!.id);
                        setSelectedWeek(currentWeekPlan?.weekNumber ?? 1);
                      }}
                    >
                      Ver semana actual →
                    </Button>
                  </div>

                  {/* Resumen rápido de volumen esta semana */}
                  {currentWeekPlan && (
                    <div className="mt-3 grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {MUSCLE_GROUPS.slice(0, 6).map(mg => {
                        const color = APP_CONFIG.muscleGroupColors[mg as keyof typeof APP_CONFIG.muscleGroupColors] ?? '#6b7280';
                        const label = APP_CONFIG.muscleGroupLabels[mg as keyof typeof APP_CONFIG.muscleGroupLabels] ?? mg;
                        const target = currentWeekPlan.muscleGroupTargets[mg]?.targetSets ?? 0;
                        const actual = actualSets[mg] ?? 0;
                        const pct = target > 0 ? Math.min((actual / target) * 100, 100) : 0;
                        return (
                          <div key={mg} className="text-center">
                            <div className="text-[10px] text-gray-500 truncate">{label}</div>
                            <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mt-1 overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all"
                                style={{ width: `${pct}%`, backgroundColor: color }}
                              />
                            </div>
                            <div className="text-[10px] text-gray-400 mt-0.5">{actual}/{target}</div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* ── Botón crear ─────────────────────────────────────────────── */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Mis mesociclos</h2>
              <Button variant="primary" size="sm" onClick={() => setShowCreate(true)}>
                + Nuevo mesociclo
              </Button>
            </div>

            {/* ── Lista de mesociclos ──────────────────────────────────────── */}
            {planning.data.mesocycles.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-4xl mb-3">📅</p>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-1">Sin mesociclos</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 max-w-sm mx-auto">
                    Crea tu primer mesociclo para planificar el volumen semanal por grupo muscular y llevar un seguimiento de tu progresión.
                  </p>
                  <Button variant="primary" onClick={() => setShowCreate(true)}>
                    Crear primer mesociclo
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                {planning.data.mesocycles.map(meso => {
                  const isActive = meso.id === planning.data.activeMesocycleId;
                  const isSelected = meso.id === selectedMesoId;
                  const endDate = new Date(meso.startDate);
                  endDate.setDate(endDate.getDate() + meso.weeks * 7);
                  return (
                    <Card
                      key={meso.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${isSelected ? 'ring-2 ring-blue-500' : ''} ${isActive ? 'border-green-400 dark:border-green-600' : ''}`}
                      onClick={() => { setSelectedMesoId(meso.id); setSelectedWeek(1); }}
                    >
                      <CardContent className="py-3 px-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                meso.status === 'active' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                : meso.status === 'completed' ? 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                                : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                              }`}>{STATUS_LABELS[meso.status]}</span>
                              <span className="text-[10px] text-gray-500">{GOAL_LABELS[meso.goal]}</span>
                            </div>
                            <p className="font-bold text-gray-900 dark:text-gray-100 truncate mt-0.5">{meso.name}</p>
                            <p className="text-xs text-gray-500">
                              {meso.weeks} semanas · {new Date(meso.startDate).toLocaleDateString('es-CL')} → {endDate.toLocaleDateString('es-CL')}
                            </p>
                          </div>
                          <div className="flex flex-col gap-1 shrink-0">
                            {!isActive && meso.status !== 'completed' && (
                              <button
                                onClick={(e) => { e.stopPropagation(); planning.setActiveMesocycle(meso.id); }}
                                className="text-xs px-2 py-1 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 font-medium"
                              >
                                Activar
                              </button>
                            )}
                            {isActive && (
                              <button
                                onClick={(e) => { e.stopPropagation(); planning.updateMesocycle(meso.id, { status: 'completed' }); planning.setActiveMesocycle(null); }}
                                className="text-xs px-2 py-1 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200 font-medium"
                              >
                                Completar
                              </button>
                            )}
                            <button
                              onClick={(e) => { e.stopPropagation(); if (confirm(`¿Eliminar "${meso.name}"?`)) planning.deleteMesocycle(meso.id); }}
                              className="text-xs px-2 py-1 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40 font-medium"
                            >
                              Eliminar
                            </button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* ── Detalle del mesociclo seleccionado ─────────────────────── */}
            {viewMeso && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <CardTitle className="flex items-center gap-2">
                      <span>{viewMeso.name}</span>
                      <span className="text-sm font-normal text-gray-500">· {GOAL_LABELS[viewMeso.goal]}</span>
                    </CardTitle>
                    {/* Botón de progresión lineal rápida */}
                    <button
                      onClick={() => {
                        const ok = confirm('Aplicar progresión lineal automática (+2 series/semana) a todos los grupos musculares. ¿Continuar?');
                        if (!ok) return;
                        MUSCLE_GROUPS.forEach(mg => {
                          const start = viewMeso.weeklyPlans[0]?.muscleGroupTargets[mg]?.targetSets ?? DEFAULT_VOLUME_LANDMARKS[mg].mev;
                          planning.applyLinearProgression(viewMeso.id, mg, start, 2);
                        });
                      }}
                      className="text-xs px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 font-medium border border-indigo-200 dark:border-indigo-800"
                    >
                      ⚡ Auto-progresión lineal
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="pb-4">
                  {/* Selector de semana */}
                  <div className="flex gap-2 flex-wrap mb-4">
                    {viewMeso.weeklyPlans.map(w => (
                      <button
                        key={w.weekNumber}
                        onClick={() => setSelectedWeek(w.weekNumber)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                          selectedWeek === w.weekNumber
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                        } ${w.isDeload ? 'ring-2 ring-purple-400' : ''}`}
                      >
                        S{w.weekNumber}{w.isDeload ? ' 💤' : ''}
                      </button>
                    ))}
                  </div>

                  {/* Leyenda */}
                  <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-4 p-2 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                    <span className="flex items-center gap-1"><span className="w-3 h-1.5 bg-green-100 dark:bg-green-900/40 inline-block rounded" /> Zona MAV</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-1.5 bg-green-500 inline-block rounded" /> Series reales</span>
                    <span className="flex items-center gap-1"><span className="w-0.5 h-3 bg-blue-500 inline-block" /> Target</span>
                  </div>

                  {weekPlan && (
                    <>
                      <WeeklyView
                        meso={viewMeso}
                        weekPlan={weekPlan}
                        actualSets={selectedWeek === (planning.activeMesocycle?.id === viewMeso.id ? planning.getCurrentWeekPlan()?.weekNumber : -1) ? actualSets : {}}
                        routines={routines}
                        onUpdateTarget={(mg, field, value) =>
                          planning.updateMuscleGroupTarget(viewMeso.id, weekPlan.weekNumber, mg, { [field]: value })
                        }
                        onToggleDeload={() =>
                          planning.updateWeeklyPlan(viewMeso.id, weekPlan.weekNumber, { isDeload: !weekPlan.isDeload })
                        }
                      />
                      <WeeklyScheduleEditor
                        meso={viewMeso}
                        weekPlan={weekPlan}
                        routines={routines}
                        onSchedule={(day, routineId) =>
                          planning.scheduleRoutineForDay(viewMeso.id, weekPlan.weekNumber, day, routineId)
                        }
                        onUnschedule={(day, routineId) =>
                          planning.unscheduleRoutineFromDay(viewMeso.id, weekPlan.weekNumber, day, routineId)
                        }
                        onToggleRest={(day) =>
                          planning.toggleRestDay(viewMeso.id, weekPlan.weekNumber, day)
                        }
                        onSync={() => planning.syncWeekToRoutinesPlanner(weekPlan)}
                      />
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* ── Recuadro informativo ─────────────────────────────────────── */}
            <Card className="border-dashed border-gray-200 dark:border-gray-700">
              <CardContent className="py-4 px-5">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">📖 ¿Cómo funciona?</p>
                <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                  <li><strong className="text-gray-700 dark:text-gray-300">MEV</strong> — Volumen mínimo efectivo. Menos de esto y no hay adaptación.</li>
                  <li><strong className="text-gray-700 dark:text-gray-300">MAV</strong> — Rango óptimo de adaptación (zona verde). Apunta aquí.</li>
                  <li><strong className="text-gray-700 dark:text-gray-300">MRV</strong> — Máximo recuperable. Superar esto genera sobreentrenamiento.</li>
                  <li><strong className="text-gray-700 dark:text-gray-300">Gap</strong> — Diferencia entre lo planificado y lo realizado esta semana.</li>
                  <li className="pt-1 text-gray-400">La barra azul muestra tu objetivo; la verde, lo realizado. Activa un mesociclo para sincronizar con tus entrenamientos.</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </PageContent>
      </PageLayout>
    </ProtectedRoute>
  );
}
