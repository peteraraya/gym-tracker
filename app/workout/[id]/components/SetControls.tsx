'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Plus, Minus } from '@/components/icons/lucide';

interface SetControlsProps {
  currentSet: number;
  totalSets: number;
  onSetChange: (set: number) => void;
  onAddSet?: () => void;
  onRemoveSet?: () => void;
  disabled?: boolean;
}

/**
 * Componente para controlar la serie actual
 * 
 * Responsabilidades:
 * - Mostrar serie actual
 * - Botones para cambiar serie
 * - Botones para agregar/eliminar series
 */
export function SetControls({
  currentSet,
  totalSets,
  onSetChange,
  onAddSet,
  onRemoveSet,
  disabled = false,
}: SetControlsProps) {
  const canGoBack = currentSet > 1;
  const canGoForward = currentSet < totalSets;

  return (
    <Card className="mb-4">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Botón anterior */}
          <Button
            variant="ghost"
            onClick={() => onSetChange(currentSet - 1)}
            disabled={!canGoBack || disabled}
            size="sm"
            className="flex-1 text-xs sm:text-sm"
          >
            <span className="hidden sm:inline">← Serie anterior</span>
            <span className="sm:hidden">←</span>
          </Button>

          {/* Indicador de serie */}
          <div className="text-center px-2 sm:px-4 shrink-0">
            <div className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400">
              {currentSet}
            </div>
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              de {totalSets}
            </div>
          </div>

          {/* Botón siguiente */}
          <Button
            variant="ghost"
            onClick={() => onSetChange(currentSet + 1)}
            disabled={!canGoForward || disabled}
            size="sm"
            className="flex-1 text-xs sm:text-sm"
          >
            <span className="hidden sm:inline">Serie siguiente →</span>
            <span className="sm:hidden">→</span>
          </Button>
        </div>

        {/* Botones adicionales */}
        {(onAddSet || onRemoveSet) && (
          <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            {onRemoveSet && (
              <Button
                variant="ghost"
                onClick={onRemoveSet}
                disabled={totalSets <= 1 || disabled}
                size="sm"
                className="flex-1 flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm"
              >
                <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Eliminar</span>
              </Button>
            )}
            {onAddSet && (
              <Button
                variant="ghost"
                onClick={onAddSet}
                disabled={disabled}
                size="sm"
                className="flex-1 flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm"
              >
                <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Agregar</span>
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
