"use client";

import React, { useEffect, useState, DragEvent, useRef } from 'react';
import { GripVertical, ChevronLeft, ChevronRight } from '@/components/icons/lucide';
import { useRoutines } from '@/context/GymContext';
import { Button } from '@/components/ui/Button';
import { useConfirm } from '@/context/ConfirmContext';
import { useToast } from '@/context/ToastContext';
import { getWeeklyPlan, saveWeeklyPlan, getMonthlyPlan, saveMonthlyPlan } from '@/lib/storage/storage';
import MonthlyCalendar from '@/components/MonthlyCalendar';
import DayPlanModal from '@/components/DayPlanModal';

type DayKey = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
type ViewMode = 'weekly' | 'monthly';

const DAYS: DayKey[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const LABELS: Record<DayKey, string> = {
  monday: 'Lunes',
  tuesday: 'Martes',
  wednesday: 'Miércoles',
  thursday: 'Jueves',
  friday: 'Viernes',
  saturday: 'Sábado',
  sunday: 'Domingo'
};

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const DAY_NAMES_SHORT = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

type DayPlan = { routines: string[]; blocked?: boolean; note?: string };
type Plan = Record<DayKey, DayPlan>;
type MonthlyPlan = Record<string, DayPlan>; // key: 'YYYY-MM-DD'

export default function WeeklyPlanner({ searchQuery = '' }: { searchQuery?: string }) {
  const { routines, loading: routinesLoading } = useRoutines();
  const { confirm } = useConfirm();
  const { info } = useToast();

  const [viewMode, setViewMode] = useState<ViewMode>('weekly');
  const [currentDate, setCurrentDate] = useState(new Date());

  const defaultPlan: Plan = DAYS.reduce((acc, d) => ({ ...acc, [d]: { routines: [], blocked: false, note: '' } }), {} as Plan);
  const [plan, setPlan] = useState<Plan>(defaultPlan);
  const [monthlyPlan, setMonthlyPlan] = useState<MonthlyPlan>({});
  const [isLoadingPlan, setIsLoadingPlan] = useState(true);
  const [selectedDayByRoutine, setSelectedDayByRoutine] = useState<Record<string, DayKey | ''>>({});
  const [selectedWeekDay, setSelectedWeekDay] = useState<DayKey | null>(null);
  const [selectedMonthDay, setSelectedMonthDay] = useState<string | null>(null);
  const daysRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // Cargar plan semanal
        const stored = await getWeeklyPlan();
        if (!mounted) return;
        if (!stored) {
          setIsLoadingPlan(false);
          return;
        }
        const parsed = stored as any;
        if (Array.isArray(parsed) === false && Object.values(parsed).every((v: any) => Array.isArray(v))) {
          const converted = DAYS.reduce((acc, d) => ({ ...acc, [d]: { routines: parsed[d] || [] } }), {} as any) as Plan;
          setPlan(converted);
        } else {
          const normalized = DAYS.reduce((acc, d) => ({
            ...acc,
            [d]: {
              routines: (parsed[d]?.routines as string[]) || (parsed[d] as string[]) || [],
              blocked: parsed[d]?.blocked || false,
              note: parsed[d]?.note || ''
            }
          }), {} as any) as Plan;
          setPlan(normalized);
        }
        
        // Cargar plan mensual
        const monthlyStored = await getMonthlyPlan();
        if (mounted && monthlyStored) {
          setMonthlyPlan(monthlyStored);
        }
      } catch (e) {
        console.warn('Error loading plans, using local default', e);
      } finally {
        if (mounted) setIsLoadingPlan(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (isLoadingPlan) return;
    try { saveWeeklyPlan(plan); } catch (e) { /* ignore */ }
  }, [plan, isLoadingPlan]);

  useEffect(() => {
    if (isLoadingPlan) return;
    try { saveMonthlyPlan(monthlyPlan); } catch (e) { /* ignore */ }
  }, [monthlyPlan, isLoadingPlan]);

  const updateIndicators = () => {
    const el = daysRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  };

  const onDragStart = (e: DragEvent, id: string) => {
    try { e.dataTransfer?.setData('text/plain', id); } catch (err) { }
  };

  const onDragOver = (e: DragEvent) => { e.preventDefault(); };

  const onDropToDay = (e: DragEvent, day: DayKey) => {
    e.preventDefault();
    try {
      const id = e.dataTransfer?.getData('text/plain');
      if (id) addRoutineToDay(id, day);
    } catch (err) { }
  };

  const removeFromDay = (day: DayKey, rid: string) => {
    setPlan(prev => ({ ...prev, [day]: { ...prev[day], routines: prev[day].routines.filter(x => x !== rid) } }));
  };

  const clearPlan = () => {
    setPlan(defaultPlan);
    try { saveWeeklyPlan(defaultPlan); } catch (e) { }
  };

  // Funciones para calendario mensual
  const formatDateKey = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const addRoutineToMonthDay = (routineId: string, dateKey: string) => {
    if (!dateKey) return;
    
    setMonthlyPlan(prev => {
      const dayPlan = prev[dateKey] || { routines: [], blocked: false, note: '' };
      
      if (dayPlan.blocked) {
        try { info('Ese día está bloqueado. Desbloquéalo primero.'); } catch { }
        return prev;
      }
      
      if (dayPlan.routines.includes(routineId)) {
        try { info('Esta rutina ya está asignada a este día'); } catch { }
        return prev;
      }
      
      return {
        ...prev,
        [dateKey]: {
          ...dayPlan,
          routines: [...dayPlan.routines, routineId]
        }
      };
    });
  };

  const removeFromMonthDay = (dateKey: string, routineId: string) => {
    setMonthlyPlan(prev => {
      const dayPlan = prev[dateKey];
      if (!dayPlan) return prev;
      
      return {
        ...prev,
        [dateKey]: {
          ...dayPlan,
          routines: dayPlan.routines.filter(id => id !== routineId)
        }
      };
    });
  };

  const toggleBlockMonthDay = (dateKey: string) => {
    setMonthlyPlan(prev => {
      const dayPlan = prev[dateKey] || { routines: [], blocked: false, note: '' };
      return {
        ...prev,
        [dateKey]: {
          ...dayPlan,
          blocked: !dayPlan.blocked,
          routines: dayPlan.blocked ? dayPlan.routines : [] // Limpiar rutinas al bloquear
        }
      };
    });
  };

  const saveMonthDayNote = (dateKey: string, note: string) => {
    setMonthlyPlan(prev => {
      const dayPlan = prev[dateKey] || { routines: [], blocked: false, note: '' };
      return {
        ...prev,
        [dateKey]: {
          ...dayPlan,
          note
        }
      };
    });
  };

  const toggleBlockWeekDay = (day: DayKey) => {
    setPlan(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        blocked: !prev[day].blocked,
        routines: prev[day].blocked ? prev[day].routines : [] // Limpiar rutinas al bloquear
      }
    }));
  };

  const saveWeekDayNote = (day: DayKey, note: string) => {
    setPlan(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        note
      }
    }));
  };

  const filteredRoutines = routines.filter(r => {
    if (!searchQuery) return true;
    return (r.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || (r.description || '').toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Todas las rutinas están disponibles para asignar a cualquier día (pueden repetirse)
  const availableRoutines = filteredRoutines;

  const addRoutineToDay = (routineId: string, day: DayKey | '') => {
    if (!day) {
      try { info('Selecciona un día primero'); } catch { };
      return;
    }
    if (plan[day]?.blocked) {
      try { info('Ese día está bloqueado (descanso). Desbloquéalo primero para agregar rutinas.'); } catch { };
      return;
    }
    // Verificar si la rutina ya está asignada a ese día
    if (plan[day]?.routines?.includes(routineId)) {
      try { info('Esta rutina ya está asignada a este día'); } catch { };
      return;
    }
    setPlan(prev => {
      const next = { ...prev } as Plan;
      // Agregar la rutina al día sin eliminarla de otros días (permitir repetición)
      if (!next[day].routines.includes(routineId)) {
        next[day].routines = [...next[day].routines, routineId];
      }
      return next;
    });
    // NO limpiar la selección para permitir agregar a más días
    // setSelectedDayByRoutine(prev => ({ ...prev, [routineId]: '' }));
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold">Planificador</h2>
          
          {/* Selector de vista */}
          <div className="flex gap-1 bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('weekly')}
              className={`px-3 py-1 rounded text-sm transition-all ${
                viewMode === 'weekly'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              📅 Semanal
            </button>
            <button
              onClick={() => setViewMode('monthly')}
              className={`px-3 py-1 rounded text-sm transition-all ${
                viewMode === 'monthly'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              🗓️ Mensual
            </button>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={async () => {
              try {
                const confirmed = await confirm({
                  title: 'Eliminar planificación',
                  message: `Se eliminará toda la planificación ${viewMode === 'weekly' ? 'semanal' : 'mensual'}. Esto no se puede deshacer. ¿Deseas continuar?`,
                  confirmText: 'Eliminar definitivamente',
                  cancelText: 'Cancelar',
                  variant: 'warning'
                });
                if (confirmed) {
                  if (viewMode === 'weekly') {
                    clearPlan();
                  } else {
                    setMonthlyPlan({});
                    try { saveMonthlyPlan({}); } catch (e) { }
                  }
                  try { info('Planificación eliminada'); } catch { }
                  try { console.log(`${viewMode} plan cleared`); } catch { }
                  try {
                    if (typeof window !== 'undefined' && (window as any).gtag) {
                      (window as any).gtag('event', `${viewMode}_plan_cleared`, { method: 'manual' });
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

          {/* <Button
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
          </Button> */}
        </div>
      </div>

      {/* Vista Mensual */}
      {viewMode === 'monthly' ? (
        <>
          <MonthlyCalendar
            currentDate={currentDate}
            monthlyPlan={monthlyPlan}
            routines={routines}
            onPreviousMonth={goToPreviousMonth}
            onNextMonth={goToNextMonth}
            onToday={goToToday}
            onDayClick={(dateKey) => setSelectedMonthDay(dateKey)}
            isLoading={isLoadingPlan || routinesLoading}
          />

          {/* Modal para gestionar día del mes */}
          {selectedMonthDay && (
            <DayPlanModal
              isOpen={!!selectedMonthDay}
              onClose={() => setSelectedMonthDay(null)}
              dateKey={selectedMonthDay}
              dayPlan={monthlyPlan[selectedMonthDay] || { routines: [], blocked: false, note: '' }}
              routines={routines}
              onAddRoutine={(routineId) => addRoutineToMonthDay(routineId, selectedMonthDay)}
              onRemoveRoutine={(routineId) => removeFromMonthDay(selectedMonthDay, routineId)}
              onToggleBlock={() => toggleBlockMonthDay(selectedMonthDay)}
              onSaveNote={(note) => saveMonthDayNote(selectedMonthDay, note)}
            />
          )}
        </>
      ) : (
        /* Vista Semanal */
        <>
      <div className="mb-2 relative">
        <div ref={daysRef} onScroll={updateIndicators} className="flex gap-3 overflow-x-auto py-2 -mx-2 md:mx-0 md:grid md:grid-cols-7 md:gap-3 touch-pan-x">
          {DAYS.map(day => (
            <button
              key={day}
              onClick={() => setSelectedWeekDay(day)}
              onDrop={(e) => onDropToDay(e as any, day)}
              onDragOver={onDragOver as any}
              className={`min-w-[120px] md:min-w-0 flex-shrink-0 md:flex-shrink p-4 rounded-lg shadow-sm min-h-[150px] text-left transition-all hover:scale-[1.02] ${plan[day]?.blocked ? 'bg-gradient-to-b from-red-800/10 to-red-800/5 border border-red-600/30' : ((plan[day]?.routines?.length || 0) > 0 ? 'border border-emerald-500 bg-gray-900/60 dark:bg-gray-800' : 'border border-gray-700 bg-gray-900/60 dark:bg-gray-800')}`}
            >
              <div className="mb-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-xs text-gray-400 uppercase tracking-wider ">{LABELS[day]}</div>
                    <div className="text-sm font-semibold text-white truncate">{plan[day]?.blocked ? `Descanso` :''}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`${(plan[day]?.routines?.length || 0) > 0 ? 'bg-emerald-600 text-white' : 'bg-gray-800/60 text-gray-400'} text-xs px-2 py-0.5 rounded-md`}>{plan[day]?.routines?.length || 0}</span>
                  </div>
                </div>
                <div className="mt-2 border-b border-gray-700/30" />
              </div>

              {/* Dia bloqueado */}
              {plan[day]?.blocked ? (
                <div className="space-y-2">
                  <div className="p-3 rounded-md bg-gradient-to-r from-red-900/10 to-red-900/5 border border-red-700/20 overflow-auto max-h-24">
                    <p className="text-sm font-semibold text-red-300">Día de descanso</p>
                    {plan[day]?.note ? (
                      <p className="text-xs text-gray-300 mt-1">{plan[day].note}</p>
                    ) : (
                      <p className="text-xs text-gray-400 mt-1">Sin nota</p>
                    )}
                  </div>
                </div>
              ) : (
                // Mostrar loader por día mientras se carga el plan o las rutinas
                (isLoadingPlan || routinesLoading) ? (
                  <div className="flex items-center justify-center py-6">
                    <div className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                      </svg>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* Rutinas del día */}
                    {(plan[day]?.routines || []).map(rid => {
                      const r = routines.find(x => x.id === rid);
                      if (!r) return null;
                      return (
                        <div key={rid} className="flex items-center justify-between bg-gray-800/40 hover:bg-gray-700/50 p-2 rounded-md border border-gray-700 transition-colors text-left overflow-auto max-h-20">
                          <p className="text-xs text-gray-100 ">{r.name}</p>
                        </div>
                      );
                    })}
                    
                    {/* Indicador de nota */}
                    {plan[day]?.note && (
                      <div className="text-xs text-gray-400 italic truncate">
                        📝 {plan[day].note}
                      </div>
                    )}
                  </div>
                )
              )}
            </button>
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
          {(isLoadingPlan || routinesLoading) ? (
            <div className="flex items-center justify-center py-6">
              <svg className="animate-spin h-6 w-6 text-gray-600 dark:text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
              <span className="ml-2 text-sm text-gray-500">Cargando rutinas...</span>
            </div>
          ) : availableRoutines.length === 0 ? (
            <div className="text-sm text-gray-500">No se encontraron rutinas</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {availableRoutines.map(r => (
                <div
                  key={r.id}
                  draggable
                  onDragStart={(e) => onDragStart(e, r.id)}
                  className="p-2 border rounded-md bg-gray-900/60 border-gray-700 flex items-center gap-2 w-full hover:shadow-sm hover:scale-[1.006] transition-transform text-sm"
                >
                  <div className="text-gray-400 flex-shrink-0 mr-1">
                    <GripVertical className="w-4 h-4 cursor-grab opacity-80 hover:opacity-100" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-medium text-sm text-white truncate">{r.name}</div>
                      <div className="text-xs text-gray-400 ml-2 px-2 py-0.5 bg-gray-800/50 rounded-md">{r.exercises.length}</div>
                    </div>
                    {r.description ? <div className="text-xs text-gray-500 truncate mt-1">{r.description}</div> : null}
                  </div>

                  <div className="flex items-center gap-2 w-36 sm:w-40">
                    <div className="w-full">
                      <select
                        value={selectedDayByRoutine[r.id] ?? ''}
                        onChange={(e) => setSelectedDayByRoutine(prev => ({ ...prev, [r.id]: e.target.value as DayKey | '' }))}
                        className="block w-full px-2 py-1 bg-gray-800 border border-gray-700 text-sm text-gray-200 rounded-md focus:outline-none"
                        aria-label={`Seleccionar día para ${r.name}`}
                        title={`Seleccionar día para ${r.name}`}
                      >
                        <option value="">Seleccionar...</option>
                        {DAYS.map(d => {
                          const alreadyAdded = Array.isArray(plan[d]?.routines) && plan[d].routines.includes(r.id);
                          const isBlocked = !!plan[d]?.blocked;
                          if (isBlocked) return null;
                          return (
                            <option key={d} value={d}>
                              {LABELS[d]}{alreadyAdded ? ' ✓' : ''}
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    <Button
                      variant="gradient"
                      className="rounded-full p-0 w-8 h-8 flex items-center justify-center"
                      size="sm"
                      aria-label={`Agregar ${r.name} al día seleccionado`}
                      onClick={() => addRoutineToDay(r.id, (selectedDayByRoutine[r.id] ?? '') as DayKey | '')}
                      disabled={!(selectedDayByRoutine[r.id])}
                    >
                      +
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal para gestionar día de la semana */}
      {selectedWeekDay && (
        <DayPlanModal
          isOpen={!!selectedWeekDay}
          onClose={() => setSelectedWeekDay(null)}
          dateKey={selectedWeekDay}
          dayPlan={plan[selectedWeekDay]}
          routines={routines}
          onAddRoutine={(routineId) => addRoutineToDay(routineId, selectedWeekDay)}
          onRemoveRoutine={(routineId) => removeFromDay(selectedWeekDay, routineId)}
          onToggleBlock={() => toggleBlockWeekDay(selectedWeekDay)}
          onSaveNote={(note) => saveWeekDayNote(selectedWeekDay, note)}
          isWeeklyView={true}
        />
      )}
        </>
      )}
    </div>
  );
}
