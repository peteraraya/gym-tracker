import type { ExerciseIndexEntry } from "@/data/exercises/index";

const MUSCLE_TERMS: Record<string, string[]> = {
  pecho: ["pecho", "pectoral", "pectorales", "chest"],
  espalda: ["espalda", "dorsal", "dorsales", "back"],
  piernas: ["pierna", "piernas", "cuadriceps", "cuádriceps", "legs"],
  gluteos: ["gluteo", "glúteo", "gluteos", "glúteos", "glutes"],
  hombros: ["hombro", "hombros", "deltoides", "shoulders"],
  biceps: ["biceps", "bíceps"],
  triceps: ["triceps", "tríceps"],
  antebrazos: ["antebrazo", "antebrazos"],
  trapecio: ["trapecio", "traps"],
  cuello: ["cuello", "neck"],
  core: ["core", "abdomen", "abdominales"],
  gemelos: ["gemelo", "gemelos", "pantorrilla", "pantorrillas"],
  cardio: ["cardio", "cardiovascular"],
};

const EQUIPMENT_TERMS: Record<string, string[]> = {
  mancuernas: ["mancuerna", "mancuernas", "dumbbell", "dumbbells"],
  barra: ["barra", "barbell"],
  poleas: ["polea", "poleas", "cable"],
  maquina: ["maquina", "máquina", "machine"],
  corporal: ["corporal", "peso corporal", "bodyweight", "sin equipo"],
};

const STOP_WORDS = new Set([
  "con",
  "para",
  "de",
  "del",
  "el",
  "la",
  "los",
  "las",
  "un",
  "una",
  "que",
  "sin",
  "y",
  "en",
  "a",
  "por",
  "without",
  "no",
  "exercise",
  "ejercicio",
  "ejercicios",
]);

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function matchesNaturalExerciseSearch(
  exercise: Pick<ExerciseIndexEntry, "name" | "muscleGroup" | "equipment">,
  query: string,
): boolean {
  const normalizedQuery = normalize(query);
  const positiveQuery = normalizedQuery.replace(
    /\b(?:sin\s+(?:banco|banca|bench)|without\s+(?:a\s+)?bench|no\s+bench)\b/g,
    " ",
  );
  const corpus = normalize(
    `${exercise.name} ${exercise.muscleGroup} ${exercise.equipment ?? ""}`,
  );

  const muscleGroup = Object.entries(MUSCLE_TERMS).find(([, terms]) =>
    terms.some((term) => positiveQuery.includes(normalize(term))),
  )?.[0];
  if (muscleGroup && exercise.muscleGroup !== muscleGroup) return false;

  const requiredEquipment = Object.entries(EQUIPMENT_TERMS).find(([, terms]) =>
    terms.some((term) => positiveQuery.includes(normalize(term))),
  );
  if (
    requiredEquipment &&
    !requiredEquipment[1].some((term) => corpus.includes(normalize(term)))
  ) {
    return false;
  }

  if (/\b(?:sin\s+(?:banco|banca|bench)|without\s+(?:a\s+)?bench|no\s+bench)\b/.test(normalizedQuery) &&
      /\b(banco|banca|bench)\b/.test(corpus)) {
    return false;
  }

  const searchTerms = positiveQuery
    .split(/[^a-z0-9]+/)
    .filter((term) => term.length > 2 && !STOP_WORDS.has(term))
    .filter(
      (term) =>
        !Object.values(MUSCLE_TERMS).flat().some((alias) => normalize(alias) === term) &&
        !Object.values(EQUIPMENT_TERMS).flat().some((alias) => normalize(alias) === term),
    );

  return searchTerms.length === 0 || searchTerms.some((term) => corpus.includes(term));
}
