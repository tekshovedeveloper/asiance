'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bell, MessageCircle, UserPlus, Heart } from 'lucide-react';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { LoadingIndicator } from '@/components/LoadingIndicator';
import { getNotifications, markAllNotificationsRead } from '@/lib/api';

type NotifItem = {
  _id?: string;
  message: string;
  type: string;
  read: boolean;
  createdAt?: string;
  link?: string;
};

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
  const [notifications, setNotifications] = useState<NotifItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getNotifications()
      .then((list) => setNotifications(list ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
    markAllNotificationsRead().catch(() => {});
  }, []);

  return (
    <main style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <SiteHeader />
      <div style={{ maxWidth: 680, margin: '40px auto', padding: '0 20px', width: '100%', flex: 1 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>All Notifications</h1>

        {loading ? (
          <LoadingIndicator compact label="Loading notifications..." />
        ) : notifications.length === 0 ? (
          <p style={{ color: 'var(--ink-muted)', textAlign: 'center', paddingTop: 40 }}>No notifications yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {notifications.map((n, i) => (
              <a
                key={n._id ?? i}
                href={n.link ?? '#'}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 14,
                  padding: '14px 16px',
                  borderRadius: 10,
                  background: n.read ? 'transparent' : 'var(--surface-alt, #f8f8fa)',
                  border: '1px solid var(--border, #e8e8e8)',
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'background 0.15s',
                }}
              >
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
              </a>
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
