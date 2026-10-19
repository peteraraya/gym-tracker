'use client';

import React, { createContext, useContext, useCallback, useMemo, useEffect, useSyncExternalStore } from 'react';
import esMessages from '@/messages/es.json';
import enMessages from '@/messages/en.json';

type Messages = typeof esMessages | typeof enMessages;
type Locale = 'es' | 'en';

interface LocaleContextType {
  locale: Locale;
  messages: Messages;
  setLocale: (locale: string) => void;
  t: (key: string) => string;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);
const localeListeners = new Set<() => void>();

function getLocaleSnapshot(): Locale {
  try {
    return localStorage.getItem('locale') === 'en' ? 'en' : 'es';
  } catch {
    return 'es';
  }
}

function subscribeToLocaleChanges(listener: () => void) {
  localeListeners.add(listener);
  const handleStorage = (event: StorageEvent) => {
    if (event.key === 'locale') listener();
  };
  window.addEventListener('storage', handleStorage);

  return () => {
    localeListeners.delete(listener);
    window.removeEventListener('storage', handleStorage);
  };
}

function getServerLocaleSnapshot(): Locale {
  return 'es';
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const locale = useSyncExternalStore(
    subscribeToLocaleChanges,
    getLocaleSnapshot,
    getServerLocaleSnapshot,
  );
  const messages = locale === 'en' ? enMessages : esMessages;

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((newLocale: string) => {
    const nextLocale: Locale = newLocale === 'en' ? 'en' : 'es';
    try {
      localStorage.setItem('locale', nextLocale);
    } catch {
      // The current page can still use the selected locale for this session.
    }
    localeListeners.forEach((listener) => listener());
  }, []);

  // Función helper para obtener traducciones anidadas
  const t = useCallback((key: string): string => {
    const keys = key.split('.');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let value: any = messages;
    
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) return key;
    }
    
    return typeof value === 'string' ? value : key;
  }, [messages]);

  const value = useMemo(() => ({
    locale, messages, setLocale, t
  }), [locale, messages, setLocale, t]);

  return (
    <LocaleContext.Provider value={value}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used within LocaleProvider');
  }
  return context;
}

export function useTranslations(namespace?: string) {
  const { t } = useLocale();

  return useCallback((key: string) => {
    const fullKey = namespace ? `${namespace}.${key}` : key;
    return t(fullKey);
  }, [namespace, t]);
}
