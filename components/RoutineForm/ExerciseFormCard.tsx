"use client";

import React, { useState, useRef, useEffect } from "react";
import type { Exercise, SetType } from "@/types";
import type { ValidationError, EditingValue } from "@/hooks/useRoutineForm";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { EquipmentDropdown } from "@/components/EquipmentDropdown";
import { RestTimeSelectorCompact } from "@/components/RestTimeSelector";
import SetTypeSelector from "@/components/SetTypeSelector";
import { getExerciseByName } from "@/data/exercises";
import { useTranslations } from "@/context/LocaleContext";
import { useToast } from "@/context/NotificationContext";
import { useConfirm } from "@/context/NotificationContext";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ExerciseFormCardProps {
  exercise: Omit<Exercise, "id">;
  exerciseIndex: number;
  /** Total de ejercicios en la rutina (para confirmar eliminación del último) */
  totalExercises: number;
  isExpanded: boolean;
  /** dragOverIndex === exerciseIndex && draggedExerciseIndex !== exerciseIndex */
  isDragOver: boolean;
  /** draggedExerciseIndex === exerciseIndex */
  isDragging: boolean;
  validationErrors: ValidationError[];
  touchedFields: Set<string>;
  onToggleExpanded: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onRemove: () => void;
  onExerciseChange: (
    field: "name" | "equipment" | "notes",
    value: string,
  ) => void;
  onAddSet: () => void;
  onRemoveSet: (setIndex: number) => void;
  onCopySet: (setIndex: number) => void;
  onSetChange: (
    setIndex: number,
    field: "reps" | "weight" | "type",
    value: number | SetType,
  ) => void;
  onEditValue: (value: EditingValue) => void;
  /** Descanso global de la rutina — usado como placeholder en el selector por ejercicio */
  globalRestBetweenSets: number;
  /** Llamado tras cambiar useSmartRest o el tiempo calculado para el ejercicio */
  onSmartRestUpdate: (
    restBetweenSets: number | undefined,
    useSmartRest: boolean,
  ) => void;
  /** Llamado cuando el usuario cambia manualmente el tiempo de descanso del ejercicio */
  onRestTimeChange: (value: number | undefined) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const ExerciseFormCard: React.FC<ExerciseFormCardProps> = ({
  exercise,
  exerciseIndex,
  totalExercises,
  isExpanded,
  isDragOver,
  isDragging: _isDragging, // recibido por la interfaz; la opacidad la gestiona el padre via classList
  validationErrors,
  touchedFields,
  onToggleExpanded,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
  onRemove,
  onExerciseChange,
  onAddSet,
  onRemoveSet,
  onCopySet,
  onSetChange,
  onEditValue,
  globalRestBetweenSets,
  onSmartRestUpdate,
  onRestTimeChange,
}) => {
  const t = useTranslations("routineForm");
  const { success } = useToast();
  const { confirm } = useConfirm();

  // Click-to-edit para el nombre del ejercicio
  const [isEditingName, setIsEditingName] = useState(!exercise.name);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Enfocar automáticamente cuando se activa la edición
  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [isEditingName]);

  // Si el nombre se borra externamente, volver a modo edición
  useEffect(() => {
    if (!exercise.name) setIsEditingName(true);
  }, [exercise.name]);

  return (
    <div
      data-exercise-index={exerciseIndex}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-md border-2 transition-all overflow-hidden ${
        isDragOver
          ? "border-blue-500 dark:border-blue-400 scale-105 shadow-xl"
          : "border-gray-200 dark:border-gray-700"
      }`}
    >
      {/* Header colapsable - siempre visible */}
      <div
        className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
          validationErrors.some((err) => err.exerciseIndex === exerciseIndex)
            ? "bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500"
            : ""
        }`}
        onClick={onToggleExpanded}
      >
        {/* Drag handle */}
        <div
          className="shrink-0 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z" />
          </svg>
        </div>

        {/* Número */}
        <div className="shrink-0 w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
          {exerciseIndex + 1}
        </div>

        {/* Nombre del ejercicio */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className="text-sm sm:text-base font-bold text-gray-900 dark:text-gray-100 truncate">
              {exercise.name || `Ejercicio ${exerciseIndex + 1}`}
            </div>
            {validationErrors.some(
              (err) => err.exerciseIndex === exerciseIndex,
            ) && (
              <span className="shrink-0 px-2 py-0.5 text-xs font-semibold bg-amber-500 text-white rounded-full animate-pulse">
                ⚠️ Completar
              </span>
            )}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {exercise.sets.length}{" "}
            {exercise.sets.length === 1 ? "serie" : "series"}
            {exercise.equipment && ` • ${exercise.equipment}`}
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (totalExercises === 1) {
                // Último ejercicio: pedir confirmación antes de dejar la rutina vacía
                (async () => {
                  try {
                    const confirmed = await confirm({
                      title: "Eliminar ejercicio",
                      message:
                        "¿Estás seguro de eliminar el último ejercicio? La rutina quedará vacía.",
                      confirmText: "Eliminar",
                      cancelText: "Cancelar",
                      variant: "warning",
                    });
                    if (confirmed) onRemove();
                  } catch (_) {
                    /* ignore */
                  }
                })();
              } else {
                onRemove();
              }
            }}
            className="shrink-0 p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all active:scale-95"
            title="Eliminar ejercicio"
          >
            <span className="text-lg">🗑️</span>
          </button>

          {/* Icono de expandir/colapsar */}
          <div
            className={`text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Contenido expandible */}
      {isExpanded && (
        <div className="p-4 pt-0 space-y-4 border-t border-gray-200 dark:border-gray-700">
          {/* Nombre */}
          <div>
            {isEditingName ? (
              <input
                ref={nameInputRef}
                placeholder={t("exerciseName")}
                value={exercise.name}
                onChange={(e) => onExerciseChange("name", e.target.value)}
                required
                onBlur={() => { if (exercise.name) setIsEditingName(false); }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && exercise.name) {
                    e.preventDefault();
                    setIsEditingName(false);
                  }
                  if (e.key === "Escape" && exercise.name) {
                    setIsEditingName(false);
                  }
                }}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 font-medium ${
                  validationErrors.some(
                    (err) =>
                      err.exerciseIndex === exerciseIndex && err.setIndex === -1,
                  )
                    ? "border-red-500 dark:border-red-500"
                    : "border-gray-300 dark:border-gray-600"
                }`}
              />
            ) : (
              <button
                type="button"
                onClick={() => setIsEditingName(true)}
                className="group w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg border border-transparent hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all text-left"
                title={t("exerciseName")}
              >
                <span className="font-medium text-gray-900 dark:text-gray-100 truncate">
                  {exercise.name}
                </span>
                <svg
                  className="shrink-0 w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
              </button>
            )}
            {validationErrors.some(
              (err) =>
                err.exerciseIndex === exerciseIndex && err.setIndex === -1,
            ) && (
              <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                ⚠️ {t("exerciseNameRequired")}
              </div>
            )}
          </div>

          {/* Equipamiento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("equipmentLabel")}
            </label>
            <EquipmentDropdown
              value={exercise.equipment || ""}
              onChange={(value) => onExerciseChange("equipment", value)}
              placeholder={t("equipmentPlaceholder")}
            />
          </div>

          {/* Series */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("sets")} ({exercise.sets.length})
              </label>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={onAddSet}
                className="text-xs"
              >
                ➕ {t("addSet")}
              </Button>
            </div>

            <div className="space-y-2">
              {exercise.sets.map((set, setIndex) => (
                <div
                  key={setIndex}
                  className="p-2.5 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  {/* Header compacto en una línea */}
                  <div className="flex items-center gap-2 mb-2">
                    <div className="shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                      <span className="text-xs font-bold text-blue-700 dark:text-blue-300">
                        {setIndex + 1}
                      </span>
                    </div>

                    {/* Selector de tipo compacto */}
                    <div className="flex-1 min-w-0">
                      <SetTypeSelector
                        value={set.type || "normal"}
                        onChange={(type) => onSetChange(setIndex, "type", type)}
                        compact
                      />
                    </div>

                    {/* Botones de acción */}
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => onCopySet(setIndex)}
                        className="p-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-all active:scale-95"
                        title={t("copySetTitle")}
                      >
                        📋
                      </button>
                      {exercise.sets.length > 1 && (
                        <button
                          type="button"
                          onClick={() => onRemoveSet(setIndex)}
                          className="p-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-all active:scale-95"
                          title={t("removeSetTitle")}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Inputs de reps y peso en una línea */}
                  <div className="grid grid-cols-2 gap-2">
                    {/* Reps */}
                    <div>
                      <label className="text-[10px] text-gray-500 dark:text-gray-400 mb-0.5 block">
                        Reps
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          onEditValue({
                            exerciseIndex,
                            setIndex,
                            field: "reps",
                            currentValue: set.reps || 0,
                          })
                        }
                        className={`w-full text-center font-semibold h-8 text-sm rounded-md border-2 transition-colors ${
                          set.reps && set.reps > 0
                            ? "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500"
                            : "bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-600"
                        } ${
                          touchedFields.has(
                            `${exerciseIndex}-${setIndex}-reps`,
                          ) &&
                          validationErrors.some(
                            (err) =>
                              err.exerciseIndex === exerciseIndex &&
                              err.setIndex === setIndex &&
                              err.message.includes("Reps"),
                          )
                            ? "border-red-500 dark:border-red-500"
                            : ""
                        }`}
                      >
                        {set.reps || "-"}
                      </button>
                      {touchedFields.has(`${exerciseIndex}-${setIndex}-reps`) &&
                        validationErrors.some(
                          (err) =>
                            err.exerciseIndex === exerciseIndex &&
                            err.setIndex === setIndex &&
                            err.message.includes("Reps"),
                        ) && (
                          <div className="text-[10px] text-red-600 dark:text-red-400 mt-0.5">
                            Reps requeridas
                          </div>
                        )}
                    </div>

                    {/* Peso */}
                    <div>
                      <label className="text-[10px] text-gray-500 dark:text-gray-400 mb-0.5 block">
                        Peso (kg)
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          onEditValue({
                            exerciseIndex,
                            setIndex,
                            field: "weight",
                            currentValue: set.weight || 0,
                          })
                        }
                        className={`w-full text-center font-semibold h-8 text-sm rounded-md border-2 transition-colors ${
                          set.weight && set.weight > 0
                            ? "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500"
                            : "bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-600"
                        } ${
                          touchedFields.has(
                            `${exerciseIndex}-${setIndex}-weight`,
                          ) &&
                          validationErrors.some(
                            (err) =>
                              err.exerciseIndex === exerciseIndex &&
                              err.setIndex === setIndex &&
                              err.message.includes("Peso"),
                          )
                            ? "border-red-500 dark:border-red-500"
                            : ""
                        }`}
                      >
                        {set.weight ? `${set.weight} kg` : "-"}
                      </button>
                      {touchedFields.has(
                        `${exerciseIndex}-${setIndex}-weight`,
                      ) &&
                        validationErrors.some(
                          (err) =>
                            err.exerciseIndex === exerciseIndex &&
                            err.setIndex === setIndex &&
                            err.message.includes("Peso"),
                        ) && (
                          <div className="text-[10px] text-red-600 dark:text-red-400 mt-0.5">
                            Peso requerido
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notas */}
          <Input
            placeholder={t("notes")}
            value={exercise.notes || ""}
            onChange={(e) => onExerciseChange("notes", e.target.value)}
          />

          {/* Descanso entre series */}
          <div className="flex items-center gap-3 p-3 bg-linear-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <span className="text-xl">⏱️</span>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                  Descanso entre series:
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const willEnableSmartRest = !exercise.useSmartRest;

                    if (willEnableSmartRest) {
                      const exerciseTemplate = getExerciseByName(exercise.name);
                      if (exerciseTemplate) {
                        const avgReps = Math.round(
                          exercise.sets.reduce(
                            (sum, set) => sum + (set.reps || 10),
                            0,
                          ) / exercise.sets.length,
                        );

                        import("@/lib/restCalculator").then(
                          ({ calculateRestBetweenSets }) => {
                            const restRecommendation =
                              calculateRestBetweenSets(
                                exerciseTemplate,
                                exercise.sets.length,
                                avgReps,
                                "intermediate",
                              );

                            // Redondear a intervalos de 5 segundos
                            const recommendedTime =
                              Math.round(
                                restRecommendation.recommended / 5,
                              ) * 5;

                            onSmartRestUpdate(recommendedTime, true);

                            // Mostrar notificación con el tiempo calculado
                            const minutes = Math.floor(recommendedTime / 60);
                            const seconds = recommendedTime % 60;
                            const timeStr =
                              seconds > 0
                                ? `${minutes}:${seconds.toString().padStart(2, "0")}`
                                : `${minutes}:00`;
                            success(
                              `Descanso inteligente aplicado: ${timeStr} (${restRecommendation.description})`,
                              3000,
                            );
                          },
                        );
                      }
                    } else {
                      // Si se desactiva, limpiar el tiempo específico
                      onSmartRestUpdate(undefined, false);
                    }
                  }}
                  className={`px-2 py-1 text-xs font-semibold rounded transition-all ${
                    exercise.useSmartRest
                      ? "bg-purple-500 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  }`}
                  title="Usar descanso inteligente basado en características del ejercicio"
                >
                  🧠 Inteligente
                </button>
              </div>

              {!exercise.useSmartRest && (
                <RestTimeSelectorCompact
                  value={exercise.restBetweenSets}
                  onChange={onRestTimeChange}
                  placeholder={`${Math.floor(globalRestBetweenSets / 60)}:${(globalRestBetweenSets % 60).toString().padStart(2, "0")} (global)`}
                  className="flex-1"
                />
              )}

              {exercise.useSmartRest && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-purple-600 dark:text-purple-400 italic">
                    Descanso inteligente
                  </span>
                  {exercise.restBetweenSets && (
                    <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded font-semibold">
                      {Math.floor(exercise.restBetweenSets / 60)}:
                      {(exercise.restBetweenSets % 60)
                        .toString()
                        .padStart(2, "0")}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
