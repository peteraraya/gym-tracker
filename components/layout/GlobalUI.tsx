
"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { BottomNavBar } from '@/components/layout/BottomNavBar';
import FloatingCreateRoutine from '@/components/features/routines/FloatingCreateRoutine';
import dynamic from 'next/dynamic';

const FloatingAIAssistant = dynamic(
  () => import('@/components/features/ai/FloatingAIAssistant').then((mod) => mod.FloatingAIAssistant),
  { ssr: false, loading: () => null }
);

export const GlobalUI: React.FC = () => {
  const pathname = usePathname() || '/';

  // Ocultar Navbar y CTA en la página de auth (incluye rutas con prefijo de idioma: /es/auth, /en/auth)
  if (!pathname) return null;
  if (pathname.includes('/auth')) return null;

  return (
    <>
      <Navbar />
      <BottomNavBar />
      <FloatingCreateRoutine />
      <FloatingAIAssistant />
    </>
  );
};

export default GlobalUI;
