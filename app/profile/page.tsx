'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
// createClient se importa dinámicamente solo cuando la DB está habilitada
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import { RestSettings } from '@/components/features/workout/RestSettings';
import { ThemeSettings } from '@/components/features/settings/ThemeSettings';
import RestartOnboardingButton from '@/components/features/onboarding/RestartOnboardingButton';
import type { UserProfile, FitnessGoal, FitnessLevel, Gender, WeightEntry } from '@/types';
import { WeightHistoryCard } from '@/components/features/profile/WeightHistoryCard';
import { usePageData } from '@/hooks/usePageData';
import { PageHeader, PageLayout, PageContent } from '@/layouts';
import {
  LoadingSpinner
} from '@/components/shared';

export default function ProfilePage() {
  const { user } = useAuth();
  const [ currentPassword, setCurrentPassword ] = useState('');
  const [ newPassword, setNewPassword ] = useState('');
  const [ confirmPassword, setConfirmPassword ] = useState('');
  const [ message, setMessage ] = useState('');
  const [ error, setError ] = useState('');
  const [ loading, setLoading ] = useState(false);

  // Profile data
  const [ profileLoading, setProfileLoading ] = useState(true);
  const [ profileMessage, setProfileMessage ] = useState('');
  const [ profileError, setProfileError ] = useState('');
  const [ age, setAge ] = useState<number | ''>('');
  const [ gender, setGender ] = useState<Gender | ''>('');
  const [ height, setHeight ] = useState<number | ''>('');
  const [ weight, setWeight ] = useState<number | ''>('');
  const [ fitnessGoal, setFitnessGoal ] = useState<FitnessGoal | ''>('');
  const [ fitnessLevel, setFitnessLevel ] = useState<FitnessLevel | ''>('');
  const [ weeklyWorkouts, setWeeklyWorkouts ] = useState<number | ''>('');
  const [ weightHistory, setWeightHistory ] = useState<WeightEntry[]>([]);
  const [ weightSaving, setWeightSaving ] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      // Verificar modo de almacenamiento
      const { isLocalStorageMode } = await import('@/lib/storageConfig');

      if (isLocalStorageMode()) {
        // Modo LOCAL: Cargar desde localStorage
        if (typeof window !== 'undefined') {
          const { getProfileLocally } = await import('@/lib/user/localProfile');
          const localProfile = getProfileLocally();

          if (localProfile) {
            // console.log('[Profile] ✅ Loaded from localStorage:', localProfile);
            setAge(localProfile.age || '');
            setGender(localProfile.gender || '');
            setHeight(localProfile.height || '');
            setWeight(localProfile.weight || '');
            setFitnessGoal(localProfile.fitnessGoal || '');
            setFitnessLevel(localProfile.fitnessLevel || '');
            setWeeklyWorkouts(localProfile.weeklyWorkouts || '');
            setWeightHistory(localProfile.weightHistory || []);
            setProfileLoading(false);
            return;
          }
        }
      } else {
        // Modo DATABASE: Cargar desde Supabase
        // console.log('[Profile] ☁️ Loading from Supabase...');
        const response = await fetch('/api/profile');
        if (response.ok) {
          const profile: UserProfile | null = await response.json();
          if (profile) {
            // console.log('[Profile] ✅ Loaded from Supabase:', profile);
            setAge(profile.age || '');
            setGender(profile.gender || '');
            setHeight(profile.height || '');
            setWeight(profile.weight || '');
            setFitnessGoal(profile.fitnessGoal || '');
            setFitnessLevel(profile.fitnessLevel || '');
            setWeeklyWorkouts(profile.weeklyWorkouts || '');
            setWeightHistory(profile.weightHistory || []);
          }
        }
      }
    } catch (err) {
      console.error('[Profile] ❌ Error loading profile:', err);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileMessage('');
    setLoading(true);

    try {
      const profileData = {
        age: age || undefined,
        gender: gender || undefined,
        height: height || undefined,
        weight: weight || undefined,
        fitnessGoal: fitnessGoal || undefined,
        fitnessLevel: fitnessLevel || undefined,
        weeklyWorkouts: weeklyWorkouts || undefined,
        weightHistory
      };

      // Verificar modo de almacenamiento
      const { isLocalStorageMode } = await import('@/lib/storageConfig');

      if (isLocalStorageMode()) {
        // Modo LOCAL: Guardar en localStorage
        if (typeof window !== 'undefined') {
          const { saveProfileLocally } = await import('@/lib/user/localProfile');
          saveProfileLocally(profileData);
          // console.log('[Profile] ✅ Saved to localStorage');
          setProfileMessage('✓ Perfil guardado localmente correctamente');
          setLoading(false);
          return;
        }
      } else {
        // Modo DATABASE: Guardar en Supabase
        // console.log('[Profile] ☁️ Saving to Supabase...');
        const response = await fetch('/api/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(profileData)
        });

        if (response.ok) {
          // console.log('[Profile] ✅ Saved to Supabase');
          setProfileMessage('✓ Perfil actualizado correctamente');
        } else {
          const data = await response.json();
          setProfileError(data.error || 'Error al guardar el perfil');
        }
      }
    } catch (err) {
      console.error('[Profile] ❌ Error saving profile:', err);
      setProfileError('Error al guardar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const calculateBMI = () => {
    if (height && weight) {
      const heightInMeters = Number(height) / 100;
      const bmi = Number(weight) / (heightInMeters * heightInMeters);
      return bmi.toFixed(1);
    }
    return null;
  };

  const persistWeightHistory = async (history: WeightEntry[], latestKg: number | '') => {
    const payload = {
      age: age || undefined,
      gender: gender || undefined,
      height: height || undefined,
      weight: latestKg !== '' ? latestKg : undefined,
      fitnessGoal: fitnessGoal || undefined,
      fitnessLevel: fitnessLevel || undefined,
      weeklyWorkouts: weeklyWorkouts || undefined,
      weightHistory: history
    };

    const { isLocalStorageMode } = await import('@/lib/storageConfig');
    if (isLocalStorageMode()) {
      if (typeof window === 'undefined') return;
      const { saveProfileLocally } = await import('@/lib/user/localProfile');
      saveProfileLocally(payload);
    } else {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        throw new Error('Error al guardar el historial de peso');
      }
    }
  };

  const handleAddWeight = async (date: string, weightKg: number) => {
    const next = [ ...weightHistory.filter((e) => e.date !== date), { date, weight: weightKg } ]
      .sort((a, b) => a.date.localeCompare(b.date));
    setWeightHistory(next);
    setWeight(weightKg);
    setWeightSaving(true);
    setProfileError('');
    setProfileMessage('');
    try {
      await persistWeightHistory(next, weightKg);
      setProfileMessage('✓ Peso registrado correctamente');
    } catch (e) {
      setProfileError('Error al guardar el historial de peso');
    } finally {
      setWeightSaving(false);
    }
  };

  const handleDeleteWeight = async (date: string) => {
    const next = weightHistory.filter((e) => e.date !== date)
      .sort((a, b) => a.date.localeCompare(b.date));
    setWeightHistory(next);
    const latest = next.length ? next[ next.length - 1 ].weight : '';
    setWeight(latest);
    setWeightSaving(true);
    setProfileError('');
    setProfileMessage('');
    try {
      await persistWeightHistory(next, latest);
      setProfileMessage('✓ Pesaje eliminado');
    } catch (e) {
      setProfileError('Error al guardar el historial de peso');
    } finally {
      setWeightSaving(false);
    }
  };

  const isDatabaseEnabled = process.env.NEXT_PUBLIC_ENABLE_DATABASE === 'true';

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    // En modo local, no se puede cambiar la contraseña
    if (!isDatabaseEnabled) {
      setError('El cambio de contraseña no está disponible en modo local.');
      return;
    }

    // Validaciones
    if (newPassword.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);

    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();

      // Primero verificamos la contraseña actual intentando hacer signIn
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: currentPassword,
      });

      if (signInError) {
        setError('La contraseña actual es incorrecta');
        setLoading(false);
        return;
      }

      // Actualizamos la contraseña
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        setError(updateError.message);
      } else {
        setMessage('✓ Contraseña actualizada correctamente');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch {
      setError('Ocurrió un error al cambiar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <PageLayout>
        <PageHeader
          title="Mi Perfil"
          subtitle="Gestiona tu información personal y configuración"
          icon={<span className="text-3xl">👤</span>}
          gradient="from-indigo-600 to-violet-600"
        />

        <PageContent maxWidth="2xl">

          <div className="space-y-4">

            {/* Datos Personales y Fitness */}
            <Card>
              <CardHeader>
                <CardTitle>Datos Personales y Objetivos</CardTitle>
              </CardHeader>
              <CardContent>
                {profileLoading ? (
                  <LoadingSpinner size="lg" message="Cargando perfil..." />
                ) : (
                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <Input
                        type="number"
                        label="Edad (años)"
                        value={age}
                        onChange={(e) => setAge(e.target.value ? parseInt(e.target.value) : '')}
                        placeholder="25"
                        min="10"
                        max="120"
                      />

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Género
                        </label>
                        <select
                          value={gender}
                          onChange={(e) => setGender(e.target.value as Gender)}
                          className="w-full p-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Seleccionar</option>
                          <option value="male">Masculino</option>
                          <option value="female">Femenino</option>
                          <option value="other">Otro</option>
                        </select>
                      </div>

                      <Input
                        type="number"
                        label="Altura (cm)"
                        value={height}
                        onChange={(e) => setHeight(e.target.value ? parseFloat(e.target.value) : '')}
                        placeholder="170"
                        min="100"
                        max="250"
                        step="0.1"
                      />

                      <Input
                        type="number"
                        label="Peso (kg)"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value ? parseFloat(e.target.value) : '')}
                        placeholder="70"
                        min="30"
                        max="300"
                        step="0.1"
                      />
                    </div>

                    {/* IMC Calculation */}
                    {calculateBMI() && (
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          <strong>IMC:</strong> {calculateBMI()}
                          <span className="ml-2 text-gray-600 dark:text-gray-400">
                            {parseFloat(calculateBMI()!) < 18.5 && '(Bajo peso)'}
                            {parseFloat(calculateBMI()!) >= 18.5 && parseFloat(calculateBMI()!) < 25 && '(Peso normal)'}
                            {parseFloat(calculateBMI()!) >= 25 && parseFloat(calculateBMI()!) < 30 && '(Sobrepeso)'}
                            {parseFloat(calculateBMI()!) >= 30 && '(Obesidad)'}
                          </span>
                        </p>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Objetivo de Fitness
                      </label>
                      <select
                        value={fitnessGoal}
                        onChange={(e) => setFitnessGoal(e.target.value as FitnessGoal)}
                        className="w-full p-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Seleccionar objetivo</option>
                        <option value="muscle_gain">💪 Ganar músculo (Hipertrofia)</option>
                        <option value="strength">🏋️ Ganar fuerza</option>
                        <option value="weight_loss">🔥 Perder peso</option>
                        <option value="endurance">⚡ Mejorar resistencia</option>
                        <option value="general_fitness">🎯 Fitness general</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Nivel de Experiencia
                      </label>
                      <select
                        value={fitnessLevel}
                        onChange={(e) => setFitnessLevel(e.target.value as FitnessLevel)}
                        className="w-full p-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Seleccionar nivel</option>
                        <option value="beginner">🌱 Principiante (0-6 meses)</option>
                        <option value="intermediate">📈 Intermedio (6-24 meses)</option>
                        <option value="advanced">🏆 Avanzado (2+ años)</option>
                      </select>
                    </div>

                    <Input
                      type="number"
                      label="Días disponibles por semana"
                      value={weeklyWorkouts}
                      onChange={(e) => setWeeklyWorkouts(e.target.value ? parseInt(e.target.value) : '')}
                      placeholder="4"
                      min="1"
                      max="7"
                    />

                    {profileError && (
                      <div className="p-3 rounded-lg text-sm bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300">
                        {profileError}
                      </div>
                    )}

                    {profileMessage && (
                      <div className="p-3 rounded-lg text-sm bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300">
                        {profileMessage}
                      </div>
                    )}

                    <Button
                      type="submit"
                      variant="primary"
                      className="w-full"
                      disabled={loading || profileLoading}
                    >
                      {loading ? 'Guardando...' : 'Guardar perfil'}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>

            {/* Historial de Peso */}
            <WeightHistoryCard
              entries={weightHistory}
              saving={weightSaving}
              onAdd={handleAddWeight}
              onDelete={handleDeleteWeight}
            />

            {/* Información del usuario - solo en modo database */}
            {isDatabaseEnabled && (
              <Card>
                <CardHeader>
                  <CardTitle>Información de la cuenta</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Email
                      </label>
                      <p className="text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                        {user?.email}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        ID de Usuario
                      </label>
                      <p className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg font-mono break-all">
                        {user?.id}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Cambiar contraseña - solo en modo database */}
            {isDatabaseEnabled && (
              <Card>
                <CardHeader>
                  <CardTitle>Cambiar contraseña</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <Input
                      type="password"
                      label="Contraseña actual"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      autoComplete="current-password"
                    />

                    <Input
                      type="password"
                      label="Nueva contraseña"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={6}
                      autoComplete="new-password"
                    />

                    <Input
                      type="password"
                      label="Confirmar nueva contraseña"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={6}
                      autoComplete="new-password"
                    />

                    {error && (
                      <div className="p-3 rounded-lg text-sm bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300">
                        {error}
                      </div>
                    )}

                    {message && (
                      <div className="p-3 rounded-lg text-sm bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300">
                        {message}
                      </div>
                    )}

                    <Button
                      type="submit"
                      variant="primary"
                      className="w-full"
                      disabled={loading}
                    >
                      {loading ? 'Cambiando contraseña...' : 'Cambiar contraseña'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Configuración de descansos */}
            <RestSettings />

            {/* Configuración de tema */}
            <ThemeSettings />

            {/* Tutorial */}
            <Card>
              <CardHeader>
                <CardTitle>Tutorial y Ayuda</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  ¿Necesitas un repaso? Vuelve a ver el tutorial interactivo que te guía por todas las funciones de la aplicación.
                </p>
                <RestartOnboardingButton />
              </CardContent>
            </Card>

            {/* Información adicional */}
            <Card>
              <CardHeader>
                <CardTitle>Consejos de seguridad</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 dark:text-blue-400">•</span>
                    <span>Usa una contraseña única que no uses en otros sitios</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 dark:text-blue-400">•</span>
                    <span>La contraseña debe tener al menos 6 caracteres</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 dark:text-blue-400">•</span>
                    <span>Combina letras, números y símbolos para mayor seguridad</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 dark:text-blue-400">•</span>
                    <span>Cambia tu contraseña regularmente</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </PageContent>
      </PageLayout>
    </ProtectedRoute>
  );
}
