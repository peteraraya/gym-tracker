"use client";

import { useState, useMemo, useEffect } from "react";
import {
  MUSCLE_GROUPS,
  EXERCISE_DATABASE,
  getExercisesByMuscleGroup,
  MuscleGroup,
  ExerciseTemplate,
} from "@/data/exercises";
import {
  getWarmupsByMuscleGroup,
  WARMUP_CATEGORY_LABELS,
  WarmupExercise,
  WarmupCategory,
} from "@/data/warmupExercises";
import { useToast } from "@/context/NotificationContext";
import { EQUIPMENT_LIST } from "@/data/equipment";
import { ExerciseDetails } from "@/components/features/exercises/ExerciseDetails";
import { ExerciseIcon } from "@/components/features/exercises/ExerciseIcon";
import { MuscleGroupIcon } from "@/components/icons/MuscleGroupIcons";
import { useEquipment } from "@/context/EquipmentContext";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import { Button } from "@/components/ui/Button";
import { APP_CONFIG } from "@/config/app.config";
import { useFilteredData } from "@/hooks/ui/useFilteredData";
import { VirtualList } from "@/components/shared/VirtualList";
import { PageHeader, PageLayout, PageContent } from "@/layouts";
import {
  SearchInput,
  EmptyStateCard,
  ExerciseListItem,
} from "@/components/shared";

const ITEMS_PER_PAGE = APP_CONFIG.pagination.exercisesPerPage;

export default function ExercisesPage() {
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedExercise, setSelectedExercise] =
    useState<ExerciseTemplate | null>(null);
  const [exerciseTab, setExerciseTab] = useState<"training" | "warmup">(
    "training",
  );
  const [currentPage, setCurrentPage] = useState(1);
  const {
    hasEquipment,
    selectedEquipment,
    setEquipment,
    clearEquipment,
    toggleEquipment,
  } = useEquipment();
  const toast = useToast();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [warmupCategoryFilter, setWarmupCategoryFilter] = useState<
    "all" | WarmupCategory
  >("all");
  const [selectedMuscleFilters, setSelectedMuscleFilters] = useState<
    Set<MuscleGroup>
  >(new Set());
  const [globalPage, setGlobalPage] = useState(1);

  // Cachear ejercicios del músculo seleccionado para evitar llamadas repetidas
  const muscleExercises = useMemo(() => {
    if (!selectedMuscle) return [];
    return getExercisesByMuscleGroup(selectedMuscle);
  }, [selectedMuscle]);

  const muscleWarmups = useMemo(() => {
    if (!selectedMuscle) return [];
    return getWarmupsByMuscleGroup(selectedMuscle);
  }, [selectedMuscle]);

  // Filtrar ejercicios de entrenamiento
  const filteredExercises = useMemo(() => {
    return muscleExercises.filter((ex) => hasEquipment(ex.equipment));
  }, [muscleExercises, hasEquipment]);

  // Usar hook genérico para filtrado y paginación
  const trainingData = useFilteredData(
    filteredExercises,
    searchTerm,
    (ex, search) => ex.name.toLowerCase().includes(search),
    { itemsPerPage: ITEMS_PER_PAGE },
  );

  // Filtrar ejercicios de calentamiento
  const allWarmupExercises = useMemo(() => {
    return muscleWarmups;
  }, [muscleWarmups]);

  const warmupExercises = useMemo(() => {
    return warmupCategoryFilter === "all"
      ? allWarmupExercises
      : allWarmupExercises.filter((ex) => ex.category === warmupCategoryFilter);
  }, [allWarmupExercises, warmupCategoryFilter]);

  // Usar hook genérico para warmups
  const warmupData = useFilteredData(
    warmupExercises,
    searchTerm,
    (ex, search) => ex.name.toLowerCase().includes(search),
    { itemsPerPage: ITEMS_PER_PAGE },
  );

  // Datos actuales según tab
  const currentData = exerciseTab === "training" ? trainingData : warmupData;
  const totalCount =
    exerciseTab === "training" ? muscleExercises.length : muscleWarmups.length;

  // Global search mode: activo cuando hay texto o filtros de grupo y no hay grupo seleccionado
  const isGlobalMode =
    !selectedMuscle &&
    (searchTerm.trim() !== "" || selectedMuscleFilters.size > 0);

  const globalResults = useMemo(() => {
    if (selectedMuscle) return [];
    let results = EXERCISE_DATABASE as ExerciseTemplate[];
    if (selectedMuscleFilters.size > 0) {
      results = results.filter((ex) => selectedMuscleFilters.has(ex.muscleGroup));
    }
    if (searchTerm.trim()) {
      const term = searchTerm.trim().toLowerCase();
      results = results.filter(
        (ex) =>
          ex.name.toLowerCase().includes(term) ||
          ex.muscleGroup.toLowerCase().includes(term) ||
          (ex.equipment && ex.equipment.toLowerCase().includes(term)),
      );
    }
    if (selectedEquipment.size > 0) {
      results = results.filter((ex) => hasEquipment(ex.equipment));
    }
    // Ordenar según orden de MUSCLE_GROUPS
    const muscleOrder = new Map(MUSCLE_GROUPS.map((m, i) => [m.id, i]));
    return [...results].sort(
      (a, b) => (muscleOrder.get(a.muscleGroup) ?? 99) - (muscleOrder.get(b.muscleGroup) ?? 99),
    );
  }, [selectedMuscle, selectedMuscleFilters, searchTerm, selectedEquipment, hasEquipment]);

  // Paginación del modo global — por grupos completos
  const allGroupedResults = useMemo(() => {
    const groups: { muscleId: MuscleGroup; muscleName: string; exercises: ExerciseTemplate[] }[] = [];
    for (const muscle of MUSCLE_GROUPS) {
      const exs = globalResults.filter((ex) => ex.muscleGroup === muscle.id);
      if (exs.length > 0) groups.push({ muscleId: muscle.id, muscleName: muscle.name, exercises: exs });
    }
    return groups;
  }, [globalResults]);

  const GROUPS_PER_PAGE = 3;
  const totalGlobalPages = Math.max(1, Math.ceil(allGroupedResults.length / GROUPS_PER_PAGE));
  const paginatedGroupedResults = useMemo(
    () => allGroupedResults.slice((globalPage - 1) * GROUPS_PER_PAGE, globalPage * GROUPS_PER_PAGE),
    [allGroupedResults, globalPage],
  );
  const paginatedExercisesCount = paginatedGroupedResults.reduce((acc, g) => acc + g.exercises.length, 0);

  // Handlers optimizados
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setGlobalPage(1);
  };

  const toggleMuscleFilter = (muscleId: MuscleGroup) => {
    setSelectedMuscleFilters((prev) => {
      const next = new Set(prev);
      if (next.has(muscleId)) next.delete(muscleId);
      else next.add(muscleId);
      return next;
    });
    setGlobalPage(1);
  };

  const handleTabChange = (tab: "training" | "warmup") => {
    setExerciseTab(tab);
    setWarmupCategoryFilter("all");
  };

  const handleCategoryChange = (category: "all" | WarmupCategory) => {
    setWarmupCategoryFilter(category);
  };

  const handleMuscleSelect = (muscleId: MuscleGroup) => {
    setSelectedMuscle(muscleId);
    setExerciseTab("training");
    setSearchTerm("");
    setWarmupCategoryFilter("all");
    setSelectedMuscleFilters(new Set());
  };

  const handleBackToMuscles = () => {
    setSelectedMuscle(null);
    setSearchTerm("");
    setExerciseTab("training");
    setWarmupCategoryFilter("all");
    setSelectedMuscleFilters(new Set());
  };

  const handleEquipmentSelect = () => {
    setEquipment(new Set(EQUIPMENT_LIST.map((e) => e.id)));
    toast.success("Seleccionado todo el equipamiento");
  };

  const handleEquipmentClear = () => {
    clearEquipment();
    toast.info("Selección limpiada");
  };

  return (
    <ProtectedRoute>
      <PageLayout>
        <PageHeader
          title="Guía de Ejercicios"
          subtitle="Explora ejercicios con técnicas profesionales"
          icon={<span className="text-3xl">💪</span>}
          gradient="from-blue-700 via-blue-800 to-indigo-900"
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
          {/* Filtro de equipamiento */}
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

        <PageContent>
          {/* Rest of the content remains the same... */}
          {!selectedMuscle ? (
            <>
              {/* Buscador global + filtros por grupo */}
              <div className="mb-6 space-y-3">
                <SearchInput
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder="Buscar ejercicio por nombre, grupo o equipamiento..."
                />
                <div className="flex flex-wrap gap-2">
                  {MUSCLE_GROUPS.map((muscle) => {
                    const checked = selectedMuscleFilters.has(muscle.id);
                    return (
                      <button
                        key={muscle.id}
                        onClick={() => toggleMuscleFilter(muscle.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all ${
                          checked
                            ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                            : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-blue-400 dark:hover:border-blue-500"
                        }`}
                      >
                        <MuscleGroupIcon muscleGroup={muscle.id} size={13} />
                        {muscle.name}
                      </button>
                    );
                  })}
                  {selectedMuscleFilters.size > 0 && (
                    <button
                      onClick={() => setSelectedMuscleFilters(new Set())}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-100 transition-all"
                    >
                      ✕ Limpiar filtros
                    </button>
                  )}
                </div>
              </div>

              {/* Vista global de búsqueda */}
              {isGlobalMode ? (
                <>
                  {/* Contador + grupos seleccionados */}
                  <div className="mb-4 space-y-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      <span className="font-semibold text-gray-800 dark:text-gray-200">
                        {allGroupedResults.length}
                      </span>{" "}
                      grupo{allGroupedResults.length !== 1 ? "s" : ""}
                      {" · "}
                      <span className="font-semibold text-gray-800 dark:text-gray-200">
                        {globalResults.length}
                      </span>{" "}
                      ejercicio{globalResults.length !== 1 ? "s" : ""}
                      {totalGlobalPages > 1 && (
                        <span className="ml-2 text-gray-400">
                          · pág. {globalPage}/{totalGlobalPages}
                        </span>
                      )}
                    </p>
                    {selectedMuscleFilters.size > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {MUSCLE_GROUPS.filter((m) => selectedMuscleFilters.has(m.id)).map((m) => {
                          const count = allGroupedResults.find((g) => g.muscleId === m.id)?.exercises.length ?? 0;
                          return (
                            <span
                              key={m.id}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300"
                            >
                              <MuscleGroupIcon muscleGroup={m.id} size={13} />
                              {m.name}
                              {count > 0 && (
                                <span className="ml-0.5 text-blue-500 dark:text-blue-400">
                                  {count}
                                </span>
                              )}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {globalResults.length > 0 ? (
                    <>
                      {/* Resultados agrupados por músculo */}
                      <div className="space-y-6">
                        {paginatedGroupedResults.map(({ muscleId, muscleName, exercises }) => (
                          <div key={muscleId}>
                            {/* Cabecera del grupo */}
                            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
                              <MuscleGroupIcon muscleGroup={muscleId} size={22} />
                              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
                                {muscleName}
                              </h3>
                              <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium">
                                {exercises.length}
                              </span>
                            </div>
                            {/* Ejercicios del grupo */}
                            <div className="space-y-3">
                              {exercises.map((exercise, idx) => (
                                <ExerciseListItem
                                  key={`${muscleId}-${exercise.id}-${idx}`}
                                  exercise={exercise}
                                  onViewDetails={setSelectedExercise}
                                  isWarmup={false}
                                />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Paginación */}
                      {totalGlobalPages > 1 && (
                        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                          <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                            {paginatedGroupedResults.length} grupo{paginatedGroupedResults.length !== 1 ? "s" : ""}{" "}
                            ({paginatedExercisesCount} ejercicio{paginatedExercisesCount !== 1 ? "s" : ""})
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setGlobalPage((p) => Math.max(1, p - 1))}
                              disabled={globalPage === 1}
                              className="px-4 py-2 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-medium text-sm"
                            >
                              ← Anterior
                            </button>
                            {Array.from({ length: totalGlobalPages }, (_, i) => i + 1)
                              .filter(
                                (p) =>
                                  p === 1 ||
                                  p === totalGlobalPages ||
                                  Math.abs(p - globalPage) <= 1,
                              )
                              .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                                if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1)
                                  acc.push("...");
                                acc.push(p);
                                return acc;
                              }, [])
                              .map((p, idx) =>
                                p === "..." ? (
                                  <span key={`ellipsis-${idx}`} className="px-1 text-gray-400">
                                    …
                                  </span>
                                ) : (
                                  <button
                                    key={p}
                                    onClick={() => setGlobalPage(p as number)}
                                    className={`w-9 h-9 rounded-xl font-semibold transition-all text-sm ${
                                      globalPage === p
                                        ? "bg-blue-600 text-white shadow-md"
                                        : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                                    }`}
                                  >
                                    {p}
                                  </button>
                                ),
                              )}
                            <button
                              onClick={() =>
                                setGlobalPage((p) => Math.min(totalGlobalPages, p + 1))
                              }
                              disabled={globalPage === totalGlobalPages}
                              className="px-4 py-2 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-medium text-sm"
                            >
                              Siguiente →
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <EmptyStateCard
                      icon="🔍"
                      title="No se encontraron ejercicios"
                      description="Intenta con otro término o selecciona otros grupos"
                      actionLabel="Limpiar búsqueda"
                      onAction={() => {
                        setSearchTerm("");
                        setSelectedMuscleFilters(new Set());
                      }}
                    />
                  )}
                </>
              ) : (
                <>
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Selecciona un grupo muscular
                  </h2>

                  {/* Grid de grupos musculares */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {MUSCLE_GROUPS.map((muscle) => {
                      const exercisesForMuscle = getExercisesByMuscleGroup(
                        muscle.id,
                      );
                      const total = exercisesForMuscle.length;
                      const available = exercisesForMuscle.filter((ex) =>
                        hasEquipment(ex.equipment),
                      ).length;
                      const warmupCount = getWarmupsByMuscleGroup(muscle.id).length;
                      return (
                        <button
                          key={muscle.id}
                          onClick={() => handleMuscleSelect(muscle.id)}
                          className="group relative flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-2xl hover:scale-105 transition-all duration-300 overflow-hidden"
                          aria-label={`Seleccionar grupo ${muscle.name}, ${total} ejercicios`}
                        >
                          <div className="absolute inset-0 bg-linear-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                          <div className="relative z-10 mb-3 group-hover:scale-110 transition-transform duration-300">
                            <MuscleGroupIcon
                              muscleGroup={muscle.id}
                              size={56}
                              className="text-blue-500 dark:text-blue-400"
                            />
                          </div>
                          <span className="relative z-10 text-base font-bold text-gray-900 dark:text-gray-100 text-center mb-2">
                            {muscle.name}
                          </span>

                          <div className="relative z-10 flex flex-col items-center gap-1.5">
                            {selectedEquipment.size > 0 ? (
                              <span className="text-xs text-gray-600 dark:text-gray-400 font-medium px-2.5 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                                {available}/{total} disponibles
                              </span>
                            ) : (
                              <span className="text-xs text-gray-600 dark:text-gray-400 font-medium px-2.5 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                                {total} ejercicio{total !== 1 ? "s" : ""}
                              </span>
                            )}
                            {warmupCount > 0 && (
                              <span className="text-xs px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-medium">
                                🔥 {warmupCount} calentamiento
                                {warmupCount !== 1 ? "s" : ""}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </>
          ) : (
            <>
              {/* Vista de ejercicios */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {MUSCLE_GROUPS.find((m) => m.id === selectedMuscle)?.name}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {currentData.total} de {totalCount} disponibles
                    {selectedEquipment.size > 0 &&
                      currentData.total < totalCount && (
                        <span className="ml-2 text-blue-600 dark:text-blue-400 font-medium">
                          (filtrado)
                        </span>
                      )}
                  </p>
                </div>
                <button
                  onClick={handleBackToMuscles}
                  className="px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all font-medium"
                >
                  ← Volver a grupos
                </button>
              </div>

              {/* Buscador de ejercicios */}
              <SearchInput
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Buscar ejercicio..."
                className="mb-6"
              />

              {/* Tabs */}
              <div className="flex gap-3 mb-6">
                <button
                  type="button"
                  onClick={() => handleTabChange("training")}
                  className={`flex-1 py-3 px-4 text-sm font-semibold rounded-xl border-2 transition-all ${
                    exerciseTab === "training"
                      ? "bg-blue-50 dark:bg-blue-900/20 border-blue-500 dark:border-blue-400 text-blue-700 dark:text-blue-300"
                      : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-blue-300"
                  }`}
                >
                  🏋️ Entrenamiento ({filteredExercises.length})
                </button>
                <button
                  type="button"
                  onClick={() => handleTabChange("warmup")}
                  className={`flex-1 py-3 px-4 text-sm font-semibold rounded-xl border-2 transition-all ${
                    exerciseTab === "warmup"
                      ? "bg-amber-50 dark:bg-amber-900/20 border-amber-500 dark:border-amber-400 text-amber-700 dark:text-amber-300"
                      : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-amber-300"
                  }`}
                >
                  🔥 Calentamiento ({allWarmupExercises.length})
                </button>
              </div>

              {/* Filtros de categoría */}
              {exerciseTab === "warmup" && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {[
                    {
                      key: "all" as const,
                      label: "🔥 Todos",
                      count: allWarmupExercises.length,
                    },
                    {
                      key: "warmup" as const,
                      label: "🌡️ Calentamiento",
                      count: allWarmupExercises.filter(
                        (e) => e.category === "warmup",
                      ).length,
                    },
                    {
                      key: "mobility" as const,
                      label: "🧘 Movilidad",
                      count: allWarmupExercises.filter(
                        (e) => e.category === "mobility",
                      ).length,
                    },
                    {
                      key: "activation" as const,
                      label: "⚡ Activación",
                      count: allWarmupExercises.filter(
                        (e) => e.category === "activation",
                      ).length,
                    },
                  ].map((filter) => (
                    <button
                      key={filter.key}
                      onClick={() => handleCategoryChange(filter.key)}
                      className={`px-3 py-2 text-xs font-medium rounded-full border-2 transition-all ${
                        warmupCategoryFilter === filter.key
                          ? "bg-amber-100 dark:bg-amber-900/30 border-amber-400 text-amber-700 dark:text-amber-300"
                          : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-amber-300"
                      }`}
                    >
                      {filter.label} ({filter.count})
                    </button>
                  ))}
                </div>
              )}

              {/* Lista de ejercicios */}
              <VirtualList
                items={currentData.data}
                estimateSize={250}
                overscan={3}
                className="space-y-4"
                renderItem={(exercise) => {
                  const warmup =
                    exerciseTab === "warmup"
                      ? (exercise as WarmupExercise)
                      : null;
                  const categoryInfo = warmup
                    ? WARMUP_CATEGORY_LABELS[warmup.category]
                    : null;

                  return (
                    <ExerciseListItem
                      key={exercise.id}
                      exercise={exercise}
                      onViewDetails={setSelectedExercise}
                      isWarmup={exerciseTab === "warmup"}
                      categoryLabel={categoryInfo?.es}
                      categoryIcon={categoryInfo?.icon}
                    />
                  );
                }}
              />

              {/* Paginación */}
              {currentData.totalPages > 1 && (
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                    Mostrando{" "}
                    {(currentData.currentPage - 1) * ITEMS_PER_PAGE + 1}-
                    {Math.min(
                      currentData.currentPage * ITEMS_PER_PAGE,
                      currentData.total,
                    )}{" "}
                    de {currentData.total}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        currentData.setCurrentPage((prev: number) =>
                          Math.max(1, prev - 1),
                        )
                      }
                      disabled={!currentData.hasPrevPage}
                      className="px-4 py-2 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-medium text-sm"
                    >
                      ← Anterior
                    </button>
                    {Array.from(
                      { length: currentData.totalPages },
                      (_, i) => i + 1,
                    ).map((page) => (
                      <button
                        key={page}
                        onClick={() => currentData.setCurrentPage(page)}
                        className={`w-10 h-10 rounded-xl font-semibold transition-all text-sm ${
                          currentData.currentPage === page
                            ? "bg-blue-600 text-white shadow-md"
                            : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() =>
                        currentData.setCurrentPage((prev: number) =>
                          Math.min(currentData.totalPages, prev + 1),
                        )
                      }
                      disabled={!currentData.hasNextPage}
                      className="px-4 py-2 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-medium text-sm"
                    >
                      Siguiente →
                    </button>
                  </div>
                </div>
              )}

              {/* No results */}
              {currentData.total === 0 && (
                <EmptyStateCard
                  icon={exerciseTab === "warmup" ? "🔥" : "🔍"}
                  title={
                    exerciseTab === "warmup"
                      ? "No hay ejercicios de calentamiento"
                      : "No se encontraron ejercicios"
                  }
                  description="Intenta con otro término o ajusta los filtros"
                />
              )}
            </>
          )}
        </PageContent>

        {/* Modal de detalles */}
        {selectedExercise && (
          <ExerciseDetails
            exercise={selectedExercise}
            onClose={() => setSelectedExercise(null)}
          />
        )}

        {/* Drawer de equipamiento */}
        {drawerOpen && (
          <div className="fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setDrawerOpen(false)}
            />

            {/* Drawer panel */}
            <aside className="relative ml-auto w-full sm:w-96 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 max-h-screen overflow-y-auto p-6 shadow-2xl z-10">
              {/* Header */}
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

              {/* Action buttons */}
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => {
                    setEquipment(new Set(EQUIPMENT_LIST.map((e) => e.id)));
                    toast.success("Seleccionado todo el equipamiento");
                  }}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all"
                >
                  ✅ Seleccionar todo
                </button>
                <button
                  onClick={() => {
                    clearEquipment();
                    toast.info("Selección limpiada");
                  }}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 hover:border-red-400 text-gray-700 dark:text-gray-300 text-sm font-semibold transition-all"
                >
                  🗑️ Limpiar
                </button>
              </div>

              {/* Equipment list */}
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
      </PageLayout>
    </ProtectedRoute>
  );
}
