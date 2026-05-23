'use client';

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from '@/components/icons/lucide';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useTranslations } from '@/context/LocaleContext';

// ==================== Toast Types ====================

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastAction {
  label: string;
  onClick: () => void;
}

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  action?: ToastAction;
}

// ==================== Confirm Types ====================

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

// ==================== Combined Context ====================

interface NotificationContextType {
  // Toast API
  showToast: (message: string, type?: ToastType, duration?: number, action?: ToastAction) => void;
  success: (message: string, duration?: number, action?: ToastAction) => void;
  error: (message: string, duration?: number, action?: ToastAction) => void;
  info: (message: string, duration?: number, action?: ToastAction) => void;
  warning: (message: string, duration?: number, action?: ToastAction) => void;
  // Confirm API
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  // Toast state
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Confirm state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmOptions, setConfirmOptions] = useState<ConfirmOptions | null>(null);
  const [confirmResolver, setConfirmResolver] = useState<((value: boolean) => void) | null>(null);

  const t = useTranslations('common');

  // ==================== Toast Methods ====================

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = 'info', duration: number = 5000, action?: ToastAction) => {
      const id = `${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev, { id, message, type, duration, action }]);
      if (duration > 0) {
        setTimeout(() => removeToast(id), duration);
      }
    },
    [removeToast],
  );

  const success = useCallback((message: string, duration?: number, action?: ToastAction) => showToast(message, 'success', duration, action), [showToast]);
  const error = useCallback((message: string, duration?: number, action?: ToastAction) => showToast(message, 'error', duration, action), [showToast]);
  const info = useCallback((message: string, duration?: number, action?: ToastAction) => showToast(message, 'info', duration, action), [showToast]);
  const warning = useCallback((message: string, duration?: number, action?: ToastAction) => showToast(message, 'warning', duration, action), [showToast]);

  // ==================== Confirm Methods ====================

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    setConfirmOptions(opts);
    setConfirmOpen(true);
    return new Promise<boolean>((resolve) => {
      setConfirmResolver(() => resolve);
    });
  }, []);

  const handleConfirm = () => {
    confirmResolver?.(true);
    setConfirmOpen(false);
    setConfirmResolver(null);
  };

  const handleCancel = () => {
    confirmResolver?.(false);
    setConfirmOpen(false);
    setConfirmResolver(null);
  };

  // ==================== Toast Styles ====================

  const getToastStyles = (type: ToastType) => {
    const base = 'flex items-start gap-3 p-4 rounded-lg shadow-lg backdrop-blur-sm border animate-slide-in-right';
    switch (type) {
      case 'success': return `${base} bg-green-50/95 dark:bg-green-900/95 border-green-200 dark:border-green-700 text-green-900 dark:text-green-100`;
      case 'error': return `${base} bg-red-50/95 dark:bg-red-900/95 border-red-200 dark:border-red-700 text-red-900 dark:text-red-100`;
      case 'warning': return `${base} bg-yellow-50/95 dark:bg-yellow-900/95 border-yellow-200 dark:border-yellow-700 text-yellow-900 dark:text-yellow-100`;
      default: return `${base} bg-blue-50/95 dark:bg-blue-900/95 border-blue-200 dark:border-blue-700 text-blue-900 dark:text-blue-100`;
    }
  };

  const getToastIcon = (type: ToastType) => {
    const cls = 'w-5 h-5 shrink-0 mt-0.5';
    switch (type) {
      case 'success': return <CheckCircle className={cls} />;
      case 'error': return <AlertCircle className={cls} />;
      case 'warning': return <AlertTriangle className={cls} />;
      default: return <Info className={cls} />;
    }
  };

  const getConfirmVariantColor = () => {
    switch (confirmOptions?.variant) {
      case 'danger': return 'text-red-600 dark:text-red-400';
      case 'warning': return 'text-yellow-600 dark:text-yellow-400';
      default: return 'text-blue-600 dark:text-blue-400';
    }
  };

  const value = useMemo(() => ({
    showToast, success, error, info, warning, confirm,
  }), [showToast, success, error, info, warning, confirm]);

  return (
    <NotificationContext.Provider value={value}>
      {children}

      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none">
        {toasts.map((toast) => (
          <div key={toast.id} className={`${getToastStyles(toast.type)} pointer-events-auto`}>
            {getToastIcon(toast.type)}
            <p className="flex-1 text-sm font-medium leading-relaxed">{toast.message}</p>
            {toast.action && (
              <button
                onClick={() => {
                  try {
                    toast.action?.onClick();
                  } catch {}
                  removeToast(toast.id);
                }}
                className="ml-3 shrink-0 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm font-semibold"
              >
                {toast.action.label}
              </button>
            )}
            <button onClick={() => removeToast(toast.id)} className="shrink-0 hover:opacity-70 transition-opacity" aria-label="Cerrar notificación">
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Confirm Modal */}
      {confirmOpen && confirmOptions && (
        <Modal
          isOpen={confirmOpen}
          onClose={handleCancel}
          title={confirmOptions.title || t('confirm') || 'Confirmar acción'}
          backdropClassName="bg-black/40 backdrop-blur-sm dark:bg-black/50"
        >
          <div className="p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className={`shrink-0 ${getConfirmVariantColor()}`}>
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <p className="text-gray-700 dark:text-gray-300">{confirmOptions.message}</p>
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <Button variant="ghost" onClick={handleCancel}>
                {confirmOptions.cancelText || t('cancel') || 'Cancelar'}
              </Button>
              <Button variant={confirmOptions.variant === 'danger' ? 'danger' : 'primary'} onClick={handleConfirm}>
                {confirmOptions.confirmText || t('confirm') || 'Confirmar'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </NotificationContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useToast must be used within a NotificationProvider');
  return {
    showToast: ctx.showToast,
    success: ctx.success,
    error: ctx.error,
    info: ctx.info,
    warning: ctx.warning,
  };
}

export function useConfirm() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useConfirm must be used within a NotificationProvider');
  return { confirm: ctx.confirm };
}
