'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { APP_TOAST_EVENT, type AppToastDetail, type AppToastType } from '@/lib/app-toast';

type Toast = Required<AppToastDetail> & {
  id: number;
};

function ToastIcon({ type }: { type: AppToastType }) {
  if (type === 'success') return <CheckCircle2 size={16} />;
  if (type === 'error') return <AlertCircle size={16} />;
  return <Info size={16} />;
}

export function AppToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    function onToast(event: Event) {
      const detail = (event as CustomEvent<AppToastDetail>).detail;
      if (!detail?.message) return;

      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev.slice(-4), {
        id,
        message: detail.message,
        type: detail.type ?? 'info',
      }]);
      setTimeout(() => setToasts((prev) => prev.filter((toast) => toast.id !== id)), 5000);
    }

    window.addEventListener(APP_TOAST_EVENT, onToast);
    return () => window.removeEventListener(APP_TOAST_EVENT, onToast);
  }, []);

  if (!toasts.length) return null;

  return (
    <div className="notif-toast-stack app-toast-stack">
      {toasts.map((toast) => (
        <div key={toast.id} className={`notif-toast app-toast app-toast-${toast.type}`}>
          <span className="notif-toast-icon">
            <ToastIcon type={toast.type} />
          </span>
          <span className="notif-toast-msg">{toast.message}</span>
          <button
            type="button"
            className="notif-toast-close"
            onClick={() => setToasts((prev) => prev.filter((item) => item.id !== toast.id))}
            aria-label="Dismiss notification"
          >
            <X size={12} />
          </button>
        </div>
      ))}
    </div>
  );
}
