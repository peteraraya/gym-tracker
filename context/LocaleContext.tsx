'use client';

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import esMessages from '@/messages/es.json';
import enMessages from '@/messages/en.json';

type Messages = typeof esMessages;

interface LocaleContextType {
  locale: string;
  messages: Messages;
  setLocale: (locale: string) => void;
  t: (key: string) => string;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('locale') || 'es';
    }
    return 'es';
  });
  const [messages, setMessages] = useState<Messages>(() => {
    if (typeof window !== 'undefined') {
      const savedLocale = localStorage.getItem('locale') || 'es';
      return savedLocale === 'en' ? enMessages : esMessages;
    }
    return esMessages;
  });

  const setLocale = useCallback((newLocale: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('locale', newLocale);
    }
    setLocaleState(newLocale);
    setMessages(newLocale === 'en' ? enMessages : esMessages);
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
  
  return (key: string) => {
    const fullKey = namespace ? `${namespace}.${key}` : key;
    return t(fullKey);
  };
}
