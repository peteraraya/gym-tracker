"use client";

import React, { useEffect, useState, DragEvent, useRef } from 'react';
import { GripVertical } from 'lucide-react';
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

export default function WeeklyPlanner({ searchQuery = '' }: { searchQuery?: string }) {
  const { routines } = useGym();
  const { confirm } = useConfirm();
  const { info } = useToast();
  const daysRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [exporting, setExporting] = useState(false);

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

  // const handleExportPDF = () => {
  //   try {
  //     const routinesMap = routines.reduce((acc, r) => ({ ...acc, [r.id]: r }), {} as Record<string, any>);
  //     const content = DAYS.map(d => {
  //       const day = plan[d];
  //       const items = (day?.routines || []).map(id => {
  //         const r = routinesMap[id];
  //         return `<li><strong>${r?.name || id}</strong> — ${r?.exercises?.length || 0} ejercicios</li>`;
  //       }).join('');
  //       return `
  //         <section style="margin-bottom:14px">
  //           <h3 style="margin:0 0 6px 0">${LABELS[d]}</h3>
  //           <div style="font-size:12px;color:#444;margin-bottom:6px">Nota: ${day?.note || ''}</div>
  //           <ul style="margin:0 0 0 18px">${items || '<li style="color:#888">(sin rutinas)</li>'}</ul>
  //         </section>`;
  //     }).join('\n');

  //     const html = `<!doctype html><html><head><meta charset="utf-8"><title>Plan semanal</title><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{font-family:Inter,system-ui,Arial,Helvetica,sans-serif;padding:20px;color:#111}h1{font-size:18px;margin-bottom:12px}h3{font-size:14px;margin:6px 0}ul{margin:6px 0 12px 18px;padding:0}@media print{button{display:none}}</style></head><body><h1>Plan semanal — ${new Date().toLocaleString()}</h1>${content}</body><script>window.onload=function(){setTimeout(()=>{window.print();},200);}</script></html>`;

  //     const w = window.open('', '_blank');
  //     if (!w) {
  //       try { info('Permite ventanas emergentes para exportar PDF'); } catch {}
  //       return;
  //     }
  //     w.document.write(html);
  //     w.document.close();
  //   } catch (e) {
  //     console.error('Export PDF failed', e);
  //     try { info('Error al generar PDF'); } catch {}
  //   }
  // };

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

  const availableRoutines = routines.filter(r => !Object.values(plan).flatMap((d: PlanDay) => d.routines).includes(r.id));

  const [selectedDayByRoutine, setSelectedDayByRoutine] = useState<Record<string, DayKey | ''>>({});

  const filteredRoutines = availableRoutines.filter(r => {
    if (!searchQuery) return true;
    return r.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

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
          <Button
            variant="ghost"
            size="sm"
            onClick={async () => {
              try {
                const confirmed = await confirm({
                  title: 'Eliminar planificación',
                  message: 'Se eliminará toda la planificación semanal. Esto no se puede deshacer. ¿Deseas continuar?',
                  confirmText: 'Eliminar definitivamente',
                  cancelText: 'Cancelar',
                  variant: 'warning'
                });
                if (confirmed) {
                  clearPlan();
                  try { info('Planificación eliminada'); } catch {}
                  try { console.log('Weekly plan cleared'); } catch {}
                  try {
                    if (typeof window !== 'undefined' && (window as any).gtag) {
                      (window as any).gtag('event', 'weekly_plan_cleared', { method: 'manual' });
                    }
                  } catch (e) {
                    // ignore analytics errors
                  }
                }
              } catch (e) {
                // ignore
              }
            }}
          >
            Limpiar
          </Button>
         
          <Button
            variant={exporting ? 'primary' : 'ghost'}
            size="sm"
            disabled={exporting}
            aria-busy={exporting}
            onClick={async () => {
              setExporting(true);
              try {
                const routinesMap = routines.reduce((acc, r) => ({ ...acc, [r.id]: r }), {} as Record<string, any>);
                const res = await fetch('/api/weekly-export', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ plan, routines: routinesMap })
                });
                if (!res.ok) throw new Error('Export failed');
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `weekly-plan-${new Date().toISOString().slice(0,10)}.pdf`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(url);
                try { info('PDF descargado desde servidor'); } catch {}
              } catch (e) {
                console.error('Server export error', e);
                try { info('Error al exportar PDF en servidor'); } catch {}
              } finally {
                setExporting(false);
              }
            }}
          >
            {exporting ? 'Exportando...' : 'Exportar PDF'}
          </Button>
        </div>
      </div>

      <div className="mb-2 relative">
        <div ref={daysRef} onScroll={updateIndicators} className="flex gap-2 overflow-x-auto py-2 -mx-2 sm:mx-0 sm:grid sm:grid-cols-7 sm:gap-2 touch-pan-x">
        {DAYS.map(day => (
          <div
            key={day}
            onDrop={(e) => onDropToDay(e as any, day)}
            onDragOver={onDragOver as any}
            className={`min-w-[110px] sm:min-w-0 flex-shrink-0 sm:flex-shrink p-3 rounded-lg shadow-sm ${plan[day]?.blocked ? 'bg-gradient-to-b from-red-900/10 to-red-900/5 border border-red-700/40' : ((plan[day]?.routines?.length || 0) > 0 ? 'border border-emerald-500 bg-gray-900/50 dark:bg-gray-800' : 'border border-gray-700 bg-gray-900/50 dark:bg-gray-800')}`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-sm text-white">{LABELS[day]}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 px-2 py-0.5 bg-gray-800/60 rounded-md">{plan[day]?.routines?.length || 0}</span>
                <button
                  title={(plan[day]?.routines?.length || 0) > 0
                    ? 'No puedes bloquear un día que tiene rutinas'
                    : (plan[day]?.blocked ? 'Día bloqueado (descanso). Haz clic para editar nota o desbloquear.' : 'Marcar como día de descanso')
                  }
                  onClick={async (e) => {
                    e.stopPropagation();
                    if ((plan[day]?.routines?.length || 0) > 0) return;
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
                  disabled={(plan[day]?.routines?.length || 0) > 0}
                  className={`inline-flex items-center gap-2 text-xs px-2 py-1 rounded-md border ${plan[day]?.blocked ? 'bg-red-700/10 border-red-700 text-red-300' : 'bg-gray-800/30 border-gray-700 text-gray-200'} ${ (plan[day]?.routines?.length || 0) > 0 ? 'opacity-50 cursor-not-allowed' : '' }`}
                >
                  {plan[day]?.blocked ? '😴 Descanso' : 'Bloquear'}
                </button>
              </div>
            </div>

            {plan[day]?.blocked ? (
              <div className="space-y-2">
                <div className="p-3 rounded-md bg-gradient-to-r from-red-900/10 to-red-900/5 border border-red-700/20">
                  <div className="text-sm font-semibold text-red-300">Día de descanso</div>
                  {plan[day]?.note ? (
                    <div className="text-xs text-gray-300 mt-1">{plan[day].note}</div>
                  ) : (
                    <div className="text-xs text-gray-400 mt-1">Sin nota</div>
                  )}
                </div>
                <div className="flex gap-2 flex-col">
                  <Button
                    className="text-sm"
                    variant="info"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingDay(day);
                      setEditingNote(plan[day]?.note || '');
                      setIsNoteModalOpen(true);
                    }}
                  >Editar nota</Button>
                  <Button
                    variant="danger"
                    block
                    className="text-sm"
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
                  >Desbloquear</Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {(plan[day]?.routines || []).map(rid => {
                  const r = routines.find(x => x.id === rid);
                  if (!r) return null;
                  return (
                    <div key={rid} className="flex items-center justify-between bg-gray-800/40 p-2 rounded-md border border-gray-700">
                      <div className="text-sm text-gray-100">{r.name}</div>
                      <button onClick={() => removeFromDay(day, rid)} className="text-red-400 text-sm">✕</button>
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

        {/* El input de búsqueda principal está en la página de Rutinas; este componente usa la prop `searchQuery`. */}

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
                  className="p-3 border rounded-md bg-gray-900/60 border-gray-700 flex items-center gap-3 w-full"
                >
                  <div className="text-gray-500"><GripVertical className="w-4 h-4 cursor-grab" /></div>

                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-white truncate">{r.name}</div>
                    <div className="text-xs text-gray-400">{r.exercises.length} ejercicios</div>
                  </div>

                  <div className="flex items-center gap-0 w-44 sm:w-56">
                    <select
                      value={selectedDayByRoutine[r.id] ?? ''}
                      onChange={(e) => setSelectedDayByRoutine(prev => ({ ...prev, [r.id]: e.target.value as DayKey }))}
                      className="block w-full px-3 py-2 bg-gray-800 border border-r-0 border-gray-700 text-sm text-gray-200 rounded-l-md focus:outline-none"
                    >
                      <option value="">Seleccionar día...</option>
                      {DAYS.map(d => {
                        const alreadyAdded = Array.isArray(plan[d]?.routines) && plan[d].routines.includes(r.id);
                        if (alreadyAdded) return null;
                        const isBlocked = !!plan[d]?.blocked;
                        return (
                          <option key={d} value={d} disabled={isBlocked}>
                            {LABELS[d]}{isBlocked ? ' (descanso)' : ''}
                          </option>
                        );
                      })}
                    </select>
                    <Button
                      variant="gradient"
                      className="ml-1 rounded-4xl"
                      size="sm"
                      onClick={() => addRoutineToDay(r.id, selectedDayByRoutine[r.id] ?? '')}
                    >+</Button>
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
