"use client";

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { WeightSuggestionBanner } from "@/components/features/workout/WeightSuggestionBanner";
import { EditValueModal } from "@/components/shared/EditValueModal";
import { useToast } from "@/context/NotificationContext";
import { formatRestTime } from "@/lib/utils/formatTime";
import type { Exercise } from "@/types";
import type { WeightSuggestion } from "@/lib/data/weightSuggestions";

interface ExerciseCardProps {
  exercise: Exercise;
  exerciseIndex: number;
  currentSet: number;
  completedSets: number;
  currentReps: number | "";
  currentWeight: number | "";
  onRepsChange: (reps: number | "") => void;
  onWeightChange: (weight: number) => void;
  onCompleteSet: () => void;
  onShowInfo?: () => void;
  isSetStarted?: boolean;
  weightSuggestion?: WeightSuggestion | null;
  onDismissWeightSuggestion?: () => void;
  // New props for "Repeat Previous" feature
  lastSetData?: { reps: number; weight: number } | null;
  onRepeatPrevious?: () => void;
  // New prop for set timer
  setStartTime?: number | null;
  // Quick exercise switcher (rendered as children)
  quickSwitcher?: React.ReactNode;
  // ✅ Personal record for this exercise
  personalRecord?: { maxWeight: number; reps: number; date: Date } | null;
  // Pesos ya usados en esta sesión para sugerencias
  actualWeights?: number[];
  // Callback para cambiar el tempo del ejercicio
  onTempoChange?: (tempo: string) => void;
}

/**
 * Componente que muestra un ejercicio individual
 *
 * Responsabilidades:
 * - Mostrar información del ejercicio
 * - Inputs para reps y peso
 * - Botones de acción
 * - Progreso de series
 */
export function ExerciseCard({
  exercise,
  exerciseIndex,
  currentSet,
  completedSets,
  currentReps,
  currentWeight,
  onRepsChange,
  onWeightChange,
  onCompleteSet,
  onShowInfo,
  isSetStarted = false,
  weightSuggestion,
  onDismissWeightSuggestion,
  lastSetData,
  onRepeatPrevious,
  setStartTime,
  quickSwitcher,
  personalRecord,
  actualWeights = [],
  onTempoChange,
}: ExerciseCardProps) {
  const { success } = useToast();
  const totalSets = exercise.sets.length;
  const isLastSet = currentSet === totalSets;
  const isSetComplete = currentReps !== "" && currentWeight !== "";

  // Estado para modales de edición
  const [editingField, setEditingField] = useState<"reps" | "weight" | null>(
    null,
  );

  // Estado local para controlar la visibilidad de la sugerencia
  const [showSuggestion, setShowSuggestion] = useState(true);

  // Timer TUT (debe declararse antes que tempoPhaseInfo)
  const [elapsedTime, setElapsedTime] = React.useState(0);
  const intervalRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (!setStartTime) {
      setElapsedTime(0);
      return;
    }
    setElapsedTime(Math.floor((Date.now() - setStartTime) / 1000));
    intervalRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - setStartTime) / 1000);
      setElapsedTime(elapsed);
    }, 1000);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [setStartTime]);

  // Estado para Tempo
  const [showTempoSheet, setShowTempoSheet] = useState(false);
  const [tempoInputs, setTempoInputs] = useState({ e: 3, p1: 1, c: 2, p2: 0 });
  const metronomRef = React.useRef<NodeJS.Timeout | null>(null);
  const [metronomActive, setMetronomActive] = useState(false);

  // Parse del tempo del ejercicio
  const parsedTempo = useMemo(() => {
    const raw = exercise.tempo;
    if (!raw) return null;
    const parts = raw.split('-').map(Number);
    if (parts.length !== 4 || parts.some(isNaN)) return null;
    return parts; // [excéntrica, pausa-arriba, concéntrica, pausa-abajo]
  }, [exercise.tempo]);

  // Sincronizar tempoInputs cuando cambia exercise.tempo
  React.useEffect(() => {
    if (parsedTempo) {
      setTempoInputs({ e: parsedTempo[0], p1: parsedTempo[1], c: parsedTempo[2], p2: parsedTempo[3] });
    }
  }, [parsedTempo]);

  // Calcular fase actual del tempo basada en el tiempo transcurrido
  const tempoPhaseInfo = useMemo(() => {
    if (!parsedTempo || !isSetStarted) return null;
    const [ecc, p1, con, p2] = parsedTempo;
    const cycle = ecc + p1 + con + p2;
    if (cycle === 0) return null;
    const timeInCycle = elapsedTime % cycle;
    const phases = [
      { name: 'BAJANDO', label: 'Excéntrica', color: '#60a5fa', bg: 'bg-blue-500/20', border: 'border-blue-500', duration: ecc, scale: 1.35 },
      { name: 'PAUSA', label: 'Sostén arriba', color: '#fbbf24', bg: 'bg-amber-500/20', border: 'border-amber-500', duration: p1, scale: 1.35 },
      { name: 'SUBIENDO', label: 'Concéntrica', color: '#34d399', bg: 'bg-emerald-500/20', border: 'border-emerald-500', duration: con, scale: 0.8 },
      { name: 'PAUSA', label: 'Sostén abajo', color: '#94a3b8', bg: 'bg-slate-500/20', border: 'border-slate-500', duration: p2, scale: 0.8 },
    ];
    let acc = 0;
    for (const ph of phases) {
      if (ph.duration === 0) continue;
      const remaining = ph.duration - Math.max(0, timeInCycle - acc);
      acc += ph.duration;
      if (timeInCycle < acc) return { ...ph, remaining: Math.max(0, Math.ceil(remaining)) };
    }
    return { ...phases[0], remaining: phases[0].duration };
  }, [parsedTempo, elapsedTime, isSetStarted]);

  // Metrónomo háptico
  React.useEffect(() => {
    if (metronomActive && isSetStarted) {
      metronomRef.current = setInterval(() => {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          const isPhaseChange = tempoPhaseInfo?.remaining === 1;
          navigator.vibrate(isPhaseChange ? [80, 30, 80] : 40);
        }
      }, 1000);
    } else {
      if (metronomRef.current) clearInterval(metronomRef.current);
    }
    return () => { if (metronomRef.current) clearInterval(metronomRef.current); };
  }, [metronomActive, isSetStarted, tempoPhaseInfo?.remaining]);

  // Resetear showSuggestion cuando cambia weightSuggestion
  React.useEffect(() => {
    if (weightSuggestion) {
      setShowSuggestion(true);
    }
  }, [weightSuggestion]);

  // (elapsedTime y su timer se inicializaron antes, junto a los hooks de tempo)

    if (!setStartTime) {
      setElapsedTime(0);
      return;
    }



  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Quick weight adjustment handler
  const handleQuickWeightAdjustment = (delta: number) => {
    const newWeight = Math.max(0, (currentWeight || 0) + delta);
    onWeightChange(newWeight);

    // Haptic feedback
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  // Calcular progreso visual
  const progress = useMemo(() => {
    return (completedSets / totalSets) * 100;
  }, [completedSets, totalSets]);

  return (
    <motion.div
      className="mb-4"
      animate={{
        boxShadow: [
          '0 0 0px 0px rgba(99,102,241,0)',
          '0 0 18px 4px rgba(99,102,241,0.35)',
          '0 0 8px 2px rgba(139,92,246,0.25)',
          '0 0 18px 4px rgba(99,102,241,0.35)',
          '0 0 0px 0px rgba(99,102,241,0)',
        ],
      }}
      transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
      style={{ borderRadius: '0.75rem' }}
    >
    <Card className="border-2 border-indigo-300 dark:border-indigo-700">
      {/* Header con información del ejercicio - Mejorado */}
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3 mb-3">
          {/* Número de ejercicio grande y colorido */}
          <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center text-xl font-bold shadow-lg shrink-0">
            {exerciseIndex + 1}
          </div>

          <div className="flex-1 min-w-0">
            <CardTitle className="text-xl mb-1 truncate">
              {exercise.name}
            </CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                Serie {currentSet} de {totalSets}
              </span>
              {/* Badge de estado */}
              {isSetStarted && (
                <span className="px-2 py-0.5 bg-blue-500 text-white text-[10px] font-bold rounded-full shadow-sm">
                  EN PROGRESO
                </span>
              )}
              {/* ✅ Badge de récord personal */}
              {personalRecord && personalRecord.maxWeight > 0 && (
                <span className="px-2 py-0.5 bg-linear-to-r from-yellow-400 to-orange-500 text-white text-[10px] font-bold rounded-full shadow-sm flex items-center gap-1">
                  🏆 {personalRecord.maxWeight}kg
                </span>
              )}
              {exercise.recommendedReps && (
                <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                  {exercise.recommendedReps}
                </span>
              )}
            </div>
          </div>

          {/* Progreso circular */}
          <div className="relative w-14 h-14 shrink-0">
            <svg className="w-14 h-14 transform -rotate-90">
              <circle
                cx="28"
                cy="28"
                r="24"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                className="text-gray-200 dark:text-gray-700"
              />
              <circle
                cx="28"
                cy="28"
                r="24"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 24}`}
                strokeDashoffset={`${2 * Math.PI * 24 * (1 - progress / 100)}`}
                className="text-blue-500 transition-all duration-500"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                {completedSets}/{totalSets}
              </span>
            </div>
          </div>

          {/* Botón de información */}
          {onShowInfo && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onShowInfo}
              className="text-blue-600 dark:text-blue-400 shrink-0"
            >
              ℹ️
            </Button>
          )}
        </div>

        {/* Barra de progreso lineal */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </CardHeader>

      {/* Contenido principal */}
      <CardContent className="space-y-3">
        {/* Panel TUT + Tempo Visualizer */}
        {isSetStarted && setStartTime && (
          <div className="relative overflow-hidden bg-linear-to-br from-indigo-900 to-slate-900 rounded-2xl shadow-2xl border border-indigo-500/30">
            {/* Fondo animado por fase */}
            <motion.div
              className="absolute inset-0"
              animate={{ backgroundColor: tempoPhaseInfo ? `${tempoPhaseInfo.color}18` : '#6366f118' }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
            />

            <div className="relative z-10 flex flex-col items-center justify-center p-4 gap-3">
              {/* Encabezado TUT */}
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-bold text-indigo-300 uppercase tracking-widest">Tiempo Bajo Tensión</span>
                {/* Toggle metrónomo */}
                <button
                  onClick={() => setMetronomActive(v => !v)}
                  title={metronomActive ? 'Desactivar metrónomo' : 'Activar metrónomo háptico'}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                    metronomActive
                      ? 'bg-amber-500 border-amber-400 text-white shadow-lg shadow-amber-500/40'
                      : 'bg-slate-800 border-slate-600 text-slate-400'
                  }`}
                >
                  📳 {metronomActive ? 'ON' : 'OFF'}
                </button>
              </div>

              {/* Anillo de respiración + cronómetro */}
              <div className="relative flex items-center justify-center w-36 h-36">
                {/* Anillo exterior (fase) */}
                {tempoPhaseInfo && (
                  <motion.div
                    className="absolute rounded-full border-4"
                    style={{ width: '120px', height: '120px', borderColor: tempoPhaseInfo.color }}
                    animate={{ scale: tempoPhaseInfo.scale, opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 0.8, ease: 'easeInOut', opacity: { repeat: Infinity, duration: 1.5 } }}
                  />
                )}
                {/* Anillo base pulsante */}
                {!tempoPhaseInfo && (
                  <motion.div
                    className="absolute w-28 h-28 rounded-full border-4 border-indigo-500"
                    animate={{ scale: [1, 1.08, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
                  />
                )}
                {/* Centro: cronómetro */}
                <div className="flex flex-col items-center justify-center z-10">
                  <span className="text-4xl font-black tabular-nums text-white drop-shadow-[0_0_12px_rgba(99,102,241,0.7)]">
                    {formatTime(elapsedTime)}
                  </span>
                  <span className="text-[9px] font-semibold text-indigo-300 uppercase tracking-widest mt-0.5">TUT</span>
                </div>
              </div>

              {/* Indicador de fase actual */}
              <AnimatePresence mode="wait">
                {tempoPhaseInfo ? (
                  <motion.div
                    key={tempoPhaseInfo.name + tempoPhaseInfo.remaining}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.25 }}
                    className="flex flex-col items-center gap-1"
                  >
                    <span
                      className="text-lg font-black tracking-widest uppercase"
                      style={{ color: tempoPhaseInfo.color }}
                    >
                      {tempoPhaseInfo.name}
                    </span>
                    <span className="text-4xl font-black tabular-nums text-white">
                      {tempoPhaseInfo.remaining}
                    </span>
                    <span className="text-xs text-slate-400">{tempoPhaseInfo.label}</span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="no-tempo"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-medium text-slate-300">Concéntrate en el movimiento</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Weight suggestion banner - Solo si hay sugerencia Y showSuggestion es true */}
        {weightSuggestion && showSuggestion && (
          <WeightSuggestionBanner
            suggestion={weightSuggestion}
            onAccept={() => {
              setShowSuggestion(false);
              onWeightChange(weightSuggestion.suggested);
              success(
                `✅ Peso actualizado a ${weightSuggestion.suggested}kg`,
                2000,
              );
              // Llamar onDismiss después de la animación
              setTimeout(() => {
                onDismissWeightSuggestion?.();
              }, 350);
            }}
            onDismiss={() => {
              setShowSuggestion(false);
              // Llamar onDismiss después de la animación
              setTimeout(() => {
                onDismissWeightSuggestion?.();
              }, 350);
            }}
          />
        )}

        {/* Información compacta del ejercicio */}
        <div className="flex items-center gap-3 flex-wrap text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 px-3 py-2 rounded-lg">
          {exercise.equipment && (
            <span className="flex items-center gap-1">
              <span>📦</span>
              <span>{exercise.equipment}</span>
            </span>
          )}
          {exercise.restBetweenSets && (
            <span className="flex items-center gap-1">
              <span>⏸️</span>
              <span>{formatRestTime(exercise.restBetweenSets)}</span>
            </span>
          )}
          {/* Badge de Tempo */}
          <button
            onClick={() => setShowTempoSheet(true)}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold transition-all active:scale-95 ${
              exercise.tempo
                ? 'bg-violet-100 dark:bg-violet-900/30 border-violet-400 dark:border-violet-600 text-violet-700 dark:text-violet-300'
                : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400'
            }`}
          >
            <span>⏱️</span>
            <span>{exercise.tempo ? `Tempo: ${exercise.tempo}` : 'Ritmo: Libre'}</span>
          </button>
        </div>

        {/* Inputs de reps y peso */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold mb-1.5 text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Repeticiones
            </label>
            <button
              onClick={() => setEditingField("reps")}
              className={`w-full min-h-18 px-4 py-3 rounded-2xl transition-all font-bold border-2 active:scale-95 touch-manipulation ${
                currentReps === "" || currentReps === 0
                  ? "text-gray-400 dark:text-gray-600 bg-gray-50 dark:bg-gray-900 border-dashed border-gray-300 dark:border-gray-700"
                  : "text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 border-blue-400 dark:border-blue-600 shadow-md"
              }`}
            >
              <span className="text-4xl font-black tabular-nums">
                {currentReps === "" || currentReps === 0 ? "—" : currentReps}
              </span>
              {(currentReps === "" || currentReps === 0) && (
                <p className="text-[10px] text-gray-400 mt-1 font-normal">
                  toca para ingresar
                </p>
              )}
            </button>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5 text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Peso (kg)
            </label>
            <button
              onClick={() => setEditingField("weight")}
              className={`w-full min-h-18 px-4 py-3 rounded-2xl transition-all font-bold border-2 active:scale-95 touch-manipulation ${
                currentWeight === "" || currentWeight === 0
                  ? "text-gray-400 dark:text-gray-600 bg-gray-50 dark:bg-gray-900 border-dashed border-gray-300 dark:border-gray-700"
                  : "text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/30 border-purple-400 dark:border-purple-600 shadow-md"
              }`}
            >
              <span className="text-4xl font-black tabular-nums">
                {currentWeight === "" || currentWeight === 0
                  ? "—"
                  : currentWeight}
              </span>
              {currentWeight !== "" && currentWeight !== 0 && (
                <p className="text-[10px] text-gray-400 mt-1 font-normal">kg</p>
              )}
              {(currentWeight === "" || currentWeight === 0) && (
                <p className="text-[10px] text-gray-400 mt-1 font-normal">
                  toca para ingresar
                </p>
              )}
            </button>
          </div>
        </div>

        {/* Indicador de serie lista */}
        {isSetComplete && !isSetStarted && (
          <div className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-semibold text-green-700 dark:text-green-400">
              Listo — pulsa ▶️ Iniciar Serie para comenzar
            </span>
          </div>
        )}
        {isSetStarted && isSetComplete && (
          <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-300 dark:border-emerald-700">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              Serie en curso — pulsa ✅ para completar
            </span>
          </div>
        )}

        {/* Quick weight adjustment - Botones más grandes y táctiles */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">
            Ajuste rápido de peso
          </p>
          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={() => handleQuickWeightAdjustment(-5)}
              className="min-h-12 px-3 py-2 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 rounded-lg font-bold text-base transition-all active:scale-95 border-2 border-red-200 dark:border-red-800"
            >
              -5
            </button>
            <button
              onClick={() => handleQuickWeightAdjustment(-2.5)}
              className="min-h-12 px-3 py-2 bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/40 text-orange-600 dark:text-orange-400 rounded-lg font-bold text-base transition-all active:scale-95 border-2 border-orange-200 dark:border-orange-800"
            >
              -2.5
            </button>
            <button
              onClick={() => handleQuickWeightAdjustment(+2.5)}
              className="min-h-12 px-3 py-2 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-lg font-bold text-base transition-all active:scale-95 border-2 border-emerald-200 dark:border-emerald-800"
            >
              +2.5
            </button>
            <button
              onClick={() => handleQuickWeightAdjustment(+5)}
              className="min-h-12 px-3 py-2 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40 text-green-600 dark:text-green-400 rounded-lg font-bold text-base transition-all active:scale-95 border-2 border-green-200 dark:border-green-800"
            >
              +5
            </button>
          </div>
        </div>

        {/* Quick action: Repeat Previous - Más compacto */}
        {lastSetData && onRepeatPrevious && !isSetStarted && (
          <Button
            variant="ghost"
            onClick={onRepeatPrevious}
            className="w-full text-xs py-2 text-blue-600 dark:text-blue-400"
          >
            🔄 Repetir: {lastSetData.reps} reps × {lastSetData.weight}kg
          </Button>
        )}

        {/* Quick switcher - Solo cuando NO está en ejecución */}
        {!isSetStarted && quickSwitcher && (
          <div className="pt-1">{quickSwitcher}</div>
        )}
      </CardContent>

      {/* BottomSheet de configuración de Tempo */}
      <BottomSheet
        isOpen={showTempoSheet}
        onClose={() => setShowTempoSheet(false)}
        title="⏱️ Tempo de ejecución"
      >
        <div className="p-4 space-y-5">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Define el ritmo de cada fase del movimiento (en segundos).
          </p>

          {/* Inputs de 4 fases */}
          <div className="grid grid-cols-4 gap-3">
            {([
              { key: 'e' as const, label: '↓ Excéntrica', color: 'blue', hint: 'Bajada' },
              { key: 'p1' as const, label: '— Pausa', color: 'amber', hint: 'Arriba' },
              { key: 'c' as const, label: '↑ Concéntrica', color: 'emerald', hint: 'Subida' },
              { key: 'p2' as const, label: '— Pausa', color: 'slate', hint: 'Abajo' },
            ] as const).map(({ key, label, hint }) => (
              <div key={key} className="flex flex-col items-center gap-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase text-center leading-tight">
                  {label}<br/><span className="normal-case font-normal">{hint}</span>
                </label>
                <input
                  type="number"
                  min={0}
                  max={10}
                  value={tempoInputs[key]}
                  onChange={e => setTempoInputs(prev => ({ ...prev, [key]: Math.max(0, parseInt(e.target.value) || 0) }))}
                  className="w-full text-center text-2xl font-black border-2 rounded-xl py-2 bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700 focus:outline-none focus:border-indigo-500 tabular-nums"
                />
              </div>
            ))}
          </div>

          {/* Preview */}
          <div className="text-center">
            <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400">
              {tempoInputs.e}-{tempoInputs.p1}-{tempoInputs.c}-{tempoInputs.p2}
            </span>
            <p className="text-xs text-gray-400 mt-1">
              Ciclo total: {tempoInputs.e + tempoInputs.p1 + tempoInputs.c + tempoInputs.p2}s/rep
            </p>
          </div>

          {/* Presets */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase">Presets</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { name: 'Hipertrofia', tempo: '3-1-2-0' },
                { name: 'Fuerza', tempo: '2-1-1-0' },
                { name: 'Explosivo', tempo: '3-0-X-0' },
                { name: 'Libre', tempo: '' },
              ].map(preset => (
                <button
                  key={preset.name}
                  onClick={() => {
                    if (!preset.tempo) {
                      setTempoInputs({ e: 0, p1: 0, c: 0, p2: 0 });
                    } else {
                      const [e, p1, c, p2] = preset.tempo.split('-').map(Number);
                      setTempoInputs({ e: e || 0, p1: p1 || 0, c: c || 0, p2: p2 || 0 });
                    }
                  }}
                  className="py-2 px-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-sm font-semibold hover:border-indigo-400 dark:hover:border-indigo-500 transition-all active:scale-95"
                >
                  {preset.name}{preset.tempo ? ` (${preset.tempo})` : ''}
                </button>
              ))}
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="ghost"
              className="flex-1"
              onClick={() => {
                onTempoChange?.('');
                setTempoInputs({ e: 0, p1: 0, c: 0, p2: 0 });
                setShowTempoSheet(false);
              }}
            >
              Libre
            </Button>
            <Button
              className="flex-1"
              onClick={() => {
                const tempo = `${tempoInputs.e}-${tempoInputs.p1}-${tempoInputs.c}-${tempoInputs.p2}`;
                onTempoChange?.(tempo);
                setShowTempoSheet(false);
              }}
            >
              Aplicar
            </Button>
          </div>
        </div>
      </BottomSheet>

      {/* Modal de edición de repeticiones */}
      <EditValueModal
        isOpen={editingField === "reps"}
        onClose={() => setEditingField(null)}
        title={`${exercise.name} · Serie ${currentSet} — ${currentReps === "" ? "–" : currentReps} reps`}
        field="reps"
        currentValue={currentReps}
        onSave={(value) => onRepsChange(value)}
      />

      {/* Modal de edición de peso */}
      <EditValueModal
        isOpen={editingField === "weight"}
        onClose={() => setEditingField(null)}
        title={`${exercise.name} · Serie ${currentSet} — ${currentReps === "" ? "–" : currentReps} reps`}
        field="weight"
        currentValue={currentWeight}
        onSave={(value) => onWeightChange(value)}
        historicalWeights={[
          ...actualWeights,
          ...exercise.sets
            .map((s) => s.weight ?? 0)
            .filter((w): w is number => typeof w === "number" && w > 0),
        ]
          .filter((w, i, arr) => arr.indexOf(w) === i)
          .sort((a, b) => b - a)}
      />
    </Card>
    </motion.div>
  );
}
