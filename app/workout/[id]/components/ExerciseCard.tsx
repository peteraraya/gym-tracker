"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { WeightSuggestionBanner } from "@/components/features/workout/WeightSuggestionBanner";
import { useToast } from "@/context/NotificationContext";
import { useTranslations } from "@/context/LocaleContext";
import { formatRestTime } from "@/lib/shared/utils/formatTime";
import { RestTimer } from "@/components/workout/RestTimer";
import type { Exercise } from "@/types";
import type { WeightSuggestion } from "@/lib/shared/utils/weightSuggestions";

interface ExerciseCardProps {
  exercise: Exercise;
  exerciseIndex: number;
  currentSet: number;
  completedSets: number;
  currentReps: number | "";
  currentWeight: number | "";
  onRepsChange: (reps: number | "") => void;
  onWeightChange: (weight: number | "") => void;
  onCompleteSet?: () => void;
  onShowInfo?: () => void;
  isSetStarted?: boolean;
  weightSuggestion?: WeightSuggestion | null;
  onDismissWeightSuggestion?: () => void;
  // New props for "Repeat Previous" feature
  lastSetData?: { reps: number; weight: number } | null;
  onRepeatPrevious?: () => void;
  // Quick exercise switcher (rendered as children)
  quickSwitcher?: React.ReactNode;
  // ✅ Personal record for this exercise
  personalRecord?: { maxWeight: number; reps: number; date: Date } | null;
  // Callback para cambiar el tempo del ejercicio
  onTempoChange?: (tempo: string) => void;
  // Timer de descanso (inline compacto)
  isResting?: boolean;
  restTimeLeft?: number;
  restDuration?: number;
  restTitle?: string;
  nextExerciseName?: string;
  onRestComplete?: () => void;
  onRestExtend?: (seconds: number) => void;
  onRestPause?: () => void;
  onRestSkip?: () => void;
  smartRestSuggestion?: { seconds: number; reason: string } | null;
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
  onShowInfo,
  isSetStarted = false,
  weightSuggestion,
  onDismissWeightSuggestion,
  lastSetData,
  onRepeatPrevious,
  quickSwitcher,
  personalRecord,
  onTempoChange,
isResting = false,
  restTimeLeft,
  restDuration,
  restTitle,
  nextExerciseName,
  onRestComplete,
  onRestExtend,
  onRestPause,
  onRestSkip,
  smartRestSuggestion,
}: ExerciseCardProps) {
  const { success, error } = useToast();
  const t = useTranslations("workout");
  const totalSets = exercise.sets.length;
  const isSetComplete = currentReps !== "" && currentReps > 0 && currentWeight !== "";

  // Estado para modales de edición
  const [editingField, setEditingField] = useState<"reps" | "weight" | null>(
    null,
  );
  const [editDraft, setEditDraft] = useState("");
  const editInputRef = useRef<HTMLInputElement>(null);

  // Estado local para controlar la visibilidad de la sugerencia
  const [showSuggestion, setShowSuggestion] = useState(true);

  useEffect(() => {
    if (editingField) {
      editInputRef.current?.focus();
      editInputRef.current?.select();
    }
  }, [editingField]);

  const startEditing = (field: "reps" | "weight") => {
    const value = field === "reps" ? currentReps : currentWeight;
    setEditDraft(value === "" ? "" : String(value));
    setEditingField(field);
  };

  const updateRepsWithUndo = (nextValue: number | "") => {
    const previousValue = currentReps;
    if (previousValue === nextValue) return;
    onRepsChange(nextValue);
    success(t("valueUpdated"), 5000, {
      label: t("undo"),
      onClick: () => onRepsChange(previousValue),
    });
  };

  const updateWeightWithUndo = (nextValue: number | "") => {
    const previousValue = currentWeight;
    if (previousValue === nextValue) return;
    onWeightChange(nextValue);
    success(t("valueUpdated"), 5000, {
      label: t("undo"),
      onClick: () => onWeightChange(previousValue),
    });
  };

  const saveEdit = (field: "reps" | "weight") => {
    if (editingField !== field) return;
    const value = Number(editDraft);
    const isValid = editDraft.trim() !== "" && Number.isFinite(value) &&
      (field === "reps" ? Number.isInteger(value) && value > 0 : value >= 0);

    if (!isValid) {
      error(t("enterValue"), 2500);
      editInputRef.current?.focus();
      return;
    }

    const nextValue = field === "reps" ? value : Math.round(value * 100) / 100;
    if (field === "reps") updateRepsWithUndo(nextValue);
    else updateWeightWithUndo(nextValue);
    setEditingField(null);
  };

  const repeatPreviousWithUndo = () => {
    if (!lastSetData || !onRepeatPrevious) return;
    const previousReps = currentReps;
    const previousWeight = currentWeight;
    onRepeatPrevious();
    success(
      `${lastSetData.reps} ${t("repsUnit")} × ${lastSetData.weight} kg`,
      5000,
      {
        label: t("undo"),
        onClick: () => {
          onRepsChange(previousReps);
          onWeightChange(previousWeight);
        },
      },
    );
  };

  // Estado para Tempo
  const [showTempoSheet, setShowTempoSheet] = useState(false);
  const [tempoInputs, setTempoInputs] = useState({ e: 3, p1: 1, c: 2, p2: 0 });

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

  // Resetear showSuggestion cuando cambia weightSuggestion
  React.useEffect(() => {
    if (weightSuggestion) {
      setShowSuggestion(true);
    }
  }, [weightSuggestion]);

  // Quick weight adjustment handler
  const handleQuickWeightAdjustment = (delta: number) => {
    const newWeight = Math.max(0, (currentWeight || 0) + delta);
    updateWeightWithUndo(newWeight);

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

        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <div className="min-w-0 rounded-2xl border border-blue-200 bg-blue-50/80 p-2.5 dark:border-blue-900 dark:bg-blue-950/30 sm:p-3">
            <label className="mb-2 block text-center text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              {t("repsShort")}
            </label>
            {editingField === "reps" ? (
              <input
                ref={editInputRef}
                type="number"
                inputMode="numeric"
                min="1"
                step="1"
                value={editDraft}
                onChange={(event) => setEditDraft(event.target.value)}
                onBlur={() => saveEdit("reps")}
                onKeyDown={(event) => {
                  if (event.key === "Enter") saveEdit("reps");
                  if (event.key === "Escape") setEditingField(null);
                }}
                aria-label={t("repsPerformed")}
                className="h-12 w-full rounded-xl border border-blue-300 bg-white text-center text-2xl font-black tabular-nums text-blue-700 outline-none focus:ring-2 focus:ring-blue-500 dark:border-blue-800 dark:bg-gray-900 dark:text-blue-300"
              />
            ) : (
              <div className="flex items-center justify-between gap-1">
                <button
                  type="button"
                  onClick={() => updateRepsWithUndo(Math.max(1, Number(currentReps || 1) - 1))}
                  disabled={currentReps === "" || currentReps <= 1}
                  aria-label={t("decreaseReps")}
                  className="h-11 w-11 shrink-0 rounded-xl bg-white text-lg font-bold text-blue-700 shadow-sm active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-gray-900 dark:text-blue-300"
                >
                  −
                </button>
                <button
                  type="button"
                  onClick={() => startEditing("reps")}
                  aria-label={`${t("tapToEdit")}: ${t("repsShort")}`}
                  className="min-w-0 flex-1 rounded-lg py-1 text-center text-3xl font-black tabular-nums text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-blue-300"
                >
                  {currentReps === "" || currentReps === 0 ? "—" : currentReps}
                </button>
                <button
                  type="button"
                  onClick={() => updateRepsWithUndo(Number(currentReps || 0) + 1)}
                  aria-label={t("increaseReps")}
                  className="h-11 w-11 shrink-0 rounded-xl bg-white text-lg font-bold text-blue-700 shadow-sm active:scale-95 dark:bg-gray-900 dark:text-blue-300"
                >
                  +
                </button>
              </div>
            )}
          </div>

          <div className="min-w-0 rounded-2xl border border-purple-200 bg-purple-50/80 p-2.5 dark:border-purple-900 dark:bg-purple-950/30 sm:p-3">
            <label className="mb-2 block text-center text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              {t("weightShort")} (kg)
            </label>
            {editingField === "weight" ? (
              <input
                ref={editInputRef}
                type="number"
                inputMode="decimal"
                min="0"
                step="0.5"
                value={editDraft}
                onChange={(event) => setEditDraft(event.target.value)}
                onBlur={() => saveEdit("weight")}
                onKeyDown={(event) => {
                  if (event.key === "Enter") saveEdit("weight");
                  if (event.key === "Escape") setEditingField(null);
                }}
                aria-label={t("weightUsed")}
                className="h-12 w-full rounded-xl border border-purple-300 bg-white text-center text-2xl font-black tabular-nums text-purple-700 outline-none focus:ring-2 focus:ring-purple-500 dark:border-purple-800 dark:bg-gray-900 dark:text-purple-300"
              />
            ) : (
              <div className="flex items-center justify-between gap-1">
                <button
                  type="button"
                  onClick={() => handleQuickWeightAdjustment(-2.5)}
                  aria-label={t("decreaseWeight")}
                  className="h-11 w-11 shrink-0 rounded-xl bg-white text-lg font-bold text-purple-700 shadow-sm active:scale-95 dark:bg-gray-900 dark:text-purple-300"
                >
                  −
                </button>
                <button
                  type="button"
                  onClick={() => startEditing("weight")}
                  aria-label={`${t("tapToEdit")}: ${t("weightShort")}`}
                  className="min-w-0 flex-1 rounded-lg py-1 text-center text-3xl font-black tabular-nums text-purple-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 dark:text-purple-300"
                >
                  {currentWeight === "" || currentWeight === 0 ? "—" : currentWeight}
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickWeightAdjustment(2.5)}
                  aria-label={t("increaseWeight")}
                  className="h-11 w-11 shrink-0 rounded-xl bg-white text-lg font-bold text-purple-700 shadow-sm active:scale-95 dark:bg-gray-900 dark:text-purple-300"
                >
                  +
                </button>
              </div>
            )}
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

        {/* Timer de descanso inline (modo compacto) */}
        {isResting && restDuration && restTimeLeft !== undefined && (
          <div className="mt-3" data-testid="inline-rest-timer">
            <RestTimer
              compact
              size="md"
              duration={restDuration}
              remaining={restTimeLeft}
              state={restTimeLeft > 0 ? 'running' : 'completed'}
              onStateChange={() => {}}
              label={restTitle || "Descanso"}
              nextExercise={nextExerciseName}
              smartSuggestion={smartRestSuggestion}
              onComplete={onRestComplete}
              onSkip={onRestSkip}
              onExtend={onRestExtend}
              onPause={onRestPause}
              autoStart={true}
            />
          </div>
        )}

        {/* Quick action: Repeat Previous - Más compacto */}
        {lastSetData && onRepeatPrevious && !isSetStarted && (
          <Button
            variant="ghost"
            onClick={repeatPreviousWithUndo}
            className="min-h-11 w-full justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 text-xs font-semibold text-blue-700 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-300"
          >
            ↻ {t("repeatPrevious")}: {lastSetData.reps} {t("repsUnit")} × {lastSetData.weight}kg
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

    </Card>
    </motion.div>
  );
}
