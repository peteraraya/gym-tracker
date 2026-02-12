'use client';

import Link from "next/link";
import { useTranslations } from "@/context/LocaleContext";
import { useGym } from "@/context/GymContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
  ClipboardList,
  Dumbbell,
  Target,
  Rocket,
  Calendar,
  TrendingUp,
  Lightbulb,
  Sparkles,
  Plus
} from 'lucide-react';

export default function Home() {
  const { routines, sessions, loading } = useGym();
  const t = useTranslations('home');
  const tCommon = useTranslations('common');

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="p-3 bg-linear-to-br from-blue-500 to-purple-600 rounded-2xl">
                <Dumbbell className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              {t('welcome')}
            </h1>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">
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
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" aria-hidden="true" />
                    <span className="sr-only">{tCommon('loading')}</span>
                  </div>
                ) : (
                  <>
                    <p className="text-3xl font-bold text-blue-600 mb-2">{routines.length}</p>
                    <p className="text-gray-600 dark:text-gray-400">{t('routinesCreated')}</p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="text-4xl mb-2">🏋️</div>
                <CardTitle>{t('sessionsCard')}</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" aria-hidden="true" />
                    <span className="sr-only">{tCommon('loading')}</span>
                  </div>
                ) : (
                  <>
                    <p className="text-3xl font-bold text-green-600 mb-2">{sessions.length}</p>
                    <p className="text-gray-600 dark:text-gray-400">{t('workoutsCompleted')}</p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="text-4xl mb-2">💯</div>
                <CardTitle>{t('exercisesCard')}</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" aria-hidden="true" />
                    <span className="sr-only">{tCommon('loading')}</span>
                  </div>
                ) : (
                  <>
                    <p className="text-3xl font-bold text-purple-600 mb-2">
                      {routines.reduce((acc, r) => acc + r.exercises.length, 0)}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">{t('totalExercises')}</p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
            <Card className="hover-lift">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Rocket className="w-5 h-5 text-blue-600" />
                  {t('getStarted')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm sm:text-base text-gray-600 dark:text-gray-400">
                  {t('getStartedDesc')}
                </p>
                <Link href="/routines">
                  <Button variant="primary" className="w-full">
                    <ClipboardList className="w-4 h-4" />
                    {t('viewRoutines')}
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover-lift">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  {t('recommendedRoutines')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm sm:text-base text-gray-600 dark:text-gray-400">
                  {t('recommendedRoutinesDesc')}
                </p>
                <Link href="/recommended">
                  <Button variant="primary" className="w-full">
                    <Target className="w-4 h-4" />
                    {t('viewRecommended')}
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover-lift">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-indigo-600" />
                  {t('history')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm sm:text-base text-gray-600 dark:text-gray-400">
                  {t('historyDesc')}
                </p>
                <Link href="/sessions">
                  <Button variant="secondary" className="w-full">
                    <Calendar className="w-4 h-4" />
                    {t('viewHistory')}
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover-lift">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                  {t('progress')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm sm:text-base text-gray-600 dark:text-gray-400">
                  {t('progressDesc')}
                </p>
                <Link href="/progress">
                  <Button variant="secondary" className="w-full">
                    <TrendingUp className="w-4 h-4" />
                    {t('viewProgress')}
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover-lift sm:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-amber-600" />
                  {t('exerciseGuide')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm sm:text-base text-gray-600 dark:text-gray-400">
                  {t('exerciseGuideDesc')}
                </p>
                <Link href="/exercises">
                  <Button variant="secondary" className="w-full">
                    <Lightbulb className="w-4 h-4" />
                    {t('exploreExercises')}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 sm:mt-12">
            <div className="bg-linear-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 sm:p-8">
              <div className="text-center mb-6">
                {routines.length === 0 ? (
                  <>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                      👋 {t('welcomeMessage')}
                    </p>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                      {t('getStartedDesc')}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                      🚀 {t('haveRoutines.title')}
                    </p>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                      {t('haveRoutines.subtitle')}
                    </p>
                  </>
                )}
              </div>
              <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
                {routines.length === 0 ? (
                  <>
                    <Link href="/recommended">
                      <Button variant="primary" className="w-full">
                        <Target className="w-5 h-5" />
                        {t('exploreRecommended')}
                      </Button>
                    </Link>
                    <Link href="/routines">
                      <Button variant="secondary" className="w-full">
                        <Plus className="w-5 h-5" />
                        {t('createFirstRoutine')}
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/routines">
                      <Button variant="primary" className="w-full">
                        <Plus className="w-5 h-5" />
                        {t('haveRoutines.cta')}
                      </Button>
                    </Link>
                    <Link href="/recommended">
                      <Button variant="secondary" className="w-full">
                        <Target className="w-5 h-5" />
                        {t('exploreRecommended')}
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
