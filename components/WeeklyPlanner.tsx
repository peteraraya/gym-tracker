"use client";

import React, { useEffect, useState, DragEvent } from 'react';
import { useGym } from '@/context/GymContext';
import { Button } from '@/components/ui/Button';

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

export default function WeeklyPlanner() {
  const { routines } = useGym();
  const [plan, setPlan] = useState<Record<DayKey,string[]>>(() => {
    try {
      if (typeof window === 'undefined') return DAYS.reduce((acc, d) => ({...acc, [d]: []}), {} as any);
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return DAYS.reduce((acc, d) => ({...acc, [d]: []}), {} as any);
      return JSON.parse(raw);
    } catch {
      return DAYS.reduce((acc, d) => ({...acc, [d]: []}), {} as any);
    }
  });

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
    setPlan(prev => {
      // remove id from any day
      const next = Object.fromEntries(Object.entries(prev).map(([k,v]) => [k, (v as string[]).filter(x => x !== id)])) as Record<DayKey,string[]>;
      // append to target day if not present
      if (!next[day].includes(id)) next[day] = [...next[day], id];
      return next;
    });
  };

  const onDragOver = (e: DragEvent) => { e.preventDefault(); };

  const removeFromDay = (day: DayKey, id: string) => {
    setPlan(prev => ({ ...prev, [day]: prev[day].filter(x => x !== id) }));
  };

  const clearPlan = () => {
    const empty = DAYS.reduce((acc, d) => ({...acc, [d]: []}), {} as any) as Record<DayKey,string[]>;
    setPlan(empty);
  };

  const availableRoutines = routines.filter(r => !Object.values(plan).flat().includes(r.id));

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Planificador semanal</h2>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={clearPlan}>Limpiar</Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {DAYS.map(day => (
          <div
            key={day}
            onDrop={(e) => onDropToDay(e as any, day)}
            onDragOver={onDragOver as any}
            className="min-h-24 p-2 border rounded bg-white dark:bg-gray-800"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">{LABELS[day]}</span>
              <span className="text-xs text-gray-500">{plan[day]?.length || 0}</span>
            </div>
            <div className="space-y-2">
              {(plan[day] || []).map(rid => {
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
          </div>
        ))}
      </div>

      <div className="mt-4">
        <h3 className="text-sm font-medium mb-2">Rutinas disponibles (arrastra al día)</h3>
        <div className="grid grid-cols-3 gap-2">
          {availableRoutines.map(r => (
            <div
              key={r.id}
              draggable
              onDragStart={(e) => onDragStart(e, r.id)}
              className="p-2 border rounded bg-white dark:bg-gray-800 cursor-grab"
            >
              <div className="font-medium text-sm">{r.name}</div>
              <div className="text-xs text-gray-500">{r.exercises.length} ejercicios</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
