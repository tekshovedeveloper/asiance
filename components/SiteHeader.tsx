'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoadingIndicator } from '@/components/LoadingIndicator';
import {
  Bell, MessageCircle, Search, ShoppingBag, ChevronDown,
  User, LogOut, Settings, UserPlus, Heart, X,
} from 'lucide-react';
import {
  getMe, getUnreadMessageCount, getUnreadNotificationCount,
  markAllNotificationsRead, getNotifications,
} from '@/lib/api';
import type { DashboardUser } from '@/components/dashboard/types';
import { useSocketContext } from '@/components/SocketProvider';
import { useCart } from '@/components/cart/CartContext';

type NotifItem = { _id?: string; message: string; type: string; read: boolean; createdAt?: string; link?: string };

const nav = [
  ['Home', '/'],
  ['Community News', '/community-news'],
  ['Activity', '/activity'],
  ['Members', '/members'],
  ['Groups', '/circles'],
  ['Blog', '/blog'],
  ['Shop', '/shop'],
];

const FALLBACK_AVATAR = '/assets/profile/dymmy-profile.jpeg';

function NotifIcon({ type }: { type: string }) {
  if (type === 'message') return <MessageCircle size={14} />;
  if (type === 'friend') return <UserPlus size={14} />;
  if (type === 'like' || type === 'reaction') return <Heart size={14} />;
  return <Bell size={14} />;
}

function formatNotifTime(dateStr?: string) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export function SiteHeader({ active }: { active?: string }) {
  const router = useRouter();
  const { onNotification } = useSocketContext();
  const { count: cartCount, openDrawer: openCart } = useCart();

  const [me, setMe] = useState<DashboardUser | null>(null);
  const [unread, setUnread] = useState(0);
  const [notifCount, setNotifCount] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifPanelOpen, setNotifPanelOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotifItem[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = localStorage.getItem('asiance_token');
    if (!token) return;

    getMe().then((user) => setMe(user)).catch(() => setMe(null));
    getUnreadMessageCount().then((r) => setUnread(r.count)).catch(() => {});
    getUnreadNotificationCount().then((r) => setNotifCount(r.count)).catch(() => {});
  }, []);

  useEffect(() => {
    return onNotification((n) => {
      if (n.type === 'message') {
        setUnread((prev) => prev + 1);
      } else {
        setNotifCount((prev) => prev + 1);
      }
      setNotifications((prev) => [
        { message: n.message, type: n.type, read: false, link: (n as any).link },
        ...prev,
      ]);
    });
  }, [onNotification]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifPanelOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function openNotifPanel() {
    if (notifPanelOpen) {
      setNotifPanelOpen(false);
      return;
    }
    setNotifPanelOpen(true);
    setNotifLoading(true);
    getNotifications()
      .then((list) => {
        setNotifications(list ?? []);
        setNotifCount(0);
        markAllNotificationsRead().catch(() => {});
      })
      .catch(() => {})
      .finally(() => setNotifLoading(false));
  }

  function logout() {
    localStorage.removeItem('asiance_token');
    setMe(null);
    router.push('/');
  }

  return (
    <>
      <div className="site-nav-promo">
        Free shipping over $120 · Members earn 2× points this week
      </div>

      <header className="site-header">
        <Link href="/" className="logo" aria-label="Asiance home">
          asiance
        </Link>

        <nav className="site-nav" aria-label="Main navigation">
          {nav.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className={`nav-link ${active === label ? 'active' : ''}`}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="nav-actions">
          <Link className="nav-icon-link" href="/blog" aria-label="Search">
            <Search size={15} />
          </Link>

          {/* Bell — opens notification panel */}
          <div className="notif-bell-wrap" ref={notifRef}>
            <button
              type="button"
              className="nav-icon-link badge-wrap"
              aria-label="Notifications"
              onClick={openNotifPanel}
            >
              <Bell size={15} />
              {notifCount > 0 && <span className="badge">{notifCount > 9 ? '9+' : notifCount}</span>}
            </button>

            {notifPanelOpen && (
              <div className="notif-panel">
                <div className="notif-panel-head">
                  <span className="notif-panel-title">Notifications</span>
                  <button
                    type="button"
                    className="notif-panel-close"
                    onClick={() => setNotifPanelOpen(false)}
                  >
                    <X size={14} />
                  </button>
                </div>
                <div className="notif-panel-list">
                  {notifLoading ? (
                    <div className="notif-panel-empty">
                      <LoadingIndicator compact />
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="notif-panel-empty">No notifications yet</div>
                  ) : (
                    notifications.map((n, i) => (
                      <a
                        key={n._id ?? i}
                        href={n.link ?? '#'}
                        className={`notif-panel-item${n.read ? '' : ' notif-panel-item--unread'}`}
                        onClick={() => setNotifPanelOpen(false)}
                      >
                        <span className="notif-panel-icon"><NotifIcon type={n.type} /></span>
                        <div className="notif-panel-content">
                          <p className="notif-panel-msg">{n.message}</p>
                          {n.createdAt && (
                            <span className="notif-panel-time">{formatNotifTime(n.createdAt)}</span>
                          )}
                        </div>
                        {!n.read && <span className="notif-panel-dot" />}
                      </a>
                    ))
                  )}
                </div>
                <div className="notif-panel-footer">
                  <a
                    href="/notifications"
                    className="notif-panel-view-all"
                    onClick={() => setNotifPanelOpen(false)}
                  >
                    View all notifications
                  </a>
                </div>
              </div>
            )}
          </div>

          <Link
            className="nav-icon-link badge-wrap"
            href="/messages"
            aria-label="Messages"
            onClick={() => setUnread(0)}
          >
            <MessageCircle size={15} />
            {unread > 0 && <span className="badge">{unread > 9 ? '9+' : unread}</span>}
          </Link>

          <button type="button" className="nav-cart" onClick={openCart} aria-label="Open cart">
            <ShoppingBag size={14} />
            <span>Bag</span>
            {cartCount > 0 && (
              <span className="nav-cart-count">{cartCount > 9 ? '9+' : cartCount}</span>
            )}
          </button>

          {me ? (
            <div className="nav-user-menu" ref={dropdownRef}>
              <button
                type="button"
                className="nav-user-trigger"
                onClick={() => setDropdownOpen((v) => !v)}
              >
                <img
                  src={me.avatarUrl || FALLBACK_AVATAR}
                  alt={me.name}
                  className="nav-user-avatar"
                />
                <span className="nav-user-name">{me.name.split(' ')[0]}</span>
                <ChevronDown size={12} style={{ opacity: 0.7 }} />
              </button>

              {dropdownOpen && (
                <div className="nav-dropdown">
                  {/* <Link
                    href={`/members/${me.username}`}
                    className="nav-dropdown-item"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <User size={14} /> Profile
                  </Link> */}
                  <Link
                    href="/dashboard"
                    className="nav-dropdown-item"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <Settings size={14} /> Dashboard
                  </Link>
                  <Link
                    href="/messages"
                    className="nav-dropdown-item"
                    onClick={() => { setDropdownOpen(false); setUnread(0); }}
                  >
                    <MessageCircle size={14} />
                    Messages
                    {unread > 0 && <span className="nav-dropdown-badge">{unread}</span>}
                  </Link>
                  <div className="nav-dropdown-divider" />
                  <button
                    type="button"
                    className="nav-dropdown-item nav-dropdown-item--danger"
                    onClick={logout}
                  >
                    <LogOut size={14} /> Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link className="nav-join" href="/register">
              Join
            </Link>
          )}
        </div>
      </header>
    </>
  );
}
