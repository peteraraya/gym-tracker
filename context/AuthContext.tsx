'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  isConfigured: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Check if database/auth is enabled
  const isDatabaseEnabled = process.env.NEXT_PUBLIC_ENABLE_DATABASE === 'true';

  // Check if Supabase is configured at initialization (only if database is enabled)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const initialIsConfigured = isDatabaseEnabled ? !!(
    supabaseUrl &&
    supabaseKey &&
    supabaseUrl !== 'your-project-url' &&
    supabaseUrl.startsWith('http') &&
    !supabaseUrl.includes('sb_publishable')
  ) : true; // Always configured when database is disabled

  const [user, setUser] = useState<User | null>(
    // If database is disabled, use a mock local user immediately
    isDatabaseEnabled ? null : { id: 'local-user', email: 'local@user.com' } as User
  );
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
      console.warn('Authentication is disabled in localStorage mode');
      return { error: null };
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
      console.warn('Authentication is disabled in localStorage mode');
      return { error: null };
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
      console.warn('Authentication is disabled in localStorage mode');
      return;
    }

    const supabase = createClient();
    await supabase.auth.signOut();
  }, [isDatabaseEnabled]);

  const value = useMemo(() => ({
    user, loading, signUp, signIn, signOut, isConfigured
  }), [user, loading, signUp, signIn, signOut, isConfigured]);

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
