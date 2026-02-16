'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  ChevronLeft, 
  ChevronRight, 
  Check,
  Calendar,
  Clock,
  Target,
  Dumbbell,
  Zap,
  TrendingUp,
  Award
} from '@/components/icons/lucide';
import type { DifficultyLevel } from '@/data/exercises/types';

interface WizardData {
  // Paso 1: Básico
  name: string;
  daysPerWeek: number;
  minutesPerSession: number;
  level: DifficultyLevel | '';
  
  // Paso 2: Equipo
  equipment: string[];
  
  // Paso 3: Objetivos
  goal: 'strength' | 'hypertrophy' | 'weight_loss' | 'endurance' | 'general' | '';
  focusAreas: string[];
}

interface RoutineWizardProps {
  onComplete: (data: WizardData) => void;
  onCancel: () => void;
}

const EQUIPMENT_OPTIONS = [
  { id: 'barbell', name: 'Barra', icon: '🏋️' },
  { id: 'dumbbells', name: 'Mancuernas', icon: '💪' },
  { id: 'machines', name: 'Máquinas', icon: '⚙️' },
  { id: 'cables', name: 'Poleas', icon: '🔗' },
  { id: 'bodyweight', name: 'Peso Corporal', icon: '🤸' },
  { id: 'bands', name: 'Bandas', icon: '🎗️' },
  { id: 'kettlebell', name: 'Kettlebell', icon: '⚫' },
  { id: 'trx', name: 'TRX', icon: '🔺' }
];

const FOCUS_AREAS = [
  { id: 'chest', name: 'Pecho', icon: '💪', group: 'pecho' },
  { id: 'back', name: 'Espalda', icon: '🦸', group: 'espalda' },
  { id: 'legs', name: 'Piernas', icon: '🦵', group: 'piernas' },
  { id: 'shoulders', name: 'Hombros', icon: '🏋️', group: 'hombros' },
  { id: 'arms', name: 'Brazos', icon: '💪', group: 'biceps' },
  { id: 'core', name: 'Core', icon: '🎯', group: 'core' },
  { id: 'glutes', name: 'Glúteos', icon: '🍑', group: 'gluteos' }
];

export default function RoutineWizard({ onComplete, onCancel }: RoutineWizardProps) {
  const [step, setStep] = useState(1);
  const [isCreating, setIsCreating] = useState(false);
  const [data, setData] = useState<WizardData>({
    name: '',
    daysPerWeek: 3,
    minutesPerSession: 60,
    level: '',
    equipment: [],
    goal: '',
    focusAreas: []
  });

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  const updateData = (updates: Partial<WizardData>) => {
    setData({ ...data, ...updates });
  };

  const toggleEquipment = (id: string) => {
    const newEquipment = data.equipment.includes(id)
      ? data.equipment.filter(e => e !== id)
      : [...data.equipment, id];
    updateData({ equipment: newEquipment });
  };

  const toggleFocusArea = (id: string) => {
    const newFocusAreas = data.focusAreas.includes(id)
      ? data.focusAreas.filter(a => a !== id)
      : [...data.focusAreas, id];
    updateData({ focusAreas: newFocusAreas });
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return data.name.trim() && data.daysPerWeek > 0 && data.minutesPerSession > 0 && data.level;
      case 2:
        return data.equipment.length > 0;
      case 3:
        return data.goal && data.focusAreas.length > 0;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const nextStep = async () => {
    if (step < totalSteps) {
      setStep(step + 1);
      // Scroll al inicio del modal cuando cambia de paso
      setTimeout(() => {
        const modal = document.querySelector('.fixed.inset-0');
        if (modal) {
          modal.scrollTop = 0;
        }
      }, 100);
    } else {
      // Último paso: crear rutina
      if (isCreating) return; // Prevenir múltiples clicks
      
      setIsCreating(true);
      try {
        await onComplete(data);
      } catch (error) {
        console.error('Error creating routine:', error);
        setIsCreating(false);
      }
      // No reseteamos isCreating aquí porque el modal se cerrará
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
      // Scroll al inicio del modal cuando cambia de paso
      setTimeout(() => {
        const modal = document.querySelector('.fixed.inset-0');
        if (modal) {
          modal.scrollTop = 0;
        }
      }, 100);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <Card className="w-full max-w-3xl my-8 shadow-2xl animate-fadeIn">
        {/* Header */}
        <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg p-4 sm:p-6 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1 pr-2">
              <CardTitle className="text-lg sm:text-2xl font-bold text-white mb-1 sm:mb-2">
                Asistente de Rutinas
              </CardTitle>
              <p className="text-blue-100 text-xs sm:text-sm">
                Paso {step} de {totalSteps}: {
                  step === 1 ? 'Información Básica' :
                  step === 2 ? 'Equipo Disponible' :
                  step === 3 ? 'Objetivos y Enfoque' :
                  'Revisión'
                }
              </p>
            </div>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0"
              aria-label="Cerrar"
            >
              <span className="text-2xl text-white">×</span>
            </button>
          </div>
          
          {/* Progress bar */}
          <div className="mt-3 sm:mt-4">
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6 max-h-[calc(100vh-280px)] sm:max-h-[calc(100vh-300px)] overflow-y-auto">
          {/* PASO 1: Información Básica */}
          {step === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <Input
                  label="Nombre de la Rutina"
                  placeholder="Ej: Mi Rutina de Fuerza"
                  value={data.name}
                  onChange={(e) => updateData({ name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    ¿Cuántos días por semana?
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[2, 3, 4, 5, 6].map(days => (
                      <button
                        key={days}
                        onClick={() => updateData({ daysPerWeek: days })}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          data.daysPerWeek === days
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-2xl font-bold">{days}</div>
                        <div className="text-xs">días</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Clock className="w-4 h-4 inline mr-2" />
                    Tiempo por sesión
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[30, 45, 60, 90].map(minutes => (
                      <button
                        key={minutes}
                        onClick={() => updateData({ minutesPerSession: minutes })}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          data.minutesPerSession === minutes
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-xl font-bold">{minutes}</div>
                        <div className="text-xs">min</div>
                      </button>
                    ))}
                  </div>
                  
                  {/* Selector personalizado */}
                  <div className="mt-3">
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                      O selecciona otro tiempo:
                    </label>
                    <select
                      value={data.minutesPerSession}
                      onChange={(e) => updateData({ minutesPerSession: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value={30}>30 minutos</option>
                      <option value={45}>45 minutos</option>
                      <option value={60}>60 minutos</option>
                      <option value={75}>75 minutos</option>
                      <option value={90}>90 minutos</option>
                      <option value={105}>105 minutos</option>
                      <option value={120}>120 minutos (2 horas)</option>
                      <option value={150}>150 minutos (2.5 horas)</option>
                      <option value={180}>180 minutos (3 horas)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Award className="w-4 h-4 inline mr-2" />
                  ¿Cuál es tu nivel?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { value: 'principiante', label: 'Principiante', desc: '0-6 meses', color: 'green' },
                    { value: 'intermedio', label: 'Intermedio', desc: '6-24 meses', color: 'yellow' },
                    { value: 'avanzado', label: 'Avanzado', desc: '2+ años', color: 'red' }
                  ].map(level => (
                    <button
                      key={level.value}
                      onClick={() => updateData({ level: level.value as DifficultyLevel })}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        data.level === level.value
                          ? `border-${level.color}-500 bg-${level.color}-50 dark:bg-${level.color}-900/20`
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-bold text-sm sm:text-base">{level.label}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">{level.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* PASO 2: Equipo */}
          {step === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  <Dumbbell className="w-4 h-4 inline mr-2" />
                  ¿Qué equipo tienes disponible?
                </label>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Selecciona todo el equipo que puedas usar
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {EQUIPMENT_OPTIONS.map(eq => (
                    <button
                      key={eq.id}
                      onClick={() => toggleEquipment(eq.id)}
                      className={`p-3 sm:p-4 rounded-lg border-2 transition-all ${
                        data.equipment.includes(eq.id)
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-105'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">{eq.icon}</div>
                      <div className="text-xs sm:text-sm font-medium">{eq.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {data.equipment.length > 0 && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    ✓ Has seleccionado {data.equipment.length} tipo(s) de equipo
                  </p>
                </div>
              )}
            </div>
          )}

          {/* PASO 3: Objetivos */}
          {step === 3 && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  <Target className="w-4 h-4 inline mr-2" />
                  ¿Cuál es tu objetivo principal?
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    { value: 'strength', label: 'Fuerza Máxima', desc: 'Levantar más peso', icon: '🏋️' },
                    { value: 'hypertrophy', label: 'Hipertrofia', desc: 'Ganar músculo', icon: '💪' },
                    { value: 'weight_loss', label: 'Pérdida de Peso', desc: 'Quemar grasa', icon: '🔥' },
                    { value: 'endurance', label: 'Resistencia', desc: 'Más repeticiones', icon: '🏃' },
                    { value: 'general', label: 'Fitness General', desc: 'Salud y bienestar', icon: '⭐' }
                  ].map(goal => (
                    <button
                      key={goal.value}
                      onClick={() => updateData({ goal: goal.value as any })}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        data.goal === goal.value
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl sm:text-3xl flex-shrink-0">{goal.icon}</span>
                        <div className="min-w-0">
                          <div className="font-bold text-sm sm:text-base">{goal.label}</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">{goal.desc}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  <Zap className="w-4 h-4 inline mr-2" />
                  ¿Qué áreas quieres enfatizar?
                </label>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Selecciona al menos una área de enfoque
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {FOCUS_AREAS.map(area => (
                    <button
                      key={area.id}
                      onClick={() => toggleFocusArea(area.id)}
                      className={`p-3 sm:p-4 rounded-lg border-2 transition-all ${
                        data.focusAreas.includes(area.id)
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20 scale-105'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">{area.icon}</div>
                      <div className="text-xs sm:text-sm font-medium">{area.name}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* PASO 4: Revisión */}
          {step === 4 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mb-4">
                  <Check className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  ¡Rutinas Listas para Crear!
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Se crearán <strong>{data.daysPerWeek} rutinas</strong> (una por día de entrenamiento)
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="font-semibold text-gray-900 dark:text-gray-100 mb-2">📋 Información Básica</div>
                  <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                    <p>• Nombre: <strong>{data.name}</strong></p>
                    <p>• Frecuencia: <strong>{data.daysPerWeek} días por semana</strong></p>
                    <p>• Duración: <strong>{data.minutesPerSession} minutos por sesión</strong></p>
                    <p>• Nivel: <strong className="capitalize">{data.level}</strong></p>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="font-semibold text-gray-900 dark:text-gray-100 mb-2">🏋️ Equipo Disponible</div>
                  <div className="flex flex-wrap gap-2">
                    {data.equipment.map(eq => {
                      const equipment = EQUIPMENT_OPTIONS.find(e => e.id === eq);
                      return (
                        <span key={eq} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm">
                          {equipment?.icon} {equipment?.name}
                        </span>
                      );
                    })}
                  </div>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="font-semibold text-gray-900 dark:text-gray-100 mb-2">🎯 Objetivo y Enfoque</div>
                  <div className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                    <p>• Objetivo: <strong className="capitalize">
                      {data.goal === 'strength' ? 'Fuerza Máxima' :
                       data.goal === 'hypertrophy' ? 'Hipertrofia' :
                       data.goal === 'weight_loss' ? 'Pérdida de Peso' :
                       data.goal === 'endurance' ? 'Resistencia' :
                       'Fitness General'}
                    </strong></p>
                    <div>
                      <p className="mb-1">• Áreas de enfoque:</p>
                      <div className="flex flex-wrap gap-2 ml-4">
                        {data.focusAreas.map(area => {
                          const focusArea = FOCUS_AREAS.find(a => a.id === area);
                          return (
                            <span key={area} className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm">
                              {focusArea?.icon} {focusArea?.name}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
                  <TrendingUp className="w-4 h-4 inline mr-2" />
                  Generaremos <strong>{data.daysPerWeek} rutinas optimizadas</strong> basadas en tus preferencias:
                </p>
                <ul className="text-xs text-blue-700 dark:text-blue-300 ml-6 space-y-1">
                  <li>• Cada rutina corresponde a un día de entrenamiento específico</li>
                  <li>• Los ejercicios están divididos según el split de entrenamiento</li>
                  <li>• Podrás editar cada rutina individualmente después de crearlas</li>
                </ul>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0 mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="ghost"
              onClick={step === 1 ? onCancel : prevStep}
              disabled={isCreating}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              {step === 1 ? 'Cancelar' : 'Anterior'}
            </Button>

            <div className="flex gap-2 order-1 sm:order-2">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div
                  key={i}
                  className={`h-2 rounded-full transition-all ${
                    i + 1 === step
                      ? 'w-8 bg-gradient-to-r from-blue-500 to-purple-600'
                      : i + 1 < step
                      ? 'w-2 bg-green-500'
                      : 'w-2 bg-gray-300 dark:bg-gray-600'
                  }`}
                />
              ))}
            </div>

            <Button
              variant="primary"
              onClick={nextStep}
              disabled={!canProceed() || isCreating}
              className={`w-full sm:w-auto order-3 ${step === totalSteps ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700' : ''}`}
            >
              {isCreating ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creando...
                </>
              ) : step === totalSteps ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Crear {data.daysPerWeek} Rutinas
                </>
              ) : (
                <>
                  Siguiente
                  <ChevronRight className="w-4 h-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
