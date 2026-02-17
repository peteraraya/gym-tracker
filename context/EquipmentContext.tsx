'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { EquipmentType } from '@/data/equipment';

interface EquipmentContextType {
  selectedEquipment: Set<EquipmentType>;
  toggleEquipment: (equipment: EquipmentType) => void;
  setEquipment: (equipment: Set<EquipmentType>) => void;
  clearEquipment: () => void;
  hasEquipment: (equipment: string | undefined) => boolean;
}

const EquipmentContext = createContext<EquipmentContextType | undefined>(undefined);

export function EquipmentProvider({ children }: { children: React.ReactNode }) {
  const [selectedEquipment, setSelectedEquipment] = useState<Set<EquipmentType>>(() => {
    if (typeof window === 'undefined') return new Set();
    try {
      const stored = localStorage.getItem('selectedEquipment');
      if (stored) {
        const parsed = JSON.parse(stored) as EquipmentType[];
        return new Set(parsed);
      }
    } catch (error) {
      console.error('Error loading equipment from localStorage:', error);
    }
    return new Set();
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('selectedEquipment', JSON.stringify(Array.from(selectedEquipment)));
      } catch (e) {
        console.error('Error saving selectedEquipment:', e);
      }
    }
  }, [selectedEquipment]);

  const toggleEquipment = useCallback((equipment: EquipmentType) => {
    setSelectedEquipment(prev => {
      const newSet = new Set(prev);
      if (newSet.has(equipment)) {
        newSet.delete(equipment);
      } else {
        newSet.add(equipment);
      }
      // debug log to trace selection changes
      try {
         
        console.debug('[EquipmentContext] toggleEquipment ->', equipment, Array.from(newSet));
      } catch (e) {
        // noop
      }
      return newSet;
    });
  }, []);

  const setEquipment = useCallback((equipment: Set<EquipmentType>) => {
    setSelectedEquipment(new Set(equipment));
  }, []);

  const clearEquipment = useCallback(() => {
    setSelectedEquipment(new Set());
  }, []);

  const hasEquipment = useCallback((equipment: string | undefined): boolean => {
    if (!equipment || selectedEquipment.size === 0) return true;

    const normalizedEquipment = equipment.toLowerCase();

    const equipmentMap: Record<string, EquipmentType[]> = {
      'barra': ['barra', 'ez-bar'],
      'mancuernas': ['mancuernas'],
      'peso corporal': ['peso-corporal'],
      'máquina': ['maquina'],
      'poleas': ['poleas'],
      'kettlebell': ['kettlebell'],
      'banda': ['banda-resistencia'],
      'trx': ['trx'],
      'bosu': ['bosu'],
      'fitball': ['fitball'],
      'pelota': ['fitball'],
      'banco': ['banco'],
      'paralelas': ['barras-paralelas'],
      'dominadas': ['barra-dominadas'],
      'discos': ['discos'],
      'cuerda': ['cuerda-saltar'],
      'saco': ['saco-boxeo'],
      'landmine': ['landmine'],
    };

    for (const [keyword, equipmentIds] of Object.entries(equipmentMap)) {
      if (normalizedEquipment.includes(keyword)) {
        return equipmentIds.some(id => selectedEquipment.has(id));
      }
    }

    return true;
  }, [selectedEquipment]);

  const value = useMemo(() => ({
    selectedEquipment,
    toggleEquipment,
    setEquipment,
    clearEquipment,
    hasEquipment,
  }), [selectedEquipment, toggleEquipment, setEquipment, clearEquipment, hasEquipment]);

  return (
    <EquipmentContext.Provider value={value}>{children}</EquipmentContext.Provider>
  );
}

export function useEquipment() {
  const context = useContext(EquipmentContext);
  if (!context) {
    throw new Error('useEquipment must be used within EquipmentProvider');
  }
  return context;
}
