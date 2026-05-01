'use client';

import React, { useState } from 'react';
import { EQUIPMENT_LIST, EQUIPMENT_CATEGORIES, Equipment } from '@/data/equipment';
import { useEquipment } from '@/context/EquipmentContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function EquipmentPage() {
  const { selectedEquipment, toggleEquipment, clearEquipment } = useEquipment();
  const [selectedCategory, setSelectedCategory] = useState<Equipment['category'] | 'all'>('all');

  const filteredEquipment = selectedCategory === 'all'
    ? EQUIPMENT_LIST
    : EQUIPMENT_LIST.filter(eq => eq.category === selectedCategory);

  const handleSelectAll = () => {
    EQUIPMENT_LIST.forEach(eq => {
      if (!selectedEquipment.has(eq.id)) {
        toggleEquipment(eq.id);
      }
    });
  };

  const selectedCount = selectedEquipment.size;
  const totalCount = EQUIPMENT_LIST.length;

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              🏋️ Mi Equipamiento
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">
              Selecciona el equipamiento que tienes disponible para filtrar ejercicios y rutinas
            </p>
          </div>

          {/* Stats */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-blue-600 dark:text-blue-400 font-semibold mb-1">
                  Equipamiento seleccionado
                </div>
                <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {selectedCount} / {totalCount}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleSelectAll}
                  disabled={selectedCount === totalCount}
                >
                  ✅ Seleccionar todo
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearEquipment}
                  disabled={selectedCount === 0}
                >
                  🗑️ Limpiar selección
                </Button>
              </div>
            </div>
            {selectedCount === 0 && (
              <div className="mt-4 text-sm text-blue-700 dark:text-blue-300">
                💡 Tip: Si no seleccionas ningún equipamiento, se mostrarán todos los ejercicios
              </div>
            )}
          </div>

          {/* Category Filters */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            <Button
              variant={selectedCategory === 'all' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setSelectedCategory('all')}
            >
              📚 Todos
            </Button>
            {EQUIPMENT_CATEGORIES.map(cat => (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.id ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setSelectedCategory(cat.id)}
              >
                {cat.emoji} {cat.name}
              </Button>
            ))}
          </div>

          {/* Equipment Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEquipment.map(equipment => {
              const isSelected = selectedEquipment.has(equipment.id);
              return (
                <button
                  key={equipment.id}
                  onClick={() => toggleEquipment(equipment.id)}
                  className={`text-left p-4 rounded-xl border-2 transition-all ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 dark:border-blue-400 shadow-lg scale-105'
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="text-3xl">{equipment.emoji}</div>
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                        isSelected
                          ? 'bg-blue-600 border-blue-600'
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
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    {equipment.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {equipment.description}
                  </p>
                  <div className="mt-3">
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                      {EQUIPMENT_CATEGORIES.find(c => c.id === equipment.category)?.name}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Info Card */}
          <Card className="mt-4 bg-linear-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
            <CardHeader>
              <CardTitle>💡 ¿Cómo funciona?</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400">✓</span>
                  <span>Selecciona todo el equipamiento que tienes disponible en tu gimnasio o en casa</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400">✓</span>
                  <span>Los ejercicios se filtrarán automáticamente para mostrarte solo los que puedes realizar</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400">✓</span>
                  <span>Las rutinas recomendadas se adaptarán a tu equipamiento disponible</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400">✓</span>
                  <span>Puedes cambiar tu selección en cualquier momento</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
