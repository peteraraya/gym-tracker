import { Metadata } from 'next';
import { 
  glossaryTerms, 
  GLOSSARY_CATEGORIES, 
  type GlossaryCategory,
  type GlossaryTerm,
  searchTerms 
} from '@/data/glossary';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { BookOpen } from '@/components/icons/lucide';
import { EmptyStateCard } from '@/components/shared';
import { PageHeader, PageLayout, PageContent } from '@/layouts';
import { GlossaryFilters } from './GlossaryFilters';
import { GlossaryTermModal } from './GlossaryTermModal';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Glosario | Gym Tracker',
  description: 'Glosario de términos de fitness y entrenamiento.',
};

export default async function GlossaryPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const searchParams = await props.searchParams;
  const searchQuery = typeof searchParams.q === 'string' ? searchParams.q : '';
  const selectedCategory = typeof searchParams.category === 'string' ? searchParams.category as GlossaryCategory | 'all' : 'all';

  // Filtrar términos
  let filteredTerms = glossaryTerms;

  if (selectedCategory !== 'all') {
    filteredTerms = filteredTerms.filter(term => term.category === selectedCategory);
  }

  if (searchQuery.trim()) {
    filteredTerms = searchTerms(searchQuery);
    if (selectedCategory !== 'all') {
      filteredTerms = filteredTerms.filter(term => term.category === selectedCategory);
    }
  }

  // Ordenar alfabéticamente
  filteredTerms = filteredTerms.sort((a, b) => a.term.localeCompare(b.term));

  // Agrupar términos por letra inicial
  const termsByLetter: Record<string, GlossaryTerm[]> = {};
  filteredTerms.forEach(term => {
    const letter = term.term[0].toUpperCase();
    if (!termsByLetter[letter]) {
      termsByLetter[letter] = [];
    }
    termsByLetter[letter].push(term);
  });

  // Category counts for the filters
  const categoryCounts = Object.keys(GLOSSARY_CATEGORIES).reduce((acc, cat) => {
    acc[cat as GlossaryCategory] = glossaryTerms.filter(t => t.category === cat).length;
    return acc;
  }, {} as Record<GlossaryCategory, number>);

  return (
    <PageLayout>
      <PageHeader
        title="Glosario de Fitness"
        subtitle={`${glossaryTerms.length} términos esenciales para tu entrenamiento`}
        icon={<BookOpen className="w-7 h-7 text-white" />}
        gradient="from-indigo-600 to-violet-600"
      />

      <PageContent>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Sidebar - Filtros */}
          <div className="lg:col-span-1">
            <GlossaryFilters 
              totalTermsCount={glossaryTerms.length}
              categoryCounts={categoryCounts}
            />
          </div>

          {/* Lista de Términos */}
          <div className="lg:col-span-3">
            {filteredTerms.length === 0 ? (
              <EmptyStateCard
                icon="🔍"
                title="No se encontraron términos"
                description="Intenta con otros términos de búsqueda"
              />
            ) : (
              <div className="space-y-4">
                {Object.entries(termsByLetter).sort().map(([letter, terms]) => (
                  <Card key={letter} className="shadow-lg">
                    <CardHeader className="bg-linear-to-r from-gray-700 to-gray-800 text-white rounded-t-lg p-3">
                      <CardTitle className="text-xl font-bold text-white">{letter}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="grid grid-cols-1 gap-3">
                        {terms.map((term) => {
                          const categoryConfig = GLOSSARY_CATEGORIES[term.category];
                          
                          // Build the URL for the term link, preserving current search params
                          const linkParams = new URLSearchParams();
                          if (searchQuery) linkParams.set('q', searchQuery);
                          if (selectedCategory !== 'all') linkParams.set('category', selectedCategory);
                          linkParams.set('term', term.id);
                          const href = `?${linkParams.toString()}`;

                          return (
                            <Link
                              key={term.id}
                              href={href}
                              scroll={false}
                              className="text-left p-4 bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-lg transition-all group block"
                            >
                              <div className="flex items-start gap-3">
                                <span className="text-2xl shrink-0">{term.icon || categoryConfig.icon}</span>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-bold text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                      {term.term}
                                    </h3>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold bg-linear-to-r ${categoryConfig.color} text-white`}>
                                      {categoryConfig.label}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                    {term.definition}
                                  </p>
                                </div>
                              </div>
                            </Link>
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
      </PageContent>

      <GlossaryTermModal />
    </PageLayout>
  );
}
