/**
 * Unified Storage Service - Strategy Pattern Refactor
 *
 * Eliminates ~1200 lines of repetitive if/else boilerplate by using
 * the Strategy pattern. Each storage backend implements `StorageStrategy`
 * and the facade delegates transparently.
 *
 * Public API is 100% backward compatible.
 */

import type { Routine, WorkoutSession } from '@/types';
import logger from '@/lib/shared/logger';

// ==================== Re-exported types ====================

export type { SetData, RoutineExercise, CreateRoutineData, UserProfile, ProgressRecommendation, WeeklyPlan, MonthlyPlan, ActiveWorkout } from '@/lib/infrastructure/storage/localStorage';
import type { CreateRoutineData, UserProfile, ProgressRecommendation, WeeklyPlan, MonthlyPlan, ActiveWorkout } from '@/lib/infrastructure/storage/localStorage';

const PENDING_SYNC_KEY = 'gym_logic_pending_sync_v1';

interface PendingSyncOperation {
  key: string;
  entity:
    | 'routine'
    | 'session'
    | 'profile'
    | 'weeklyPlan'
    | 'activeWorkout'
    | 'routineDelete'
    | 'sessionDelete'
    | 'activeWorkoutDelete';
  id: string;
  ownerId: string;
  updatedAt: number;
}

function readPendingOperations(): PendingSyncOperation[] {
  if (typeof localStorage === 'undefined') return [];
  const stored = localStorage.getItem(PENDING_SYNC_KEY);
  if (!stored) return [];
  const parsed: unknown = JSON.parse(stored);
  if (!Array.isArray(parsed)) throw new Error('Offline sync queue is malformed');
  return parsed.filter(
    (item): item is PendingSyncOperation =>
      typeof item === 'object' &&
      item !== null &&
      typeof item.key === 'string' &&
      typeof item.id === 'string' &&
      typeof item.ownerId === 'string' &&
      typeof item.updatedAt === 'number' &&
      typeof item.entity === 'string' &&
      [
        'routine',
        'session',
        'profile',
        'weeklyPlan',
        'activeWorkout',
        'routineDelete',
        'sessionDelete',
        'activeWorkoutDelete',
      ].includes(item.entity),
  );
}

function writePendingOperations(operations: PendingSyncOperation[]): void {
  localStorage.setItem(PENDING_SYNC_KEY, JSON.stringify(operations));
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function hasWeeklyPlanAssignments(plan: unknown): boolean {
  if (!plan || typeof plan !== 'object') return false;
  return Object.values(plan).some((day) => {
    if (Array.isArray(day)) return day.length > 0;
    if (!day || typeof day !== 'object') return false;
    const routines = (day as { routines?: unknown }).routines;
    return Array.isArray(routines) && routines.length > 0;
  });
}

async function queuePendingOperation(
  entity: 'routineDelete' | 'sessionDelete' | 'activeWorkout' | 'activeWorkoutDelete',
  id: string,
): Promise<void> {
  const dbSvc = await import('@/lib/infrastructure/supabase/service');
  const ownerId = await dbSvc.getCurrentUserId();
  if (!ownerId) return;
  const key = `${entity}:${id}`;
  const operations = readPendingOperations().filter(
    (operation) => operation.key !== key &&
      !(entity === 'routineDelete' && operation.key === `routine:${id}`) &&
      !(entity === 'sessionDelete' && operation.key === `session:${id}`) &&
      !(entity === 'activeWorkoutDelete' && operation.key === `activeWorkout:${id}`) &&
      !(entity === 'activeWorkout' && operation.key === `activeWorkoutDelete:${id}`),
  );
  operations.push({ key, entity, id, ownerId, updatedAt: Date.now() });
  writePendingOperations(operations);
}

function removePendingOperations(keys: Set<string>): void {
  writePendingOperations(readPendingOperations().filter((operation) => !keys.has(operation.key)));
}

function notifySyncStatus(detail: {
  state: 'syncing' | 'complete' | 'error';
  pending: number;
  synced: number;
  errors: number;
}): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('gym-logix:sync-status', { detail }));
  }
}

// ==================== Strategy Interface ====================
 
export interface StorageStrategy {
  name: string;
  getRoutines(): Promise<Routine[]>;
  createRoutine(data: CreateRoutineData): Promise<Routine>;
  updateRoutine(id: string, data: CreateRoutineData): Promise<Routine>;
  deleteRoutine(id: string): Promise<void>;
  deleteSessionsByRoutine?(id: string): Promise<void>;
  getSessions(): Promise<WorkoutSession[]>;
  saveSession(session: WorkoutSession): Promise<void>;
  updateSession(session: WorkoutSession): Promise<void>;
  deleteSession(id: string): Promise<void>;
  getProfile(): Promise<UserProfile>;
  updateProfile(data: Partial<UserProfile>): Promise<void>;
  getWeeklyPlan(): Promise<WeeklyPlan>;
  saveWeeklyPlan(plan: WeeklyPlan): Promise<void>;
  getMonthlyPlan(): Promise<MonthlyPlan>;
  saveMonthlyPlan(plan: MonthlyPlan): Promise<void>;
  getRecommendations(): Promise<ProgressRecommendation[]>;
  saveRecommendations(recs: ProgressRecommendation[]): Promise<void>;
  getLastWeights(): Promise<Record<string, number[]>>;
  saveLastWeights(w: Record<string, number[]>): Promise<void>;
  getActiveWorkout(): Promise<ActiveWorkout | null>;
  saveActiveWorkout(payload: ActiveWorkout): Promise<void>;
  clearActiveWorkout(): Promise<void>;
  rebuildRoutinesFromSessions(): Promise<Routine[]>;
  migrateLegacySessions(): Promise<{ migrated: number; total: number }>;
}

// ==================== Concrete Strategy: Supabase ====================

class SupabaseStrategy implements StorageStrategy {
  name = 'supabase';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private _cache: any = null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async svc(): Promise<any> {
    if (this._cache) return this._cache;
    const mod = await import('@/lib/infrastructure/supabase/service');
    this._cache = mod;
    return mod;
  }

  async getRoutines() { return (await this.svc()).getRoutines(); }
  async createRoutine(data: CreateRoutineData) { return (await this.svc()).createRoutine(data); }
  async updateRoutine(id: string, data: CreateRoutineData) { return (await this.svc()).updateRoutine(id, data); }
  async deleteRoutine(id: string) { return (await this.svc()).deleteRoutine(id); }
  async deleteSessionsByRoutine(id: string) { return (await this.svc()).deleteSessionsByRoutine(id); }
  async getSessions() { return (await this.svc()).getSessions(); }
  async saveSession(s: WorkoutSession) { return (await this.svc()).saveSession(s); }
  async updateSession(s: WorkoutSession) { return (await this.svc()).updateSession(s); }
  async deleteSession(id: string) { return (await this.svc()).deleteSession(id); }
  async getProfile() { return (await this.svc()).getProfile(); }
  async updateProfile(d: Partial<UserProfile>) { return (await this.svc()).updateProfile(d); }
  async getWeeklyPlan() { return (await this.svc()).getWeeklyPlan(); }
  async saveWeeklyPlan(p: WeeklyPlan) { return (await this.svc()).saveWeeklyPlan(p); }
  async getMonthlyPlan() { return this.unsupportedRemoteOperation('monthly plans'); }
  async saveMonthlyPlan() { return this.unsupportedRemoteOperation('monthly plans'); }
  async getRecommendations() { return this.unsupportedRemoteOperation('recommendations'); }
  async saveRecommendations() { return this.unsupportedRemoteOperation('recommendations'); }
  async getLastWeights() { return (await this.svc()).getLastWeights(); }
  async saveLastWeights(w: Record<string, number[]>) { return (await this.svc()).saveLastWeights?.(w); }
  async getActiveWorkout() { return (await this.svc()).getActiveWorkout(); }
  async saveActiveWorkout(p: ActiveWorkout) { return (await this.svc()).saveActiveWorkout(p); }
  async clearActiveWorkout() { return (await this.svc()).clearActiveWorkout(); }
  async rebuildRoutinesFromSessions() { return this.unsupportedRemoteOperation('routine rebuilding'); }
  async migrateLegacySessions() { return this.unsupportedRemoteOperation('legacy session migration'); }

  private unsupportedRemoteOperation(operation: string): never {
    throw new Error(`Supabase does not support ${operation}; using local storage is required.`);
  }
}

// ==================== Concrete Strategy: LocalStorage ====================

class LocalStorageStrategy implements StorageStrategy {
  name = 'localStorage';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private _cache: any = null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async svc(): Promise<any> {
    if (this._cache) return this._cache;
    const mod = await import('@/lib/infrastructure/storage/localStorage');
    this._cache = mod;
    return mod;
  }

  async getRoutines() { return (await this.svc()).getRoutines(); }
  async createRoutine(d: CreateRoutineData) { return (await this.svc()).createRoutine(d); }
  async updateRoutine(id: string, d: CreateRoutineData) { return (await this.svc()).updateRoutine(id, d); }
  async deleteRoutine(id: string) { return (await this.svc()).deleteRoutine(id); }
  async deleteSessionsByRoutine(id: string) { return (await this.svc()).deleteSessionsByRoutine(id); }
  async getSessions() { return (await this.svc()).getSessions(); }
  async saveSession(s: WorkoutSession) { return (await this.svc()).saveSession(s); }
  async updateSession(s: WorkoutSession) { return (await this.svc()).saveSession(s); }
  async deleteSession(id: string) {
    const svc = await this.svc();
    const sessions = await svc.getSessions();
    const filtered = sessions.filter((s: WorkoutSession) => s.id !== id);
    if (typeof window !== 'undefined') localStorage.setItem('gym_logic_sessions', JSON.stringify(filtered));
  }
  async getProfile() { return (await this.svc()).getProfile(); }
  async updateProfile(d: Partial<UserProfile>) { return (await this.svc()).updateProfile(d); }
  async getWeeklyPlan() { return (await this.svc()).getWeeklyPlan(); }
  async saveWeeklyPlan(p: WeeklyPlan) { return (await this.svc()).saveWeeklyPlan(p); }
  async getMonthlyPlan() { return (await this.svc()).getMonthlyPlan(); }
  async saveMonthlyPlan(p: MonthlyPlan) { return (await this.svc()).saveMonthlyPlan(p); }
  async getRecommendations() { return (await this.svc()).getRecommendations(); }
  async saveRecommendations(r: ProgressRecommendation[]) { return (await this.svc()).saveRecommendations(r); }
  async getLastWeights() { return (await this.svc()).getLastWeights(); }
  async saveLastWeights(w: Record<string, number[]>) { return (await this.svc()).saveLastWeights(w); }
  async getActiveWorkout() { return (await this.svc()).getActiveWorkout(); }
  async saveActiveWorkout(p: ActiveWorkout) { return (await this.svc()).saveActiveWorkout(p); }
  async clearActiveWorkout() { return (await this.svc()).clearActiveWorkout(); }
  async rebuildRoutinesFromSessions() { return (await this.svc()).rebuildRoutinesFromSessions(); }
  async migrateLegacySessions() { return (await this.svc()).migrateLegacySessions(); }
}

// ==================== Storage Router (Context) ====================

class StorageRouter {
  private supabase = new SupabaseStrategy();
  private localStore = new LocalStorageStrategy();
  private mode: 'supabase' | 'localStorage' | null = null;
  private lastError: Date | null = null;

  isDbEnabled(): boolean {
    return process.env.NEXT_PUBLIC_ENABLE_DATABASE === 'true';
  }

  private shouldRetry(): boolean {
    return !this.lastError || Date.now() - this.lastError.getTime() > 30000;
  }

  /** Select strategy: Supabase when DB enabled, otherwise localStorage. Falls back after error. */
  private pick(): StorageStrategy {
    if (!this.isDbEnabled()) return this.localStore;
    if (this.mode === 'localStorage' && !this.shouldRetry()) return this.localStore;
    return this.supabase;
  }

  private onError(): void {
    this.lastError = new Date();
    this.mode = 'localStorage';
    this.notifyStatusChange();
  }

  private onSuccess(): void {
    this.mode = 'supabase';
    this.lastError = null;
    this.notifyStatusChange();
  }

  onSyncSuccess(): void {
    this.onSuccess();
  }

  onWriteFallback(): void {
    this.onError();
  }

  private notifyStatusChange(): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('gym-logix:storage-status'));
    }
  }

  get status() {
    return {
      mode: this.mode || (this.isDbEnabled() ? 'supabase' : 'localStorage'),
      hasError: this.lastError !== null,
      lastError: this.lastError,
      hasVerifiedConnection: this.mode === 'supabase',
    };
  }

  /** Run on chosen strategy with automatic retry fallback. */
  async run<T>(fn: (s: StorageStrategy) => Promise<T>): Promise<T> {
    const strategy = this.pick();
    try {
      const result = await fn(strategy);
      if (strategy === this.supabase) this.onSuccess();
      return result;
    } catch (primaryError) {
      if (strategy === this.supabase) {
        this.onError();
        try {
          logger.warn('Supabase operation failed; falling back to localStorage', {
            operation: 'STORAGE_FALLBACK',
            error: primaryError instanceof Error ? primaryError.message : String(primaryError),
          });
          return await fn(this.localStore);
        } catch (fallbackError) {
          throw new Error(
            `Supabase operation failed (${primaryError instanceof Error ? primaryError.message : String(primaryError)}); local fallback failed (${fallbackError instanceof Error ? fallbackError.message : String(fallbackError)}).`,
          );
        }
      }
      throw primaryError;
    }
  }

  /** Always use local (for localStorage-only ops). */
  async localStorageOnly<T>(fn: (s: LocalStorageStrategy) => Promise<T>): Promise<T> {
    return fn(this.localStore);
  }

  /** Supabase-only critical operation. */
  async critical<T>(fn: (s: StorageStrategy) => Promise<T>): Promise<T | null> {
    const strategy = this.isDbEnabled() ? this.supabase : this.localStore;
    try {
      const result = await fn(strategy);
      if (strategy === this.supabase) this.onSuccess();
      return result;
    } catch (error) {
      const isAuthError = error instanceof Error && error.message === 'No autenticado';
      if (strategy === this.supabase) {
        this.onError();
        // "No autenticado" es un estado esperado (usuario sin sesión), no un error crítico del sistema
        if (!isAuthError) {
          logger.error(
            'Critical Supabase storage operation failed',
            { operation: 'CRITICAL_STORAGE' },
            error instanceof Error ? error : undefined,
          );
        }
      }
      // Retornar null para permitir que el llamador maneje gracefulmente la ausencia de usuario
      // y el sistema pueda hacer fallback a localStorage si corresponde
      return null as unknown as T;
    }
  }

  async read<T>(fn: (s: StorageStrategy) => Promise<T>): Promise<T> {
    if (!this.isDbEnabled()) return fn(this.localStore);
    try {
      const dbSvc = await import('@/lib/infrastructure/supabase/service');
      const ownerId = await dbSvc.getCurrentUserId();
      if (!ownerId) return fn(this.localStore);

      const result = await fn(this.supabase);
      this.onSuccess();
      return result;
    } catch (error) {
      this.onError();
      logger.warn('Remote read failed; using local data', {
        operation: 'OFFLINE_READ_FALLBACK',
        error: error instanceof Error ? error.message : String(error),
      });
      return fn(this.localStore);
    }
  }

/** Critical with draft saving on Supabase failure.
    * Guarda draft y notifica al router del fallo para que run()
    * pueda activar su fallback correctamente. */
    async criticalWithDraft<T>(
      fn: (s: StorageStrategy) => Promise<T>,
      draftKey: string,
      draftPayload: unknown,
    ): Promise<T> {
      if (!this.isDbEnabled()) {
        logger.info('Database disabled, using localStorage');
        return fn(this.localStore);
      }
      if (!this.shouldRetry()) {
        const localResult = await fn(this.localStore);
        const operation = await this.createPendingOperation(draftKey, draftPayload, localResult);
        if (operation) this.storePendingOperation(operation);
        this.notifyStatusChange();
        return localResult;
      }
      try {
        const result = await fn(this.supabase);
        this.onSuccess();
        return result;
      } catch {
        this.onError();
        try {
          const localResult = await fn(this.localStore);
          const operation = await this.createPendingOperation(draftKey, draftPayload, localResult);
          if (operation) this.storePendingOperation(operation);
          logger.warn('Remote write saved locally for later synchronization', { draftKey });
          this.notifyStatusChange();
          return localResult;
        } catch (localError) {
          logger.error(
            'Remote and local writes failed',
            { draftKey },
            localError instanceof Error ? localError : undefined,
          );
          throw new Error(
            `No se pudo guardar en la nube ni en este dispositivo: ${
              localError instanceof Error ? localError.message : String(localError)
            }`,
          );
        }
      }
    }

  private async createPendingOperation(
    draftKey: string,
    payload: unknown,
    localResult: unknown,
  ): Promise<PendingSyncOperation | null> {
    const supabaseSvc = await import('@/lib/infrastructure/supabase/service');
    const ownerId = await supabaseSvc.getCurrentUserId();
    if (!ownerId) return null;

    if (draftKey.startsWith('routine-draft-')) {
      const resultId =
        typeof localResult === 'object' && localResult !== null && 'id' in localResult
          ? String((localResult as { id: unknown }).id)
          : draftKey.replace('routine-draft-', '');
      return { key: `routine:${resultId}`, entity: 'routine', id: resultId, ownerId, updatedAt: Date.now() };
    }
    if (draftKey.startsWith('session-draft-')) {
      const sessionId =
        typeof payload === 'object' && payload !== null && 'id' in payload
          ? String((payload as { id: unknown }).id)
          : draftKey.replace('session-draft-', '');
      return { key: `session:${sessionId}`, entity: 'session', id: sessionId, ownerId, updatedAt: Date.now() };
    }
    if (draftKey === 'profile-draft') {
      return { key: 'profile', entity: 'profile', id: ownerId, ownerId, updatedAt: Date.now() };
    }
    if (draftKey === 'weekly-plan-draft') {
      return { key: 'weekly-plan', entity: 'weeklyPlan', id: ownerId, ownerId, updatedAt: Date.now() };
    }
    logger.warn('Unrecognized offline write type; leaving draft for manual recovery', { draftKey });
    try {
      localStorage.setItem(draftKey, JSON.stringify({ ...(payload as object), savedAt: Date.now() }));
    } catch (error) {
      logger.error('Could not persist fallback draft', { draftKey }, error instanceof Error ? error : undefined);
      throw error;
    }
    return null;
  }

  private storePendingOperation(operation: PendingSyncOperation): void {
    const pending = readPendingOperations();
    const next = pending.filter((item) => item.key !== operation.key);
    next.push(operation);
    localStorage.setItem(PENDING_SYNC_KEY, JSON.stringify(next));
  }

  /** Dual-write: localStorage first (always), then Supabase best-effort. */
  async dualWrite<T>(fn: (s: LocalStorageStrategy) => Promise<T>): Promise<T> {
    const result = await fn(this.localStore);
    logger.debug('Saved to localStorage', { operation: 'DUAL_WRITE' });
    if (this.isDbEnabled()) {
      try {
        await fn(this.supabase as unknown as LocalStorageStrategy);
        this.onSuccess();
      } catch (error) {
        this.onError();
        logger.warn('Supabase failed, localStorage succeeded', {
          operation: 'DUAL_WRITE',
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
    return result;
  }

  /**
   * Dual-read: Supabase first, localStorage fallback.
   * Un resultado de Supabase que no lanzó excepción es autoritativo, aunque
   * sea `null` (p. ej. "no hay entrenamiento activo" confirmado) — no hay
   * que caer al fallback local en ese caso, o se puede resucitar/mostrar
   * datos obsoletos de otro dispositivo. Solo una excepción real (falla de
   * red, tabla inexistente, etc.) debe activar el fallback.
   */
  async dualRead<T, U>(
    fnSupabase: (s: SupabaseStrategy) => Promise<T>,
    fnLocal: (s: LocalStorageStrategy) => Promise<U>,
  ): Promise<T | U> {
    if (this.isDbEnabled()) {
      try {
        const result = await fnSupabase(this.supabase);
        this.onSuccess();
        return result;
      } catch (error) {
        this.onError();
        logger.warn('Supabase read failed, trying localStorage', {
          operation: 'DUAL_READ',
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
    const result = await fnLocal(this.localStore);
    return result;
  }
}

const router = new StorageRouter();

// ==================== Public API (100% backward compatible) ====================

// --- Status ---
export function getStorageStatus() { return router.status; }

// --- Routines (critical data) ---
export async function getRoutines(): Promise<Routine[]> {
  const routines = await router.read(s => s.getRoutines());
  if (typeof window === 'undefined' || !router.isDbEnabled()) return routines;
  const localSvc = await import('@/lib/infrastructure/storage/localStorage');
  const localRoutines = await localSvc.getRoutines();
  const dbSvc = await import('@/lib/infrastructure/supabase/service');
  const ownerId = await dbSvc.getCurrentUserId();
  const ownerOperations = readPendingOperations().filter((item) => item.ownerId === ownerId);
  const pendingRoutineIds = new Set(
    ownerOperations
      .filter((item) => item.entity === 'routine')
      .map((item) => item.id),
  );
  const deletedRoutineIds = new Set(
    ownerOperations
      .filter((item) => item.entity === 'routineDelete')
      .map((item) => item.id),
  );
  const mappings = JSON.parse(
    localStorage.getItem('gym_logic_remote_routine_ids') || '{}',
  ) as Record<string, string>;
  const localIdByRemoteId = new Map(
    Object.entries(mappings).map(([localId, remoteId]) => [remoteId, localId]),
  );
  const mergedRemote = routines.filter((routine) => {
    const localId = localIdByRemoteId.get(routine.id);
    return !deletedRoutineIds.has(routine.id) && (!localId || !deletedRoutineIds.has(localId));
  }).map((routine) => {
    const localId = localIdByRemoteId.get(routine.id);
    const localRoutine = localId
      ? localRoutines.find((item) => item.id === localId)
      : undefined;
    if (localRoutine && pendingRoutineIds.has(localRoutine.id)) return localRoutine;
    return localId ? { ...routine, id: localId } : routine;
  });
  const mergedIds = new Set(mergedRemote.map((routine) => routine.id));
  const mergedRoutines = [
    ...mergedRemote,
    ...localRoutines.filter(
      (routine) =>
        !mergedIds.has(routine.id) &&
        !deletedRoutineIds.has(routine.id) &&
        (pendingRoutineIds.has(routine.id) || !Object.prototype.hasOwnProperty.call(mappings, routine.id)),
    ),
  ];
  if (!router.status.hasError) await localSvc.replaceCachedRoutines(mergedRoutines);
  return mergedRoutines;
}

export async function createRoutine(data: CreateRoutineData): Promise<Routine> {
  // Clave fija (no Date.now()): un reintento sobrescribe el borrador anterior
  // en vez de acumular una entrada nueva en localStorage por cada fallo.
  return router.criticalWithDraft(s => s.createRoutine(data), 'routine-draft-new', data);
}

export async function updateRoutine(id: string, data: CreateRoutineData): Promise<Routine> {
  return router.criticalWithDraft(s => s.updateRoutine(id, data), `routine-draft-${id}`, { ...data, id });
}

export async function deleteRoutine(id: string): Promise<void> {
  const localSvc = await import('@/lib/infrastructure/storage/localStorage');
  if (!router.isDbEnabled()) {
    await localSvc.deleteSessionsByRoutine(id);
    await localSvc.deleteRoutine(id);
    return;
  }
  const mappings = JSON.parse(
    localStorage.getItem('gym_logic_remote_routine_ids') || '{}',
  ) as Record<string, string>;
  const sessionsToRemove = (await localSvc.getSessions()).filter(
    (session) => session.routineId === id,
  );
  try {
    const dbSvc = await import('@/lib/infrastructure/supabase/service');
    const remoteId = mappings[id] ?? id;
    await dbSvc.deleteSessionsByRoutine(remoteId);
    await dbSvc.deleteRoutine(remoteId);
    await localSvc.deleteSessionsByRoutine(id);
    await localSvc.deleteRoutine(id);
    delete mappings[id];
    localStorage.setItem('gym_logic_remote_routine_ids', JSON.stringify(mappings));
    removePendingOperations(
      new Set([
        `routine:${id}`,
        ...sessionsToRemove.map((session) => `session:${session.id}`),
        `routineDelete:${id}`,
      ]),
    );
  } catch (error) {
    router.onWriteFallback();
    await localSvc.deleteSessionsByRoutine(id);
    await localSvc.deleteRoutine(id);
    const removeKeys = new Set([
      `routine:${id}`,
      ...sessionsToRemove.map((session) => `session:${session.id}`),
    ]);
    removePendingOperations(removeKeys);
    if (isUuid(mappings[id] ?? id)) {
      await queuePendingOperation('routineDelete', id);
    }
    logger.warn(
      'Routine deleted locally and queued for synchronization',
      { routineId: id },
      error instanceof Error ? error : undefined,
    );
    notifySyncStatus({
      state: 'error',
      pending: readPendingOperations().length,
      synced: 0,
      errors: 1,
    });
  }
}

// --- Sessions (critical data) ---
export async function getSessions(): Promise<WorkoutSession[]> {
  const sessions = await router.read(s => s.getSessions());
  if (typeof window === 'undefined' || !router.isDbEnabled()) return sessions;
  const localSvc = await import('@/lib/infrastructure/storage/localStorage');
  const localSessions = await localSvc.getSessions();
  const dbSvc = await import('@/lib/infrastructure/supabase/service');
  const ownerId = await dbSvc.getCurrentUserId();
  const ownerOperations = readPendingOperations().filter((item) => item.ownerId === ownerId);
  const pendingSessionIds = new Set(
    ownerOperations
      .filter((item) => item.entity === 'session')
      .map((item) => item.id),
  );
  const deletedSessionIds = new Set(
    ownerOperations
      .filter((item) => item.entity === 'sessionDelete')
      .map((item) => item.id),
  );
  const deletedRoutineIds = new Set(
    ownerOperations
      .filter((item) => item.entity === 'routineDelete')
      .map((item) => item.id),
  );
  const mappings = JSON.parse(
    localStorage.getItem('gym_logic_remote_routine_ids') || '{}',
  ) as Record<string, string>;
  const localIdByRemoteId = new Map(
    Object.entries(mappings).map(([localId, remoteId]) => [remoteId, localId]),
  );
  const merged = new Map(
    sessions.filter((session) => {
      const localRoutineId = localIdByRemoteId.get(session.routineId);
      return (
        !deletedSessionIds.has(session.id) &&
        !deletedRoutineIds.has(session.routineId) &&
        (!localRoutineId || !deletedRoutineIds.has(localRoutineId))
      );
    }).map((session) => [
      session.id,
      {
        ...session,
        routineId: localIdByRemoteId.get(session.routineId) ?? session.routineId,
      },
    ]),
  );
  for (const session of localSessions) {
    if (
      deletedSessionIds.has(session.id) ||
      deletedRoutineIds.has(session.routineId)
    ) continue;
    if (!merged.has(session.id) || pendingSessionIds.has(session.id)) {
      merged.set(session.id, session);
    }
  }
  const mergedSessions = [...merged.values()].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
  if (!router.status.hasError) await localSvc.replaceCachedSessions(mergedSessions);
  return mergedSessions;
}

export async function saveSession(session: WorkoutSession): Promise<void> {
  const id = session.id || (typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`);
  const sessionWithId = { ...session, id };
  return router.criticalWithDraft(
    (strategy) => strategy.saveSession(sessionWithId),
    `session-draft-${id}`,
    sessionWithId,
  );
}

export async function updateSession(session: WorkoutSession): Promise<void> {
  return router.criticalWithDraft(s => s.updateSession(session), `session-draft-${session.id}`, session);
}

export async function deleteSession(id: string): Promise<void> {
  const localSvc = await import('@/lib/infrastructure/storage/localStorage');
  if (!router.isDbEnabled()) return localSvc.deleteSession(id);
  try {
    const dbSvc = await import('@/lib/infrastructure/supabase/service');
    await dbSvc.deleteSession(id);
    await localSvc.deleteSession(id);
    removePendingOperations(new Set([`session:${id}`, `sessionDelete:${id}`]));
  } catch (error) {
    router.onWriteFallback();
    await localSvc.deleteSession(id);
    removePendingOperations(new Set([`session:${id}`]));
    if (isUuid(id)) {
      await queuePendingOperation('sessionDelete', id);
    }
    logger.warn(
      'Session deleted locally and queued for synchronization',
      { sessionId: id },
      error instanceof Error ? error : undefined,
    );
    notifySyncStatus({
      state: 'error',
      pending: readPendingOperations().length,
      synced: 0,
      errors: 1,
    });
  }
}

// --- Profile ---
export async function getProfile(): Promise<UserProfile | null> {
  const profile = await router.read(s => s.getProfile());
  if (
    router.status.mode === 'supabase' &&
    !router.status.hasError &&
    !readPendingOperations().some((operation) => operation.entity === 'profile')
  ) {
    const localSvc = await import('@/lib/infrastructure/storage/localStorage');
    await localSvc.replaceCachedProfile(profile);
  }
  return profile;
}

export async function updateProfile(data: Partial<UserProfile>): Promise<void> {
  // Clave fija: hay un solo perfil por usuario, no tiene sentido acumular
  // un borrador por cada fallo con Date.now(); el último reintento pisa al
  // anterior.
  return router.criticalWithDraft(s => s.updateProfile(data), 'profile-draft', data);
}

// --- Weekly Plan ---
export async function getWeeklyPlan(): Promise<WeeklyPlan | null> {
  const plan = await router.read(s => s.getWeeklyPlan());
  if (
    router.status.mode === 'supabase' &&
    !router.status.hasError &&
    !readPendingOperations().some((operation) => operation.entity === 'weeklyPlan')
  ) {
    const localSvc = await import('@/lib/infrastructure/storage/localStorage');
    await localSvc.replaceCachedWeeklyPlan(plan);
  }
  return plan;
}

export async function saveWeeklyPlan(plan: WeeklyPlan): Promise<void> {
  // Clave fija: un solo plan semanal por usuario, mismo motivo que arriba.
  return router.criticalWithDraft(s => s.saveWeeklyPlan(plan), 'weekly-plan-draft', plan);
}

// --- Monthly Plan (local-only; Supabase has no monthly plan storage) ---
export async function getMonthlyPlan(): Promise<MonthlyPlan> {
  return router.localStorageOnly(s => s.getMonthlyPlan());
}

export async function saveMonthlyPlan(plan: MonthlyPlan): Promise<void> {
  return router.localStorageOnly(s => s.saveMonthlyPlan(plan));
}

// --- Recommendations (allows fallback) ---
export async function getRecommendations(): Promise<ProgressRecommendation[]> {
  return router.run(s => s.getRecommendations());
}

export async function saveRecommendations(recs: ProgressRecommendation[]): Promise<void> {
  return router.run(s => s.saveRecommendations(recs));
}

// --- Last Weights (allows fallback) ---
export async function getLastWeights(): Promise<Record<string, number[]>> {
  return router.run(s => s.getLastWeights());
}

export async function saveLastWeights(w: Record<string, number[]>): Promise<void> {
  return router.run(s => s.saveLastWeights(w));
}

// --- Active Workout (dual read/write) ---
export async function getActiveWorkout(): Promise<ActiveWorkout | null> {
  if (router.isDbEnabled() && typeof localStorage !== 'undefined') {
    const dbSvc = await import('@/lib/infrastructure/supabase/service');
    const ownerId = await dbSvc.getCurrentUserId();
    const ownerOperations = readPendingOperations().filter((item) => item.ownerId === ownerId);
    if (ownerOperations.some((item) => item.entity === 'activeWorkoutDelete')) return null;
    if (ownerOperations.some((item) => item.entity === 'activeWorkout')) {
      const localSvc = await import('@/lib/infrastructure/storage/localStorage');
      return localSvc.getActiveWorkout();
    }
  }
  return router.dualRead(
    s => s.getActiveWorkout(),
    s => s.getActiveWorkout(),
  );
}

export async function saveActiveWorkout(payload: ActiveWorkout): Promise<void> {
  const localSvc = await import('@/lib/infrastructure/storage/localStorage');
  await localSvc.saveActiveWorkout(payload);
  if (!router.isDbEnabled()) return;

  const dbSvc = await import('@/lib/infrastructure/supabase/service');
  const ownerId = await dbSvc.getCurrentUserId();
  try {
    await dbSvc.saveActiveWorkout(payload);
    router.onSyncSuccess();
    if (ownerId) {
      removePendingOperations(
        new Set([`activeWorkout:${ownerId}`, `activeWorkoutDelete:${ownerId}`]),
      );
    }
  } catch (error) {
    router.onWriteFallback();
    if (ownerId) await queuePendingOperation('activeWorkout', ownerId);
    logger.warn(
      'Active workout saved locally and queued for synchronization',
      {},
      error instanceof Error ? error : undefined,
    );
    notifySyncStatus({
      state: 'error',
      pending: readPendingOperations().filter((operation) => operation.ownerId === ownerId).length,
      synced: 0,
      errors: 1,
    });
  }
}

export async function clearActiveWorkout(): Promise<void> {
  const localSvc = await import('@/lib/infrastructure/storage/localStorage');
  await localSvc.clearActiveWorkout();
  if (!router.isDbEnabled()) return;

  const dbSvc = await import('@/lib/infrastructure/supabase/service');
  const ownerId = await dbSvc.getCurrentUserId();
  try {
    await dbSvc.clearActiveWorkout();
    router.onSyncSuccess();
    if (ownerId) {
      removePendingOperations(
        new Set([`activeWorkout:${ownerId}`, `activeWorkoutDelete:${ownerId}`]),
      );
    }
  } catch (error) {
    router.onWriteFallback();
    if (ownerId) await queuePendingOperation('activeWorkoutDelete', ownerId);
    logger.warn(
      'Active workout cleared locally and queued for synchronization',
      {},
      error instanceof Error ? error : undefined,
    );
    notifySyncStatus({
      state: 'error',
      pending: readPendingOperations().filter((operation) => operation.ownerId === ownerId).length,
      synced: 0,
      errors: 1,
    });
  }
}

export interface PendingSyncResult {
  synced: number;
  errors: number;
  pending: number;
}

let pendingSyncPromise: Promise<PendingSyncResult> | null = null;

export function syncPendingLocalData(): Promise<PendingSyncResult> {
  if (pendingSyncPromise) return pendingSyncPromise;
  pendingSyncPromise = syncPendingLocalDataInternal().finally(() => {
    pendingSyncPromise = null;
  });
  return pendingSyncPromise;
}

async function syncPendingLocalDataInternal(): Promise<PendingSyncResult> {
  if (!router.isDbEnabled() || typeof localStorage === 'undefined') {
    return { synced: 0, errors: 0, pending: 0 };
  }

  const localSvc = await import('@/lib/infrastructure/storage/localStorage');
  const dbSvc = await import('@/lib/infrastructure/supabase/service');
  const ownerId = await dbSvc.getCurrentUserId();
  if (!ownerId) return { synced: 0, errors: 0, pending: 0 };

  let pending = readPendingOperations();
  const ownerOperations = pending
    .filter((operation) => operation.ownerId === ownerId)
    .sort((a, b) => {
      const priority = {
        routine: 0,
        session: 1,
        profile: 2,
        weeklyPlan: 3,
        activeWorkout: 4,
        sessionDelete: 5,
        routineDelete: 6,
        activeWorkoutDelete: 7,
      };
      return priority[a.entity] - priority[b.entity] || a.updatedAt - b.updatedAt;
    });
  let synced = 0;
  let errors = 0;
  const localRoutines = await localSvc.getRoutines();
  const routineIds = new Map<string, string>();
  const storedMappings = JSON.parse(
    localStorage.getItem('gym_logic_remote_routine_ids') || '{}',
  ) as Record<string, string>;
  const needsRoutineLookup = ownerOperations.some(
    (operation) => operation.entity === 'routine' || operation.entity === 'session',
  );
  const remoteRoutines = needsRoutineLookup ? await dbSvc.getRoutines() : [];
  remoteRoutines.forEach((routine) => routineIds.set(routine.id, routine.id));
  Object.entries(storedMappings).forEach(([localId, remoteId]) => {
    routineIds.set(localId, remoteId);
  });

  if (ownerOperations.length > 0) {
    notifySyncStatus({ state: 'syncing', pending: ownerOperations.length, synced, errors });
  }

  const removePending = (operation: PendingSyncOperation) => {
    pending = pending.filter((item) => item.key !== operation.key);
    writePendingOperations(pending);
    synced += 1;
    notifySyncStatus({
      state: 'syncing',
      pending: pending.filter((item) => item.ownerId === ownerId).length,
      synced,
      errors,
    });
  };

  for (const operation of ownerOperations.filter((item) => item.entity === 'routine')) {
    try {
      if (ownerOperations.some((item) => item.entity === 'routineDelete' && item.id === operation.id)) {
        removePending(operation);
        continue;
      }
      const routine = localRoutines.find((item) => item.id === operation.id);
      if (!routine) {
        removePending(operation);
        continue;
      }

      const mappedId = storedMappings[routine.id];
      const byId = remoteRoutines.find(
        (item) => item.id === routine.id || item.id === mappedId,
      );
      const sameName = remoteRoutines.filter(
        (item) =>
          item.name.trim().toLocaleLowerCase() === routine.name.trim().toLocaleLowerCase() &&
          item.exercises.map((exercise) => exercise.name).join('|') ===
            routine.exercises.map((exercise) => exercise.name).join('|'),
      );
      const existing = byId ?? (sameName.length === 1 ? sameName[0] : undefined);
      const routineData: Parameters<typeof dbSvc.createRoutine>[0] = {
        name: routine.name,
        description: routine.description,
        image: routine.image,
        exercises: routine.exercises.map((exercise) => ({
          id: exercise.id,
          name: exercise.name,
          sets: exercise.sets,
          equipment: exercise.equipment,
          notes: exercise.notes,
          restBetweenSets: exercise.restBetweenSets,
          useSmartRest: exercise.useSmartRest,
          technique: Array.isArray(exercise.technique)
            ? exercise.technique
            : exercise.technique
              ? [exercise.technique]
              : undefined,
          recommendedSets:
            exercise.recommendedSets !== undefined ? String(exercise.recommendedSets) : undefined,
          recommendedReps:
            exercise.recommendedReps !== undefined ? String(exercise.recommendedReps) : undefined,
          restTime: exercise.restTime !== undefined ? String(exercise.restTime) : undefined,
        })),
        restBetweenSets: routine.restBetweenSets,
        restBetweenExercises: routine.restBetweenExercises,
      };
      const saved = existing
        ? await dbSvc.updateRoutine(existing.id, routineData)
        : await dbSvc.createRoutine(routineData);

      routineIds.set(routine.id, saved.id);
      storedMappings[routine.id] = saved.id;
      localStorage.setItem('gym_logic_remote_routine_ids', JSON.stringify(storedMappings));
      removePending(operation);
    } catch (error) {
      errors += 1;
      logger.error(
        'Failed to synchronize offline routine',
        { routineId: operation.id },
        error instanceof Error ? error : undefined,
      );
    }
  }

  const sessions = await localSvc.getSessions();
  for (const operation of ownerOperations.filter((item) => item.entity === 'session')) {
    try {
      if (ownerOperations.some((item) => item.entity === 'sessionDelete' && item.id === operation.id)) {
        removePending(operation);
        continue;
      }
      const session = sessions.find((item) => item.id === operation.id);
      if (!session) {
        removePending(operation);
        continue;
      }
      const remoteRoutineId = routineIds.get(session.routineId);
      if (!remoteRoutineId) {
        throw new Error(`No remote routine mapping for ${session.routineId}`);
      }

      const sessionId = session.id;
      const idIsUuid =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
          sessionId,
        );
      const remoteSession = {
        ...session,
        id: idIsUuid
          ? sessionId
          : typeof crypto.randomUUID === 'function'
            ? crypto.randomUUID()
            : (() => {
                throw new Error('This browser cannot generate a secure session ID');
              })(),
        routineId: remoteRoutineId,
      };
      await dbSvc.saveSession(remoteSession);
      if (remoteSession.id !== sessionId) {
        await localSvc.deleteSession(sessionId);
        await localSvc.saveSession(remoteSession);
      }
      removePending(operation);
    } catch (error) {
      errors += 1;
      logger.error(
        'Failed to synchronize offline session',
        { sessionId: operation.id },
        error instanceof Error ? error : undefined,
      );
    }
  }

  for (const operation of ownerOperations.filter(
    (item) => item.entity === 'profile' || item.entity === 'weeklyPlan',
  )) {
    try {
      if (operation.entity === 'profile') {
        await dbSvc.updateProfile(await localSvc.getProfile());
      } else {
        const localPlan = await localSvc.getWeeklyPlan();
        const remotePlan = await dbSvc.getWeeklyPlan();
        if (!hasWeeklyPlanAssignments(localPlan) && hasWeeklyPlanAssignments(remotePlan)) {
          await localSvc.replaceCachedWeeklyPlan(remotePlan);
        } else {
          await dbSvc.saveWeeklyPlan(localPlan);
        }
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('gym-logix:weekly-plan-synced'));
        }
      }
      removePending(operation);
    } catch (error) {
      errors += 1;
      logger.error(
        'Failed to synchronize offline user data',
        { entity: operation.entity },
        error instanceof Error ? error : undefined,
      );
    }
  }

  for (const operation of ownerOperations.filter((item) => item.entity === 'activeWorkout')) {
    try {
      const activeWorkout = await localSvc.getActiveWorkout();
      if (activeWorkout) await dbSvc.saveActiveWorkout(activeWorkout);
      removePending(operation);
    } catch (error) {
      errors += 1;
      logger.error(
        'Failed to synchronize active workout',
        {},
        error instanceof Error ? error : undefined,
      );
    }
  }

  for (const operation of ownerOperations.filter((item) => item.entity === 'sessionDelete')) {
    try {
      await dbSvc.deleteSession(operation.id);
      removePending(operation);
    } catch (error) {
      errors += 1;
      logger.error(
        'Failed to synchronize offline session deletion',
        { sessionId: operation.id },
        error instanceof Error ? error : undefined,
      );
    }
  }

  for (const operation of ownerOperations.filter((item) => item.entity === 'activeWorkoutDelete')) {
    try {
      await dbSvc.clearActiveWorkout();
      removePending(operation);
    } catch (error) {
      errors += 1;
      logger.error(
        'Failed to synchronize active workout deletion',
        {},
        error instanceof Error ? error : undefined,
      );
    }
  }

  for (const operation of ownerOperations.filter((item) => item.entity === 'routineDelete')) {
    try {
      const remoteId = storedMappings[operation.id] ?? operation.id;
      await dbSvc.deleteSessionsByRoutine(remoteId);
      await dbSvc.deleteRoutine(remoteId);
      delete storedMappings[operation.id];
      localStorage.setItem('gym_logic_remote_routine_ids', JSON.stringify(storedMappings));
      removePending(operation);
    } catch (error) {
      errors += 1;
      logger.error(
        'Failed to synchronize offline routine deletion',
        { routineId: operation.id },
        error instanceof Error ? error : undefined,
      );
    }
  }

  const remaining = readPendingOperations().filter((item) => item.ownerId === ownerId).length;
  notifySyncStatus({
    state: errors > 0 ? 'error' : 'complete',
    pending: remaining,
    synced,
    errors,
  });
  if (remaining === 0 && errors === 0) router.onSyncSuccess();
  return { synced, errors, pending: remaining };
}

// --- Utilities ---
export async function rebuildRoutinesFromSessions(): Promise<Routine[]> {
  return router.run(s => s.rebuildRoutinesFromSessions());
}

export async function migrateLegacySessions(): Promise<{ migrated: number; total: number }> {
  return router.localStorageOnly(s => s.migrateLegacySessions());
}

export async function syncLocalSessionsToDatabase(): Promise<{ synced: number; errors: number }> {
  if (!router.isDbEnabled()) {
    throw new Error('Session sync requires an enabled database connection.');
  }

  const localSvc = await import('@/lib/infrastructure/storage/localStorage');
  const localSessions = await localSvc.getSessions();
  const dbSvc = await import('@/lib/infrastructure/supabase/service');
  const dbSessions = await dbSvc.getSessions();
  let synced = 0;
  let errors = 0;

  for (const session of localSessions) {
    try {
      const existing = dbSessions.find((savedSession) => savedSession.id === session.id);
      if (existing) {
        await dbSvc.updateSession(session);
      } else {
        await dbSvc.saveSession(session);
      }
      synced++;
    } catch (error) {
      errors++;
      logger.error(
        'Error syncing session',
        { sessionId: session.id },
        error instanceof Error ? error : undefined,
      );
    }
  }

  if (synced > 0) logger.info('Sessions synced to database', { synced, errors });
  return { synced, errors };
}

export async function syncLocalRoutinesToDatabase(): Promise<{ synced: number; errors: number }> {
  if (!router.isDbEnabled()) {
    throw new Error('Routine sync requires an enabled database connection.');
  }

  const localSvc = await import('@/lib/infrastructure/storage/localStorage');
  const localRoutines = await localSvc.getRoutines();
  const dbSvc = await import('@/lib/infrastructure/supabase/service');
  const dbRoutines = await dbSvc.getRoutines();
  const dbMap = new Map(dbRoutines.map((routine) => [routine.name, routine]));
  let synced = 0;
  let errors = 0;

  for (const routine of localRoutines) {
    try {
      const existing = dbMap.get(routine.name);
      const data: Parameters<typeof dbSvc.createRoutine>[0] = {
        name: routine.name,
        description: routine.description,
        image: routine.image,
        exercises: routine.exercises.map((exercise) => ({
          name: exercise.name,
          sets: exercise.sets,
          equipment: exercise.equipment,
          notes: exercise.notes,
          restBetweenSets: exercise.restBetweenSets,
          useSmartRest: exercise.useSmartRest,
        })),
        restBetweenSets: routine.restBetweenSets,
        restBetweenExercises: routine.restBetweenExercises,
      };

      if (existing) {
        await dbSvc.updateRoutine(existing.id, data);
      } else {
        await dbSvc.createRoutine(data);
      }
      synced++;
    } catch (error) {
      errors++;
      logger.error(
        'Error syncing routine',
        { routineName: routine.name },
        error instanceof Error ? error : undefined,
      );
    }
  }

  if (synced > 0) logger.info('Routines synced to database', { synced, errors });
  return { synced, errors };
}

// ==================== Dev Tools ====================

export function isDevToolsEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_DEV_TOOLS === 'true';
}

export async function devClearAllSessions(): Promise<{ deleted: number; error?: string }> {
  if (!isDevToolsEnabled()) throw new Error('Dev tools not enabled');
  try {
    if (router.isDbEnabled()) {
      const svc = await import('@/lib/infrastructure/supabase/service');
      const sessions = await svc.getSessions();
      for (const s of sessions) { if (typeof svc.deleteSession === 'function') await svc.deleteSession(s.id); }
      logger.info('[DEV] Cleared all sessions from Supabase', { count: sessions.length });
      return { deleted: sessions.length };
    } else {
      const svc = await import('@/lib/infrastructure/storage/localStorage');
      const sessions = await svc.getSessions();
      localStorage.removeItem('gym-logic-sessions');
      logger.info('[DEV] Cleared all sessions from localStorage', { count: sessions.length });
      return { deleted: sessions.length };
    }
  } catch (err: unknown) { return { deleted: 0, error: err instanceof Error ? err.message : 'Unknown error' }; }
}

export async function devClearAllRoutines(): Promise<{ deleted: number; error?: string }> {
  if (!isDevToolsEnabled()) throw new Error('Dev tools not enabled');
  try {
    if (router.isDbEnabled()) {
      const svc = await import('@/lib/infrastructure/supabase/service');
      const routines = await svc.getRoutines();
      for (const r of routines) { if (typeof svc.deleteRoutine === 'function') await svc.deleteRoutine(r.id); }
      logger.info('[DEV] Cleared all routines from Supabase', { count: routines.length });
      return { deleted: routines.length };
    } else {
      const svc = await import('@/lib/infrastructure/storage/localStorage');
      const routines = await svc.getRoutines();
      localStorage.removeItem('gym-logic-routines');
      logger.info('[DEV] Cleared all routines from localStorage', { count: routines.length });
      return { deleted: routines.length };
    }
  } catch (err: unknown) { return { deleted: 0, error: err instanceof Error ? err.message : 'Unknown error' }; }
}

export async function devClearProfile(): Promise<{ success: boolean; error?: string }> {
  if (!isDevToolsEnabled()) throw new Error('Dev tools not enabled');
  try {
    if (router.isDbEnabled()) {
      const svc = await import('@/lib/infrastructure/supabase/service');
      await svc.updateProfile({ name: undefined, avatarUrl: undefined, currentWeight: undefined, targetWeight: undefined, height: undefined });
      logger.info('[DEV] Cleared profile from Supabase');
      return { success: true };
    } else {
      localStorage.removeItem('gym-logic-profile');
      logger.info('[DEV] Cleared profile from localStorage');
      return { success: true };
    }
  } catch (err: unknown) { return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }; }
}

export async function devClearPlans(): Promise<{ success: boolean; error?: string }> {
  if (!isDevToolsEnabled()) throw new Error('Dev tools not enabled');
  try {
    if (router.isDbEnabled()) {
      const svc = await import('@/lib/infrastructure/supabase/service');
      const emptyPlan = { monday: { routines: [] }, tuesday: { routines: [] }, wednesday: { routines: [] }, thursday: { routines: [] }, friday: { routines: [] }, saturday: { routines: [] }, sunday: { routines: [] } };
      await svc.saveWeeklyPlan(emptyPlan);
      // saveMonthlyPlan may not exist in supabase service
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (svc as any).saveMonthlyPlan?.({});
      logger.info('[DEV] Cleared plans from Supabase');
      return { success: true };
    } else {
      localStorage.removeItem('gym-logic-weekly-plan');
      localStorage.removeItem('gym-logic-monthly-plan');
      logger.info('[DEV] Cleared plans from localStorage');
      return { success: true };
    }
  } catch (err: unknown) { return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }; }
}

export async function devClearRecommendations(): Promise<{ success: boolean; error?: string }> {
  if (!isDevToolsEnabled()) throw new Error('Dev tools not enabled');
  try {
    if (router.isDbEnabled()) {
      const svc = await import('@/lib/infrastructure/supabase/service');
      // saveRecommendations may not exist in supabase service
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (svc as any).saveRecommendations?.([]);
      logger.info('[DEV] Cleared recommendations from Supabase');
      return { success: true };
    } else {
      localStorage.removeItem('gym-logic-recommendations');
      logger.info('[DEV] Cleared recommendations from localStorage');
      return { success: true };
    }
  } catch (err: unknown) { return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }; }
}

export async function devClearAllData(): Promise<{
  sessions: number; routines: number; profile: boolean; plans: boolean; recommendations: boolean; errors: string[];
}> {
  if (!isDevToolsEnabled()) throw new Error('Dev tools not enabled');

  const errors: string[] = [];
  let sessionsDeleted = 0;
  let routinesDeleted = 0;
  let profileCleared = false;
  let plansCleared = false;
  let recommendationsCleared = false;

  const safe = async <T>(label: string, fn: () => Promise<T>): Promise<T | null> => {
    try { return await fn(); }
    catch (err: unknown) { errors.push(`${label}: ${err instanceof Error ? err.message : 'Unknown error'}`); return null; }
  };

  await safe('Sessions', async () => { const r = await devClearAllSessions(); sessionsDeleted = r.deleted ?? 0; return r; });
  await safe('Routines', async () => { const r = await devClearAllRoutines(); routinesDeleted = r.deleted ?? 0; return r; });
  await safe('Profile', async () => { const r = await devClearProfile(); profileCleared = r.success; return r; });
  await safe('Plans', async () => { const r = await devClearPlans(); plansCleared = r.success; return r; });
  await safe('Recommendations', async () => { const r = await devClearRecommendations(); recommendationsCleared = r.success; return r; });
  await safe('Active workout', () => clearActiveWorkout());

  logger.warn('[DEV] Cleared all user data', { sessionsDeleted, routinesDeleted, profileCleared, plansCleared, recommendationsCleared, errors });
  return { sessions: sessionsDeleted, routines: routinesDeleted, profile: profileCleared, plans: plansCleared, recommendations: recommendationsCleared, errors };
}

export async function devGenerateTestData(): Promise<{ success: boolean; error?: string }> {
  if (!isDevToolsEnabled()) throw new Error('Dev tools not enabled');
  try {
    const testRoutine = await createRoutine({
      name: 'Rutina de Prueba',
      description: 'Generada automáticamente para desarrollo',
      exercises: [
        { id: 'test-exercise-1', name: 'Press Banca', sets: [{ reps: 10, weight: 50 }, { reps: 10, weight: 55 }, { reps: 8, weight: 60 }] },
        { id: 'test-exercise-2', name: 'Sentadillas', sets: [{ reps: 12, weight: 80 }, { reps: 10, weight: 90 }, { reps: 8, weight: 100 }] },
      ],
      restBetweenSets: 90,
      restBetweenExercises: 120,
    });

    const testSession: WorkoutSession = {
      id: `test-session-${Date.now()}`,
      routineId: testRoutine.id,
      routineName: testRoutine.name,
      date: new Date(),
      startedAt: new Date(Date.now() - 3600000),
      completedAt: new Date(),
      exercises: [
        { exerciseId: 'test-exercise-1', exerciseName: 'Press Banca', completedSets: 3, actualReps: [10, 10, 8], actualWeight: [50, 55, 60] },
        { exerciseId: 'test-exercise-2', exerciseName: 'Sentadillas', completedSets: 3, actualReps: [12, 10, 8], actualWeight: [80, 90, 100] },
      ],
      totalDuration: 3600,
      notes: 'Sesión de prueba generada automáticamente',
    };

    await saveSession(testSession);
    logger.info('[DEV] Generated test data', { routineId: testRoutine.id, sessionId: testSession.id });
    return { success: true };
  } catch (err: unknown) { return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }; }
}
