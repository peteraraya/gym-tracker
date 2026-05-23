'use client';

import { useState } from 'react';
import type { SetType } from '@/types';
import { ChevronDown } from '@/components/icons/lucide';

interface SetTypeSelectorProps {
  value: SetType;
  onChange: (type: SetType) => void;
  compact?: boolean;
  mini?: boolean; // Nueva prop para modo ultra-compacto (solo letra)
}

const SET_TYPES = [
  {
    value: 'normal' as SetType,
    label: 'Normal',
    icon: '💪',
    color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700',
    description: 'Serie estándar de trabajo'
  },
  {
    value: 'warmup' as SetType,
    label: 'Calentamiento',
    icon: '🔥',
    color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-700',
    description: 'Serie de calentamiento con peso ligero'
  },
  {
    value: 'dropset' as SetType,
    label: 'Drop Set',
    icon: '⬇️',
    color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700',
    description: 'Reducir peso y continuar sin descanso'
  },
  {
    value: 'failure' as SetType,
    label: 'Al Fallo',
    icon: '🔴',
    color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700',
    description: 'Serie hasta el fallo muscular'
  },
  {
    value: 'amrap' as SetType,
    label: 'AMRAP',
    icon: '♾️',
    color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700',
    description: 'Máximas repeticiones posibles'
  },
  {
    value: 'rest-pause' as SetType,
    label: 'Rest-Pause',
    icon: '⏸️',
    color: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 border-cyan-300 dark:border-cyan-700',
    description: 'Pausas cortas dentro de la serie'
  },
  {
    value: 'cluster' as SetType,
    label: 'Cluster',
    icon: '🔗',
    color: 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 border-pink-300 dark:border-pink-700',
    description: 'Mini-series con descansos breves'
  }
];

export default function SetTypeSelector({ value, onChange, compact = false, mini = false }: SetTypeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const currentType = SET_TYPES.find(t => t.value === value) || SET_TYPES[0];

  const handleSelect = (type: SetType) => {
    onChange(type);
    setIsOpen(false);
  };

  // Función para obtener la inicial del tipo
  const getTypeInitial = (type: SetType) => {
    switch(type) {
      case 'normal': return 'N';
      case 'warmup': return 'C'; // Calentamiento
      case 'dropset': return 'D';
      case 'failure': return 'F';
      case 'amrap': return 'A';
      case 'rest-pause': return 'R';
      case 'cluster': return 'Cl';
      default: return 'N';
    }
  };

  if (mini) {
    // Versión mini: solo letra clickeable con dropdown completo
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full h-7 sm:h-9 px-1 sm:px-2 rounded border-2 text-[10px] sm:text-sm font-bold transition-all hover:scale-105 ${currentType.color}`}
        >
          {getTypeInitial(value)}
        </button>

        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 min-w-[200px] max-h-[300px] overflow-y-auto">
              {SET_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => handleSelect(type.value)}
                  className={`w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                    value === type.value ? 'bg-gray-50 dark:bg-gray-700/50' : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{type.icon}</span>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {type.label}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {type.description}
                      </div>
                    </div>
                    {value === type.value && (
                      <span className="text-blue-600 dark:text-blue-400">✓</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  if (compact) {
    // Versión compacta: solo badge clickeable
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`px-2 py-1 rounded-full text-xs font-semibold border transition-all hover:scale-105 ${currentType.color}`}
        >
          <span className="mr-1">{currentType.icon}</span>
          {currentType.label}
        </button>

        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute top-full left-0 mt-1 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 min-w-[200px] max-h-[300px] overflow-y-auto">
              {SET_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => handleSelect(type.value)}
                  className={`w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                    value === type.value ? 'bg-gray-50 dark:bg-gray-700/50' : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{type.icon}</span>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {type.label}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {type.description}
                      </div>
                    </div>
                    {value === type.value && (
                      <span className="text-blue-600 dark:text-blue-400">✓</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  // Versión completa: dropdown con descripción
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-3 py-2 rounded-lg border-2 transition-all hover:shadow-md ${currentType.color} flex items-center justify-between`}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">{currentType.icon}</span>
          <span className="font-medium">{currentType.label}</span>
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 max-h-[400px] overflow-y-auto">
            {SET_TYPES.map((type) => (
              <button
                key={type.value}
                onClick={() => handleSelect(type.value)}
                className={`w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                  value === type.value ? 'bg-gray-50 dark:bg-gray-700/50' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{type.icon}</span>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
                      {type.label}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {type.description}
                    </div>
                  </div>
                  {value === type.value && (
                    <span className="text-blue-600 dark:text-blue-400 text-lg">✓</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// Componente auxiliar para mostrar solo el badge (sin selector)
export function SetTypeBadge({ type }: { type: SetType }) {
  const typeInfo = SET_TYPES.find(t => t.value === type) || SET_TYPES[0];
  
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${typeInfo.color}`}>
      <span className="mr-1">{typeInfo.icon}</span>
      {typeInfo.label}
    </span>
  );
}
