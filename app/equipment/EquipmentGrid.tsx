'use client';

import { Equipment, EQUIPMENT_CATEGORIES } from '@/data/equipment';
import { useEquipment } from '@/context/EquipmentContext';
import { CardGrid } from '@/components/shared';
import { Button } from '@/components/ui/Button';

interface EquipmentGridProps {
  filteredEquipment: Equipment[];
  totalCount: number;
}

export function EquipmentGrid({ filteredEquipment, totalCount }: EquipmentGridProps) {
  const { selectedEquipment, toggleEquipment, clearEquipment } = useEquipment();
  const selectedCount = selectedEquipment.size;

  const handleSelectAll = () => {
    filteredEquipment.forEach(eq => {
      if (!selectedEquipment.has(eq.id)) {
        toggleEquipment(eq.id);
      }
    });
  };

  return (
    <>
      <div className="mt-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 shadow-md mb-6 -mt-20 relative z-10 mx-4 sm:mx-0">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-white/80 font-semibold mb-1">
              Equipamiento seleccionado
            </div>
            <div className="text-2xl font-bold text-white">
              {selectedCount} / {totalCount}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleSelectAll}
              disabled={selectedCount === totalCount}
              className="bg-white/20 text-white border-white/30 hover:bg-white/30"
            >
              ✅ Seleccionar todo
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearEquipment}
              disabled={selectedCount === 0}
              className="bg-white/10 text-white border-white/20 hover:bg-white/20"
            >
              🗑️ Limpiar
            </Button>
          </div>
        </div>
        {selectedCount === 0 && (
          <div className="mt-4 text-sm text-white/80">
            💡 Tip: Si no seleccionas ningún equipamiento, se mostrarán todos los ejercicios
          </div>
        )}
      </div>

      <CardGrid cols={3}>
        {filteredEquipment.map(equipment => {
          const isSelected = selectedEquipment.has(equipment.id);
          return (
            <button
              key={equipment.id}
              onClick={() => toggleEquipment(equipment.id)}
              className={`text-left p-5 rounded-xl border-2 transition-all duration-300 ${
                isSelected
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 dark:border-blue-400 shadow-xl scale-105'
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-lg'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="text-4xl">{equipment.emoji}</div>
                <div
                  className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-blue-600 border-blue-600 shadow-md'
                      : 'border-gray-300 dark:border-gray-500'
                  }`}
                >
                  {isSelected && (
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="3"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M5 13l4 4L19 7"></path>
                    </svg>
                  )}
                </div>
              </div>
              <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2 text-lg">
                {equipment.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {equipment.description}
              </p>
              <div className="mt-3">
                <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 font-medium">
                  {EQUIPMENT_CATEGORIES.find(c => c.id === equipment.category)?.name}
                </span>
              </div>
            </button>
          );
        })}
      </CardGrid>
    </>
  );
}
