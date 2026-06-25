'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { EQUIPMENT_CATEGORIES, Equipment } from '@/data/equipment';

export function EquipmentFilters({ currentCategory }: { currentCategory: Equipment['category'] | 'all' }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleSelect = (category: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (category === 'all') {
      params.delete('category');
    } else {
      params.set('category', category);
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
      <Button
        variant={currentCategory === 'all' ? 'primary' : 'secondary'}
        size="sm"
        onClick={() => handleSelect('all')}
      >
        📚 Todos
      </Button>
      {EQUIPMENT_CATEGORIES.map(cat => (
        <Button
          key={cat.id}
          variant={currentCategory === cat.id ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => handleSelect(cat.id)}
        >
          {cat.emoji} {cat.name}
        </Button>
      ))}
    </div>
  );
}
