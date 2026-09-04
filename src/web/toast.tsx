import React, { useEffect, useState } from 'react';
import { useTheme } from '../app/providers/ThemeProvider';

type ToastType = 'success' | 'error' | 'info';
type ToastOptions = { type?: ToastType; text1?: string; text2?: string; visibilityTime?: number };
type ToastItem = ToastOptions & { id: number };

const listeners = new Set<(toast: ToastItem) => void>();

const Toast = {
  show(options: ToastOptions) {
    const toast = { id: Date.now() + Math.random(), type: 'info' as ToastType, ...options };
    listeners.forEach((listener) => listener(toast));
  },
};

export const ToastHost = () => {
  const [items, setItems] = useState<ToastItem[]>([]);
  const { colors } = useTheme();

  useEffect(() => {
    const listener = (toast: ToastItem) => {
      setItems((current) => [...current.slice(-2), toast]);
      window.setTimeout(() => setItems((current) => current.filter((item) => item.id !== toast.id)), toast.visibilityTime || 3200);
    };
    listeners.add(listener);
    return () => { listeners.delete(listener); };
  }, []);

  return (
    <div aria-live="polite" style={{ position: 'fixed', top: 18, right: 18, zIndex: 10000, display: 'grid', gap: 10, width: 'min(420px, calc(100vw - 36px))' }}>
      {items.map((item) => {
        const tone = item.type === 'success' ? colors.success : item.type === 'error' ? colors.danger : colors.info;
        return (
          <div key={item.id} style={{ background: colors.surface, border: `1px solid ${colors.border}`, borderLeft: `4px solid ${tone}`, borderRadius: 8, boxShadow: '0 16px 40px rgba(15,23,42,.16)', padding: '13px 16px', animation: 'sanwariya-toast-in .18s ease-out' }}>
            {item.text1 && <strong style={{ display: 'block', color: colors.text, fontSize: 14 }}>{item.text1}</strong>}
            {item.text2 && <span style={{ display: 'block', color: colors.textSecondary, fontSize: 12, marginTop: 3 }}>{item.text2}</span>}
          </div>
        );
      })}
    </div>
  );
};

export default Toast;
