/**
 * Sistema de almacenamiento local de perfil de usuario
 * Usado cuando no hay conexión a Supabase
 */

import type { UserProfile } from '@/types';

const PROFILE_STORAGE_KEY = 'gym-tracker-user-profile';

/**
 * Guarda el perfil del usuario en localStorage
 */
export function saveProfileLocally(profile: Partial<Omit<UserProfile, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>): UserProfile {
  if (typeof window === 'undefined') {
    throw new Error('localStorage only available in browser');
  }

  const existingProfile = getProfileLocally();
  
  // Normalizar null/undefined a `undefined` para compatibilidad con UserProfile
  const normalizeValue = <T>(value: T | null | undefined): T | undefined => {
    // Si es null o undefined, devolvemos undefined (campos opcionales en UserProfile)
    return value == null ? undefined : value;
  };
  
  const updatedProfile: UserProfile = {
    id: existingProfile?.id || 'local-profile',
    userId: existingProfile?.userId || 'local-user',
    name: profile.name ?? existingProfile?.name ?? 'Usuario',
    email: profile.email ?? existingProfile?.email ?? 'local@user.com',
    avatarUrl: normalizeValue(profile.avatarUrl ?? existingProfile?.avatarUrl),
    age: normalizeValue(profile.age ?? existingProfile?.age),
    gender: normalizeValue(profile.gender ?? existingProfile?.gender),
    height: normalizeValue(profile.height ?? existingProfile?.height),
    weight: normalizeValue(profile.weight ?? existingProfile?.weight),
    currentWeight: normalizeValue(profile.currentWeight ?? existingProfile?.currentWeight),
    targetWeight: normalizeValue(profile.targetWeight ?? existingProfile?.targetWeight),
    weightHistory: profile.weightHistory ?? existingProfile?.weightHistory,
    fitnessGoal: normalizeValue(profile.fitnessGoal ?? existingProfile?.fitnessGoal),
    fitnessLevel: normalizeValue(profile.fitnessLevel ?? existingProfile?.fitnessLevel),
    weeklyWorkouts: normalizeValue(profile.weeklyWorkouts ?? existingProfile?.weeklyWorkouts),
    createdAt: existingProfile?.createdAt ?? new Date(),
    updatedAt: new Date()
  };

  try {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(updatedProfile));
    console.log('[LocalProfile] Profile saved successfully:', updatedProfile);
    return updatedProfile;
  } catch (error) {
    console.error('[LocalProfile] Error saving profile:', error);
    throw new Error('Error al guardar el perfil localmente');
  }
}

/**
 * Obtiene el perfil del usuario desde localStorage
 */
export function getProfileLocally(): UserProfile | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const stored = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!stored) {
      console.log('[LocalProfile] No profile found in localStorage');
      return null;
    }

    const profile = JSON.parse(stored) as UserProfile;
    console.log('[LocalProfile] Profile loaded successfully:', profile);
    return profile;
  } catch (error) {
    console.error('[LocalProfile] Error loading profile:', error);
    return null;
  }
}

/**
 * Elimina el perfil del usuario de localStorage
 */
export function clearProfileLocally(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.removeItem(PROFILE_STORAGE_KEY);
    console.log('[LocalProfile] Profile cleared successfully');
  } catch (error) {
    console.error('[LocalProfile] Error clearing profile:', error);
  }
}

/**
 * Verifica si existe un perfil guardado localmente
 */
export function hasLocalProfile(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return localStorage.getItem(PROFILE_STORAGE_KEY) !== null;
}

/**
 * Exporta el perfil como JSON para backup
 */
export function exportProfileAsJSON(): string | null {
  const profile = getProfileLocally();
  if (!profile) return null;

  return JSON.stringify(profile, null, 2);
}

/**
 * Importa un perfil desde JSON
 */
export function importProfileFromJSON(jsonString: string): UserProfile {
  try {
    const profile = JSON.parse(jsonString) as UserProfile;
    return saveProfileLocally(profile);
  } catch (error) {
    console.error('[LocalProfile] Error importing profile:', error);
    throw new Error('Error al importar el perfil. Verifica que el formato sea correcto.');
  }
}
