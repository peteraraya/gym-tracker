import { Metadata } from 'next';
import { EQUIPMENT_LIST, Equipment } from '@/data/equipment';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import { PageHeader, PageLayout, PageContent } from '@/layouts';
import { EquipmentGrid } from './EquipmentGrid';
import { EquipmentFilters } from './EquipmentFilters';

export const metadata: Metadata = {
  title: 'Equipamiento | Gym Tracker',
  description: 'Selecciona el equipamiento disponible para tus rutinas',
};

export default async function EquipmentPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const searchParams = await props.searchParams;
  const selectedCategory = typeof searchParams.category === 'string' ? searchParams.category as Equipment['category'] | 'all' : 'all';

  const filteredEquipment = selectedCategory === 'all'
    ? EQUIPMENT_LIST
    : EQUIPMENT_LIST.filter(eq => eq.category === selectedCategory);

  return (
    <ProtectedRoute>
      <PageLayout>
        <PageHeader
          title="Mi Equipamiento"
          subtitle="Selecciona el equipamiento que tienes disponible"
          icon={<span className="text-3xl">🏋️</span>}
          gradient="from-indigo-600 to-violet-600"
        />

        <PageContent maxWidth="6xl">
          <EquipmentFilters currentCategory={selectedCategory} />
          
          <EquipmentGrid 
            filteredEquipment={filteredEquipment} 
            totalCount={EQUIPMENT_LIST.length} 
          />

          {/* Info Card */}
          <Card className="mt-4 bg-linear-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
            <CardHeader>
              <CardTitle>💡 ¿Cómo funciona?</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400">✓</span>
                  <span>Selecciona todo el equipamiento que tienes disponible en tu gimnasio o en casa</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400">✓</span>
                  <span>Los ejercicios se filtrarán automáticamente para mostrarte solo los que puedes realizar</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400">✓</span>
                  <span>Las rutinas recomendadas se adaptarán a tu equipamiento disponible</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400">✓</span>
                  <span>Puedes cambiar tu selección en cualquier momento</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </PageContent>
      </PageLayout>
    </ProtectedRoute>
  );
}
