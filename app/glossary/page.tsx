'use client';

import { useState, useMemo } from 'react';
import { 
  glossaryTerms, 
  GLOSSARY_CATEGORIES, 
  type GlossaryCategory,
  type GlossaryTerm,
  searchTerms 
} from '@/data/glossary';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Search, BookOpen, Link as LinkIcon, Lightbulb } from '@/components/icons/lucide';

export default function GlossaryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<GlossaryCategory | 'all'>('all');
  const [selectedTerm, setSelectedTerm] = useState<GlossaryTerm | null>(null);

  // Filtrar términos
  const filteredTerms = useMemo(() => {
    let terms = glossaryTerms;

    // Filtrar por categoría
    if (selectedCategory !== 'all') {
      terms = terms.filter(term => term.category === selectedCategory);
    }

    // Filtrar por búsqueda
    if (searchQuery.trim()) {
      terms = searchTerms(searchQuery);
      if (selectedCategory !== 'all') {
        terms = terms.filter(term => term.category === selectedCategory);
      }
    }

    // Ordenar alfabéticamente
    return terms.sort((a, b) => a.term.localeCompare(b.term));
  }, [searchQuery, selectedCategory]);

  // Agrupar términos por letra inicial
  const termsByLetter = useMemo(() => {
    const grouped: Record<string, GlossaryTerm[]> = {};
    filteredTerms.forEach(term => {
      const letter = term.term[0].toUpperCase();
      if (!grouped[letter]) {
        grouped[letter] = [];
      }
      grouped[letter].push(term);
    });
    return grouped;
  }, [filteredTerms]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <Card className="shadow-xl">
          <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-lg p-6">
            <CardTitle className="flex items-center gap-3 text-white">
              <BookOpen className="w-8 h-8" />
              <div>
                <h1 className="text-3xl font-bold">Glosario de Fitness</h1>
                <p className="text-indigo-100 text-sm mt-1">
                  {glossaryTerms.length} términos esenciales para tu entrenamiento
                </p>
              </div>
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - Filtros */}
        <div className="lg:col-span-1 space-y-4">
          {/* Búsqueda */}
          <Card className="shadow-lg">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Buscar términos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Categorías */}
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-lg p-4">
              <CardTitle className="text-lg text-white">Categorías</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                    selectedCategory === 'all'
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                      : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className="font-medium">📚 Todos</span>
                  <span className="float-right text-sm opacity-75">
                    {glossaryTerms.length}
                  </span>
                </button>
                {(Object.keys(GLOSSARY_CATEGORIES) as GlossaryCategory[]).map((category) => {
                  const config = GLOSSARY_CATEGORIES[category];
                  const count = glossaryTerms.filter(t => t.category === category).length;
                  return (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                        selectedCategory === category
                          ? `bg-gradient-to-r ${config.color} text-white shadow-md`
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
          <Card className="shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-2 border-blue-200 dark:border-blue-800">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
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

        {/* Lista de Términos */}
        <div className="lg:col-span-3">
          {filteredTerms.length === 0 ? (
            <Card className="shadow-lg">
              <CardContent className="p-12 text-center">
                <Search className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  No se encontraron términos
                </p>
                <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">
                  Intenta con otros términos de búsqueda
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {Object.entries(termsByLetter).sort().map(([letter, terms]) => (
                <Card key={letter} className="shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-t-lg p-4">
                    <CardTitle className="text-2xl font-bold text-white">{letter}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 gap-3">
                      {terms.map((term) => {
                        const categoryConfig = GLOSSARY_CATEGORIES[term.category];
                        return (
                          <button
                            key={term.id}
                            onClick={() => setSelectedTerm(term)}
                            className="text-left p-4 bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-lg transition-all group"
                          >
                            <div className="flex items-start gap-3">
                              <span className="text-2xl flex-shrink-0">{term.icon || categoryConfig.icon}</span>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-bold text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                    {term.term}
                                  </h3>
                                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold bg-gradient-to-r ${categoryConfig.color} text-white`}>
                                    {categoryConfig.label}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                  {term.definition}
                                </p>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Detalle del Término */}
      {selectedTerm && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setSelectedTerm(null)}
        >
          <div 
            className="w-full max-w-3xl my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="shadow-2xl animate-fadeIn">
            <CardHeader className={`bg-gradient-to-r ${GLOSSARY_CATEGORIES[selectedTerm.category].color} text-white rounded-t-lg p-6`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <span className="text-5xl">{selectedTerm.icon || GLOSSARY_CATEGORIES[selectedTerm.category].icon}</span>
                  <div>
                    <CardTitle className="text-3xl font-bold text-white mb-2">
                      {selectedTerm.term}
                    </CardTitle>
                    <span className="px-3 py-1 rounded-full text-sm font-semibold bg-white/20 text-white">
                      {GLOSSARY_CATEGORIES[selectedTerm.category].label}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedTerm(null)}
                  className="ml-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <span className="text-3xl text-white">×</span>
                </button>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
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
                <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
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
                          onClick={() => setSelectedTerm(relatedTerm)}
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
      )}
    </div>
  );
}
