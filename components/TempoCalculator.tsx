'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Clock } from '@/components/icons/lucide';

export default function TempoCalculator() {
  const [eccentric, setEccentric] = useState<number>(3);
  const [pause1, setPause1] = useState<number>(0);
  const [concentric, setConcentric] = useState<number>(1);
  const [pause2, setPause2] = useState<number>(0);
  const [reps, setReps] = useState<number>(10);
  const [sets, setSets] = useState<number>(3);

  const timePerRep = eccentric + pause1 + concentric + pause2;
  const timePerSet = timePerRep * reps;
  const totalTime = timePerSet * sets;
  const tut = timePerSet; // Time Under Tension por serie

  const tempoPresets = [
    { name: 'Fuerza', tempo: '2-0-1-0', values: [2, 0, 1, 0], desc: 'Explosivo, enfoque en potencia' },
    { name: 'Hipertrofia', tempo: '3-0-1-1', values: [3, 0, 1, 1], desc: 'Tensión constante, crecimiento muscular' },
    { name: 'Control', tempo: '4-2-1-0', values: [4, 2, 1, 0], desc: 'Máximo control y técnica' },
    { name: 'Resistencia', tempo: '2-0-2-0', values: [2, 0, 2, 0], desc: 'Ritmo constante, resistencia' },
    { name: 'Excéntrico', tempo: '5-1-1-0', values: [5, 1, 1, 0], desc: 'Énfasis en fase negativa' },
  ];

  const applyPreset = (values: number[]) => {
    setEccentric(values[0]);
    setPause1(values[1]);
    setConcentric(values[2]);
    setPause2(values[3]);
  };

  return (
    <Card className="shadow-xl">
      <CardHeader className="bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-t-lg p-6">
        <CardTitle className="flex items-center gap-3">
          <Clock className="w-6 h-6" />
          Calculadora de Tempo de Repetición
        </CardTitle>
        <p className="text-sm text-violet-100 mt-2">
          Calcula el tiempo bajo tensión (TUT) basado en el tempo de ejecución
        </p>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Presets */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Presets de Tempo
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {tempoPresets.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => applyPreset(preset.values)}
                  className="p-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-violet-500 transition-all text-left"
                >
                  <div className="font-semibold text-gray-900 dark:text-gray-100">
                    {preset.name}
                  </div>
                  <div className="text-lg font-mono text-violet-600 dark:text-violet-400 my-1">
                    {preset.tempo}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {preset.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Tempo Manual */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Configuración de Tempo (segundos)
            </h4>
            <div className="grid grid-cols-4 gap-3">
              <div>
                <Input
                  type="number"
                  label="Excéntrico"
                  value={eccentric}
                  onChange={(e) => setEccentric(parseInt(e.target.value) || 0)}
                  min="0"
                />
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
                  Bajada
                </div>
              </div>
              <div>
                <Input
                  type="number"
                  label="Pausa 1"
                  value={pause1}
                  onChange={(e) => setPause1(parseInt(e.target.value) || 0)}
                  min="0"
                />
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
                  Abajo
                </div>
              </div>
              <div>
                <Input
                  type="number"
                  label="Concéntrico"
                  value={concentric}
                  onChange={(e) => setConcentric(parseInt(e.target.value) || 0)}
                  min="0"
                />
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
                  Subida
                </div>
              </div>
              <div>
                <Input
                  type="number"
                  label="Pausa 2"
                  value={pause2}
                  onChange={(e) => setPause2(parseInt(e.target.value) || 0)}
                  min="0"
                />
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
                  Arriba
                </div>
              </div>
            </div>
            <div className="mt-3 text-center">
              <div className="text-sm text-gray-600 dark:text-gray-400">Tempo Actual</div>
              <div className="text-3xl font-mono font-bold text-violet-600 dark:text-violet-400">
                {eccentric}-{pause1}-{concentric}-{pause2}
              </div>
            </div>
          </div>

          {/* Series y Reps */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              type="number"
              label="Repeticiones por Serie"
              value={reps}
              onChange={(e) => setReps(parseInt(e.target.value) || 0)}
              min="1"
            />
            <Input
              type="number"
              label="Número de Series"
              value={sets}
              onChange={(e) => setSets(parseInt(e.target.value) || 0)}
              min="1"
            />
          </div>

          {/* Resultados */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 rounded-lg border border-violet-200 dark:border-violet-800">
              <div className="text-center">
                <div className="text-3xl font-bold text-violet-600 dark:text-violet-400">
                  {timePerRep}s
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Por Repetición
                </div>
              </div>
            </div>
            <div className="p-4 bg-gradient-to-br from-purple-50 to-fuchsia-50 dark:from-purple-900/20 dark:to-fuchsia-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {tut}s
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  TUT por Serie
                </div>
              </div>
            </div>
            <div className="p-4 bg-gradient-to-br from-fuchsia-50 to-pink-50 dark:from-fuchsia-900/20 dark:to-pink-900/20 rounded-lg border border-fuchsia-200 dark:border-fuchsia-800">
              <div className="text-center">
                <div className="text-3xl font-bold text-fuchsia-600 dark:text-fuchsia-400">
                  {Math.floor(totalTime / 60)}:{(totalTime % 60).toString().padStart(2, '0')}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Tiempo Total
                </div>
              </div>
            </div>
          </div>

          {/* Visualización del Tempo */}
          <div className="p-6 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 rounded-xl border-2 border-violet-200 dark:border-violet-800">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 text-center">
              Visualización del Tempo
            </h4>
            <div className="flex items-center justify-between">
              <div className="text-center flex-1">
                <div className="text-4xl mb-2">⬇️</div>
                <div className="text-2xl font-bold text-violet-600 dark:text-violet-400">
                  {eccentric}s
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Excéntrico
                </div>
              </div>
              <div className="text-2xl text-gray-400">→</div>
              <div className="text-center flex-1">
                <div className="text-4xl mb-2">⏸️</div>
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {pause1}s
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Pausa Inferior
                </div>
              </div>
              <div className="text-2xl text-gray-400">→</div>
              <div className="text-center flex-1">
                <div className="text-4xl mb-2">⬆️</div>
                <div className="text-2xl font-bold text-fuchsia-600 dark:text-fuchsia-400">
                  {concentric}s
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Concéntrico
                </div>
              </div>
              <div className="text-2xl text-gray-400">→</div>
              <div className="text-center flex-1">
                <div className="text-4xl mb-2">⏸️</div>
                <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">
                  {pause2}s
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Pausa Superior
                </div>
              </div>
            </div>
          </div>

          {/* Guía */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              📚 Guía de TUT
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• <strong>20-40s:</strong> Óptimo para hipertrofia</li>
              <li>• <strong>40-70s:</strong> Resistencia muscular</li>
              <li>• <strong>&lt;20s:</strong> Fuerza y potencia</li>
              <li>• Tempo más lento = Mayor control y técnica</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
