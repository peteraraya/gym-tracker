'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, isConfigured } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isConfigured) {
        router.push('/setup');
      } else if (!user) {
        router.push('/auth');
      }
    }
  }, [user, loading, isConfigured, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">💪</div>
          <p className="text-gray-600 dark:text-gray-400">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isConfigured) {
    return null;
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
