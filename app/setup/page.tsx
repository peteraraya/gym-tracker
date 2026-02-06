'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function SetupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="text-center mb-4">
            <span className="text-6xl">⚙️</span>
          </div>
          <CardTitle className="text-center text-2xl">
            Configuración de Supabase Requerida
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <p className="text-yellow-800 dark:text-yellow-300">
                ⚠️ La aplicación requiere configuración de Supabase para funcionar correctamente.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Pasos para configurar:</h3>
              
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold">Crear cuenta en Supabase</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Ve a <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">https://supabase.com</a> y crea una cuenta gratuita
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold">Crear un nuevo proyecto</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      En el dashboard de Supabase, crea un nuevo proyecto (espera 2-3 minutos)
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold">Ejecutar el schema SQL</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Ve a SQL Editor → copia y pega el contenido de <code className="bg-gray-100 dark:bg-gray-800 px-1">supabase/schema.sql</code> → Run
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    4
                  </div>
                  <div>
                    <h4 className="font-semibold">Obtener credenciales</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Ve a Settings → API → copia Project URL y anon public key
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    5
                  </div>
                  <div>
                    <h4 className="font-semibold">Configurar .env.local</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Edita el archivo <code className="bg-gray-100 dark:bg-gray-800 px-1">.env.local</code> con tus credenciales:
                    </p>
                    <pre className="bg-gray-800 text-gray-100 p-3 rounded text-xs overflow-x-auto">
{`NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui`}
                    </pre>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    6
                  </div>
                  <div>
                    <h4 className="font-semibold">Reiniciar el servidor</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Detén y reinicia <code className="bg-gray-100 dark:bg-gray-800 px-1">npm run dev</code>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                💡 <strong>Tip:</strong> Consulta el archivo <code>SUPABASE_SETUP.md</code> para instrucciones detalladas.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="primary"
                className="flex-1"
                onClick={() => window.open('https://supabase.com', '_blank')}
              >
                🚀 Ir a Supabase
              </Button>
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => window.location.reload()}
              >
                🔄 Recargar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
