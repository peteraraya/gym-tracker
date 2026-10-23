/**
 * Barrel de repositorios de dominio
 * Expone las interfaces de acceso a datos por entidad
 */

export type {
  IRoutineRepository,
  CreateRoutineInput,
  UpdateRoutineInput,
  RoutineFilters,
  RoutineListResult,
} from './routineRepository';

export type {
  ISessionRepository,
  CreateSessionInput,
  UpdateSessionInput,
  SessionFilters,
  SessionListResult,
} from './sessionRepository';

export type {
  IProfileRepository,
  CreateProfileInput,
  UpdateProfileInput,
} from './profileRepository';

export type {
  IActiveWorkoutRepository,
  ActiveWorkoutData,
} from './activeWorkoutRepository';