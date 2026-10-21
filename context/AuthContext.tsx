'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/infrastructure/supabase/client';
import { hasSupabaseConfig } from '@/lib/infrastructure/supabase/config';
import type { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  isConfigured: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Check if database/auth is enabled
  const isDatabaseEnabled = process.env.NEXT_PUBLIC_ENABLE_DATABASE === 'true';

  // Check if Supabase is configured at initialization (only if database is enabled)
  const initialIsConfigured = isDatabaseEnabled && hasSupabaseConfig();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(!initialIsConfigured ? false : (isDatabaseEnabled ? true : false));
  const [isConfigured] = useState(initialIsConfigured);

  useEffect(() => {
    // Skip auth setup if database is disabled
    if (!isDatabaseEnabled) {
      return;
    }

    if (!isConfigured) {
      return;
    }

    const supabase = createClient();

    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [isConfigured, isDatabaseEnabled]);

  const signUp = useCallback(async (email: string, password: string) => {
    if (!isDatabaseEnabled) {
      return { error: new Error('La autenticación requiere una conexión de base de datos configurada.') };
    }

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { error: error || null };
  }, [isDatabaseEnabled]);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!isDatabaseEnabled) {
      return { error: new Error('La autenticación requiere una conexión de base de datos configurada.') };
    }

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error: error || null };
  }, [isDatabaseEnabled]);

  const signOut = useCallback(async () => {
    if (!isDatabaseEnabled) {
      return;
    }

    const supabase = createClient();
    try {
      await supabase.auth.signOut({ scope: 'global' });
    } catch { /* ignore */ }
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('sb-access-token');
        localStorage.removeItem('sb-refresh-token');
        localStorage.removeItem('sb-event-callback');
      }
    } catch { /* ignore */ }
    setUser(null);
    setLoading(false);
  }, [isDatabaseEnabled]);

  const resetPassword = useCallback(async (email: string) => {
    if (!isDatabaseEnabled) {
      return { error: new Error('La recuperación de contraseña requiere una conexión de base de datos configurada.') };
    }

    const supabase = createClient();
    // Opcional: redirect back to app after password reset
    const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/auth` : undefined;
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    return { error: error || null };
  }, [isDatabaseEnabled]);

  const value = useMemo(() => ({
    user, loading, signUp, signIn, signOut, resetPassword, isConfigured
  }), [user, loading, signUp, signIn, signOut, resetPassword, isConfigured]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
