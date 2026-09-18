"use client";

import React from 'react';
import { ChevronLeft, ChevronRight } from '@/components/icons/lucide';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import type { Routine } from '@/types';
import { getISOWeekdayIndex, getDayKey } from '@/lib/utils/dateUtils';

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

// Mostrar encabezado empezando en Lunes (ISO)
const DAY_NAMES_SHORT = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

type DayKey = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
type DayPlan = { routines: string[]; blocked?: boolean; note?: string };
type MonthlyPlan = Record<string, DayPlan>;
type WeeklyPlan = Partial<Record<DayKey, DayPlan>>;

const JS_DAY_TO_KEY: DayKey[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

interface MonthlyCalendarProps {
  currentDate: Date;
  monthlyPlan: MonthlyPlan;
  weeklyPlan?: WeeklyPlan;
  routines: Routine[];
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  onDayClick: (dateKey: string) => void;
  isLoading: boolean;
}

// Obtener días del mes en formato calendario
const getMonthDays = (year: number, month: number) => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  // Índice ISO: 0 = lunes, ... 6 = domingo
  const startingDayOfWeek = getISOWeekdayIndex(firstDay);
  
  const days: (Date | null)[] = [];
  
  // Días vacíos al inicio
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null);
  }
  
  // Días del mes
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(new Date(year, month, day));
  }
  
  return days;
};

// Formatear fecha como YYYY-MM-DD
const formatDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function MonthlyCalendar({
  currentDate,
  monthlyPlan,
  weeklyPlan = {},
  routines,
  onPreviousMonth,
  onNextMonth,
  onToday,
  onDayClick,
  isLoading
}: MonthlyCalendarProps) {
  const today = new Date();
  const todayKey = formatDateKey(today);

  // Obtiene el plan efectivo de un día: override mensual > plan semanal recurrente > vacío
  const getEffectivePlan = (date: Date, dateKey: string): DayPlan & { isFromWeekly?: boolean } => {
    if (monthlyPlan[dateKey]) return monthlyPlan[dateKey];
    const weekDayKey = getDayKey(date);
    const weekly = weeklyPlan[weekDayKey];
    if (weekly) return { ...weekly, isFromWeekly: true };
    return { routines: [], blocked: false, note: '' };
  };

  return (
    <div className="space-y-4">
      {/* Navegación del mes */}
      <div className="flex items-center justify-between bg-gray-800 p-4 rounded-lg">
        <Button variant="ghost" size="sm" onClick={onPreviousMonth}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        
        <div className="flex items-center gap-3">
          <h3 className="text-xl font-bold">
            {MONTH_NAMES[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
          <Button variant="ghost" size="sm" onClick={onToday}>
            Hoy
          </Button>
        </div>
        
        <Button variant="ghost" size="sm" onClick={onNextMonth}>
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Calendario */}
      <div className="bg-gray-900/60 rounded-lg p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" className="text-white" />
          </div>
        ) : (
          <>
            {/* Encabezados de días */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {DAY_NAMES_SHORT.map(day => (
                <div key={day} className="text-center text-xs font-semibold text-gray-400 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Días del mes */}
            <div className="grid grid-cols-7 gap-2">
              {getMonthDays(currentDate.getFullYear(), currentDate.getMonth()).map((date, index) => {
                if (!date) {
                  return <div key={`empty-${index}`} className="aspect-square" />;
                }

                const dateKey = formatDateKey(date);
                const dayPlan = getEffectivePlan(date, dateKey);
                const isFromWeekly = !!(dayPlan as any).isFromWeekly;
                const isToday = dateKey === todayKey;
                const isPast = date < new Date(new Date(today).setHours(0, 0, 0, 0));
                const hasRoutines = dayPlan.routines.length > 0;

                return (
                  <button
                    key={dateKey}
                    onClick={() => onDayClick(dateKey)}
                    className={`min-h-20 p-1.5 rounded-lg border transition-all text-left ${
                      dayPlan.blocked
                        ? 'bg-purple-900/20 border-purple-600/30 hover:bg-purple-900/30'
                        : hasRoutines
                        ? isFromWeekly
                          ? 'bg-blue-900/15 border-blue-600/25 hover:bg-blue-900/25'
                          : 'bg-emerald-900/20 border-emerald-600/30 hover:bg-emerald-900/30'
                        : 'bg-gray-800/60 border-gray-700/60 hover:bg-gray-700/60'
                    } ${isToday ? 'ring-2 ring-blue-500' : ''} ${
                      isPast ? 'opacity-50' : ''
                    }`}
                  >
                    <div className="flex flex-col h-full gap-0.5">
                      {/* Número del día */}
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold ${
                          isToday ? 'text-blue-400' : isPast ? 'text-gray-500' : 'text-gray-300'
                        }`}>
                          {date.getDate()}
                        </span>
                        {hasRoutines && (
                          <span className={`text-[9px] font-semibold px-1 py-0.5 rounded ${
                            isFromWeekly
                              ? 'bg-blue-700/60 text-blue-200'
                              : 'bg-emerald-700/60 text-emerald-200'
                          }`}>
                            {dayPlan.routines.length}
                          </span>
                        )}
                      </div>

                      {/* Contenido del día */}
                      {dayPlan.blocked ? (
                        <div className="text-[9px] text-purple-400 font-medium">💤 Descanso</div>
                      ) : (
                        <div className="flex-1 overflow-hidden space-y-0.5">
                          {dayPlan.routines.slice(0, 3).map(rid => {
                            const routine = routines.find(r => r.id === rid);
                            return routine ? (
                              <div
                                key={rid}
                                className={`text-[9px] truncate leading-tight px-1 py-px rounded ${
                                  isFromWeekly
                                    ? 'text-blue-300 bg-blue-900/20'
                                    : 'text-emerald-300 bg-emerald-900/20'
                                }`}
                              >
                                {routine.name}
                              </div>
                            ) : null;
                          })}
                          {dayPlan.routines.length > 3 && (
                            <div className="text-[9px] text-gray-500 px-1">
                              +{dayPlan.routines.length - 3} más
                            </div>
                          )}
                        </div>
                      )}

                      {/* Indicador de origen */}
                      {isFromWeekly && hasRoutines && (
                        <div className="text-[8px] text-blue-500/70 mt-auto">↻ semanal</div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Exportar funciones auxiliares
export { formatDateKey };
