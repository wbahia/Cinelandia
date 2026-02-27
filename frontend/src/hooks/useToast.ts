import { useState, useCallback, useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

let globalDispatch: ((toast: Omit<Toast, 'id'>) => void) | null = null;

export function toast(message: string, type: ToastType = 'info') {
  if (globalDispatch) globalDispatch({ message, type });
}

toast.success = (msg: string) => toast(msg, 'success');
toast.error = (msg: string) => toast(msg, 'error');
toast.warning = (msg: string) => toast(msg, 'warning');
toast.info = (msg: string) => toast(msg, 'info');

export function useToastState() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((t: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { ...t, id }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(x => x.id !== id));
    }, 4000);
  }, []);

  useEffect(() => {
    globalDispatch = addToast;
    return () => { globalDispatch = null; };
  }, [addToast]);

  const remove = useCallback((id: string) => {
    setToasts(prev => prev.filter(x => x.id !== id));
  }, []);

  return { toasts, remove };
}
