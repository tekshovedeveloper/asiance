'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getMe } from '@/lib/api';

export function HomeMembershipCta() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = window.localStorage.getItem('asiance_token');

    if (!token) return;

    setIsLoggedIn(true);

    void getMe().catch(() => {
      window.localStorage.removeItem('asiance_token');
      window.localStorage.removeItem('asiance_user');
      setIsLoggedIn(false);
    });
  }, []);

  return (
    <section className="home-cta">
      <div>
        <span className="eyebrow">membership</span>
        <h2>
          Join the <em>circle</em>.
        </h2>
      </div>
      <Link href={isLoggedIn ? '/circles' : '/register'} className="btn">
        {isLoggedIn ? 'View the circles' : 'Create your account'}
      </Link>
    </section>
  );
}
