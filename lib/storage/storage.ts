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
import logger from '@/lib/logger';

// ==================== Re-exported types ====================

export type { SetData, RoutineExercise, CreateRoutineData, UserProfile, ProgressRecommendation, WeeklyPlan, MonthlyPlan, ActiveWorkout } from '@/lib/storage/localStorage';
import type { CreateRoutineData, UserProfile, ProgressRecommendation, WeeklyPlan, MonthlyPlan, ActiveWorkout } from '@/lib/storage/localStorage';

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
    const mod = await import('@/lib/supabase/service');
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
  async getMonthlyPlan() { return (await this.svc()).getMonthlyPlan?.() ?? {}; }
  async saveMonthlyPlan(p: MonthlyPlan) { return (await this.svc()).saveMonthlyPlan?.(p); }
  async getRecommendations() { return (await this.svc()).getRecommendations?.() ?? []; }
  async saveRecommendations(r: ProgressRecommendation[]) { return (await this.svc()).saveRecommendations?.(r); }
  async getLastWeights() { return (await this.svc()).getLastWeights?.() ?? {}; }
  async saveLastWeights(w: Record<string, number[]>) { return (await this.svc()).saveLastWeights?.(w); }
  async getActiveWorkout() { return (await this.svc()).getActiveWorkout?.() ?? null; }
  async saveActiveWorkout(p: ActiveWorkout) { return (await this.svc()).saveActiveWorkout?.(p); }
  async clearActiveWorkout() { return (await this.svc()).clearActiveWorkout?.(); }
  async rebuildRoutinesFromSessions() { return []; }
  async migrateLegacySessions() { return { migrated: 0, total: 0 }; }
}

// ==================== Concrete Strategy: LocalStorage ====================

class LocalStorageStrategy implements StorageStrategy {
  name = 'localStorage';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private _cache: any = null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async svc(): Promise<any> {
    if (this._cache) return this._cache;
    const mod = await import('@/lib/storage/localStorage');
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
    if (typeof window !== 'undefined') localStorage.setItem('gym_tracker_sessions', JSON.stringify(filtered));
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
  }

  private onSuccess(): void {
    this.mode = 'supabase';
    this.lastError = null;
  }

  get status() {
    return {
      mode: this.mode || (this.isDbEnabled() ? 'supabase' : 'localStorage'),
      hasError: this.lastError !== null,
      lastError: this.lastError,
    };
  }

  /** Run on chosen strategy with automatic retry fallback. */
  async run<T>(fn: (s: StorageStrategy) => Promise<T>): Promise<T> {
    const strategy = this.pick();
    try {
      const result = await fn(strategy);
      this.onSuccess();
      return result;
    } catch {
      // Try local as fallback
      if (strategy === this.supabase) {
        this.onError();
        try {
          return await fn(this.localStore);
        } catch {
          // rethrow
        }
      }
      throw new Error('Operación fallida en ambos backends');
    }
  }

  /** Always use local (for localStorage-only ops). */
  async localStorageOnly<T>(fn: (s: LocalStorageStrategy) => Promise<T>): Promise<T> {
    return fn(this.localStore);
  }

  /** Supabase mode → Supabase only; localStorage mode → local only. No cross-fallback, throws on error. */
  async critical<T>(fn: (s: StorageStrategy) => Promise<T>): Promise<T> {
    const strategy = this.isDbEnabled() ? this.supabase : this.localStore;
    const result = await fn(strategy);
    if (strategy === this.supabase) this.onSuccess();
    return result;
  }

  /** Critical with draft saving on Supabase failure. */
  async criticalWithDraft<T>(
    fn: (s: StorageStrategy) => Promise<T>,
    draftKey: string,
    draftPayload: unknown,
  ): Promise<T> {
    if (!this.isDbEnabled()) {
      logger.info('Database disabled, using localStorage');
      return fn(this.localStore);
    }
    try {
      const result = await fn(this.supabase);
      this.onSuccess();
      return result;
    } catch (err: unknown) {
      this.onError();
      logger.error('Critical operation failed, saving draft', { draftKey }, err instanceof Error ? err : undefined);
      try {
        localStorage.setItem(draftKey, JSON.stringify({ ...(draftPayload as object), savedAt: Date.now() }));
      } catch { /* ignore */ }
      throw err;
    }
  }

  /** Dual-write: localStorage first (always), then Supabase best-effort. */
  async dualWrite<T>(fn: (s: LocalStorageStrategy) => Promise<T>): Promise<T> {
    const result = await fn(this.localStore);
    logger.debug('Saved to localStorage', { operation: 'DUAL_WRITE' });
    if (this.isDbEnabled()) {
      try {
        await fn(this.supabase as unknown as LocalStorageStrategy);
        this.onSuccess();
      } catch {
        logger.warn('Supabase failed, localStorage succeeded', { operation: 'DUAL_WRITE' });
      }
    }
    return result;
  }

  /** Dual-read: Supabase first, localStorage fallback. */
  async dualRead<T, U>(
    fnSupabase: (s: SupabaseStrategy) => Promise<T>,
    fnLocal: (s: LocalStorageStrategy) => Promise<U>,
  ): Promise<T | U> {
    if (this.isDbEnabled()) {
      try {
        const result = await fnSupabase(this.supabase);
        if (result !== null) { this.onSuccess(); return result; }
      } catch {
        logger.warn('Supabase read failed, trying localStorage', { operation: 'DUAL_READ' });
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
  return router.critical(s => s.getRoutines());
}

export async function createRoutine(data: CreateRoutineData): Promise<Routine> {
  return router.criticalWithDraft(s => s.createRoutine(data), `routine-draft-${Date.now()}`, data);
}

export async function updateRoutine(id: string, data: CreateRoutineData): Promise<Routine> {
  return router.criticalWithDraft(s => s.updateRoutine(id, data), `routine-draft-${id}`, { ...data, id });
}

export async function deleteRoutine(id: string): Promise<void> {
  if (!router.isDbEnabled()) {
    const svc = await import('@/lib/storage/localStorage');
    await svc.deleteSessionsByRoutine(id);
    await svc.deleteRoutine(id);
    return;
  }
  try {
    const svc = await import('@/lib/supabase/service');
    if (svc.deleteSessionsByRoutine) await svc.deleteSessionsByRoutine(id);
    await svc.deleteRoutine(id);
  } catch (err: unknown) {
    logger.error('Error al eliminar rutina', { critical: true, routineId: id }, err instanceof Error ? err : undefined);
    throw new Error('No se pudo eliminar la rutina. Verifica tu conexión a internet e intenta de nuevo.');
  }
}

// --- Sessions (critical data) ---
export async function getSessions(): Promise<WorkoutSession[]> {
  return router.critical(s => s.getSessions());
}

export async function saveSession(session: WorkoutSession): Promise<void> {
  return router.criticalWithDraft(s => s.saveSession(session), `session-draft-${session.id || Date.now()}`, session);
}

export async function updateSession(session: WorkoutSession): Promise<void> {
  if (!router.isDbEnabled()) {
    const svc = await import('@/lib/storage/localStorage');
    return svc.saveSession(session);
  }
  try {
    const svc = await import('@/lib/supabase/service');
    await svc.updateSession(session);
    logger.info('Sesión actualizada exitosamente', { sessionId: session.id });
  } catch (err: unknown) {
    logger.error('Error al actualizar sesión', { critical: true, sessionId: session.id }, err instanceof Error ? err : undefined);
    throw new Error('No se pudo actualizar la sesión de entrenamiento. Verifica tu conexión.');
  }
}

export async function deleteSession(id: string): Promise<void> {
  return router.critical(s => s.deleteSession(id));
}

// --- Profile ---
export async function getProfile(): Promise<UserProfile> {
  return router.critical(s => s.getProfile());
}

export async function updateProfile(data: Partial<UserProfile>): Promise<void> {
  return router.criticalWithDraft(s => s.updateProfile(data), `profile-draft-${Date.now()}`, data);
}

// --- Weekly Plan ---
export async function getWeeklyPlan(): Promise<WeeklyPlan> {
  return router.critical(s => s.getWeeklyPlan());
}

export async function saveWeeklyPlan(plan: WeeklyPlan): Promise<void> {
  return router.criticalWithDraft(s => s.saveWeeklyPlan(plan), `weekly-plan-draft-${Date.now()}`, plan);
}

// --- Monthly Plan (allows fallback) ---
export async function getMonthlyPlan(): Promise<MonthlyPlan> {
  return router.run(s => s.getMonthlyPlan());
}

export async function saveMonthlyPlan(plan: MonthlyPlan): Promise<void> {
  return router.run(s => s.saveMonthlyPlan(plan));
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
  return router.dualRead(
    s => s.getActiveWorkout(),
    s => s.getActiveWorkout(),
  );
}

export async function saveActiveWorkout(payload: ActiveWorkout): Promise<void> {
  return router.dualWrite(s => s.saveActiveWorkout(payload));
}

export async function clearActiveWorkout(): Promise<void> {
  return router.dualWrite(s => s.clearActiveWorkout());
}

// --- Utilities ---
export async function rebuildRoutinesFromSessions(): Promise<Routine[]> {
  return router.run(s => s.rebuildRoutinesFromSessions());
}

export async function migrateLegacySessions(): Promise<{ migrated: number; total: number }> {
  return router.localStorageOnly(s => s.migrateLegacySessions());
}

export async function syncLocalSessionsToDatabase(): Promise<{ synced: number; errors: number }> {
  if (!router.isDbEnabled()) return { synced: 0, errors: 0 };

  try {
    const localSvc = await import('@/lib/storage/localStorage');
    const localSessions = await localSvc.getSessions();

    const dbSvc = await import('@/lib/supabase/service');
    let dbSessions: WorkoutSession[] = [];
    try { dbSessions = await dbSvc.getSessions(); } catch { return { synced: 0, errors: 0 }; }

    const dbIds = new Set(dbSessions.map(s => s.id));
    let synced = 0;
    let errors = 0;

    for (const session of localSessions) {
      if (!dbIds.has(session.id)) {
        try { await dbSvc.saveSession(session); synced++; }
        catch { errors++; logger.error('Error syncing session', { sessionId: session.id }); }
      }
    }

    if (synced > 0) logger.info('Sessions synced to database', { synced, errors });
    return { synced, errors };
  } catch { return { synced: 0, errors: 0 }; }
}

// ==================== Dev Tools ====================

export function isDevToolsEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_DEV_TOOLS === 'true';
}

export async function devClearAllSessions(): Promise<{ deleted: number; error?: string }> {
  if (!isDevToolsEnabled()) throw new Error('Dev tools not enabled');
  try {
    if (router.isDbEnabled()) {
      const svc = await import('@/lib/supabase/service');
      const sessions = await svc.getSessions();
      for (const s of sessions) { if (typeof svc.deleteSession === 'function') await svc.deleteSession(s.id); }
      logger.info('[DEV] Cleared all sessions from Supabase', { count: sessions.length });
      return { deleted: sessions.length };
    } else {
      const svc = await import('@/lib/storage/localStorage');
      const sessions = await svc.getSessions();
      localStorage.removeItem('gym-tracker-sessions');
      logger.info('[DEV] Cleared all sessions from localStorage', { count: sessions.length });
      return { deleted: sessions.length };
    }
  } catch (err: unknown) { return { deleted: 0, error: err instanceof Error ? err.message : 'Unknown error' }; }
}

export async function devClearAllRoutines(): Promise<{ deleted: number; error?: string }> {
  if (!isDevToolsEnabled()) throw new Error('Dev tools not enabled');
  try {
    if (router.isDbEnabled()) {
      const svc = await import('@/lib/supabase/service');
      const routines = await svc.getRoutines();
      for (const r of routines) { if (typeof svc.deleteRoutine === 'function') await svc.deleteRoutine(r.id); }
      logger.info('[DEV] Cleared all routines from Supabase', { count: routines.length });
      return { deleted: routines.length };
    } else {
      const svc = await import('@/lib/storage/localStorage');
      const routines = await svc.getRoutines();
      localStorage.removeItem('gym-tracker-routines');
      logger.info('[DEV] Cleared all routines from localStorage', { count: routines.length });
      return { deleted: routines.length };
    }
  } catch (err: unknown) { return { deleted: 0, error: err instanceof Error ? err.message : 'Unknown error' }; }
}

export async function devClearProfile(): Promise<{ success: boolean; error?: string }> {
  if (!isDevToolsEnabled()) throw new Error('Dev tools not enabled');
  try {
    if (router.isDbEnabled()) {
      const svc = await import('@/lib/supabase/service');
      await svc.updateProfile({ name: undefined, avatarUrl: undefined, currentWeight: undefined, targetWeight: undefined, height: undefined });
      logger.info('[DEV] Cleared profile from Supabase');
      return { success: true };
    } else {
      localStorage.removeItem('gym-tracker-profile');
      logger.info('[DEV] Cleared profile from localStorage');
      return { success: true };
    }
  } catch (err: unknown) { return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }; }
}

export async function devClearPlans(): Promise<{ success: boolean; error?: string }> {
  if (!isDevToolsEnabled()) throw new Error('Dev tools not enabled');
  try {
    if (router.isDbEnabled()) {
      const svc = await import('@/lib/supabase/service');
      const emptyPlan = { monday: { routines: [] }, tuesday: { routines: [] }, wednesday: { routines: [] }, thursday: { routines: [] }, friday: { routines: [] }, saturday: { routines: [] }, sunday: { routines: [] } };
      await svc.saveWeeklyPlan(emptyPlan);
      // saveMonthlyPlan may not exist in supabase service
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (svc as any).saveMonthlyPlan?.({});
      logger.info('[DEV] Cleared plans from Supabase');
      return { success: true };
    } else {
      localStorage.removeItem('gym-tracker-weekly-plan');
      localStorage.removeItem('gym-tracker-monthly-plan');
      logger.info('[DEV] Cleared plans from localStorage');
      return { success: true };
    }
  } catch (err: unknown) { return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }; }
}

export async function devClearRecommendations(): Promise<{ success: boolean; error?: string }> {
  if (!isDevToolsEnabled()) throw new Error('Dev tools not enabled');
  try {
    if (router.isDbEnabled()) {
      const svc = await import('@/lib/supabase/service');
      // saveRecommendations may not exist in supabase service
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (svc as any).saveRecommendations?.([]);
      logger.info('[DEV] Cleared recommendations from Supabase');
      return { success: true };
    } else {
      localStorage.removeItem('gym-tracker-recommendations');
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
