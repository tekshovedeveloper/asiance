'use client';

import { useEffect, useState } from 'react';
import { Bell, MessageCircle, UserPlus, Heart, X } from 'lucide-react';
import { useSocketContext } from './SocketProvider';

type Toast = {
  id: number;
  message: string;
  type: string;
  link?: string;
};

function ToastIcon({ type }: { type: string }) {
  if (type === 'message') return <MessageCircle size={16} />;
  if (type === 'friend') return <UserPlus size={16} />;
  if (type === 'like' || type === 'reaction') return <Heart size={16} />;
  return <Bell size={16} />;
}

export function NotificationToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const { onNotification } = useSocketContext();

  useEffect(() => {
    return onNotification((n) => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev.slice(-4), { id, message: n.message, type: n.type, link: (n as any).link }]);
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 5000);
    });
  }, [onNotification]);

  if (!toasts.length) return null;

  return (
    <div className="notif-toast-stack">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="notif-toast"
          onClick={() => {
            setToasts((prev) => prev.filter((x) => x.id !== t.id));
            if (t.link) window.location.href = t.link;
          }}
        >
          <span className="notif-toast-icon">
            <ToastIcon type={t.type} />
          </span>
          <span className="notif-toast-msg">{t.message}</span>
          <button
            type="button"
            className="notif-toast-close"
            onClick={(e) => {
              e.stopPropagation();
              setToasts((prev) => prev.filter((x) => x.id !== t.id));
            }}
          >
            <X size={12} />
          </button>
        </div>
      ))}
    </div>
  );
}
