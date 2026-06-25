'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { SearchInput } from '@/components/shared';
import { MuscleGroupIcon } from '@/components/icons/MuscleGroupIcons';
import { MUSCLE_GROUPS, MuscleGroup } from '@/data/exercises';
import { WarmupCategory } from '@/data/warmupExercises';
import { Button } from '@/components/ui/Button';

interface ExercisesFiltersProps {
  isGlobalMode: boolean;
  selectedMuscle: string | null;
  exerciseTab: "training" | "warmup";
  warmupCategoryFilter: string;
  searchTerm: string;
  selectedMuscleFilters: Set<string>;
  filteredExercisesCount: number;
  allWarmupExercisesCount: number;
}

export function ExercisesFilters({
  isGlobalMode,
  selectedMuscle,
  exerciseTab,
  warmupCategoryFilter,
  searchTerm,
  selectedMuscleFilters,
  filteredExercisesCount,
  allWarmupExercisesCount,
}: ExercisesFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleSearchChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set('q', value);
    else params.delete('q');
    params.set('gpage', '1');
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const toggleMuscleFilter = (muscleId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const currentMuscles = new Set(params.getAll('muscles'));
    if (currentMuscles.has(muscleId)) {
      currentMuscles.delete(muscleId);
    } else {
      currentMuscles.add(muscleId);
    }
    params.delete('muscles');
    currentMuscles.forEach(m => params.append('muscles', m));
    params.set('gpage', '1');
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const clearMuscleFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('muscles');
    params.set('gpage', '1');
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleTabChange = (tab: "training" | "warmup") => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tab);
    params.delete('warmupCat');
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleCategoryChange = (category: "all" | WarmupCategory) => {
    const params = new URLSearchParams(searchParams.toString());
    if (category === 'all') params.delete('warmupCat');
    else params.set('warmupCat', category);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleBackToMuscles = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('muscle');
    params.delete('q');
    params.delete('tab');
    params.delete('warmupCat');
    params.delete('muscles');
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <>
      {!selectedMuscle ? (
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
                  <MuscleGroupIcon muscleGroup={muscle.id as MuscleGroup} size={13} />
                  {muscle.name}
                </button>
              );
            })}
            {selectedMuscleFilters.size > 0 && (
              <button
                onClick={clearMuscleFilters}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-100 transition-all"
              >
                ✕ Limpiar filtros
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
                {MUSCLE_GROUPS.find((m) => m.id === selectedMuscle)?.name}
              </h2>
            </div>
            <button
              onClick={handleBackToMuscles}
              className="px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all font-medium"
            >
              ← Volver a grupos
            </button>
          </div>

          <SearchInput
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Buscar ejercicio..."
            className="mb-6"
          />

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
              🏋️ Entrenamiento ({filteredExercisesCount})
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
              🔥 Calentamiento ({allWarmupExercisesCount})
            </button>
          </div>

          {exerciseTab === "warmup" && (
            <div className="flex flex-wrap gap-2 mb-6">
              {[
                {
                  key: "all" as const,
                  label: "🔥 Todos",
                  count: allWarmupExercisesCount,
                },
                {
                  key: "warmup" as const,
                  label: "🌡️ Calentamiento",
                },
                {
                  key: "mobility" as const,
                  label: "🧘 Movilidad",
                },
                {
                  key: "activation" as const,
                  label: "⚡ Activación",
                },
              ].map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => handleCategoryChange(filter.key as WarmupCategory | "all")}
                  className={`px-3 py-2 text-xs font-medium rounded-full border-2 transition-all ${
                    warmupCategoryFilter === filter.key
                      ? "bg-amber-100 dark:bg-amber-900/30 border-amber-400 text-amber-700 dark:text-amber-300"
                      : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-amber-300"
                  }`}
                >
                  {filter.label} {filter.count !== undefined ? `(${filter.count})` : ''}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </>
  );
}
