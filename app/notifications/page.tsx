'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Bell, MessageCircle, UserPlus, Heart, Trash2 } from 'lucide-react';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { LoadingIndicator } from '@/components/LoadingIndicator';
import { deleteNotification, getNotifications, markAllNotificationsRead, type NotificationItem } from '@/lib/api';
import { showAppToast } from '@/lib/app-toast';
import { useSocketContext } from '@/components/SocketProvider';

function NotifIcon({ type }: { type: string }) {
  if (type === 'message') return <MessageCircle size={16} />;
  if (type === 'friend') return <UserPlus size={16} />;
  if (type === 'like' || type === 'reaction') return <Heart size={16} />;
  return <Bell size={16} />;
}

function formatTime(dateStr?: string) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function NotificationsPage() {
  const { onNotification } = useSocketContext();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const refreshId = useRef(0);

  function loadNotifications() {
    const id = ++refreshId.current;
    setLoading(true);
    setError(false);
    getNotifications()
      .then(async (list) => {
        if (id !== refreshId.current) return;
        const items = list ?? [];
        if (items.some((item) => !item.read)) {
          try {
            await markAllNotificationsRead();
            if (id !== refreshId.current) return;
            setNotifications(items.map((item) => ({ ...item, read: true })));
            window.dispatchEvent(new Event('asiance:notifications-changed'));
            return;
          } catch {
            // Keep the unread state if the server could not save the change.
          }
        }
        if (id === refreshId.current) setNotifications(items);
      })
      .catch(() => {
        if (id === refreshId.current) setError(true);
      })
      .finally(() => {
        if (id === refreshId.current) setLoading(false);
      });
  }

  useEffect(() => {
    loadNotifications();
  }, []);

  useEffect(() => onNotification(() => {
    const id = ++refreshId.current;
    getNotifications().then((list) => {
      if (id === refreshId.current) {
        setNotifications(list ?? []);
        setError(false);
      }
    }).catch(() => {}).finally(() => {
      if (id === refreshId.current) setLoading(false);
    });
  }), [onNotification]);

  async function removeNotification(notificationId: string) {
    setDeletingId(notificationId);
    try {
      await deleteNotification(notificationId);
      refreshId.current += 1;
      setNotifications((prev) => prev.filter((item) => item._id !== notificationId));
      window.dispatchEvent(new Event('asiance:notifications-changed'));
    } catch {
      showAppToast('Could not delete notification. Please try again.', 'error');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <SiteHeader />
      <div style={{ maxWidth: 680, margin: '40px auto', padding: '0 20px', width: '100%', flex: 1 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>All Notifications</h1>

        {loading ? (
          <LoadingIndicator compact label="Loading notifications..." />
        ) : error ? (
          <p style={{ color: 'var(--ink-muted)', textAlign: 'center', paddingTop: 40 }}>Could not load notifications. <button type="button" onClick={loadNotifications}>Try again</button></p>
        ) : notifications.length === 0 ? (
          <p style={{ color: 'var(--ink-muted)', textAlign: 'center', paddingTop: 40 }}>No notifications yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {notifications.map((n, i) => (
              <div
                key={n._id ?? i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '14px 16px',
                  borderRadius: 10,
                  background: n.read ? 'transparent' : 'var(--surface-alt, #f8f8fa)',
                  border: '1px solid var(--border, #e8e8e8)',
                  color: 'inherit',
                  transition: 'background 0.15s',
                }}
              >
                <a href={n.link || '/notifications'} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, flex: 1, minWidth: 0, color: 'inherit', textDecoration: 'none' }}>
                  <span
                    style={{
                      flexShrink: 0,
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      background: 'var(--brand-light, #eef2ff)',
                      color: 'var(--brand, #6366f1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <NotifIcon type={n.type} />
                  </span>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: n.read ? 400 : 600, lineHeight: 1.4 }}>
                      {n.message}
                    </p>
                    <span style={{ fontSize: 12, color: 'var(--ink-muted, #888)', marginTop: 4, display: 'block' }}>
                      {formatTime(n.createdAt)}
                    </span>
                  </div>
                </a>
                {!n.read && (
                  <span
                    style={{
                      flexShrink: 0,
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: 'var(--brand, #6366f1)',
                      marginTop: 4,
                    }}
                  />
                )}
                {n._id && <button type="button" className="notif-delete" aria-label={`Delete notification: ${n.message}`} title="Delete notification" disabled={deletingId === n._id} onClick={() => removeNotification(n._id!)}><Trash2 size={16} /></button>}
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: 32, textAlign: 'center' }}>
          <Link href="/" style={{ color: 'var(--brand)', fontSize: 14 }}>
            ← Back to home
          </Link>
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}
