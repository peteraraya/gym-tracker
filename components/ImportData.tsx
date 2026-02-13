'use client';

import { useState, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Upload, FileJson, FileSpreadsheet, AlertCircle, CheckCircle, Info } from '@/components/icons/lucide';
import { importFromJSON, importCSVAuto, detectCSVFormat } from '@/lib/dataExport';
import type { WorkoutSession } from '@/types';

interface ImportDataProps {
  onImportSessions: (sessions: WorkoutSession[]) => Promise<void>;
}

export default function ImportData({ onImportSessions }: ImportDataProps) {
  const [importing, setImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<{
    type: 'success' | 'error' | 'info' | null;
    message: string;
  }>({ type: null, message: '' });
  
  const jsonInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);

  const handleJSONImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportStatus({ type: null, message: '' });

    try {
      const text = await file.text();
      const data = importFromJSON(text);

      if (!data) {
        throw new Error('Formato JSON inválido');
      }

      if (data.sessions && data.sessions.length > 0) {
        await onImportSessions(data.sessions);
        setImportStatus({
          type: 'success',
          message: `✓ Importadas ${data.sessions.length} sesiones exitosamente`
        });
      } else {
        setImportStatus({
          type: 'info',
          message: 'No se encontraron sesiones en el archivo'
        });
      }
    } catch (error) {
      console.error('Error importing JSON:', error);
      setImportStatus({
        type: 'error',
        message: 'Error al importar el archivo JSON. Verifica el formato.'
      });
    } finally {
      setImporting(false);
      if (jsonInputRef.current) {
        jsonInputRef.current.value = '';
      }
    }
  };

  const handleCSVImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportStatus({ type: null, message: '' });

    try {
      const text = await file.text();
      const format = detectCSVFormat(text);

      if (format === 'unknown') {
        setImportStatus({
          type: 'error',
          message: 'Formato CSV no reconocido. Soportados: Strong App, Hevy'
        });
        setImporting(false);
        return;
      }

      const sessions = importCSVAuto(text);

      if (!sessions || sessions.length === 0) {
        throw new Error('No se pudieron importar sesiones del CSV');
      }

      await onImportSessions(sessions);
      setImportStatus({
        type: 'success',
        message: `✓ Importadas ${sessions.length} sesiones desde ${format === 'strong' ? 'Strong App' : 'Hevy'}`
      });
    } catch (error) {
      console.error('Error importing CSV:', error);
      setImportStatus({
        type: 'error',
        message: 'Error al importar el archivo CSV. Verifica el formato.'
      });
    } finally {
      setImporting(false);
      if (csvInputRef.current) {
        csvInputRef.current.value = '';
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5 text-green-600" />
          Importar Datos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Importa datos desde otras aplicaciones o restaura un backup
          </p>

          {/* Status Message */}
          {importStatus.type && (
            <div className={`p-4 rounded-lg border ${
              importStatus.type === 'success' 
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                : importStatus.type === 'error'
                ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
            }`}>
              <div className="flex items-center gap-2">
                {importStatus.type === 'success' && <CheckCircle className="w-5 h-5 text-green-600" />}
                {importStatus.type === 'error' && <AlertCircle className="w-5 h-5 text-red-600" />}
                {importStatus.type === 'info' && <Info className="w-5 h-5 text-blue-600" />}
                <p className={`text-sm font-medium ${
                  importStatus.type === 'success' 
                    ? 'text-green-800 dark:text-green-200'
                    : importStatus.type === 'error'
                    ? 'text-red-800 dark:text-red-200'
                    : 'text-blue-800 dark:text-blue-200'
                }`}>
                  {importStatus.message}
                </p>
              </div>
            </div>
          )}

          {/* Importar desde JSON */}
          <div className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <FileJson className="w-5 h-5 text-purple-600" />
                  <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">
                    Backup JSON
                  </h4>
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Restaura un backup completo exportado desde Gym Tracker
                </p>
              </div>
              <div>
                <input
                  ref={jsonInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleJSONImport}
                  className="hidden"
                  id="json-upload"
                />
                <Button
                  variant="secondary"
                  onClick={() => jsonInputRef.current?.click()}
                  disabled={importing}
                  className="gap-2"
                >
                  <Upload className="w-4 h-4" />
                  {importing ? 'Importando...' : 'Seleccionar'}
                </Button>
              </div>
            </div>
          </div>

          {/* Importar desde CSV */}
          <div className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <FileSpreadsheet className="w-5 h-5 text-green-600" />
                  <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">
                    Importar desde otras Apps
                  </h4>
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
                  Importa sesiones desde Strong App o Hevy
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded">
                    Strong App
                  </span>
                  <span className="px-2 py-1 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 rounded">
                    Hevy
                  </span>
                </div>
              </div>
              <div>
                <input
                  ref={csvInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleCSVImport}
                  className="hidden"
                  id="csv-upload"
                />
                <Button
                  variant="secondary"
                  onClick={() => csvInputRef.current?.click()}
                  disabled={importing}
                  className="gap-2"
                >
                  <Upload className="w-4 h-4" />
                  {importing ? 'Importando...' : 'Seleccionar'}
                </Button>
              </div>
            </div>
          </div>

          {/* Instrucciones */}
          <div className="mt-6 space-y-4">
            {/* Strong App */}
            <details className="group">
              <summary className="cursor-pointer font-semibold text-zinc-900 dark:text-zinc-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                📱 Cómo exportar desde Strong App
              </summary>
              <div className="mt-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-sm text-zinc-700 dark:text-zinc-300 space-y-2">
                <ol className="list-decimal list-inside space-y-1">
                  <li>Abre Strong App en tu dispositivo</li>
                  <li>Ve a <strong>Settings → Export Data</strong></li>
                  <li>Selecciona <strong>Export to CSV</strong></li>
                  <li>Guarda el archivo y súbelo aquí</li>
                </ol>
              </div>
            </details>

            {/* Hevy */}
            <details className="group">
              <summary className="cursor-pointer font-semibold text-zinc-900 dark:text-zinc-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                📱 Cómo exportar desde Hevy
              </summary>
              <div className="mt-3 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg text-sm text-zinc-700 dark:text-zinc-300 space-y-2">
                <ol className="list-decimal list-inside space-y-1">
                  <li>Abre Hevy en tu dispositivo</li>
                  <li>Ve a <strong>Profile → Settings → Data</strong></li>
                  <li>Selecciona <strong>Export Workout Data</strong></li>
                  <li>Elige formato CSV y descarga</li>
                  <li>Sube el archivo aquí</li>
                </ol>
              </div>
            </details>
          </div>

          {/* Advertencia */}
          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800 dark:text-amber-200">
                <p className="font-semibold mb-1">⚠️ Importante</p>
                <ul className="space-y-1">
                  <li>• Los datos importados se <strong>agregarán</strong> a tus datos existentes</li>
                  <li>• Se recomienda hacer un backup antes de importar</li>
                  <li>• Verifica que el archivo esté en el formato correcto</li>
                  <li>• Las rutinas deben crearse manualmente después de importar</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
