'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/context/ToastContext';
import * as storageService from '@/lib/storage/storage';
import { RefreshCw } from 'lucide-react';

export function SyncSessionsButton() {
  const [syncing, setSyncing] = useState(false);
  const { success, error } = useToast();

  const handleSync = async () => {
    setSyncing(true);
    try {
      // Primero migrar sesiones antiguas
      const migrationResult = await storageService.migrateLegacySessions();
      
      // Luego sincronizar a la base de datos
      const syncResult = await storageService.syncLocalSessionsToDatabase();
      
      if (migrationResult.migrated > 0 || syncResult.synced > 0) {
        success(`Sincronizado: ${migrationResult.migrated} migradas, ${syncResult.synced} subidas a BD`);
        // Recargar la página para refrescar todos los datos
        window.location.reload();
      } else {
        success('Todas las sesiones ya están sincronizadas');
      }
    } catch (e) {
      console.error('Error syncing sessions:', e);
      error('Error al sincronizar sesiones');
    } finally {
      setSyncing(false);
    }
  };

  // Solo mostrar en desarrollo o si hay problemas de storage
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleSync}
      disabled={syncing}
      className="flex items-center gap-2"
    >
      <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
      {syncing ? 'Sincronizando...' : 'Sincronizar Sesiones'}
    </Button>
  );
}
