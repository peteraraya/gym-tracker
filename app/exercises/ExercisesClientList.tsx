'use client';

import { useState, useMemo } from "react";
import { useEquipment } from "@/context/EquipmentContext";
import { useToast } from "@/context/NotificationContext";
import { EQUIPMENT_LIST } from "@/data/equipment";
import { ExerciseTemplate, MuscleGroup } from "@/data/exercises";
import { WarmupExercise, WARMUP_CATEGORY_LABELS } from "@/data/warmupExercises";
import { VirtualList } from "@/components/shared/VirtualList";
import { ExerciseListItem, EmptyStateCard } from "@/components/shared";
import { useFilteredData } from "@/hooks/ui/useFilteredData";
import { APP_CONFIG } from "@/config/app.config";
import { ExerciseDetails } from "@/components/features/exercises/ExerciseDetails";
import { MuscleGroupIcon } from "@/components/icons/MuscleGroupIcons";
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

const ITEMS_PER_PAGE = APP_CONFIG.pagination.exercisesPerPage;

interface ExercisesClientProps {
  muscleExercises: ExerciseTemplate[];
  muscleWarmups: WarmupExercise[];
  globalResults: ExerciseTemplate[];
  allGroupedResults: { muscleId: string; muscleName: string; exercises: ExerciseTemplate[] }[];
  isGlobalMode: boolean;
  selectedMuscle: string | null;
  exerciseTab: "training" | "warmup";
  totalCount: number;
}

export function ExercisesClientList({
  muscleExercises,
  muscleWarmups,
  globalResults,
  allGroupedResults,
  isGlobalMode,
  selectedMuscle,
  exerciseTab,
  totalCount,
}: ExercisesClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [selectedExercise, setSelectedExercise] = useState<ExerciseTemplate | null>(null);
  const { hasEquipment, selectedEquipment } = useEquipment();

  // Filtrar ejercicios de entrenamiento por equipamiento
  const filteredExercises = useMemo(() => {
    return muscleExercises.filter((ex) => hasEquipment(ex.equipment));
  }, [muscleExercises, hasEquipment]);

  // Hook genérico para filtrado y paginación
  // Note: search is already handled by server, so we pass empty string to useFilteredData 
  // or we bypass it entirely if we don't need client-side search.
  // But we still need pagination!
  const trainingData = useFilteredData(
    filteredExercises,
    "",
    () => true,
    { itemsPerPage: ITEMS_PER_PAGE },
  );

  const warmupData = useFilteredData(
    muscleWarmups,
    "",
    () => true,
    { itemsPerPage: ITEMS_PER_PAGE },
  );

  const currentData = exerciseTab === "training" ? trainingData : warmupData;

  const globalPage = Number(searchParams.get('gpage')) || 1;
  const GROUPS_PER_PAGE = 3;
  const totalGlobalPages = Math.max(1, Math.ceil(allGroupedResults.length / GROUPS_PER_PAGE));
  const paginatedGroupedResults = useMemo(
    () => allGroupedResults.slice((globalPage - 1) * GROUPS_PER_PAGE, globalPage * GROUPS_PER_PAGE),
    [allGroupedResults, globalPage],
  );
  const paginatedExercisesCount = paginatedGroupedResults.reduce((acc, g) => acc + g.exercises.length, 0);

  const setGlobalPage = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('gpage', p.toString());
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  if (isGlobalMode) {
    return (
      <>
        {/* Vista global de búsqueda */}
        <div className="mb-4 space-y-2">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            <span className="font-semibold text-gray-800 dark:text-gray-200">
              {allGroupedResults.length}
            </span>{" "}
            grupo{allGroupedResults.length !== 1 ? "s" : ""}
            {" · "}
            <span className="font-semibold text-gray-800 dark:text-gray-200">
              {globalResults.filter(ex => hasEquipment(ex.equipment)).length}
            </span>{" "}
            ejercicio{globalResults.length !== 1 ? "s" : ""}
            {totalGlobalPages > 1 && (
              <span className="ml-2 text-gray-400">
                · pág. {globalPage}/{totalGlobalPages}
              </span>
            )}
          </p>
        </div>

        {globalResults.length > 0 ? (
          <>
            <div className="space-y-6">
              {paginatedGroupedResults.map(({ muscleId, muscleName, exercises }) => {
                const availableExercises = exercises.filter(ex => hasEquipment(ex.equipment));
                if (availableExercises.length === 0) return null;
                
                return (
                  <div key={muscleId}>
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
                      <MuscleGroupIcon muscleGroup={muscleId as MuscleGroup} size={22} />
                      <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
                        {muscleName}
                      </h3>
                      <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium">
                        {availableExercises.length}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {availableExercises.map((exercise, idx) => (
                        <ExerciseListItem
                          key={`${muscleId}-${exercise.id}-${idx}`}
                          exercise={exercise}
                          onViewDetails={setSelectedExercise}
                          isWarmup={false}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {totalGlobalPages > 1 && (
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  {paginatedGroupedResults.length} grupo{paginatedGroupedResults.length !== 1 ? "s" : ""}{" "}
                  ({paginatedExercisesCount} ejercicio{paginatedExercisesCount !== 1 ? "s" : ""})
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setGlobalPage(Math.max(1, globalPage - 1))}
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
                    onClick={() => setGlobalPage(Math.min(totalGlobalPages, globalPage + 1))}
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
              router.replace(pathname, { scroll: false });
            }}
          />
        )}
        
        {selectedExercise && (
          <ExerciseDetails
            exercise={selectedExercise}
            onClose={() => setSelectedExercise(null)}
          />
        )}
      </>
    );
  }

  return (
    <>
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

      {selectedExercise && (
        <ExerciseDetails
          exercise={selectedExercise}
          onClose={() => setSelectedExercise(null)}
        />
      )}
    </>
  );
}
