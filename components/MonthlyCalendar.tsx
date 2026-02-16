"use client";

import React from 'react';
import { ChevronLeft, ChevronRight } from '@/components/icons/lucide';
import { Button } from '@/components/ui/Button';
import type { Routine } from '@/types';

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const DAY_NAMES_SHORT = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

type DayPlan = { routines: string[]; blocked?: boolean; note?: string };
type MonthlyPlan = Record<string, DayPlan>;

interface MonthlyCalendarProps {
  currentDate: Date;
  monthlyPlan: MonthlyPlan;
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
  const startingDayOfWeek = firstDay.getDay();
  
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
  routines,
  onPreviousMonth,
  onNextMonth,
  onToday,
  onDayClick,
  isLoading
}: MonthlyCalendarProps) {
  const today = new Date();
  const todayKey = formatDateKey(today);

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
            <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
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
                const dayPlan = monthlyPlan[dateKey] || { routines: [], blocked: false, note: '' };
                const isToday = dateKey === todayKey;
                const isPast = date < new Date(today.setHours(0, 0, 0, 0));

                return (
                  <button
                    key={dateKey}
                    onClick={() => onDayClick(dateKey)}
                    className={`aspect-square p-2 rounded-lg border transition-all hover:scale-105 ${
                      dayPlan.blocked
                        ? 'bg-red-900/20 border-red-600/30 hover:bg-red-900/30'
                        : dayPlan.routines.length > 0
                        ? 'bg-emerald-900/20 border-emerald-600/30 hover:bg-emerald-900/30'
                        : 'bg-gray-800 border-gray-700 hover:bg-gray-700'
                    } ${isToday ? 'ring-2 ring-blue-500' : ''} ${
                      isPast ? 'opacity-60' : ''
                    }`}
                  >
                    <div className="flex flex-col h-full">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-sm font-semibold ${isToday ? 'text-blue-400' : 'text-gray-300'}`}>
                          {date.getDate()}
                        </span>
                        {dayPlan.routines.length > 0 && (
                          <span className="text-xs bg-emerald-600 text-white px-1.5 py-0.5 rounded">
                            {dayPlan.routines.length}
                          </span>
                        )}
                      </div>

                      {dayPlan.blocked ? (
                        <div className="text-xs text-red-400">Descanso</div>
                      ) : (
                        <div className="flex-1 overflow-hidden text-left">
                          {dayPlan.routines.slice(0, 2).map(rid => {
                            const routine = routines.find(r => r.id === rid);
                            return routine ? (
                              <div key={rid} className="text-[10px] text-gray-400 truncate">
                                • {routine.name}
                              </div>
                            ) : null;
                          })}
                          {dayPlan.routines.length > 2 && (
                            <div className="text-[10px] text-gray-500">
                              +{dayPlan.routines.length - 2} más
                            </div>
                          )}
                        </div>
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
