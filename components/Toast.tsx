'use client';

import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, AlertTriangle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}

const ICONS: Record<ToastType, React.ReactNode> = {
  success: <Check className="w-4 h-4" />,
  error: <AlertTriangle className="w-4 h-4" />,
  info: <Info className="w-4 h-4" />,
};

const STYLES: Record<ToastType, string> = {
  success: 'bg-green-500/20 border-green-500/30 text-green-400',
  error: 'bg-red-500/20 border-red-500/30 text-red-400',
  info: 'bg-blue-500/20 border-blue-500/30 text-blue-400',
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence mode="popLayout">
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-2xl border backdrop-blur-xl shadow-2xl ${STYLES[toast.type]}`}
              role="status"
              aria-live="polite"
            >
              {ICONS[toast.type]}
              <span className="text-sm font-medium text-white">{toast.message}</span>
              <button
                onClick={() => dismissToast(toast.id)}
                className="ml-2 p-0.5 rounded-full hover:bg-white/10 transition-colors"
                aria-label="Закрыть уведомление"
              >
                <X className="w-3.5 h-3.5 text-white/50" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
