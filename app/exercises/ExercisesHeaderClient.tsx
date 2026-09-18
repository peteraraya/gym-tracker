'use client';

import { useState } from 'react';
import { useEquipment } from '@/context/EquipmentContext';
import { useToast } from '@/context/NotificationContext';
import { EQUIPMENT_LIST } from '@/data/equipment';
import { PageHeader } from '@/layouts';
import { Button } from '@/components/ui/Button';

export function ExercisesHeaderClient() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { selectedEquipment, setEquipment, clearEquipment, toggleEquipment } = useEquipment();
  const toast = useToast();

  const handleEquipmentSelect = () => {
    setEquipment(new Set(EQUIPMENT_LIST.map((e) => e.id)));
    toast.success("Seleccionado todo el equipamiento");
  };

  const handleEquipmentClear = () => {
    clearEquipment();
    toast.info("Selección limpiada");
  };

  return (
    <>
      <PageHeader
        title="Guía de Ejercicios"
        subtitle="Explora ejercicios con técnicas profesionales"
        icon={<span className="text-3xl">💪</span>}
        gradient="from-indigo-600 to-violet-600"
        actions={
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setDrawerOpen(true)}
            className="shrink-0 inline-flex items-center gap-2 px-4 py-2 bg-white/10 text-white border-white/20 hover:bg-white/20 backdrop-blur-sm transition-all text-sm shadow-md"
          >
            <span className="text-base">⚙️</span>
            <span className="hidden sm:inline">Equipamiento</span>
          </Button>
        }
      >
        {selectedEquipment.size > 0 && (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 shadow-md border border-white/20">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🏋️</span>
                <span className="text-sm font-medium text-white">
                  Filtrando por {selectedEquipment.size} equipamiento
                  {selectedEquipment.size !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleEquipmentSelect}
                  className="text-xs bg-white/20 hover:bg-white/30 text-white border-0 shadow-sm"
                >
                  ✅ Todo
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleEquipmentClear}
                  className="text-xs bg-red-600/40 hover:bg-red-600/50 text-white border-0 shadow-sm"
                >
                  🗑️ Limpiar
                </Button>
              </div>
            </div>
          </div>
        )}
      </PageHeader>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />

          <aside className="relative ml-auto w-full sm:w-96 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 max-h-screen overflow-y-auto p-6 shadow-2xl z-10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                ⚙️ Mi Equipamiento
              </h3>
              <button
                onClick={() => setDrawerOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-3xl leading-none transition-colors"
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>

            <div className="flex gap-2 mb-6">
              <button
                onClick={handleEquipmentSelect}
                className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all"
              >
                ✅ Seleccionar todo
              </button>
              <button
                onClick={handleEquipmentClear}
                className="flex-1 px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 hover:border-red-400 text-gray-700 dark:text-gray-300 text-sm font-semibold transition-all"
              >
                🗑️ Limpiar
              </button>
            </div>

            <div className="space-y-3">
              {EQUIPMENT_LIST.map((eq) => {
                const isSelected = selectedEquipment.has(eq.id);
                return (
                  <button
                    key={eq.id}
                    onClick={() => {
                      toggleEquipment(eq.id);
                      if (isSelected) {
                        toast.info(`${eq.name} eliminado`);
                      } else {
                        toast.success(`${eq.name} seleccionado`);
                      }
                    }}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      isSelected
                        ? "bg-blue-50 dark:bg-blue-900/20 border-blue-400 dark:border-blue-500"
                        : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-3xl">{eq.emoji}</div>
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-gray-100">
                            {eq.name}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {eq.description}
                          </div>
                        </div>
                      </div>
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${
                          isSelected
                            ? "bg-blue-600 border-blue-600 text-white"
                            : "border-gray-300 dark:border-gray-600"
                        }`}
                      >
                        {isSelected && "✓"}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
