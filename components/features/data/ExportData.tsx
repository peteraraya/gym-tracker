'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Download, FileJson, FileSpreadsheet, CheckCircle } from '@/components/icons/lucide';
import { 
  exportSessionsToCSV, 
  exportRoutinesToCSV, 
  exportToJSON, 
  downloadFile 
} from '@/lib/data/dataExport';
import type { WorkoutSession, Routine, UserProfile } from '@/types';

interface ExportDataProps {
  sessions: WorkoutSession[];
  routines: Routine[];
  profile?: UserProfile | null;
}

export default function ExportData({ sessions, routines, profile }: ExportDataProps) {
  const [exportedType, setExportedType] = useState<string | null>(null);

  const handleExportSessionsCSV = () => {
    const csv = exportSessionsToCSV(sessions);
    const filename = `gym-tracker-sessions-${new Date().toISOString().split('T')[0]}.csv`;
    downloadFile(csv, filename, 'text/csv');
    setExportedType('sessions-csv');
    setTimeout(() => setExportedType(null), 3000);
  };

  const handleExportRoutinesCSV = () => {
    const csv = exportRoutinesToCSV(routines);
    const filename = `gym-tracker-routines-${new Date().toISOString().split('T')[0]}.csv`;
    downloadFile(csv, filename, 'text/csv');
    setExportedType('routines-csv');
    setTimeout(() => setExportedType(null), 3000);
  };

  const handleExportFullBackup = () => {
    const json = exportToJSON({ sessions, routines, profile });
    const filename = `gym-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
    downloadFile(json, filename, 'application/json');
    setExportedType('full-backup');
    setTimeout(() => setExportedType(null), 3000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="w-5 h-5 text-blue-600" />
          Exportar Datos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Exporta tus datos para hacer respaldos o analizarlos en otras aplicaciones
          </p>

          {/* Exportar Sesiones CSV */}
          <div className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <FileSpreadsheet className="w-5 h-5 text-green-600" />
                  <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">
                    Sesiones (CSV)
                  </h4>
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">
                  Exporta todas tus sesiones de entrenamiento en formato CSV
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-500">
                  {sessions.length} sesiones disponibles
                </p>
              </div>
              <Button
                variant="secondary"
                onClick={handleExportSessionsCSV}
                disabled={sessions.length === 0}
                className="gap-2"
              >
                {exportedType === 'sessions-csv' ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Exportado
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Exportar
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Exportar Rutinas CSV */}
          <div className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                  <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">
                    Rutinas (CSV)
                  </h4>
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">
                  Exporta todas tus rutinas de entrenamiento en formato CSV
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-500">
                  {routines.length} rutinas disponibles
                </p>
              </div>
              <Button
                variant="secondary"
                onClick={handleExportRoutinesCSV}
                disabled={routines.length === 0}
                className="gap-2"
              >
                {exportedType === 'routines-csv' ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Exportado
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Exportar
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Backup Completo JSON */}
          <div className="p-4 bg-linear-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <FileJson className="w-5 h-5 text-purple-600" />
                  <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">
                    Backup Completo (JSON)
                  </h4>
                  <span className="px-2 py-0.5 text-xs font-semibold bg-purple-600 text-white rounded-full">
                    Recomendado
                  </span>
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">
                  Exporta todos tus datos en formato JSON (sesiones, rutinas y perfil)
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-500">
                  Ideal para backups y migración completa
                </p>
              </div>
              <Button
                variant="primary"
                onClick={handleExportFullBackup}
                className="gap-2"
              >
                {exportedType === 'full-backup' ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Exportado
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Exportar
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Información */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
              💡 Información sobre formatos
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• <strong>CSV:</strong> Compatible con Excel, Google Sheets y aplicaciones de análisis</li>
              <li>• <strong>JSON:</strong> Formato completo para backups y restauración</li>
              <li>• Todos los archivos incluyen fecha en el nombre del archivo</li>
              <li>• Se recomienda hacer backups regulares de tus datos</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
