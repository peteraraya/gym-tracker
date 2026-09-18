'use client';

import React from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { LocaleProvider } from '@/context/LocaleContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { EquipmentProvider } from '@/context/EquipmentContext';
import { GymProvider } from '@/context/GymContext';
import { WorkoutProvider } from '@/context/WorkoutContext';
import { PrefetchData } from '@/components/layout/PrefetchData';

/**
 * Consolidated provider tree.
 *
 * Before: 10 nested providers (10 re-render levels)
 * After:  6 nested providers (6 re-render levels)
 *
 * Merged Toast + Confirm → NotificationProvider
 * Moved ThemeProvider and OnboardingProvider out of tree
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LocaleProvider>
      <NotificationProvider>
        <AuthProvider>
          <EquipmentProvider>
            <GymProvider>
              <PrefetchData />
              <WorkoutProvider>
                {children}
              </WorkoutProvider>
            </GymProvider>
          </EquipmentProvider>
        </AuthProvider>
      </NotificationProvider>
    </LocaleProvider>
  );
}
