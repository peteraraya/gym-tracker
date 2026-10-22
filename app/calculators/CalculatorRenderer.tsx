'use client';

import type { ComponentType } from 'react';
import dynamic from 'next/dynamic';

const CalculatorLoadingState = () => (
  <div className="mx-auto w-full max-w-4xl animate-pulse space-y-4" aria-busy="true">
    <div className="h-20 rounded-2xl bg-zinc-800" />
    <div className="h-48 rounded-2xl bg-zinc-800" />
  </div>
);

const CALCULATORS: Record<string, ComponentType> = {
  '1rm': dynamic(() => import('@/components/features/calculators/OneRMCalculator'), {
    loading: CalculatorLoadingState,
  }),
  plates: dynamic(() => import('@/components/features/calculators/PlateCalculator'), {
    loading: CalculatorLoadingState,
  }),
  units: dynamic(() => import('@/components/features/calculators/UnitConverter'), {
    loading: CalculatorLoadingState,
  }),
  tdee: dynamic(() => import('@/components/features/calculators/TdeeCalculator'), {
    loading: CalculatorLoadingState,
  }),
  percentage: dynamic(() => import('@/components/features/calculators/PercentageRMCalculator'), {
    loading: CalculatorLoadingState,
  }),
  volume: dynamic(() => import('@/components/features/calculators/VolumeCalculator'), {
    loading: CalculatorLoadingState,
  }),
  rest: dynamic(() => import('@/components/features/calculators/RestTimeCalculator'), {
    loading: CalculatorLoadingState,
  }),
  bmi: dynamic(() => import('@/components/features/calculators/BMICalculator'), {
    loading: CalculatorLoadingState,
  }),
  calories: dynamic(() => import('@/components/features/calculators/CaloriesBurnedCalculator'), {
    loading: CalculatorLoadingState,
  }),
  progression: dynamic(() => import('@/components/features/progress/ProgressionCalculator'), {
    loading: CalculatorLoadingState,
  }),
  wilks: dynamic(() => import('@/components/features/calculators/WilksCalculator'), {
    loading: CalculatorLoadingState,
  }),
  tempo: dynamic(() => import('@/components/features/calculators/TempoCalculator'), {
    loading: CalculatorLoadingState,
  }),
  heart_rate: dynamic(() => import('@/components/features/calculators/HeartRateZonesCalculator'), {
    loading: CalculatorLoadingState,
  }),
  macro_split: dynamic(() => import('@/components/features/calculators/MacroSplitCalculator'), {
    loading: CalculatorLoadingState,
  }),
  water_intake: dynamic(() => import('@/components/features/calculators/WaterIntakeCalculator'), {
    loading: CalculatorLoadingState,
  }),
  rep_progression: dynamic(() => import('@/components/features/calculators/RepMaxProgressionCalculator'), {
    loading: CalculatorLoadingState,
  }),
};

interface CalculatorRendererProps {
  selectedCalculator: string | null;
}

export default function CalculatorRenderer({
  selectedCalculator,
}: CalculatorRendererProps) {
  if (!selectedCalculator || !Object.hasOwn(CALCULATORS, selectedCalculator)) {
    return null;
  }

  const Calculator = CALCULATORS[selectedCalculator];

  return (
    <div className="animate-fadeIn">
      <Calculator />
    </div>
  );
}
