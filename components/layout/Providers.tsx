'use client';

import React from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { AuthProvider } from '@/context/AuthContext';
import { LocaleProvider, useLocale } from '@/context/LocaleContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { EquipmentProvider } from '@/context/EquipmentContext';
import { GymProvider } from '@/context/GymContext';
import { WorkoutProvider } from '@/context/WorkoutContext';
import { PrefetchData } from '@/components/layout/PrefetchData';

function SyncedIntlProvider({ children }: { children: React.ReactNode }) {
  const { locale, messages } = useLocale();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}

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
      <SyncedIntlProvider>
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
      </SyncedIntlProvider>
    </LocaleProvider>
  );
}
