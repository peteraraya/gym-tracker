'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import { X } from '@/components/icons/lucide';
import { useTranslations } from '@/context/LocaleContext';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxHeight?: string;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxHeight = '80dvh'
}) => {
  const sheetRef = useRef<HTMLDivElement>(null);
  const startY = useRef<number | null>(null);
  const currentY = useRef<number>(0);
  const onCloseRef = useRef(onClose);
  const titleId = useId();
  const t = useTranslations('common');
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const previousFocus = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    const scrollY = window.scrollY;
    const previousStyles = {
      overflow: document.body.style.overflow,
      position: document.body.style.position,
      top: document.body.style.top,
      left: document.body.style.left,
      right: document.body.style.right,
      width: document.body.style.width,
    };
    const focusableSelector = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const focusableElements = sheetRef.current?.querySelectorAll<HTMLElement>(focusableSelector);
    (focusableElements?.[0] ?? sheetRef.current)?.focus();

    document.body.classList.add('modal-open');
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCloseRef.current();
        return;
      }
      if (event.key !== 'Tab') return;

      const elements = sheetRef.current?.querySelectorAll<HTMLElement>(focusableSelector);
      if (!elements?.length) {
        event.preventDefault();
        sheetRef.current?.focus();
        return;
      }

      const first = elements[0];
      const last = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.classList.remove('modal-open');
      Object.assign(document.body.style, previousStyles);
      window.scrollTo(0, scrollY);
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [isOpen]);

  const handleTouchStart = (e: React.TouchEvent) => {
    const contentDiv = sheetRef.current?.querySelector('.bottom-sheet-content');

    if (contentDiv && contentDiv.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
    } else {
      startY.current = null;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startY.current === null) return;
    
    currentY.current = e.touches[0].clientY;
    const diff = currentY.current - startY.current;

    if (diff > 0 && sheetRef.current) {
      e.preventDefault();
      setIsDragging(true);
      sheetRef.current.style.transform = `translateY(${diff}px)`;
    }
  };

  const handleTouchEnd = () => {
    if (startY.current === null) return;
    
    const diff = currentY.current - startY.current;

    if (diff > 100) {
      onClose();
    }

    if (sheetRef.current) sheetRef.current.style.transform = '';
    
    startY.current = null;
    currentY.current = 0;
    setIsDragging(false);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
        aria-hidden="true"
        style={{ touchAction: 'none' }}
      />

      {/* Bottom Sheet */}
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="fixed bottom-0 left-0 right-0 z-50 overflow-hidden rounded-t-3xl bg-surface pb-[env(safe-area-inset-bottom)] shadow-2xl"
        style={{
          maxHeight,
          maxWidth: '100vw',
          touchAction: 'pan-y',
          transition: isDragging ? 'none' : 'transform 220ms ease-out',
          position: 'fixed',
          bottom: 0
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-light px-4 pb-3">
          <h3 id={titleId} className="truncate text-lg font-bold text-gray-900 dark:text-gray-100">
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label={`${t('close')} ${title}`}
            className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-xl text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div 
          className="bottom-sheet-content overflow-x-hidden overflow-y-auto"
          style={{ 
            maxHeight: `calc(${maxHeight} - 80px)`,
            overscrollBehavior: 'contain'
          }}
        >
          {children}
        </div>
      </div>
    </>
  );
};
