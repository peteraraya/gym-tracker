'use client';

import React from 'react';
import { ProgressDashboard } from './ProgressDashboard';
import type { WorkoutSession } from '@/types';

interface ProgressChartsProps {
  sessions?: WorkoutSession[];
}

export function ProgressCharts({ sessions = [] }: ProgressChartsProps) {
  return <ProgressDashboard sessions={sessions} />;
}

export default ProgressCharts;
