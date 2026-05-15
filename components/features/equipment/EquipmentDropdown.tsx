'use client';

import React, { useState } from 'react';
import { EQUIPMENT_LIST } from '@/data/equipment';
import { useEquipment } from '@/context/EquipmentContext';

interface EquipmentDropdownProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function EquipmentDropdown({ value, onChange, placeholder = 'Seleccionar equipamiento' }: EquipmentDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { hasEquipment } = useEquipment();

  // Filtrar solo los equipos que el usuario ha seleccionado
  const availableEquipment = EQUIPMENT_LIST.filter(equipment => 
    hasEquipment(equipment.id)
  );

  const selectedEquipment = EQUIPMENT_LIST.find(eq => eq.name === value);

  const handleSelect = (equipmentName: string) => {
    onChange(equipmentName);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 text-left bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
      >
        <div className="flex items-center justify-between">
          <span className={value ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'}>
            {selectedEquipment ? (
              <span className="flex items-center gap-2">
                <span>{selectedEquipment.emoji}</span>
                <span>{selectedEquipment.name}</span>
              </span>
            ) : (
              placeholder
            )}
          </span>
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-20 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {availableEquipment.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-gray-500 dark:text-gray-400 mb-2">
                  No hay equipamiento seleccionado
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  Ve a la pestaña <span className="font-medium text-blue-600 dark:text-blue-400">🏋️ Equipamiento</span> para configurar tu equipo disponible
                </p>
              </div>
            ) : (
              <div className="py-1">
                <button
                  type="button"
                  onClick={() => handleSelect('')}
                  className="w-full px-4 py-2 text-left text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  {placeholder}
                </button>
                {availableEquipment.map((equipment) => (
                  <button
                    key={equipment.id}
                    type="button"
                    onClick={() => handleSelect(equipment.name)}
                    className={`w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                      value === equipment.name
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'text-gray-900 dark:text-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>{equipment.emoji}</span>
                      <span>{equipment.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
