'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoadingIndicator } from '@/components/LoadingIndicator';
import {
  Bell, MessageCircle, ShoppingBag, ChevronDown,
  LogOut, Settings, UserPlus, Heart, Menu, X, Trash2,
} from 'lucide-react';
import {
  getChatThreads, getMe, getUnreadMessageCount, getUnreadNotificationCount,
  getNotifications, deleteNotification, markAllNotificationsRead,
  type ChatThread, type NotificationItem,
} from '@/lib/api';
import type { DashboardUser } from '@/components/dashboard/types';
import { useSocketContext } from '@/components/SocketProvider';
import { useCart } from '@/components/cart/CartContext';
import { showAppToast } from '@/lib/app-toast';

type MobileMenuTab = 'navigation' | 'notifications' | 'messages';

const nav = [
  ['Home', '/'],
  ['Explore Asiance', '/women'],
  ['Community News', '/community-news'],
  ['Activity', '/activity'],
  ['Members', '/members'],
  ['Groups', '/circles'],
  ['Blog', '/blog'],
  ['Shop', '/shop'],
];

const FALLBACK_AVATAR = 'https://res.cloudinary.com/ux81wsbq/image/upload/v1786640168/asiance/site-assets/profile/dymmy-profile-jpeg.jpg';

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

function threadDisplayName(title: string, currentUserName: string) {
  const name = currentUserName.trim();
  if (!name || !title) return title;
  if (title.startsWith(`${name} and `)) return title.slice(name.length + 5);
  if (title.endsWith(` and ${name}`)) return title.slice(0, -(name.length + 5));
  return title;
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
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifError, setNotifError] = useState(false);
  const [deletingNotificationId, setDeletingNotificationId] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<MobileMenuTab>('navigation');
  const [messageThreads, setMessageThreads] = useState<ChatThread[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const notificationRefreshId = useRef(0);

  useEffect(() => {
    let refreshId = 0;
    const syncAccount = () => {
      const id = ++refreshId;
      setMe(null);
      setUnread(0);
      setNotifCount(0);
      setNotifications([]);
      if (!localStorage.getItem('asiance_token')) return;

      getMe().then((user) => {
        if (id === refreshId) setMe(user);
      }).catch(() => {});
      getUnreadMessageCount().then((r) => {
        if (id === refreshId) setUnread(r.count);
      }).catch(() => {});
      getUnreadNotificationCount().then((r) => {
        if (id === refreshId) setNotifCount(r.count);
      }).catch(() => {});
    };
    syncAccount();
    window.addEventListener('asiance:auth-changed', syncAccount);
    window.addEventListener('storage', syncAccount);
    return () => {
      refreshId += 1;
      window.removeEventListener('asiance:auth-changed', syncAccount);
      window.removeEventListener('storage', syncAccount);
    };
  }, []);

  useEffect(() => {
    const refreshCount = () => {
      getUnreadNotificationCount().then((r) => setNotifCount(r.count)).catch(() => {});
    };
    window.addEventListener('asiance:notifications-changed', refreshCount);
    return () => window.removeEventListener('asiance:notifications-changed', refreshCount);
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setMobileMenuOpen(false);
    }

    function closeOnDesktop() {
      if (window.innerWidth > 1100) setMobileMenuOpen(false);
    }

    document.addEventListener('keydown', closeOnEscape);
    window.addEventListener('resize', closeOnDesktop);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', closeOnEscape);
      window.removeEventListener('resize', closeOnDesktop);
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    return onNotification((n) => {
      if (n.type === 'message') {
        setUnread((prev) => prev + 1);
      } else {
        setNotifCount((prev) => prev + 1);
      }
      setNotifications((prev) => [
        { _id: n._id, message: n.message, type: n.type, read: false, link: n.link, createdAt: n.createdAt },
        ...prev.filter((item) => !n._id || item._id !== n._id),
      ]);
      const refreshId = ++notificationRefreshId.current;
      getNotifications().then((list) => {
        if (refreshId === notificationRefreshId.current) {
          setNotifications(list ?? []);
          setNotifError(false);
        }
      }).catch(() => {}).finally(() => {
        if (refreshId === notificationRefreshId.current) setNotifLoading(false);
      });
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

  function loadNotifications() {
    const refreshId = ++notificationRefreshId.current;
    setNotifLoading(true);
    setNotifError(false);
    getNotifications()
      .then(async (list) => {
        if (refreshId !== notificationRefreshId.current) return;
        const items = list ?? [];
        if (items.some((item) => !item.read)) {
          try {
            await markAllNotificationsRead();
            if (refreshId !== notificationRefreshId.current) return;
            setNotifications(items.map((item) => ({ ...item, read: true })));
            setNotifCount(0);
            window.dispatchEvent(new Event('asiance:notifications-changed'));
            return;
          } catch {
            // Keep the unread state if the server could not save the change.
          }
        }
        if (refreshId === notificationRefreshId.current) setNotifications(items);
      })
      .catch(() => {
        if (refreshId === notificationRefreshId.current) setNotifError(true);
      })
      .finally(() => {
        if (refreshId === notificationRefreshId.current) setNotifLoading(false);
      });
  }

  async function removeNotification(notificationId: string) {
    const removedItem = notifications.find((item) => item._id === notificationId);
    setDeletingNotificationId(notificationId);
    try {
      await deleteNotification(notificationId);
      notificationRefreshId.current += 1;
      setNotifications((prev) => prev.filter((item) => item._id !== notificationId));
      if (removedItem && !removedItem.read && removedItem.type !== 'message') {
        setNotifCount((prev) => Math.max(0, prev - 1));
      }
      getUnreadNotificationCount().then((result) => setNotifCount(result.count)).catch(() => {});
    } catch {
      showAppToast('Could not delete notification. Please try again.', 'error');
    } finally {
      setDeletingNotificationId(null);
    }
  }

  function openNotifPanel() {
    if (notifPanelOpen) {
      setNotifPanelOpen(false);
      return;
    }
    setNotifPanelOpen(true);
    loadNotifications();
  }

  function loadMessageThreads() {
    setMessagesLoading(true);
    getChatThreads()
      .then((threads) => setMessageThreads(threads ?? []))
      .catch(() => setMessageThreads([]))
      .finally(() => setMessagesLoading(false));
  }

  function selectMobileTab(tab: MobileMenuTab) {
    setMobileTab(tab);
    if (tab === 'notifications') loadNotifications();
    if (tab === 'messages') loadMessageThreads();
  }

  function openMobileMenu() {
    setDropdownOpen(false);
    setNotifPanelOpen(false);
    setMobileTab('navigation');
    setMobileMenuOpen(true);
  }

  function logout() {
    localStorage.removeItem('asiance_token');
    localStorage.removeItem('asiance_user');
    window.dispatchEvent(new Event('asiance:auth-changed'));
    setMe(null);
    setMobileMenuOpen(false);
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
          <button
            type="button"
            className="mobile-menu-trigger"
            aria-label="Open menu"
            aria-expanded={mobileMenuOpen}
            onClick={openMobileMenu}
          >
            <Menu size={20} aria-hidden="true" />
          </button>

          {/* Bell — opens notification panel */}
          <div className="notif-bell-wrap nav-desktop-notification" ref={notifRef}>
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
                  ) : notifError ? (
                    <div className="notif-panel-empty">Could not load notifications. <button type="button" onClick={loadNotifications}>Try again</button></div>
                  ) : notifications.length === 0 ? (
                    <div className="notif-panel-empty">No notifications yet</div>
                  ) : (
                    notifications.slice(0, 20).map((n, i) => (
                      <div
                        key={n._id ?? i}
                        className={`notif-panel-item${n.read ? '' : ' notif-panel-item--unread'}`}
                      >
                        <span className="notif-panel-icon"><NotifIcon type={n.type} /></span>
                        <div className="notif-panel-content">
                          <a className="notif-panel-msg" href={n.link || '/notifications'} onClick={() => setNotifPanelOpen(false)}>{n.message}</a>
                          {n.createdAt && (
                            <span className="notif-panel-time">{formatNotifTime(n.createdAt)}</span>
                          )}
                        </div>
                        {!n.read && <span className="notif-panel-dot" />}
                        {n._id && <button type="button" className="notif-delete" aria-label={`Delete notification: ${n.message}`} title="Delete notification" disabled={deletingNotificationId === n._id} onClick={() => removeNotification(n._id!)}><Trash2 size={14} /></button>}
                      </div>
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
            className="nav-icon-link badge-wrap nav-desktop-message"
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

      {mobileMenuOpen ? (
        <div className="mobile-menu-layer">
          <button
            type="button"
            className="mobile-menu-backdrop"
            aria-label="Close menu"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="mobile-menu-drawer" aria-label="Mobile menu">
            <div className="mobile-menu-head">
              <span>Explore Asiance</span>
              <button
                type="button"
                className="mobile-menu-close"
                aria-label="Close menu"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>

            <div className="mobile-menu-tabs" role="tablist" aria-label="Mobile menu sections">
              <button
                type="button"
                role="tab"
                aria-selected={mobileTab === 'navigation'}
                className={mobileTab === 'navigation' ? 'is-active' : ''}
                onClick={() => selectMobileTab('navigation')}
              >
                <Menu size={17} aria-hidden="true" />
                Menu
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mobileTab === 'notifications'}
                className={mobileTab === 'notifications' ? 'is-active' : ''}
                onClick={() => selectMobileTab('notifications')}
              >
                <Bell size={17} aria-hidden="true" />
                Notifications
                {notifCount > 0 ? <span>{notifCount > 9 ? '9+' : notifCount}</span> : null}
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mobileTab === 'messages'}
                className={mobileTab === 'messages' ? 'is-active' : ''}
                onClick={() => selectMobileTab('messages')}
              >
                <MessageCircle size={17} aria-hidden="true" />
                Messages
                {unread > 0 ? <span>{unread > 9 ? '9+' : unread}</span> : null}
              </button>
            </div>

            <div className="mobile-menu-body">
              {mobileTab === 'navigation' ? (
                <nav className="mobile-menu-navigation" aria-label="Mobile navigation">
                  {nav.map(([label, href]) => (
                    <Link
                      href={href}
                      key={href}
                      className={active === label ? 'is-active' : ''}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {label}
                      <span aria-hidden="true">›</span>
                    </Link>
                  ))}
                </nav>
              ) : null}

              {mobileTab === 'notifications' ? (
                <div className="mobile-menu-feed" role="tabpanel">
                  {!me ? (
                    <div className="mobile-menu-empty">
                      <Bell size={24} aria-hidden="true" />
                      <p>Log in to see your notifications.</p>
                      <Link href="/login?redirect=%2Fnotifications" onClick={() => setMobileMenuOpen(false)}>
                        Log in
                      </Link>
                    </div>
                  ) : notifLoading ? (
                    <LoadingIndicator compact />
                  ) : notifError ? (
                    <div className="mobile-menu-empty">Could not load notifications. <button type="button" onClick={loadNotifications}>Try again</button></div>
                  ) : notifications.length ? (
                    <>
                      {notifications.slice(0, 6).map((notification, index) => (
                        <div
                          className="mobile-menu-feed-item"
                          key={notification._id ?? index}
                        >
                          <span className="mobile-menu-feed-icon">
                            <NotifIcon type={notification.type} />
                          </span>
                          <Link href={notification.link || '/notifications'} onClick={() => setMobileMenuOpen(false)} className="mobile-menu-feed-content">
                            <strong>{notification.message}</strong>
                            <small>{formatNotifTime(notification.createdAt)}</small>
                          </Link>
                          <i aria-label={notification.read ? undefined : 'Unread'} style={{ visibility: notification.read ? 'hidden' : 'visible' }} />
                          {notification._id && <button type="button" className="notif-delete" aria-label={`Delete notification: ${notification.message}`} disabled={deletingNotificationId === notification._id} onClick={() => removeNotification(notification._id!)}><Trash2 size={14} /></button>}
                        </div>
                      ))}
                      <Link
                        href="/notifications"
                        className="mobile-menu-view-all"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        View all notifications
                      </Link>
                    </>
                  ) : (
                    <div className="mobile-menu-empty">
                      <Bell size={24} aria-hidden="true" />
                      <p>No notifications yet.</p>
                    </div>
                  )}
                </div>
              ) : null}

              {mobileTab === 'messages' ? (
                <div className="mobile-menu-feed" role="tabpanel">
                  {!me ? (
                    <div className="mobile-menu-empty">
                      <MessageCircle size={24} aria-hidden="true" />
                      <p>Log in to see your messages.</p>
                      <Link href="/login?redirect=%2Fmessages" onClick={() => setMobileMenuOpen(false)}>
                        Log in
                      </Link>
                    </div>
                  ) : messagesLoading ? (
                    <LoadingIndicator compact />
                  ) : messageThreads.length ? (
                    <>
                      {messageThreads.slice(0, 6).map((thread) => {
                        const latestMessage = thread.messages[thread.messages.length - 1];

                        return (
                          <Link
                            href={`/messages?thread=${thread._id}`}
                            className="mobile-menu-feed-item"
                            key={thread._id}
                            onClick={() => {
                              setUnread(0);
                              setMobileMenuOpen(false);
                            }}
                          >
                            <span className="mobile-menu-feed-icon">
                              <MessageCircle size={14} aria-hidden="true" />
                            </span>
                            <span>
                              <strong>{threadDisplayName(thread.title, me.name)}</strong>
                              <small>{latestMessage?.body || 'Open conversation'}</small>
                            </span>
                          </Link>
                        );
                      })}
                      <Link
                        href="/messages"
                        className="mobile-menu-view-all"
                        onClick={() => {
                          setUnread(0);
                          setMobileMenuOpen(false);
                        }}
                      >
                        View all messages
                      </Link>
                    </>
                  ) : (
                    <div className="mobile-menu-empty">
                      <MessageCircle size={24} aria-hidden="true" />
                      <p>No messages yet.</p>
                      <Link href="/messages" onClick={() => setMobileMenuOpen(false)}>
                        Open messages
                      </Link>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}
