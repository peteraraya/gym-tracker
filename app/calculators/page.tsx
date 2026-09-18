import { Metadata } from 'next';
import Link from 'next/link';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import OneRMCalculator from '@/components/features/calculators/OneRMCalculator';
import PlateCalculator from '@/components/features/calculators/PlateCalculator';
import UnitConverter from '@/components/features/calculators/UnitConverter';
import TdeeCalculator from '@/components/features/calculators/TdeeCalculator';
import PercentageRMCalculator from '@/components/features/calculators/PercentageRMCalculator';
import VolumeCalculator from '@/components/features/calculators/VolumeCalculator';
import RestTimeCalculator from '@/components/features/calculators/RestTimeCalculator';
import BMICalculator from '@/components/features/calculators/BMICalculator';
import CaloriesBurnedCalculator from '@/components/features/calculators/CaloriesBurnedCalculator';
import ProgressionCalculator from '@/components/features/progress/ProgressionCalculator';
import WilksCalculator from '@/components/features/calculators/WilksCalculator';
import TempoCalculator from '@/components/features/calculators/TempoCalculator';
import { Button } from '@/components/ui/Button';
import {
  Calculator,
  Dumbbell,
  Circle,
  Scale,
  ArrowLeft,
  Target,
  BarChart3,
  Clock,
  User,
  Flame,
  TrendingUp,
  Trophy,
  Activity
} from '@/components/icons/lucide';

export const metadata: Metadata = {
  title: 'Calculadoras | Gym Tracker',
  description: 'Calculadoras de entrenamiento y composición corporal',
};

type CalculatorType = '1rm' | 'plates' | 'units' | 'tdee' | 'percentage' | 'volume' | 'rest' | 'bmi' | 'calories' | 'progression' | 'wilks' | 'tempo' | null;

export default async function CalculatorsPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const searchParams = await props.searchParams;
  const selectedCalculator = (typeof searchParams.calc === 'string' ? searchParams.calc : null) as CalculatorType;
  const category = (typeof searchParams.cat === 'string' ? searchParams.cat : 'all') as 'all' | 'strength' | 'body' | 'planning';

  const calculators = [
    // Fuerza y Rendimiento
    {
      id: '1rm' as CalculatorType,
      name: 'Calculadora de 1RM',
      description: 'Calcula tu máximo de una repetición',
      icon: Dumbbell,
      category: 'strength',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20',
      borderColor: 'border-blue-200 dark:border-blue-800'
    },
    {
      id: 'percentage' as CalculatorType,
      name: 'Porcentaje de 1RM',
      description: 'Calcula pesos para diferentes % de tu 1RM',
      icon: Target,
      category: 'strength',
      color: 'from-indigo-500 to-purple-600',
      bgColor: 'from-indigo-50 to-purple-100 dark:from-indigo-900/20 dark:to-purple-800/20',
      borderColor: 'border-indigo-200 dark:border-indigo-800'
    },
    {
      id: 'wilks' as CalculatorType,
      name: 'Wilks Score',
      description: 'Compara tu fuerza relativa',
      icon: Trophy,
      category: 'strength',
      color: 'from-yellow-500 to-amber-600',
      bgColor: 'from-yellow-50 to-amber-100 dark:from-yellow-900/20 dark:to-amber-800/20',
      borderColor: 'border-yellow-200 dark:border-yellow-800'
    },
    {
      id: 'plates' as CalculatorType,
      name: 'Calculadora de Placas',
      description: 'Calcula qué placas necesitas',
      icon: Circle,
      category: 'strength',
      color: 'from-green-500 to-emerald-600',
      bgColor: 'from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-800/20',
      borderColor: 'border-green-200 dark:border-green-800'
    },
    
    // Composición Corporal
    {
      id: 'tdee' as CalculatorType,
      name: 'TDEE y Macros',
      description: 'Calcula tu gasto calórico diario',
      icon: Scale,
      category: 'body',
      color: 'from-amber-500 to-orange-600',
      bgColor: 'from-amber-50 to-orange-100 dark:from-amber-900/20 dark:to-orange-800/20',
      borderColor: 'border-amber-200 dark:border-amber-800'
    },
    {
      id: 'bmi' as CalculatorType,
      name: 'IMC y Composición',
      description: 'Calcula IMC y % de grasa corporal',
      icon: User,
      category: 'body',
      color: 'from-pink-500 to-rose-600',
      bgColor: 'from-pink-50 to-rose-100 dark:from-pink-900/20 dark:to-rose-800/20',
      borderColor: 'border-pink-200 dark:border-pink-800'
    },
    {
      id: 'calories' as CalculatorType,
      name: 'Calorías Quemadas',
      description: 'Estima calorías quemadas en entrenamiento',
      icon: Flame,
      category: 'body',
      color: 'from-orange-500 to-red-600',
      bgColor: 'from-orange-50 to-red-100 dark:from-orange-900/20 dark:to-red-800/20',
      borderColor: 'border-orange-200 dark:border-orange-800'
    },
    {
      id: 'units' as CalculatorType,
      name: 'Conversor de Unidades',
      description: 'Convierte kg ↔ lbs',
      icon: Scale,
      category: 'body',
      color: 'from-purple-500 to-fuchsia-600',
      bgColor: 'from-purple-50 to-fuchsia-100 dark:from-purple-900/20 dark:to-fuchsia-800/20',
      borderColor: 'border-purple-200 dark:border-purple-800'
    },
    
    // Planificación
    {
      id: 'volume' as CalculatorType,
      name: 'Volumen de Entrenamiento',
      description: 'Calcula el volumen total de tu sesión',
      icon: BarChart3,
      category: 'planning',
      color: 'from-green-500 to-teal-600',
      bgColor: 'from-green-50 to-teal-100 dark:from-green-900/20 dark:to-teal-800/20',
      borderColor: 'border-green-200 dark:border-green-800'
    },
    {
      id: 'rest' as CalculatorType,
      name: 'Tiempo de Descanso',
      description: 'Encuentra el descanso óptimo',
      icon: Clock,
      category: 'planning',
      color: 'from-cyan-500 to-blue-600',
      bgColor: 'from-cyan-50 to-blue-100 dark:from-cyan-900/20 dark:to-blue-800/20',
      borderColor: 'border-cyan-200 dark:border-cyan-800'
    },
    {
      id: 'progression' as CalculatorType,
      name: 'Progresión Lineal',
      description: 'Planifica tu progresión semanal',
      icon: TrendingUp,
      category: 'planning',
      color: 'from-emerald-500 to-green-600',
      bgColor: 'from-emerald-50 to-green-100 dark:from-emerald-900/20 dark:to-green-800/20',
      borderColor: 'border-emerald-200 dark:border-emerald-800'
    },
    {
      id: 'tempo' as CalculatorType,
      name: 'Tempo de Repetición',
      description: 'Calcula tiempo bajo tensión (TUT)',
      icon: Activity,
      category: 'planning',
      color: 'from-violet-500 to-purple-600',
      bgColor: 'from-violet-50 to-purple-100 dark:from-violet-900/20 dark:to-purple-800/20',
      borderColor: 'border-violet-200 dark:border-violet-800'
    },
  ];

  const categories = [
    { id: 'all', name: 'Todas', emoji: '🎯' },
    { id: 'strength', name: 'Fuerza', emoji: '💪' },
    { id: 'body', name: 'Composición', emoji: '⚖️' },
    { id: 'planning', name: 'Planificación', emoji: '📊' },
  ];

  const filteredCalculators = category === 'all' 
    ? calculators 
    : calculators.filter(c => c.category === category);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="p-4 max-w-7xl mx-auto space-y-4">
          {/* Header */}
          <div className="flex items-center gap-4">
            {selectedCalculator && (
              <Link href={`?cat=${category}`} scroll={false}>
                <Button
                  variant="ghost"
                  className="gap-2 hover:bg-white/50 dark:hover:bg-gray-800/50 pointer-events-none"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Volver
                </Button>
              </Link>
            )}
          </div>

          {!selectedCalculator && (
            <>
              {/* Hero Section */}
              <div className="relative overflow-hidden bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-4 md:p-6 text-white shadow-xl">
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                      <Calculator className="w-8 h-8" />
                    </div>
                    <div>
                      <h1 className="text-2xl md:text-3xl font-bold">
                        Calculadoras de Entrenamiento
                      </h1>
                      <p className="text-sm text-white/90 mt-1">
                        12 herramientas profesionales para optimizar tu progreso
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <div className="flex items-center gap-1 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                      <span className="text-lg">🎯</span>
                      <span className="text-xs">Precisión Científica</span>
                    </div>
                    <div className="flex items-center gap-1 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                      <span className="text-lg">⚡</span>
                      <span className="text-xs">Resultados Instantáneos</span>
                    </div>
                    <div className="flex items-center gap-1 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                      <span className="text-lg">📱</span>
                      <span className="text-xs">100% Gratis</span>
                    </div>
                  </div>
                </div>
                <div className="absolute inset-0 bg-linear-to-br from-white/5 to-transparent" />
              </div>

              {/* Categorías */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                {categories.map((cat) => (
                  <Link key={cat.id} href={`?cat=${cat.id}`} scroll={false}>
                    <button
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold transition-all whitespace-nowrap text-sm ${
                        category === cat.id
                          ? 'bg-blue-600 text-white dark:bg-blue-600 dark:text-white shadow-md'
                          : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:shadow-md'
                      }`}
                    >
                      <span>{cat.emoji}</span>
                      <span>{cat.name}</span>
                      <span className="text-xs opacity-75">
                        ({calculators.filter(c => cat.id === 'all' || c.category === cat.id).length})
                      </span>
                    </button>
                  </Link>
                ))}
              </div>

              {/* Grid de Calculadoras */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCalculators.map((calc) => {
                  const Icon = calc.icon;
                  return (
                    <Link
                      key={calc.id}
                      href={`?cat=${category}&calc=${calc.id}`}
                      scroll={false}
                      className={`group relative overflow-hidden bg-linear-to-br ${calc.bgColor} border-2 ${calc.borderColor} rounded-2xl p-4 text-left hover:shadow-xl transition-all duration-300 hover:scale-102 hover:-translate-y-0.5 block w-full`}
                    >
                      <div className="relative z-10">
                        <div className={`inline-flex p-3 rounded-xl bg-linear-to-br ${calc.color} mb-3 shadow-md group-hover:scale-110 transition-transform`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-1">
                          {calc.name}
                        </h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                          {calc.description}
                        </p>
                        <div className="flex items-center text-xs font-medium text-blue-600 dark:text-blue-400">
                          Abrir calculadora →
                        </div>
                      </div>
                      <div className="absolute inset-0 bg-linear-to-br from-white/50 to-transparent dark:from-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  );
                })}
              </div>
            </>
          )}

          {/* Calculadoras */}
          <div className="animate-fadeIn">
            {selectedCalculator === '1rm' && <OneRMCalculator />}
            {selectedCalculator === 'plates' && <PlateCalculator />}
            {selectedCalculator === 'units' && <UnitConverter />}
            {selectedCalculator === 'tdee' && <TdeeCalculator />}
            {selectedCalculator === 'percentage' && <PercentageRMCalculator />}
            {selectedCalculator === 'volume' && <VolumeCalculator />}
            {selectedCalculator === 'rest' && <RestTimeCalculator />}
            {selectedCalculator === 'bmi' && <BMICalculator />}
            {selectedCalculator === 'calories' && <CaloriesBurnedCalculator />}
            {selectedCalculator === 'progression' && <ProgressionCalculator />}
            {selectedCalculator === 'wilks' && <WilksCalculator />}
            {selectedCalculator === 'tempo' && <TempoCalculator />}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
