import { Metadata } from 'next';
import {
  MUSCLE_GROUPS,
  EXERCISE_DATABASE,
  getExercisesByMuscleGroup,
  MuscleGroup,
  ExerciseTemplate,
} from "@/data/exercises";
import {
  getWarmupsByMuscleGroup,
  WarmupCategory,
} from "@/data/warmupExercises";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import { MuscleGroupIcon } from "@/components/icons/MuscleGroupIcons";
import { PageHeader, PageLayout, PageContent } from "@/layouts";
import { ExercisesClientList } from "./ExercisesClientList";
import { ExercisesFilters } from "./ExercisesFilters";
import { ExercisesHeaderClient } from "./ExercisesHeaderClient";

export const metadata: Metadata = {
  title: 'Ejercicios | Gym Tracker',
  description: 'Guía de ejercicios con técnicas profesionales',
};

export default async function ExercisesPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const searchParams = await props.searchParams;
  
  const selectedMuscle = typeof searchParams.muscle === 'string' ? searchParams.muscle : null;
  const searchTerm = typeof searchParams.q === 'string' ? searchParams.q : '';
  const exerciseTab = (typeof searchParams.tab === 'string' ? searchParams.tab : 'training') as 'training' | 'warmup';
  const warmupCategoryFilter = typeof searchParams.warmupCat === 'string' ? searchParams.warmupCat : 'all';
  
  const rawMuscles = searchParams.muscles;
  const selectedMuscleFilters = new Set<string>(
    Array.isArray(rawMuscles) ? rawMuscles : typeof rawMuscles === 'string' ? [rawMuscles] : []
  );

  const muscleExercises = selectedMuscle ? getExercisesByMuscleGroup(selectedMuscle as MuscleGroup) : [];
  const muscleWarmups = selectedMuscle ? getWarmupsByMuscleGroup(selectedMuscle as MuscleGroup) : [];

  const isGlobalMode = !selectedMuscle && (searchTerm.trim() !== "" || selectedMuscleFilters.size > 0);

  let globalResults = EXERCISE_DATABASE as ExerciseTemplate[];
  if (selectedMuscleFilters.size > 0) {
    globalResults = globalResults.filter((ex) => selectedMuscleFilters.has(ex.muscleGroup));
  }
  if (searchTerm.trim()) {
    const term = searchTerm.trim().toLowerCase();
    globalResults = globalResults.filter(
      (ex) =>
        ex.name.toLowerCase().includes(term) ||
        ex.muscleGroup.toLowerCase().includes(term) ||
        (ex.equipment && ex.equipment.toLowerCase().includes(term)),
    );
  }
  const muscleOrder = new Map(MUSCLE_GROUPS.map((m, i) => [m.id, i]));
  globalResults = [...globalResults].sort(
    (a, b) => (muscleOrder.get(a.muscleGroup) ?? 99) - (muscleOrder.get(b.muscleGroup) ?? 99),
  );

  const allGroupedResults: { muscleId: string; muscleName: string; exercises: ExerciseTemplate[] }[] = [];
  for (const muscle of MUSCLE_GROUPS) {
    const exs = globalResults.filter((ex) => ex.muscleGroup === muscle.id);
    if (exs.length > 0) allGroupedResults.push({ muscleId: muscle.id, muscleName: muscle.name, exercises: exs });
  }

  const allWarmupExercisesCount = muscleWarmups.length;
  const filteredExercisesCount = muscleExercises.length;
  const totalCount = exerciseTab === "training" ? muscleExercises.length : muscleWarmups.length;

  return (
    <ProtectedRoute>
      <PageLayout>
        <ExercisesHeaderClient />

        <PageContent>
          {!selectedMuscle && !isGlobalMode && (
            <ExercisesFilters 
              isGlobalMode={isGlobalMode}
              selectedMuscle={selectedMuscle}
              exerciseTab={exerciseTab}
              warmupCategoryFilter={warmupCategoryFilter}
              searchTerm={searchTerm}
              selectedMuscleFilters={selectedMuscleFilters}
              filteredExercisesCount={filteredExercisesCount}
              allWarmupExercisesCount={allWarmupExercisesCount}
            />
          )}

          {!selectedMuscle && !isGlobalMode ? (
            <>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4 mt-6">
                Selecciona un grupo muscular
              </h2>

              {/* Server-side grid of muscle groups, the client component handles navigation */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {MUSCLE_GROUPS.map((muscle) => {
                  const exercisesForMuscle = getExercisesByMuscleGroup(muscle.id);
                  const total = exercisesForMuscle.length;
                  const warmupCount = getWarmupsByMuscleGroup(muscle.id).length;
                  
                  return (
                    <a
                      key={muscle.id}
                      href={`?muscle=${muscle.id}`}
                      className="group relative flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-2xl hover:scale-105 transition-all duration-300 overflow-hidden"
                      aria-label={`Seleccionar grupo ${muscle.name}, ${total} ejercicios`}
                    >
                      <div className="absolute inset-0 bg-linear-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      <div className="relative z-10 mb-3 group-hover:scale-110 transition-transform duration-300">
                        <MuscleGroupIcon muscleGroup={muscle.id} size={56} className="text-blue-500 dark:text-blue-400" />
                      </div>
                      
                      <span className="relative z-10 text-base font-bold text-gray-900 dark:text-gray-100 text-center mb-2">
                        {muscle.name}
                      </span>

                      <div className="relative z-10 flex flex-col items-center gap-1.5">
                        <span className="text-xs text-gray-600 dark:text-gray-400 font-medium px-2.5 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                          {total} ejercicio{total !== 1 ? "s" : ""}
                        </span>
                        {warmupCount > 0 && (
                          <span className="text-xs px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-medium">
                            🔥 {warmupCount} calentamiento
                            {warmupCount !== 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                    </a>
                  );
                })}
              </div>
            </>
          ) : (
            <>
              <ExercisesFilters 
                isGlobalMode={isGlobalMode}
                selectedMuscle={selectedMuscle}
                exerciseTab={exerciseTab}
                warmupCategoryFilter={warmupCategoryFilter}
                searchTerm={searchTerm}
                selectedMuscleFilters={selectedMuscleFilters}
                filteredExercisesCount={filteredExercisesCount}
                allWarmupExercisesCount={allWarmupExercisesCount}
              />
              
              <ExercisesClientList 
                muscleExercises={muscleExercises}
                muscleWarmups={muscleWarmups}
                globalResults={globalResults}
                allGroupedResults={allGroupedResults}
                isGlobalMode={isGlobalMode}
                selectedMuscle={selectedMuscle}
                exerciseTab={exerciseTab}
                totalCount={totalCount}
              />
            </>
          )}
        </PageContent>
      </PageLayout>
    </ProtectedRoute>
  );
}
