'use client';

import Link from 'next/link';
import {
  ChevronRight,
  Heart,
  MessageCircle,
  Package,
  UserRound,
  UsersRound,
  type LucideIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { getMe } from '@/lib/api';

const shortcuts: Array<{ label: string; href: string; icon: LucideIcon }> = [
  { label: 'My Profile', href: '/dashboard?tab=profile', icon: UserRound },
  { label: 'My Communities', href: '/circles', icon: UsersRound },
  { label: 'Saved', href: '/saved', icon: Heart },
  { label: 'My Orders', href: '/dashboard?tab=orders', icon: Package },
  { label: 'Messages', href: '/messages', icon: MessageCircle },
];

type StoredUser = {
  name?: string;
};

function readStoredUser(): StoredUser | null {
  try {
    const value = window.localStorage.getItem('asiance_user');
    return value ? (JSON.parse(value) as StoredUser) : null;
  } catch {
    window.localStorage.removeItem('asiance_user');
    return null;
  }
}

export function CommunityHeroAccount() {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = window.localStorage.getItem('asiance_token');

    if (!token) return;

    setIsLoggedIn(true);
    setUser(readStoredUser());

    void getMe()
      .then((currentUser) => {
        setUser(currentUser);
        window.localStorage.setItem('asiance_user', JSON.stringify(currentUser));
      })
      .catch(() => {
        window.localStorage.removeItem('asiance_token');
        window.localStorage.removeItem('asiance_user');
        setUser(null);
        setIsLoggedIn(false);
      });
  }, []);

  const firstName = user?.name?.trim().split(/\s+/)[0];

  return (
    <aside className="community-hero__account" aria-label="Account shortcuts">
      <div className="community-hero__account-heading">
        <p>
          {isLoggedIn ? 'Welcome back,' : 'Welcome to Asiance,'}
          <strong>{isLoggedIn ? firstName || 'Member' : 'New member'}</strong>
        </p>
        <Heart size={23} aria-hidden="true" />
      </div>
      <nav className="community-hero__account-links" aria-label="Your account">
        {shortcuts.map(({ label, href, icon: Icon }) => {
          const destination = isLoggedIn
            ? href
            : `/login?redirect=${encodeURIComponent(href)}`;

          return (
            <Link href={destination} key={label}>
              <Icon size={18} aria-hidden="true" />
              <span>{label}</span>
              <ChevronRight size={16} aria-hidden="true" />
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
