"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  GripVertical,
  ChevronDown,
  Pencil,
  Trash2,
  Plus,
  X,
  Camera,
  Dumbbell,
  AlertTriangle,
  Copy,
  Timer,
} from "@/components/icons/lucide";
import { useRoutineForm } from "@/hooks/useRoutineForm";
import { Input, TextArea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { EditValueModal } from "@/components/shared/EditValueModal";
import { ExerciseSelector } from "@/components/features/exercises/ExerciseSelector";
import { EquipmentDropdown } from "@/components/features/equipment/EquipmentDropdown";
import {
  RestTimeSelector,
  RestTimeSelectorCompact,
} from "@/components/features/workout/RestTimeSelector";
import SetTypeSelector from "@/components/features/workout/SetTypeSelector";
import { WarmupRecommendation } from "@/components/features/workout/WarmupRecommendation";
import { StepIndicator } from "@/components/features/routines/RoutineForm/StepIndicator";
import { Spinner } from "@/components/ui/Spinner";

interface RoutineFormProps {
  routineId?: string | null;
  onClose: () => void;
}

export const RoutineForm: React.FC<RoutineFormProps> = ({
  routineId,
  onClose,
}) => {
  const {
    currentStep,
    setCurrentStep,
    name,
    setName,
    description,
    setDescription,
    image,
    setImage,
    exercises,
    setExercises,
    isExerciseSelectorOpen,
    setIsExerciseSelectorOpen,
    restBetweenSets,
    setRestBetweenSets,
    restBetweenExercises,
    setRestBetweenExercises,
    isSubmitting,
    validationErrors,
    touchedFields,
    showBasicErrors,
    setShowBasicErrors,
    draggedExerciseIndex,
    setDraggedExerciseIndex,
    dragOverIndex,
    setDragOverIndex,
    expandedExercises,
    toggleExerciseExpanded,
    editingValue,
    setEditingValue,
    userProfile,
    routineStats,
    canProceedToExercises,
    canProceedToReview,
    routineMuscleGroups,
    handleCancelWithConfirm,
    handleAddExercise,
    handleSelectExercises,
    handleAddWarmups,
    handleAddCustomExercise,
    handleRemoveExercise,
    handleMoveExercise,
    handleExerciseChange,
    handleAddSet,
    handleRemoveSet,
    handleCopySet,
    handleSetChange,
    handleSubmit,
    handleImageUpload,
    handleRemoveImage,
    validateExercises,
    t,
    tc,
    setTouchedFields,
    setValidationErrors,
    setExpandedExercises,
    confirm,
    success,
    error,
    getExerciseByName,
  } = useRoutineForm(routineId, onClose);

  // Shake en el input de nombre cuando falla validación
  const [shakeNameInput, setShakeNameInput] = useState(false);

  // Trackea qué ejercicios tienen el input de nombre activo
  const [editingNameIndexes, setEditingNameIndexes] = useState<Set<number>>(
    new Set(),
  );
  const nameInputRefs = useRef<Map<number, HTMLInputElement>>(new Map());

  const startEditingName = (index: number) => {
    setEditingNameIndexes((prev) => new Set(prev).add(index));
  };
  const stopEditingName = (index: number, name: string) => {
    if (name) {
      setEditingNameIndexes((prev) => {
        const next = new Set(prev);
        next.delete(index);
        return next;
      });
    }
  };

  // Auto-focus cuando se activa la edición del nombre
  useEffect(() => {
    editingNameIndexes.forEach((index) => {
      const input = nameInputRefs.current.get(index);
      if (input) {
        input.focus();
        input.select();
      }
    });
  }, [editingNameIndexes]);

  return (
    <div className="min-h-[600px] flex flex-col">
      {/* Header: título + botones — scrollea con el contenido */}
      <div className="bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg px-4 sm:px-6 pt-4 sm:pt-6 pb-3">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1 pr-2">
            <h2 className="text-lg sm:text-2xl font-bold text-white mb-0.5">
              {routineId ? t("editRoutine") : t("newRoutine")}
            </h2>
            <p className="text-blue-100 text-sm">
              {currentStep === "basic" ? "Paso 1 de 3: Información" : currentStep === "exercises" ? "Paso 2 de 3: Ejercicios" : "Paso 3 de 3: Revisar"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCancelWithConfirm}
              className="text-white/80 hover:text-white bg-transparent hover:bg-white/10 px-3 py-2 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors shrink-0"
              aria-label="Cerrar"
            >
              <span className="text-2xl text-white">×</span>
            </button>
          </div>
        </div>
      </div>

      {/* Barra de progreso + pasos — sticky, compacta */}
      <div className="bg-linear-to-r from-blue-600 to-indigo-600 px-4 sm:px-6 pb-4 sticky top-0 z-10 shadow-md">
        <div className="pt-2">
          <div className="h-1.5 bg-white/20 rounded-full overflow-hidden mb-3">
            <div
              className="h-full bg-white transition-all duration-300"
              style={{ width: `${(currentStep === 'basic' ? 1 : currentStep === 'exercises' ? 2 : 3) / 3 * 100}%` }}
            />
          </div>
          <StepIndicator
            currentStep={currentStep}
            canProceedToExercises={canProceedToExercises}
            canProceedToReview={canProceedToReview}
            onStepClick={(step) => setCurrentStep(step)}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col pt-6 sm:pt-8">
        {/* Step 1: Basic Information */}
        {currentStep === "basic" && (
          <div className="flex-1 space-y-8 animate-fadeIn">
            <div className="bg-linear-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 sm:p-6 rounded-xl border border-blue-200 dark:border-blue-800">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                📝 Información Básica
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Dale un nombre y descripción a tu rutina
              </p>
            </div>

            <div className="scroll-mt-20">
            <Input
              id="routine-name-input"
              label={`${t("routineName")} *`}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (showBasicErrors) setShowBasicErrors(false);
                if (shakeNameInput) setShakeNameInput(false);
              }}
              onBlur={() =>
                setTouchedFields((prev) => new Set(prev).add("routine-name"))
              }
              error={
                (showBasicErrors || touchedFields.has("routine-name")) &&
                !name.trim()
                  ? "El nombre de la rutina es obligatorio"
                  : undefined
              }
              placeholder={t("routineNamePlaceholder")}
              required
              className={`text-base sm:text-lg font-semibold transition-all ${
                shakeNameInput ? "animate-shake" : ""
              }`}
            />
            </div>

            <TextArea
              label={t("description")}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("descriptionPlaceholder")}
              rows={4}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                {t("imageLabel")}
              </label>
              {image ? (
                <div className="relative group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image}
                    alt={t("imagePreviewAlt")}
                    className="w-full h-56 sm:h-64 object-cover rounded-xl shadow-lg"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-3 right-3 bg-red-600 text-white p-2.5 rounded-full hover:bg-red-700 transition-all shadow-lg opacity-0 group-hover:opacity-100 active:scale-95"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 sm:p-12 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <Camera className="w-12 h-12 sm:w-14 sm:h-14 mb-3 text-gray-400 dark:text-gray-500" />
                    <span className="text-base sm:text-lg font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t("imageUploadClick")}
                    </span>
                    <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-500">
                      {t("imageFormats")}
                    </span>
                  </label>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <RestTimeSelector
                label={t("restBetweenSets")}
                value={restBetweenSets}
                onChange={(v) => setRestBetweenSets(v)}
                includeZero={false}
              />
              <RestTimeSelector
                label={t("restBetweenExercises")}
                value={restBetweenExercises}
                onChange={(v) => setRestBetweenExercises(v)}
                includeZero={false}
              />
            </div>

            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={handleCancelWithConfirm}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={() => {
                  if (!canProceedToExercises) {
                    setShowBasicErrors(true);
                    setTouchedFields((prev) => new Set(prev).add("routine-name"));
                    // Focus + shake en el input
                    const input = document.getElementById("routine-name-input") as HTMLInputElement | null;
                    if (input) {
                      input.scrollIntoView({ behavior: "smooth", block: "center" });
                      input.focus();
                    }
                    setShakeNameInput(true);
                    setTimeout(() => setShakeNameInput(false), 600);
                  } else {
                    setCurrentStep("exercises");
                  }
                }}
                className="px-8"
              >
                Siguiente: Ejercicios →
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Exercises */}
        {currentStep === "exercises" && (
          <div className="flex-1 space-y-8 animate-fadeIn">
            <div className="bg-linear-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 sm:p-6 rounded-xl border border-purple-200 dark:border-purple-800">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                💪 Ejercicios de la Rutina
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Agrega los ejercicios que formarán parte de tu rutina
              </p>
            </div>

            {/* Estadísticas de la rutina */}
            {exercises.length > 0 && (
              <div className="bg-linear-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 mb-3">
                  <Timer className="w-5 h-5 text-blue-500 dark:text-blue-400 shrink-0" />
                  <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                    Duración Estimada
                  </h4>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Tiempo estimado
                    </div>
                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {routineStats.estimatedDurationFormatted}
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Rango
                    </div>
                    <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {routineStats.durationRange.minFormatted} -{" "}
                      {routineStats.durationRange.maxFormatted}
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Ejercicios
                    </div>
                    <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                      {routineStats.totalExercises}
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Series totales
                    </div>
                    <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                      {routineStats.totalSets}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                  💡 Estimación basada en ~30s por serie + descansos
                  configurados
                </p>
              </div>
            )}

            {exercises.length > 0 && (
              <WarmupRecommendation
                routineMuscleGroups={routineMuscleGroups}
                onAddWarmups={handleAddWarmups}
              />
            )}

            <div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {t("exercisesTitle")} ({exercises.length})
                </h3>
                <div className="flex gap-2 flex-wrap w-full sm:w-auto">
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={handleAddExercise}
                    className="flex-1 sm:flex-none"
                  >
                    <Plus className="w-4 h-4" /> {t("fromLibrary")}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={handleAddCustomExercise}
                    className="flex-1 sm:flex-none"
                  >
                    <Pencil className="w-4 h-4" /> {t("manual")}
                  </Button>
                </div>
              </div>

              {exercises.length === 0 && (
                <div className="text-center py-12 sm:py-16 bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600">
                  <Dumbbell className="w-14 h-14 sm:w-16 sm:h-16 mb-4 text-gray-400 dark:text-gray-500 mx-auto" />
                  <p className="text-base sm:text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t("noExercises")}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                    Comienza agregando ejercicios desde la biblioteca
                  </p>
                  <Button
                    type="button"
                    variant="primary"
                    onClick={handleAddExercise}
                  >
                    {t("addFirstExercise")}
                  </Button>
                </div>
              )}

              <div className="space-y-4">
                {exercises.map((exercise, exerciseIndex) => {
                  const isExpanded = expandedExercises.has(exerciseIndex);

                  return (
                    <div
                      key={exerciseIndex}
                      data-exercise-index={exerciseIndex}
                      draggable
                      onDragStart={(e) => {
                        setDraggedExerciseIndex(exerciseIndex);
                        e.dataTransfer.effectAllowed = "move";
                        e.currentTarget.classList.add("opacity-50");
                      }}
                      onDragEnd={(e) => {
                        setDraggedExerciseIndex(null);
                        setDragOverIndex(null);
                        e.currentTarget.classList.remove("opacity-50");
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = "move";
                        setDragOverIndex(exerciseIndex);
                      }}
                      onDragLeave={() => {
                        setDragOverIndex(null);
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (
                          draggedExerciseIndex !== null &&
                          draggedExerciseIndex !== exerciseIndex
                        ) {
                          handleMoveExercise(
                            draggedExerciseIndex,
                            exerciseIndex,
                          );
                        }
                        setDraggedExerciseIndex(null);
                        setDragOverIndex(null);
                      }}
                      className={`bg-white dark:bg-gray-800 rounded-xl shadow-md border-2 transition-all overflow-hidden ${
                        dragOverIndex === exerciseIndex &&
                        draggedExerciseIndex !== exerciseIndex
                          ? "border-blue-500 dark:border-blue-400 scale-105 shadow-xl"
                          : "border-gray-200 dark:border-gray-700"
                      }`}
                    >
                      {/* Header colapsable - siempre visible */}
                      <div
                        className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                          validationErrors.some(
                            (err) => err.exerciseIndex === exerciseIndex,
                          )
                            ? "bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500"
                            : ""
                        }`}
                        onClick={() => toggleExerciseExpanded(exerciseIndex)}
                      >
                        {/* Drag handle */}
                        <div
                          className="shrink-0 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                          onMouseDown={(e) => e.stopPropagation()}
                        >
                          <GripVertical className="w-5 h-5" />
                        </div>

                        {/* Número */}
                        <div className="shrink-0 w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                          {exerciseIndex + 1}
                        </div>

                        {/* Nombre del ejercicio */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <div className="text-sm sm:text-base font-bold text-gray-900 dark:text-gray-100 truncate">
                              {exercise.name ||
                                `Ejercicio ${exerciseIndex + 1}`}
                            </div>
                            {validationErrors.some(
                              (err) => err.exerciseIndex === exerciseIndex,
                            ) && (
                              <span className="shrink-0 flex items-center gap-1 px-2 py-0.5 text-xs font-semibold bg-amber-500 text-white rounded-full animate-pulse">
                                <AlertTriangle className="w-3 h-3" /> Completar
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
                              if (exercises.length === 1) {
                                // Si es el último ejercicio, mostrar confirmación (confirm devuelve Promise<boolean>)
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
                                    if (confirmed)
                                      handleRemoveExercise(exerciseIndex);
                                  } catch (e) {
                                    /* ignore */
                                  }
                                })();
                              } else {
                                handleRemoveExercise(exerciseIndex);
                              }
                            }}
                            className="shrink-0 p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all active:scale-95"
                            title="Eliminar ejercicio"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>

                          {/* Icono de expandir/colapsar */}
                          <div
                            className={`text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                          >
                            <ChevronDown className="w-5 h-5" />
                          </div>
                        </div>
                      </div>

                      {/* Contenido expandible */}
                      {isExpanded && (
                        <div className="p-4 pt-0 space-y-4 border-t border-gray-200 dark:border-gray-700">
                          <div>
                            {editingNameIndexes.has(exerciseIndex) ||
                            !exercise.name ? (
                              <input
                                ref={(el) => {
                                  if (el)
                                    nameInputRefs.current.set(
                                      exerciseIndex,
                                      el,
                                    );
                                  else
                                    nameInputRefs.current.delete(exerciseIndex);
                                }}
                                placeholder={t("exerciseName")}
                                value={exercise.name}
                                onChange={(e) =>
                                  handleExerciseChange(
                                    exerciseIndex,
                                    "name",
                                    e.target.value,
                                  )
                                }
                                required
                                onBlur={() =>
                                  stopEditingName(exerciseIndex, exercise.name)
                                }
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" && exercise.name) {
                                    e.preventDefault();
                                    stopEditingName(exerciseIndex, exercise.name);
                                  }
                                  if (e.key === "Escape" && exercise.name) {
                                    stopEditingName(exerciseIndex, exercise.name);
                                  }
                                }}
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 font-medium ${
                                  validationErrors.some(
                                    (err) =>
                                      err.exerciseIndex === exerciseIndex &&
                                      err.setIndex === -1,
                                  )
                                    ? "border-red-500 dark:border-red-500"
                                    : "border-gray-300 dark:border-gray-600"
                                }`}
                              />
                            ) : (
                              <button
                                type="button"
                                onClick={() => startEditingName(exerciseIndex)}
                                className="group w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg border border-transparent hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all text-left"
                                title={t("exerciseName")}
                              >
                                <span className="font-medium text-gray-900 dark:text-gray-100 truncate">
                                  {exercise.name}
                                </span>
                                <Pencil className="shrink-0 w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </button>
                            )}
                            {validationErrors.some(
                              (err) =>
                                err.exerciseIndex === exerciseIndex &&
                                err.setIndex === -1,
                            ) && (
                              <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                                ⚠️ {t("exerciseNameRequired")}
                              </div>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              {t("equipmentLabel")}
                            </label>
                            <EquipmentDropdown
                              value={exercise.equipment || ""}
                              onChange={(value) =>
                                handleExerciseChange(
                                  exerciseIndex,
                                  "equipment",
                                  value,
                                )
                              }
                              placeholder={t("equipmentPlaceholder")}
                            />
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                {t("sets")} ({exercise.sets.length})
                              </label>
                              <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={() => handleAddSet(exerciseIndex)}
                                className="text-xs flex items-center gap-1"
                              >
                                <Plus className="w-3 h-3" /> {t("addSet")}
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
                                        onChange={(type) =>
                                          handleSetChange(
                                            exerciseIndex,
                                            setIndex,
                                            "type",
                                            type,
                                          )
                                        }
                                        compact
                                      />
                                    </div>

                                    {/* Botones de acción */}
                                    <div className="flex gap-1">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleCopySet(exerciseIndex, setIndex)
                                        }
                                        className="p-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 transition-all active:scale-95"
                                        title={t("copySetTitle")}
                                      >
                                        <Copy className="w-3 h-3" />
                                      </button>
                                      {exercise.sets.length > 1 && (
                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleRemoveSet(
                                              exerciseIndex,
                                              setIndex,
                                            )
                                          }
                                          className="p-1.5 bg-red-500 text-white rounded hover:bg-red-600 transition-all active:scale-95"
                                          title={t("removeSetTitle")}
                                        >
                                          <X className="w-3 h-3" />
                                        </button>
                                      )}
                                    </div>
                                  </div>

                                  {/* Inputs de reps y peso en una línea */}
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <label className="text-[10px] text-gray-500 dark:text-gray-400 mb-0.5 block">
                                        Reps
                                      </label>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setEditingValue({
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
                                              err.exerciseIndex ===
                                                exerciseIndex &&
                                              err.setIndex === setIndex &&
                                              err.message.includes("Reps"),
                                          )
                                            ? "border-red-500 dark:border-red-500"
                                            : ""
                                        }`}
                                      >
                                        {set.reps || "-"}
                                      </button>
                                      {touchedFields.has(
                                        `${exerciseIndex}-${setIndex}-reps`,
                                      ) &&
                                        validationErrors.some(
                                          (err) =>
                                            err.exerciseIndex ===
                                              exerciseIndex &&
                                            err.setIndex === setIndex &&
                                            err.message.includes("Reps"),
                                        ) && (
                                          <div className="text-[10px] text-red-600 dark:text-red-400 mt-0.5">
                                            Reps requeridas
                                          </div>
                                        )}
                                    </div>
                                    <div>
                                      <label className="text-[10px] text-gray-500 dark:text-gray-400 mb-0.5 block">
                                        Peso (kg)
                                      </label>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setEditingValue({
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
                                              err.exerciseIndex ===
                                                exerciseIndex &&
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
                                            err.exerciseIndex ===
                                              exerciseIndex &&
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

                          <Input
                            placeholder={t("notes")}
                            value={exercise.notes || ""}
                            onChange={(e) =>
                              handleExerciseChange(
                                exerciseIndex,
                                "notes",
                                e.target.value,
                              )
                            }
                          />

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
                                    const willEnableSmartRest =
                                      !exercise.useSmartRest;

                                    // Si se activa el descanso inteligente, calcular y aplicar el tiempo recomendado
                                    if (willEnableSmartRest) {
                                      const exerciseTemplate =
                                        getExerciseByName(exercise.name);
                                      if (exerciseTemplate) {
                                        // Calcular promedio de reps de todas las series
                                        const avgReps = Math.round(
                                          exercise.sets.reduce(
                                            (sum, set) =>
                                              sum + (set.reps || 10),
                                            0,
                                          ) / exercise.sets.length,
                                        );

                                        // Importar la función de cálculo
                                        import("@/lib/workout/restCalculator").then(
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
                                                restRecommendation.recommended /
                                                  5,
                                              ) * 5;

                                            // Aplicar el tiempo calculado - usar el estado actual
                                            setExercises((currentExercises) => {
                                              const updatedExercises = [
                                                ...currentExercises,
                                              ];
                                              updatedExercises[
                                                exerciseIndex
                                              ].restBetweenSets =
                                                recommendedTime;
                                              updatedExercises[
                                                exerciseIndex
                                              ].useSmartRest = true;
                                              return updatedExercises;
                                            });

                                            // Mostrar notificación con el tiempo calculado
                                            const minutes = Math.floor(
                                              recommendedTime / 60,
                                            );
                                            const seconds =
                                              recommendedTime % 60;
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
                                      setExercises((currentExercises) => {
                                        const updatedExercises = [
                                          ...currentExercises,
                                        ];
                                        updatedExercises[
                                          exerciseIndex
                                        ].restBetweenSets = undefined;
                                        updatedExercises[
                                          exerciseIndex
                                        ].useSmartRest = false;
                                        return updatedExercises;
                                      });
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
                                  onChange={(v) => {
                                    const newExercises = [...exercises];
                                    newExercises[
                                      exerciseIndex
                                    ].restBetweenSets = v;
                                    setExercises(newExercises);
                                  }}
                                  placeholder={`${Math.floor(restBetweenSets / 60)}:${(restBetweenSets % 60).toString().padStart(2, "0")} (global)`}
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
                                      {Math.floor(
                                        exercise.restBetweenSets / 60,
                                      )}
                                      :
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
                })}
                {exercises.length === 0 && (
                  <span className="text-red-500 dark:text-red-200 text-sm text-center">
                    Debes agregar al menos un ejercicio a la rutina.
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setCurrentStep("basic")}
                className="order-2 sm:order-1"
              >
                ← Volver
              </Button>
              <Button
                type="button"
                variant="primary"
                disabled={exercises.length === 0 || !canProceedToExercises}
                onClick={() => {
                  const validation = validateExercises();
                  if (validation.errors.length > 0) {
                    // Expandir ejercicios con errores
                    setExpandedExercises(validation.exercisesWithErrors);

                    // Marcar todos los campos como tocados
                    const allTouchedFields = new Set<string>();
                    exercises.forEach((exercise, ei) => {
                      exercise.sets.forEach((s, si) => {
                        allTouchedFields.add(`${ei}-${si}-reps`);
                        allTouchedFields.add(`${ei}-${si}-weight`);
                      });
                    });
                    setTouchedFields(allTouchedFields);
                    setValidationErrors(validation.errors);

                    // Mostrar toast con resumen de errores
                    const errorCount = validation.errors.length;
                    const exerciseCount = validation.exercisesWithErrors.size;
                    error(
                      `⚠️ Completa los datos faltantes: ${errorCount} ${errorCount === 1 ? "campo" : "campos"} en ${exerciseCount} ${exerciseCount === 1 ? "ejercicio" : "ejercicios"}. Los campos están marcados en rojo.`,
                    );

                    // Scroll al primer ejercicio con error
                    setTimeout(() => {
                      const firstErrorExercise = Math.min(
                        ...Array.from(validation.exercisesWithErrors),
                      );
                      const element = document.querySelector(
                        `[data-exercise-index="${firstErrorExercise}"]`,
                      );
                      element?.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                      });
                    }, 100);
                  } else {
                    setCurrentStep("review");
                  }
                }}
                className="order-1 sm:order-2 px-8"
              >
                Siguiente: Revisar →
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {currentStep === "review" && (
          <div className="flex-1 space-y-6 animate-fadeIn">
            <div className="bg-linear-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 sm:p-6 rounded-xl border border-green-200 dark:border-green-800">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                ✓ Revisar Rutina
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Verifica que todo esté correcto antes de guardar
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border-2 border-gray-200 dark:border-gray-700 overflow-hidden">
              {image && (
                <div className="relative h-48 sm:h-56">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image}
                    alt={name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1">
                      {name}
                    </h2>
                    {description && (
                      <p className="text-sm text-white/90 line-clamp-2">
                        {description}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="p-4 sm:p-6 space-y-4">
                {!image && (
                  <>
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
                      {name}
                    </h2>
                    {description && (
                      <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                        {description}
                      </p>
                    )}
                  </>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                  <div className="bg-linear-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-3 sm:p-4 rounded-xl text-center border border-blue-200 dark:border-blue-800">
                    <div className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400">
                      {exercises.length}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Ejercicios
                    </div>
                  </div>
                  <div className="bg-linear-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-3 sm:p-4 rounded-xl text-center border border-purple-200 dark:border-purple-800">
                    <div className="text-2xl sm:text-3xl font-bold text-purple-600 dark:text-purple-400">
                      {exercises.reduce((sum, ex) => sum + ex.sets.length, 0)}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Series
                    </div>
                  </div>
                  <div className="bg-linear-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-3 sm:p-4 rounded-xl text-center border border-green-200 dark:border-green-800">
                    <div className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400">
                      {Math.floor(restBetweenSets / 60)}:
                      {(restBetweenSets % 60).toString().padStart(2, "0")}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Descanso/Serie
                    </div>
                  </div>
                  <div className="bg-linear-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-3 sm:p-4 rounded-xl text-center border border-amber-200 dark:border-amber-800">
                    <div className="text-2xl sm:text-3xl font-bold text-amber-600 dark:text-amber-400">
                      {Math.floor(restBetweenExercises / 60)}:
                      {(restBetweenExercises % 60).toString().padStart(2, "0")}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Descanso/Ej.
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                    Lista de Ejercicios
                  </h3>
                  {exercises.map((exercise, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div className="shrink-0 w-8 h-8 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base">
                          {exercise.name}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {exercise.sets.length} series •{" "}
                          {exercise.equipment || "Sin equipamiento"}
                        </div>
                        {exercise.notes && (
                          <div className="text-xs text-gray-500 dark:text-gray-500 mt-1 italic">
                            {exercise.notes}
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => setCurrentStep("exercises")}
                        className="shrink-0 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 p-2 rounded-lg transition-all"
                        title="Editar"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setCurrentStep("exercises")}
                className="order-2 sm:order-1"
              >
                ← Volver
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={exercises.length === 0 || isSubmitting}
                className="order-1 sm:order-2 px-8"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">
                      <Spinner size="sm" />
                    </span>
                    {t("saving")}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <span>✓</span>
                    {routineId ? t("updateRoutineBtn") : t("createRoutineBtn")}
                  </span>
                )}
              </Button>
            </div>
          </div>
        )}
      </form>

      <Modal
        isOpen={isExerciseSelectorOpen}
        onClose={() => setIsExerciseSelectorOpen(false)}
        title={t("selectExercisesTitle")}
        contentClassName="max-w-5xl w-full"
      >
        <ExerciseSelector
          onSelectExercises={handleSelectExercises}
          onClose={() => setIsExerciseSelectorOpen(false)}
        />
      </Modal>

      {/* Modal de edición de valores con teclado numérico */}
      {editingValue && (
        <EditValueModal
          isOpen={true}
          onClose={() => setEditingValue(null)}
          title={`${exercises[editingValue.exerciseIndex]?.name || "Ejercicio"} - Serie ${editingValue.setIndex + 1}`}
          field={editingValue.field}
          currentValue={editingValue.currentValue}
          onSave={(value) => {
            handleSetChange(
              editingValue.exerciseIndex,
              editingValue.setIndex,
              editingValue.field,
              value,
            );
            setEditingValue(null);
          }}
          historicalWeights={
            editingValue.field === "weight"
              ? exercises[editingValue.exerciseIndex]?.sets
                  .map((s) => s.weight)
                  .filter((w): w is number => typeof w === "number" && w > 0)
                  .filter((w, i, arr) => arr.indexOf(w) === i)
                  .sort((a, b) => b - a) || []
              : []
          }
        />
      )}
    </div>
  );
};
