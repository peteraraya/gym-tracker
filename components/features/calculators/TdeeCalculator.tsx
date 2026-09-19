"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { NumericInput } from '@/components/ui/NumericInput';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Scale } from '@/components/icons/lucide';
import { FitnessGoal, FitnessLevel, UserProfile } from '@/types';

function bmrMifflin(weightKg: number, heightCm: number, age: number, sex: 'male' | 'female') {
  if (!weightKg || !heightCm || !age) return 0;
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return sex === 'male' ? base + 5 : base - 161;
}

const ACTIVITY_FACTORS: Record<string, number> = {
  sedentary: 1.2, // poco o nada
  light: 1.375, // 1-3 días
  moderate: 1.55, // 3-5 días
  active: 1.725, // 6-7 días
  very_active: 1.9 // trabajo físico o dos sesiones/día
};

const FITNESS_GOAL_LABELS: Record<string, string> = {
  muscle_gain: 'Ganar músculo',
  strength: 'Fuerza',
  weight_loss: 'Perder peso',
  endurance: 'Resistencia',
  general_fitness: 'Fitness general'
};

const FITNESS_LEVEL_LABELS: Record<string, string> = {
  beginner: 'Principiante',
  intermediate: 'Intermedio',
  advanced: 'Avanzado'
};

export default function TdeeCalculator() {
 
  const [activity, setActivity] = useState<string>('moderate');
  const [goal, setGoal] = useState<'maintenance'|'mild-cut'|'cut'|'mild-bulk'|'bulk'>('maintenance');
  const [proteinPerKg, setProteinPerKg] = useState<number>(1.8);
  const [fatPercent, setFatPercent] = useState<number>(25);
  const [statusMsg, setStatusMsg] = useState<string>('');

  const STORAGE_KEY = 'tdee_profile_v1';
  const isInitialized = useRef(false);
  const resultsRef = useRef<HTMLDivElement | null>(null);


  // Profile data
    const [profileLoading, setProfileLoading] = useState(true);
    const [profileMessage, setProfileMessage] = useState('');
    const [profileError, setProfileError] = useState('');
    const [sex, setSex] = useState<'male' | 'female'>('male');
    const [age, setAge] = useState<number | ''>(30);
    const [weight, setWeight] = useState<number | ''>(75); // kg
    const [height, setHeight] = useState<number | ''>(175); // cm
    
    const [fitnessGoal, setFitnessGoal] = useState<FitnessGoal | ''>('');
    const [fitnessLevel, setFitnessLevel] = useState<FitnessLevel | ''>('');
    const [weeklyWorkouts, setWeeklyWorkouts] = useState<number | ''>('');
useEffect(() => {
    loadProfile();
  }, []);

  // Infiere el nivel de actividad TDEE a partir de los entrenos/semana del perfil
  function applyActivityFromWeeklyWorkouts(w: number) {
    if (w <= 1) setActivity('sedentary');
    else if (w <= 3) setActivity('light');
    else if (w <= 5) setActivity('moderate');
    else if (w <= 7) setActivity('active');
    else setActivity('very_active');
  }

  const loadProfile = async () => {
    try {
      // Verificar modo de almacenamiento
      const { isLocalStorageMode } = await import('@/lib/storageConfig');
      let usedProfile = false;

      if (isLocalStorageMode()) {
        // Modo LOCAL: Cargar desde localStorage
        if (typeof window !== 'undefined') {
          const { getProfileLocally } = await import('@/lib/user/localProfile');
          const localProfile = getProfileLocally();

          if (localProfile) {
            // console.log('[TdeeCalculator] ✅ Loaded from localStorage');
            setAge(localProfile.age || '');
            if (localProfile.gender === 'male' || localProfile.gender === 'female') setSex(localProfile.gender as 'male'|'female');
            setHeight(localProfile.height || '');
            setWeight(localProfile.weight || '');
            setFitnessGoal(localProfile.fitnessGoal || '');
            setFitnessLevel(localProfile.fitnessLevel || '');
            setWeeklyWorkouts(localProfile.weeklyWorkouts || '');
            if (typeof localProfile.weeklyWorkouts === 'number') applyActivityFromWeeklyWorkouts(localProfile.weeklyWorkouts);
            usedProfile = true;
          }
        }
      } else {
        // Modo DATABASE: Cargar desde Supabase
        // console.log('[TdeeCalculator] ☁️ Loading from Supabase...');
        const response = await fetch('/api/profile');
        if (response.ok) {
          const profile: UserProfile | null = await response.json();
          if (profile) {
            // console.log('[TdeeCalculator] ✅ Loaded from Supabase');
            setAge(profile.age || '');
            if (profile.gender === 'male' || profile.gender === 'female') setSex(profile.gender as 'male'|'female');
            setHeight(profile.height || '');
            setWeight(profile.weight || '');
            setFitnessGoal(profile.fitnessGoal || '');
            setFitnessLevel(profile.fitnessLevel || '');
            setWeeklyWorkouts(profile.weeklyWorkouts || '');
            if (typeof profile.weeklyWorkouts === 'number') applyActivityFromWeeklyWorkouts(profile.weeklyWorkouts);
            usedProfile = true;
          }
        }
      }

      if (usedProfile) {
        setStatusMsg('Basado en tu perfil');
        setTimeout(() => setStatusMsg(''), 1800);
      }
    } catch (err) {
      console.error('[TdeeCalculator] ❌ Error loading profile:', err);
    } finally {
      setProfileLoading(false);
      // Marca la carga inicial como completa para que el autoguardado no
      // sobrescriba el perfil recién cargado.
      isInitialized.current = true;
    }
  };



  function clearProfile() {
    localStorage.removeItem(STORAGE_KEY);
    setStatusMsg('Perfil eliminado');
    setTimeout(() => setStatusMsg(''), 1500);
  }

  // Autoguardado local (debounced) de la última información ingresada
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!isInitialized.current) return; // no guardar hasta cargar inicial

    const payload = {
      sex,
      age,
      weight,
      height,
      activity,
      goal,
      proteinPerKg,
      fatPercent,
      fitnessGoal,
      fitnessLevel,
      weeklyWorkouts,
    };

    const id = window.setTimeout(() => {
      try {
        // console.log('TDEE: autoguardado', payload);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
        setStatusMsg('Guardado localmente');
        setTimeout(() => setStatusMsg(''), 1200);

        // Intentar enviar al backend (guardado automático remoto) solo si la base de datos está habilitada
        (async () => {
          try {
            const { isLocalStorageMode } = await import('@/lib/storageConfig');
            
            if (!isLocalStorageMode()) {
              // Modo DATABASE: Guardar en Supabase
              // console.log('[TdeeCalculator] ☁️ Auto-saving to Supabase...');
              const res = await fetch('/api/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  age: age || null,
                  gender: sex || null,
                  height: height || null,
                  weight: weight || null,
                  fitnessGoal: fitnessGoal || null,
                  fitnessLevel: fitnessLevel || null,
                  weeklyWorkouts: weeklyWorkouts || null
                })
              });

              if (res.ok) {
                // console.log('[TdeeCalculator] ✅ Auto-saved to Supabase');
                setStatusMsg('Guardado remoto');
                setTimeout(() => setStatusMsg(''), 1200);
              } else if (res.status === 401) {
                // No autenticado - dejar silencioso
                console.debug('No autenticado al guardar perfil remoto');
              } else {
                const data = await res.json().catch(() => ({}));
                console.warn('Error guardando perfil remoto', data);
              }
            }
          } catch (err) {
            console.warn('Fallo al guardar perfil remoto', err);
          }
        })();
      } catch (e) {
        // ignore
      }
    }, 800);

    return () => window.clearTimeout(id);
  }, [sex, age, weight, height, activity, goal, proteinPerKg, fatPercent, fitnessGoal, fitnessLevel, weeklyWorkouts]);


  const w = Number(weight || 0);
  const h = Number(height || 0);
  const a = Number(age || 0);

  const bmr = bmrMifflin(w, h, a, sex);
  const activityFactor = ACTIVITY_FACTORS[activity] ?? 1.2;
  const tdee = bmr * activityFactor;

  const goalAdjust = {
    maintenance: 0,
    'mild-cut': -0.10,
    cut: -0.20,
    'mild-bulk': 0.10,
    bulk: 0.20
  }[goal];

  const targetCalories = Math.round(tdee * (1 + goalAdjust));

  // Macros
  const proteinCalories = Math.round(proteinPerKg * w * 4);
  const fatCalories = Math.round((fatPercent / 100) * targetCalories);
  const remainingCalories = Math.max(0, targetCalories - proteinCalories - fatCalories);
  const carbsCalories = remainingCalories;
  const carbsGrams = Math.round(carbsCalories / 4);
  const proteinGrams = Math.round((proteinCalories) / 4);
  const fatGrams = Math.round(fatCalories / 9);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader className="bg-linear-to-r from-amber-600 to-orange-600 text-white rounded-t-lg p-6">
          <CardTitle className="flex items-center gap-2 text-white">
            <Scale className="w-5 h-5" />
            Calculadora BMR / TDEE + Macros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Fila 1: Sexo / Edad / Peso */}
              <div>
                <Select
                  label="Sexo"
                  value={sex}
                  onChange={e => setSex(e.target.value as 'male'|'female')}
                >
                  <option value="male">Masculino</option>
                  <option value="female">Femenino</option>
                </Select>
              </div>

              <div>
                <Input type="number" label="Edad" value={age} onChange={e => setAge(e.target.value === '' ? '' : Number(e.target.value))} />
              </div>

              <div>
                <Input type="number" label="Peso (kg)" value={weight} onChange={e => setWeight(e.target.value === '' ? '' : Number(e.target.value))} />
              </div>

              {/* Fila 2: Altura / Entrenos por semana / Actividad */}
              <div>
                <Input type="number" label="Altura (cm)" value={height} onChange={e => setHeight(e.target.value === '' ? '' : Number(e.target.value))} />
              </div>

              <div>
                <Input type="number" label="Entrenos / semana" value={weeklyWorkouts} onChange={e => setWeeklyWorkouts(e.target.value === '' ? '' : Number(e.target.value))} />
              </div>

              <div>
                <Select
                  label="Actividad"
                  value={activity}
                  onChange={e => setActivity(e.target.value)}
                >
                  <option value="sedentary">Sedentario (poco o nada)</option>
                  <option value="light">Ligero (1-3 días/sem)</option>
                  <option value="moderate">Moderado (3-5 días/sem)</option>
                  <option value="active">Activo (6-7 días/sem)</option>
                  <option value="very_active">Muy activo</option>
                </Select>
              </div>

              {/* Fila 3: Objetivo (perfil) / Nivel / Objetivo (calorías) */}
              <div className="hidden md:block">
                <label className="block text-sm text-gray-600 dark:text-gray-400">Objetivo (perfil)</label>
                <div className="mt-1 w-full px-3 py-2 border rounded bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200">{fitnessGoal ? FITNESS_GOAL_LABELS[fitnessGoal] ?? fitnessGoal : '—'}</div>
              </div>

              <div className="hidden md:block">
                <label className="block text-sm text-gray-600 dark:text-gray-400">Nivel de experiencia (perfil)</label>
                <div className="mt-1 w-full px-3 py-2 border rounded bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200">{fitnessLevel ? FITNESS_LEVEL_LABELS[fitnessLevel] ?? fitnessLevel : '—'}</div>
              </div>

              <div>
                <Select
                  label="Objetivo"
                  value={goal}
                  onChange={e => setGoal(e.target.value as any)}
                >
                  <option value="maintenance">Mantenimiento</option>
                  <option value="mild-cut">Déficit leve (-10%)</option>
                  <option value="cut">Pérdida (-20%)</option>
                  <option value="mild-bulk">Volumen leve (+10%)</option>
                  <option value="bulk">Volumen (+20%)</option>
                </Select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-medium mb-3">Resultados</h3>
                <div className="flex items-center gap-2">
                  {/* Botón Imprimir / PDF desactivado temporalmente */}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div id="tdee-results" ref={resultsRef} className="p-3 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                  <div className="text-xs text-gray-500 dark:text-gray-400">BMR (Mifflin-St Jeor)</div>
                  <div className="text-xl font-semibold text-gray-900 dark:text-gray-100">{bmr ? Math.round(bmr) + ' kcal' : '—'}</div>
                </div>

                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                  <div className="text-xs text-gray-500 dark:text-gray-400">TDEE (estimado)</div>
                  <div className="text-xl font-semibold text-gray-900 dark:text-gray-100">{tdee ? Math.round(tdee) + ' kcal' : '—'}</div>
                </div>

                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                  <div className="text-xs text-gray-500 dark:text-gray-400">Calorías objetivo</div>
                  <div className="text-xl font-semibold text-gray-900 dark:text-gray-100">{targetCalories ? targetCalories + ' kcal' : '—'}</div>
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                <div className="text-xs text-gray-500 dark:text-gray-400">Proteínas</div>
                <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">{proteinGrams} g • {proteinCalories} kcal</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{proteinPerKg} g/kg</div>
              </div>

              <div className="p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                <div className="text-xs text-gray-500 dark:text-gray-400">Grasas</div>
                <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">{fatGrams} g • {fatCalories} kcal</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{fatPercent}% calorías</div>
              </div>

              <div className="p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                <div className="text-xs text-gray-500 dark:text-gray-400">Carbohidratos</div>
                <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">{carbsGrams} g • {carbsCalories} kcal</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Resto de calorías</div>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">Ajustes de Macros</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400">Proteínas (g/kg)</label>
                  <NumericInput allowDecimal value={proteinPerKg} onChange={v => setProteinPerKg(v)} className="mt-1 px-3 py-2 border rounded" />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400">Grasas (% calorías)</label>
                  <NumericInput value={fatPercent} onChange={v => setFatPercent(v)} className="mt-1 px-3 py-2 border rounded" />
                </div>
                <Button onClick={() => { setProteinPerKg(1.8); setFatPercent(25); }} variant="ghost">Reset</Button>

                {/* <div className="flex flex-col items-end">
                  <div className="flex gap-2">
                    <Button onClick={saveProfile}>Guardar</Button>
                    <Button onClick={loadProfile} variant="ghost">Cargar</Button>
                    <Button onClick={clearProfile} variant="ghost">Eliminar</Button>
                  </div>
                  {statusMsg && <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">{statusMsg}</div>}
                </div> */}
              </div>
            </div>

            <div className="text-sm text-gray-500 dark:text-gray-400">Nota: las fórmulas son estimaciones. Ajusta según progreso y sensación.</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
