'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle2, AlertCircle, Info, Sparkles, X } from 'lucide-react';
import { useMounted } from '@/lib/hooks/use-mounted';
import { hapticFeedback, hapticPatterns } from '@/lib/haptics';

export type ToastType = 'success' | 'error' | 'info' | 'favorite';

interface Toast {
    id: string;
    message: string;
    type?: ToastType;
    duration?: number;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const mounted = useMounted();

    const showToast = useCallback((message: string, type: ToastType = 'success', duration = 2800) => {
        const id = Math.random().toString(36).substring(2, 9);

        // Tactile micro-haptic for user confirmation
        if (type === 'favorite') {
            hapticFeedback(hapticPatterns.heartbeat);
        } else if (type === 'error') {
            hapticFeedback(hapticPatterns.error);
        } else {
            hapticFeedback(hapticPatterns.selection);
        }

        setToasts((prev) => [...prev.slice(-2), { id, message, type, duration }]);

        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, duration);
    }, []);

    const dismissToast = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {mounted && toasts.length > 0 && (
                <div
                    aria-live="polite"
                    aria-atomic="true"
                    className="fixed z-120 top-4 inset-x-0 sm:top-5 sm:right-5 sm:left-auto flex flex-col items-center sm:items-end gap-2 px-3 sm:px-4 pointer-events-none transition-all duration-300"
                    style={{ paddingTop: 'env(safe-area-inset-top)' }}
                >
                    {toasts.map((toast) => (
                        <div
                            key={toast.id}
                            className="pointer-events-auto flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-m3-inverse-surface/95 text-m3-inverse-on-surface shadow-2xl border border-white/10 text-xs sm:text-sm font-semibold animate-in slide-in-from-top-4 zoom-in-95 fade-in duration-200 backdrop-blur-xl max-w-sm w-auto"
                        >
                            {toast.type === 'error' ? (
                                <AlertCircle size={16} className="text-red-400 shrink-0" />
                            ) : toast.type === 'info' ? (
                                <Info size={16} className="text-sky-400 shrink-0" />
                            ) : toast.type === 'favorite' ? (
                                <span className="text-rose-400 text-sm shrink-0 leading-none">❤️</span>
                            ) : (
                                <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                            )}
                            <span className="leading-tight select-none">{toast.message}</span>
                            <button
                                type="button"
                                onClick={() => dismissToast(toast.id)}
                                className="ml-1 text-m3-inverse-on-surface/60 hover:text-m3-inverse-on-surface p-0.5 rounded-full hover:bg-white/10 active:scale-90 transition-all cursor-pointer"
                                aria-label="Dismiss notification"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}
