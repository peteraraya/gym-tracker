
"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { BottomNavBar } from '@/components/layout/BottomNavBar';
import { ConnectionIndicator } from '@/components/shared/ConnectionIndicator';
import FloatingCreateRoutine from '@/components/features/routines/FloatingCreateRoutine';
import dynamic from 'next/dynamic';

const FloatingAIAssistant = dynamic(
  () => import('@/components/features/ai/FloatingAIAssistant').then((mod) => mod.FloatingAIAssistant),
  { ssr: false, loading: () => null }
);

export const GlobalUI: React.FC = () => {
  const pathname = usePathname() || '/';

  const hideNavigation = pathname.includes('/auth') || pathname.startsWith('/workout');

  return (
    <>
      <ConnectionIndicator />
      {!hideNavigation && (
        <>
          <Navbar />
          <BottomNavBar />
          <FloatingCreateRoutine />
          <FloatingAIAssistant />
        </>
      )}
    </>
  );
};

export default GlobalUI;
