"use client";

import { useState, useMemo, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Database, Shield, Download, Upload, Info } from '@/components/icons/lucide';
import ExportData from '@/components/features/data/ExportData';
import ImportData from '@/components/features/data/ImportData';
import { useGym } from '@/context/GymContext';
import type { WorkoutSession, UserProfile } from '@/types';
import * as storageService from '@/lib/storage/storage';

export default function DataManagementPage() {
  const { routines, sessions: contextSessions } = useGym();
  
  const [localSessions, setLocalSessions] = useState<WorkoutSession[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const all = await storageService.getSessions();
        // Keep only sessions that are not present in contextSessions (local/imported)
        const serverIds = new Set(contextSessions.filter(s => s.id).map(s => s.id));
        const locals = all.filter(s => !s.id || !serverIds.has(s.id));
        if (mounted) setLocalSessions(locals);
      } catch (e) {
        // fallback keep empty
      }
    })();
    return () => { mounted = false };
  }, [contextSessions]);

  const [profile, setProfile] = useState<UserProfile | null>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('userProfile');
      return stored ? JSON.parse(stored) : null;
    }
    return null;
  });

  // Combinar sesiones de Supabase y localStorage
  const allSessions = useMemo(() => {
    return [...contextSessions, ...localSessions];
  }, [contextSessions, localSessions]);

  const handleImportSessions = async (importedSessions: WorkoutSession[]) => {
    // Determine which imported sessions are new
    const existing = [...allSessions];
    const newSessions = importedSessions.filter(
      imported => !existing.some(existingItem => 
        existingItem.date === imported.date && existingItem.routineId === imported.routineId
      )
    );

    if (newSessions.length === 0) return;

    // Save each new session via storageService (DB or local fallback)
    await Promise.all(newSessions.map(s => storageService.saveSession(s)));

    // Refresh localSessions from storage and keep only non-server sessions
    try {
      const all = await storageService.getSessions();
      const serverIds = new Set(contextSessions.filter(s => s.id).map(s => s.id));
      const locals = all.filter(s => !s.id || !serverIds.has(s.id));
      setLocalSessions(locals);
    } catch (e) {
      // ignore
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <div className="container mx-auto px-4 py-4 max-w-6xl">
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center gap-3 mb-1">
            <Database className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              Gestión de Datos
            </h1>
          </div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Exporta, importa y administra tus datos de entrenamiento
          </p>
        </div>

        {/* Info Banner */}
        <Card className="mb-4 border-blue-200 dark:border-blue-800 bg-linear-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
          <div className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Shield className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
                  Controla tus datos
                </h3>
                <p className="text-sm text-zinc-700 dark:text-zinc-300 mb-3">
                  Tus datos están almacenados localmente en tu navegador. Puedes exportarlos 
                  en cualquier momento para hacer backups o migrar a otros dispositivos.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                    <div className="text-sm">
                      <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                        Backups regulares
                      </p>
                      <p className="text-zinc-600 dark:text-zinc-400">
                        Exporta periódicamente tus datos
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                    <div className="text-sm">
                      <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                        Portabilidad
                      </p>
                      <p className="text-zinc-600 dark:text-zinc-400">
                        Migra desde otras apps
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                    <div className="text-sm">
                      <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                        Análisis
                      </p>
                      <p className="text-zinc-600 dark:text-zinc-400">
                        Usa Excel para análisis avanzado
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <Card className="p-4 bg-linear-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">
                  Sesiones
                </p>
                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                  {allSessions.length}
                </p>
              </div>
              <Database className="w-10 h-10 text-blue-600/20" />
            </div>
          </Card>

          <Card className="p-4 bg-linear-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-1">
                  Rutinas
                </p>
                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                  {routines.length}
                </p>
              </div>
              <Database className="w-10 h-10 text-purple-600/20" />
            </div>
          </Card>

          <Card className="p-4 bg-linear-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400 mb-1">
                  Estado
                </p>
                <p className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  {profile ? 'Configurado' : 'Pendiente'}
                </p>
              </div>
              <Shield className="w-12 h-12 text-green-600/20" />
            </div>
          </Card>
        </div>

        {/* Export Section */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Download className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Exportar Datos
            </h2>
          </div>
          <ExportData 
            sessions={allSessions}
            routines={routines}
            profile={profile}
          />
        </div>

        {/* Import Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Upload className="w-6 h-6 text-green-600" />
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              Importar Datos
            </h2>
          </div>
          <ImportData onImportSessions={handleImportSessions} />
        </div>
      </div>
    </div>
  );
}
