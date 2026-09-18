'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { BookOpen, Link as LinkIcon, Lightbulb } from '@/components/icons/lucide';
import { glossaryTerms, GLOSSARY_CATEGORIES } from '@/data/glossary';

export function GlossaryTermModal() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const termId = searchParams.get('term');

  if (!termId) return null;

  const selectedTerm = glossaryTerms.find((t) => t.id === termId);
  if (!selectedTerm) return null;

  const handleClose = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('term');
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={handleClose}
    >
      <div 
        className="w-full max-w-3xl my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <Card className="shadow-2xl animate-fadeIn">
          <CardHeader className={`bg-linear-to-r ${GLOSSARY_CATEGORIES[selectedTerm.category].color} text-white rounded-t-lg p-4`}>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <span className="text-4xl">{selectedTerm.icon || GLOSSARY_CATEGORIES[selectedTerm.category].icon}</span>
                <div>
                  <CardTitle className="text-2xl font-bold text-white mb-1">
                    {selectedTerm.term}
                  </CardTitle>
                  <span className="px-3 py-1 rounded-full text-sm font-semibold bg-white/20 text-white">
                    {GLOSSARY_CATEGORIES[selectedTerm.category].label}
                  </span>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="ml-4 p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              >
                <span className="text-2xl text-white">×</span>
              </button>
            </div>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            {/* Definición */}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Definición
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {selectedTerm.definition}
              </p>
            </div>

            {/* Ejemplo */}
            {selectedTerm.example && (
              <div className="p-4 bg-linear-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5" />
                  Ejemplo
                </h3>
                <p className="text-blue-800 dark:text-blue-200 text-sm">
                  {selectedTerm.example}
                </p>
              </div>
            )}

            {/* Términos Relacionados */}
            {selectedTerm.relatedTerms && selectedTerm.relatedTerms.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                  <LinkIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  Términos Relacionados
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedTerm.relatedTerms.map((relatedId) => {
                    const relatedTerm = glossaryTerms.find(t => t.id === relatedId);
                    if (!relatedTerm) return null;
                    return (
                      <button
                        key={relatedId}
                        onClick={() => {
                          const params = new URLSearchParams(searchParams.toString());
                          params.set('term', relatedId);
                          router.replace(`${pathname}?${params.toString()}`, { scroll: false });
                        }}
                        className="px-3 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors text-sm font-medium"
                      >
                        {relatedTerm.term}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
