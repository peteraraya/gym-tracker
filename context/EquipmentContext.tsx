'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
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
    // Inicializar desde localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('selectedEquipment');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          return new Set(parsed);
        } catch (error) {
          console.error('Error loading equipment:', error);
        }
      }
    }
    return new Set();
  });

  // Guardar en localStorage cuando cambia
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        'selectedEquipment',
        JSON.stringify(Array.from(selectedEquipment))
      );
    }
  }, [selectedEquipment]);

  const toggleEquipment = (equipment: EquipmentType) => {
    setSelectedEquipment(prev => {
      const newSet = new Set(prev);
      if (newSet.has(equipment)) {
        newSet.delete(equipment);
      } else {
        newSet.add(equipment);
      }
      return newSet;
    });
  };

  const setEquipment = (equipment: Set<EquipmentType>) => {
    setSelectedEquipment(equipment);
  };

  const clearEquipment = () => {
    setSelectedEquipment(new Set());
  };

  const hasEquipment = (equipment: string | undefined): boolean => {
    if (!equipment || selectedEquipment.size === 0) return true;
    
    // Normalizar el string del equipamiento para comparación
    const normalizedEquipment = equipment.toLowerCase();
    
    // Mapeo de variaciones de nombres a IDs
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

    // Verificar si alguna de las palabras clave coincide
    for (const [keyword, equipmentIds] of Object.entries(equipmentMap)) {
      if (normalizedEquipment.includes(keyword)) {
        return equipmentIds.some(id => selectedEquipment.has(id));
      }
    }

    // Si no hay coincidencia específica, permitir el ejercicio
    return true;
  };

  return (
    <EquipmentContext.Provider
      value={{
        selectedEquipment,
        toggleEquipment,
        setEquipment,
        clearEquipment,
        hasEquipment,
      }}
    >
      {children}
    </EquipmentContext.Provider>
  );
}

export function useEquipment() {
  const context = useContext(EquipmentContext);
  if (!context) {
    throw new Error('useEquipment must be used within EquipmentProvider');
  }
  return context;
}
