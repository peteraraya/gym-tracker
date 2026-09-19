'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { SearchInput } from '@/components/shared';
import { GLOSSARY_CATEGORIES, type GlossaryCategory } from '@/data/glossary';
import { Lightbulb } from '@/components/icons/lucide';

interface GlossaryFiltersProps {
  totalTermsCount: number;
  categoryCounts: Record<GlossaryCategory, number>;
}

export function GlossaryFilters({ totalTermsCount, categoryCounts }: GlossaryFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentQuery = searchParams.get('q') || '';
  const currentCategory = searchParams.get('category') || 'all';

  const updateFilters = (q: string, category: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (q) {
      params.set('q', q);
    } else {
      params.delete('q');
    }

    if (category !== 'all') {
      params.set('category', category);
    } else {
      params.delete('category');
    }

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="space-y-4">
      {/* Búsqueda */}
      <Card className="shadow-lg">
        <CardContent className="p-4">
          <SearchInput
            value={currentQuery}
            onChange={(v) => updateFilters(v, currentCategory)}
            placeholder="Buscar términos..."
            debounceMs={300}
            className="w-full"
          />
        </CardContent>
      </Card>

      {/* Categorías */}
      <Card className="shadow-lg">
        <CardHeader className="bg-linear-to-r from-purple-500 to-blue-500 text-white rounded-t-lg p-4">
          <CardTitle className="text-lg text-white">Categorías</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-2">
            <button
              onClick={() => updateFilters(currentQuery, 'all')}
              className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                currentCategory === 'all'
                  ? 'bg-linear-to-r from-purple-600 to-blue-600 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <span className="font-medium">📚 Todos</span>
              <span className="float-right text-sm opacity-75">
                {totalTermsCount}
              </span>
            </button>
            {(Object.keys(GLOSSARY_CATEGORIES) as GlossaryCategory[]).map((category) => {
              const config = GLOSSARY_CATEGORIES[category];
              const count = categoryCounts[category] || 0;
              return (
                <button
                  key={category}
                  onClick={() => updateFilters(currentQuery, category)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                    currentCategory === category
                      ? `bg-linear-to-r ${config.color} text-white shadow-md`
                      : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className="font-medium">
                    {config.icon} {config.label}
                  </span>
                  <span className="float-right text-sm opacity-75">{count}</span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Info */}
      <Card className="shadow-lg bg-linear-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-2 border-blue-200 dark:border-blue-800">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900 dark:text-blue-100">
              <p className="font-semibold mb-1">💡 Consejo</p>
              <p className="text-blue-700 dark:text-blue-300">
                Haz clic en cualquier término para ver su definición completa, ejemplos y términos relacionados.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
