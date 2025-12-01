'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { AlertTriangle } from 'lucide-react';

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [resolver, setResolver] = useState<((value: boolean) => void) | null>(null);

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    setOptions(opts);
    setIsOpen(true);
    
    return new Promise<boolean>((resolve) => {
      setResolver(() => resolve);
    });
  }, []);

  const handleConfirm = () => {
    if (resolver) resolver(true);
    setIsOpen(false);
    setResolver(null);
  };

  const handleCancel = () => {
    if (resolver) resolver(false);
    setIsOpen(false);
    setResolver(null);
  };

  const getVariantColor = () => {
    switch (options?.variant) {
      case 'danger':
        return 'text-red-600 dark:text-red-400';
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'info':
      default:
        return 'text-blue-600 dark:text-blue-400';
    }
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      
      {isOpen && options && (
        <Modal 
          isOpen={isOpen} 
          onClose={handleCancel}
          title={options.title || 'Confirmar acción'}
        >
          <div className="p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className={`flex-shrink-0 ${getVariantColor()}`}>
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <p className="text-gray-700 dark:text-gray-300">
                  {options.message}
                </p>
              </div>
            </div>
            
            <div className="flex gap-3 justify-end mt-6">
              <Button
                variant="ghost"
                onClick={handleCancel}
              >
                {options.cancelText || 'Cancelar'}
              </Button>
              <Button
                variant={options.variant === 'danger' ? 'danger' : 'primary'}
                onClick={handleConfirm}
              >
                {options.confirmText || 'Confirmar'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return context;
}
