"use client";

import React, { useEffect, useState, DragEvent, useRef } from 'react';
import { useGym } from '@/context/GymContext';
import { Button } from '@/components/ui/Button';
import { useConfirm } from '@/context/ConfirmContext';
import { useToast } from '@/context/ToastContext';

type DayKey = 'monday'|'tuesday'|'wednesday'|'thursday'|'friday'|'saturday'|'sunday';

const DAYS: DayKey[] = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];

const LABELS: Record<DayKey,string> = {
  monday: 'Lun',
  tuesday: 'Mar',
  wednesday: 'Mié',
  thursday: 'Jue',
  friday: 'Vie',
  saturday: 'Sáb',
  sunday: 'Dom'
};

const STORAGE_KEY = 'weekly_routine_plan';

type PlanDay = {
  routines: string[];
  blocked?: boolean; // día de descanso
  note?: string;     // texto editable asociado al día
};

type Plan = Record<DayKey, PlanDay>;

export default function WeeklyPlanner() {
  const { routines } = useGym();
  const { confirm } = useConfirm();
  const { info } = useToast();
  const daysRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateIndicators = () => {
    const el = daysRef.current;
    if (!el) {
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  };

  useEffect(() => {
    updateIndicators();
    const onResize = () => updateIndicators();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  const [plan, setPlan] = useState<Plan>(() => {
    try {
      if (typeof window === 'undefined') return DAYS.reduce((acc, d) => ({...acc, [d]: { routines: [] }}), {} as any) as Plan;
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return DAYS.reduce((acc, d) => ({...acc, [d]: { routines: [] }}), {} as any) as Plan;
      const parsed = JSON.parse(raw);
      // Compatibilidad: si el formato antiguo era Record<DayKey,string[]>, convertir
      if (Array.isArray(parsed) === false && Object.values(parsed).every(v => Array.isArray(v))) {
        const converted = DAYS.reduce((acc, d) => ({...acc, [d]: { routines: parsed[d] || [] }}), {} as any) as Plan;
        return converted;
      }
      // Si ya tiene la forma nueva, devolverlo y normalizar campos
      const normalized = DAYS.reduce((acc, d) => ({
        ...acc,
        [d]: {
          routines: (parsed[d]?.routines as string[]) || (parsed[d] as string[]) || [],
          blocked: parsed[d]?.blocked || false,
          note: parsed[d]?.note || ''
        }
      }), {} as any) as Plan;
      return normalized;
    } catch {
      return DAYS.reduce((acc, d) => ({...acc, [d]: { routines: [] }}), {} as any) as Plan;
    }
  });

  // Modal state para editar nota del día
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [editingDay, setEditingDay] = useState<DayKey | null>(null);
  const [editingNote, setEditingNote] = useState('');

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(plan)); } catch {};
  }, [plan]);

  const onDragStart = (e: DragEvent, routineId: string) => {
    e.dataTransfer.setData('text/plain', routineId);
  };

  const onDropToDay = (e: DragEvent, day: DayKey) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    if (!id) return;
    // no permitir drop si el día está bloqueado
    if (plan[day]?.blocked) return;

    setPlan(prev => {
      const next = { ...prev } as Plan;
      // remove id from any day
      for (const d of DAYS) {
        next[d] = { ...next[d], routines: next[d].routines.filter(x => x !== id) };
      }
      // append to target day if not present
      if (!next[day].routines.includes(id)) next[day].routines = [...next[day].routines, id];
      return next;
    });
  };

  const onDragOver = (e: DragEvent) => { e.preventDefault(); };

  const removeFromDay = (day: DayKey, id: string) => {
    setPlan(prev => ({ ...prev, [day]: { ...prev[day], routines: prev[day].routines.filter(x => x !== id) } }));
  };

  const clearPlan = () => {
    const empty = DAYS.reduce((acc, d) => ({...acc, [d]: { routines: [] }}), {} as any) as Plan;
    setPlan(empty);
  };

  const availableRoutines = routines.filter(r => !Object.values(plan).flat().includes(r.id));

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDayByRoutine, setSelectedDayByRoutine] = useState<Record<string, DayKey | ''>>({});

  const filteredRoutines = availableRoutines.filter(r => {
    if (!searchQuery) return true;
    return r.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Propagar el valor del buscador para que otras vistas (p. ej. lista principal) también filtren
  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      localStorage.setItem('weekly_routines_search', searchQuery);
      // Dispatch custom event so other components in same tab can react immediately
      try {
        window.dispatchEvent(new CustomEvent('weekly_routines_search_changed', { detail: searchQuery }));
      } catch (e) {
        // ignore
      }
    } catch (e) {
      // ignore
    }
  }, [searchQuery]);

  const addRoutineToDay = (routineId: string, day: DayKey | '') => {
    if (!day) {
      try { info('Selecciona un día primero'); } catch {};
      return;
    }
    if (plan[day]?.blocked) {
      try { info('Ese día está bloqueado (descanso). Desbloquéalo primero para agregar rutinas.'); } catch {};
      return;
    }
    setPlan(prev => {
      const next = { ...prev } as Plan;
      // remove from other days
      for (const d of DAYS) {
        next[d] = { ...next[d], routines: next[d].routines.filter(x => x !== routineId) };
      }
      if (!next[day].routines.includes(routineId)) next[day].routines = [...next[day].routines, routineId];
      return next;
    });
    // clear selection
    setSelectedDayByRoutine(prev => ({ ...prev, [routineId]: '' }));
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Planificador semanal</h2>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={clearPlan}>Limpiar</Button>
        </div>
      </div>

      <div className="mb-2 relative">
        <div ref={daysRef} onScroll={updateIndicators} className="flex gap-2 overflow-x-auto py-2 -mx-2 sm:mx-0 sm:grid sm:grid-cols-7 sm:gap-2 touch-pan-x">
        {DAYS.map(day => (
          <div
            key={day}
            onDrop={(e) => onDropToDay(e as any, day)}
            onDragOver={onDragOver as any}
            className={`min-w-[92px] sm:min-w-0 flex-shrink-0 sm:flex-shrink p-2 border rounded ${plan[day]?.blocked ? 'bg-gray-100 dark:bg-gray-700/60 border-dashed border-red-300' : 'bg-white dark:bg-gray-800'}`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">{LABELS[day]}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">{plan[day]?.routines?.length || 0}</span>
                <button
                  title={plan[day]?.blocked ? 'Día bloqueado (descanso). Haz clic para editar nota o desbloquear.' : 'Marcar como día de descanso'}
                  onClick={async (e) => {
                    e.stopPropagation();
                    if (plan[day]?.blocked) {
                      // desbloquear mediante confirm modal
                      try {
                        const confirmed = await confirm({
                          title: 'Desbloquear día',
                          message: 'Desbloquear día de descanso? Se perderá la nota asociada.',
                          confirmText: 'Desbloquear',
                          cancelText: 'Cancelar',
                          variant: 'warning'
                        });
                        if (confirmed) setPlan(prev => ({ ...prev, [day]: { ...prev[day], blocked: false, note: '' } }));
                      } catch (e) {
                        // ignore
                      }
                    } else {
                      setPlan(prev => ({ ...prev, [day]: { ...prev[day], blocked: !prev[day].blocked } }));
                    }
                  }}
                  className={`text-xs px-2 py-1 rounded ${plan[day]?.blocked ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}
                >
                  {plan[day]?.blocked ? 'Descanso' : 'Bloquear'}
                </button>
              </div>
            </div>

            {plan[day]?.blocked ? (
              <div className="space-y-2">
                <div className="p-3 bg-red-50 dark:bg-red-900/10 rounded">
                  <div className="text-sm font-medium text-red-700 dark:text-red-200">Día de descanso</div>
                  {plan[day]?.note ? (
                    <div className="text-xs text-gray-600 dark:text-gray-300 mt-1">{plan[day].note}</div>
                  ) : (
                    <div className="text-xs text-gray-500 mt-1">Sin nota</div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    className="text-sm text-blue-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingDay(day);
                      setEditingNote(plan[day]?.note || '');
                      setIsNoteModalOpen(true);
                    }}
                  >Editar nota</button>
                  <button
                    className="text-sm text-red-600"
                    onClick={async (e) => {
                      e.stopPropagation();
                      try {
                        const confirmed = await confirm({
                          title: 'Desbloquear día',
                          message: 'Desbloquear día de descanso? Se perderá la nota asociada.',
                          confirmText: 'Desbloquear',
                          cancelText: 'Cancelar',
                          variant: 'warning'
                        });
                        if (confirmed) setPlan(prev => ({ ...prev, [day]: { ...prev[day], blocked: false, note: '' } }));
                      } catch (e) {}
                    }}
                  >Desbloquear</button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {(plan[day]?.routines || []).map(rid => {
                  const r = routines.find(x => x.id === rid);
                  if (!r) return null;
                  return (
                    <div key={rid} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-2 rounded">
                      <div className="text-sm">{r.name}</div>
                      <button onClick={() => removeFromDay(day, rid)} className="text-red-500 text-sm">✕</button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
        </div>

        {/* Scroll indicators */}
        <div className={`pointer-events-none absolute left-0 top-0 bottom-0 w-6 flex items-center transition-opacity ${canScrollLeft ? 'opacity-100' : 'opacity-0'}`}>
          <div className="h-full w-full bg-gradient-to-r from-white/90 to-transparent dark:from-gray-900/80" />
        </div>
        <div className={`pointer-events-none absolute right-0 top-0 bottom-0 w-6 flex items-center transition-opacity ${canScrollRight ? 'opacity-100' : 'opacity-0'}`}>
          <div className="h-full w-full bg-gradient-to-l from-white/90 to-transparent dark:from-gray-900/80" />
        </div>
      </div>

      <div className="mt-4">
        <h3 className="text-sm font-medium mb-2">Rutinas disponibles (arrastra al día o usa el selector)</h3>

        <div className="mb-3 flex items-center gap-2">
          <input
            type="search"
            placeholder="Buscar rutinas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-2 border rounded bg-white dark:bg-gray-800"
          />
        </div>

        <div className="max-h-64 overflow-auto p-2 border rounded bg-white dark:bg-gray-800">
          {filteredRoutines.length === 0 ? (
            <div className="text-sm text-gray-500">No se encontraron rutinas</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {filteredRoutines.map(r => (
                <div
                  key={r.id}
                  draggable
                  onDragStart={(e) => onDragStart(e, r.id)}
                  className="p-2 border rounded bg-white dark:bg-gray-900/30 flex flex-col gap-2 w-full"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium text-sm">{r.name}</div>
                      <div className="text-xs text-gray-500">{r.exercises.length} ejercicios</div>
                    </div>
                    <div className="text-xs text-gray-400">↕</div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch gap-2">
                    <select
                      value={selectedDayByRoutine[r.id] ?? ''}
                      onChange={(e) => setSelectedDayByRoutine(prev => ({ ...prev, [r.id]: e.target.value as DayKey }))}
                      className="w-full sm:flex-1 p-1 border rounded bg-white dark:bg-gray-800 text-sm"
                    >
                      <option value="">Seleccionar día...</option>
                      {DAYS.map(d => (<option key={d} value={d}>{LABELS[d]}</option>))}
                    </select>
                    <button
                      type="button"
                      onClick={() => addRoutineToDay(r.id, selectedDayByRoutine[r.id] ?? '')}
                      className="w-full sm:w-auto p-1 px-2 bg-blue-600 text-white rounded text-sm"
                    >Agregar</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal simple para editar nota del día */}
      {isNoteModalOpen && editingDay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsNoteModalOpen(false)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md z-10">
            <h3 className="text-lg font-semibold mb-3">Nota para {LABELS[editingDay]}</h3>
            <textarea
              value={editingNote}
              onChange={(e) => setEditingNote(e.target.value)}
              rows={5}
              className="w-full p-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
            <div className="mt-4 flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setIsNoteModalOpen(false)}>Cancelar</Button>
              <Button
                variant="primary"
                onClick={() => {
                  if (!editingDay) return;
                  setPlan(prev => ({ ...prev, [editingDay]: { ...prev[editingDay], note: editingNote } }));
                  setIsNoteModalOpen(false);
                }}
              >Guardar</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
