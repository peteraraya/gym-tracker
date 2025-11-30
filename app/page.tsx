'use client';

import Link from "next/link";
import { useTranslations } from "@/context/LocaleContext";
import { useGym } from "@/context/GymContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function Home() {
  const { routines, sessions } = useGym();
  const t = useTranslations('home');
  const tCommon = useTranslations('common');

  return (
    <ProtectedRoute>
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            💪 {t('welcome')}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {t('subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center">
            <CardHeader>
              <div className="text-4xl mb-2">📋</div>
              <CardTitle>{t('routinesCard')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600 mb-2">{routines.length}</p>
              <p className="text-gray-600 dark:text-gray-400">{t('routinesCreated')}</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="text-4xl mb-2">🏋️</div>
              <CardTitle>{t('sessionsCard')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600 mb-2">{sessions.length}</p>
              <p className="text-gray-600 dark:text-gray-400">{t('workoutsCompleted')}</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="text-4xl mb-2">💯</div>
              <CardTitle>{t('exercisesCard')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-purple-600 mb-2">
                {routines.reduce((acc, r) => acc + r.exercises.length, 0)}
              </p>
              <p className="text-gray-600 dark:text-gray-400">{t('totalExercises')}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>🚀 {t('getStarted')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-gray-600 dark:text-gray-400">
                {t('getStartedDesc')}
              </p>
              <Link href="/routines">
                <Button variant="primary" className="w-full">
                  {t('viewRoutines')}
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🎯 Rutinas Recomendadas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-gray-600 dark:text-gray-400">
                Explora rutinas profesionales como Push Pull Legs, Torso/Pierna y más
              </p>
              <Link href="/recommended">
                <Button variant="primary" className="w-full">
                  Ver rutinas recomendadas
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>📊 {t('history')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-gray-600 dark:text-gray-400">
                {t('historyDesc')}
              </p>
              <Link href="/sessions">
                <Button variant="secondary" className="w-full">
                  {t('viewHistory')}
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>📈 Progreso</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-gray-600 dark:text-gray-400">
                Analiza tu volumen de entrenamiento por grupo muscular
              </p>
              <Link href="/progress">
                <Button variant="secondary" className="w-full">
                  Ver progreso
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>💡 Guía de Ejercicios</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-gray-600 dark:text-gray-400">
                Aprende la técnica correcta con consejos profesionales
              </p>
              <Link href="/exercises">
                <Button variant="secondary" className="w-full">
                  Explorar ejercicios
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {routines.length === 0 && (
          <div className="mt-12">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-8">
              <div className="text-center mb-6">
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  👋 {t('welcomeMessage')}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  Comienza tu viaje fitness con una rutina profesional
                </p>
              </div>
              <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                <Link href="/recommended">
                  <Button variant="primary" className="w-full">
                    🎯 Explorar rutinas recomendadas
                  </Button>
                </Link>
                <Link href="/routines">
                  <Button variant="secondary" className="w-full">
                    ➕ {t('createFirstRoutine')}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </ProtectedRoute>
  );
}
