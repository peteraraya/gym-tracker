'use client';

import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef, useState, useEffect } from 'react';

interface VirtualListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  estimateSize?: number;
  overscan?: number;
  className?: string;
  enableKeyboardNav?: boolean;
  ariaLabel?: string;
}

export function VirtualList<T>({
  items,
  renderItem,
  estimateSize = 100,
  overscan = 5,
  className = '',
  enableKeyboardNav = false,
  ariaLabel = 'Lista virtualizada',
}: VirtualListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    overscan,
  });

  useEffect(() => {
    if (!enableKeyboardNav || !parentRef.current) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (items.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex(prev => {
            const next = prev < items.length - 1 ? prev + 1 : prev;
            virtualizer.scrollToIndex(next, { align: 'auto' });
            return next;
          });
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex(prev => {
            const next = prev > 0 ? prev - 1 : 0;
            virtualizer.scrollToIndex(next, { align: 'auto' });
            return next;
          });
          break;
        case 'Home':
          e.preventDefault();
          setFocusedIndex(0);
          virtualizer.scrollToIndex(0, { align: 'start' });
          break;
        case 'End':
          e.preventDefault();
          setFocusedIndex(items.length - 1);
          virtualizer.scrollToIndex(items.length - 1, { align: 'end' });
          break;
      }
    };

    const element = parentRef.current;
    element.addEventListener('keydown', handleKeyDown);
    return () => element.removeEventListener('keydown', handleKeyDown);
  }, [enableKeyboardNav, items.length, virtualizer]);

  return (
    <div
      ref={parentRef}
      className={className}
      style={{ height: '100%', overflow: 'auto' }}
      role="list"
      aria-label={ariaLabel}
      tabIndex={enableKeyboardNav ? 0 : undefined}
    >
      <div style={{ height: `${virtualizer.getTotalSize()}px`, width: '100%', position: 'relative' }}>
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            data-index={virtualItem.index}
            ref={virtualizer.measureElement}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${virtualItem.start}px)`,
            }}
            role="listitem"
            aria-setsize={items.length}
            aria-posinset={virtualItem.index + 1}
            data-focused={enableKeyboardNav && focusedIndex === virtualItem.index ? 'true' : undefined}
          >
            {renderItem(items[virtualItem.index], virtualItem.index)}
          </div>
        ))}
      </div>
    </div>
  );
}
