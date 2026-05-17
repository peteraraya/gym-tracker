'use client';

import React, { useEffect, useRef } from 'react';
import { X } from '@/components/icons/lucide';

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
  maxHeight = '80vh'
}) => {
  const sheetRef = useRef<HTMLDivElement>(null);
  const startY = useRef<number>(0);
  const currentY = useRef<number>(0);

  useEffect(() => {
    if (isOpen) {
      // Guardar scroll position actual
      const scrollY = window.scrollY;
      
      // Agregar clase al body
      document.body.classList.add('modal-open');
      
      // Prevenir scroll del body y horizontal
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.width = '100%';
      
      return () => {
        // Remover clase del body
        document.body.classList.remove('modal-open');
        
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        document.body.style.width = '';
        
        // Restaurar scroll position
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  const handleTouchStart = (e: React.TouchEvent) => {
    const target = e.target as HTMLElement;
    const contentDiv = sheetRef.current?.querySelector('.bottom-sheet-content');
    
    // Solo permitir swipe down si el contenido está en el top
    if (contentDiv && contentDiv.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
    } else {
      startY.current = 0;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startY.current === 0) return;
    
    currentY.current = e.touches[0].clientY;
    const diff = currentY.current - startY.current;

    // Solo permitir arrastrar hacia abajo
    if (diff > 0 && sheetRef.current) {
      e.preventDefault();
      sheetRef.current.style.transform = `translateY(${diff}px)`;
    }
  };

  const handleTouchEnd = () => {
    if (startY.current === 0) return;
    
    const diff = currentY.current - startY.current;

    if (diff > 100) {
      onClose();
    }

    if (sheetRef.current) {
      sheetRef.current.style.transform = '';
    }
    
    startY.current = 0;
    currentY.current = 0;
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
        style={{ touchAction: 'none' }}
      />

      {/* Bottom Sheet */}
      <div
        ref={sheetRef}
        className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 rounded-t-3xl shadow-2xl z-50 overflow-hidden"
        style={{
          maxHeight,
          transform: isOpen ? 'translateY(0)' : 'translateY(100%)',
          maxWidth: '100vw',
          touchAction: 'pan-y',
          transition: 'none',
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
        <div className="flex items-center justify-between px-4 pb-3 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 truncate">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shrink-0"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div 
          className="bottom-sheet-content overflow-y-auto overflow-x-hidden" 
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
