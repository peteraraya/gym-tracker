'use client';

import { ReactNode } from 'react';
import { SearchInput } from './SearchInput';
import { Button } from '../ui/Button';

export interface FilterOption {
  id: string;
  label: string;
  icon?: ReactNode | string;
  count?: number;
}

interface FilterBarProps {
  // Search
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  showSearch?: boolean;

  // Filters
  filters?: FilterOption[];
  selectedFilter?: string;
  onFilterChange?: (filterId: string) => void;
  filterLabel?: string;

  // Actions
  actions?: ReactNode;
  
  // Layout
  vertical?: boolean;
  className?: string;
}

export function FilterBar({
  searchValue = '',
  onSearchChange,
  searchPlaceholder = '🔍 Buscar...',
  showSearch = true,
  filters = [],
  selectedFilter,
  onFilterChange,
  filterLabel,
  actions,
  vertical = false,
  className = ''
}: FilterBarProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search and Actions Row */}
      {(showSearch || actions) && (
        <div className={`flex ${vertical ? 'flex-col' : 'flex-col sm:flex-row'} gap-3`}>
          {/* Search */}
          {showSearch && onSearchChange && (
            <div className="flex-1">
              <SearchInput
                value={searchValue}
                onChange={onSearchChange}
                placeholder={searchPlaceholder}
                debounceMs={300}
              />
            </div>
          )}

          {/* Actions */}
          {actions && (
            <div className="flex gap-2 shrink-0">
              {actions}
            </div>
          )}
        </div>
      )}

      {/* Filters Row */}
      {filters.length > 0 && onFilterChange && (
        <div className="space-y-2">
          {filterLabel && (
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {filterLabel}
            </label>
          )}
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => {
              const isSelected = selectedFilter === filter.id;
              return (
                <Button
                  key={filter.id}
                  variant={isSelected ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => onFilterChange(filter.id)}
                  className={`
                    transition-all
                    ${isSelected 
                      ? 'shadow-md' 
                      : 'hover:shadow-sm'
                    }
                  `}
                >
                  {typeof filter.icon === 'string' ? (
                    <span className="text-base">{filter.icon}</span>
                  ) : (
                    filter.icon
                  )}
                  <span>{filter.label}</span>
                  {filter.count !== undefined && (
                    <span className={`
                      ml-1 px-1.5 py-0.5 rounded-full text-xs font-bold
                      ${isSelected 
                        ? 'bg-white/20 text-white' 
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                      }
                    `}>
                      {filter.count}
                    </span>
                  )}
                </Button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// Variante simple solo con búsqueda
export function SearchBar({
  value,
  onChange,
  placeholder,
  actions
}: Pick<FilterBarProps, 'searchValue' | 'onSearchChange' | 'searchPlaceholder' | 'actions'> & {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <FilterBar
      searchValue={value}
      onSearchChange={onChange}
      searchPlaceholder={placeholder}
      showSearch={true}
      actions={actions}
    />
  );
}

// Variante simple solo con filtros
export function FilterButtons({
  filters,
  selected,
  onChange,
  label
}: {
  filters: FilterOption[];
  selected: string;
  onChange: (id: string) => void;
  label?: string;
}) {
  return (
    <FilterBar
      showSearch={false}
      filters={filters}
      selectedFilter={selected}
      onFilterChange={onChange}
      filterLabel={label}
    />
  );
}
