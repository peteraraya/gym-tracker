'use client';

import React, { useState, useEffect, useRef } from 'react';

interface WeightSelectorProps {
  value: number | '';
  onChange: (value: number) => void;
  exerciseId: string;
  placeholder?: string;
  className?: string;
}

export function WeightSelector({ value, onChange, exerciseId, placeholder = '0', className = '' }: WeightSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [savedWeights, setSavedWeights] = useState<number[]>([]);
  const [inputValue, setInputValue] = useState(value === '' ? '' : value.toString());
  const containerRef = useRef<HTMLDivElement>(null);

  // Cargar pesos guardados del localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`weight-history-${exerciseId}`);
      if (stored) {
        const parsed = JSON.parse(stored) as number[];
        // Ordenar de mayor a menor y eliminar duplicados
        const unique = Array.from(new Set(parsed)).sort((a, b) => b - a);
        setSavedWeights(unique.slice(0, 10)); // Máximo 10 pesos guardados
      }
    } catch (e) {
      console.warn('Error loading weight history', e);
    }
  }, [exerciseId]);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Sincronizar inputValue con value prop
  useEffect(() => {
    setInputValue(value === '' ? '' : value.toString());
  }, [value]);

  const saveWeight = (weight: number) => {
    if (weight <= 0) return;

    try {
      const stored = localStorage.getItem(`weight-history-${exerciseId}`);
      let weights: number[] = stored ? JSON.parse(stored) : [];
      
      // Agregar el nuevo peso si no existe
      if (!weights.includes(weight)) {
        weights.push(weight);
        // Ordenar de mayor a menor y limitar a 10
        weights = Array.from(new Set(weights)).sort((a, b) => b - a).slice(0, 10);
        localStorage.setItem(`weight-history-${exerciseId}`, JSON.stringify(weights));
        setSavedWeights(weights);
      }
    } catch (e) {
      console.warn('Error saving weight history', e);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    
    if (val === '') {
      onChange(0);
    } else {
      const num = parseFloat(val);
      if (!isNaN(num) && num >= 0) {
        onChange(Math.max(0, num)); // Asegurar que nunca sea negativo
      }
    }
  };

  const handleInputBlur = () => {
    const num = parseFloat(inputValue);
    if (!isNaN(num) && num > 0) {
      saveWeight(num);
    }
    // Si el valor es 0 o vacío, no guardarlo en el historial
  };

  const handleSelectWeight = (weight: number) => {
    onChange(weight);
    setInputValue(weight.toString());
    setIsOpen(false);
  };

  const handleInputFocus = () => {
    if (savedWeights.length > 0) {
      setIsOpen(true);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <input
        type="number"
        className={`w-full px-2 py-2 border rounded-md bg-white dark:bg-gray-700 text-sm font-medium text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        onFocus={handleInputFocus}
        step="0.5"
        min="0"
        placeholder={placeholder}
        aria-label="Peso"
      />
      
      {/* Dropdown de pesos guardados */}
      {isOpen && savedWeights.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-48 overflow-y-auto">
          <div className="py-1">
            <div className="px-3 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide border-b border-gray-200 dark:border-gray-700">
              Pesos recientes
            </div>
            {savedWeights.map((weight, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectWeight(weight)}
                className={`w-full px-3 py-2 text-left text-sm hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors ${
                  weight === value ? 'bg-blue-100 dark:bg-blue-900/30 font-semibold' : ''
                }`}
              >
                <span className="font-medium">{weight}</span>
                <span className="text-gray-500 dark:text-gray-400 ml-1">kg</span>
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Indicador de historial disponible */}
      {savedWeights.length > 0 && !isOpen && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      )}
    </div>
  );
}
