'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { API_URL, getTopMembers } from '@/lib/api';
import styles from './dashboard.module.css';

const API_ORIGIN = API_URL.replace(/\/api\/?$/, '');

function resolveAvatar(url?: string) {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('blob:') || url.startsWith('data:')) return url;
  return `${API_ORIGIN}${url}`;
}

function initials(name: string) {
  return name.trim().split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}

type TopMember = {
  _id: string;
  name: string;
  handle: string;
  avatar: string;
  bio: string;
  friendCount: number;
};

export function FeaturedMemberCard() {
  const [members, setMembers] = useState<TopMember[]>([]);

  useEffect(() => {
    getTopMembers().then((data) => setMembers(data ?? [])).catch(() => {});
  }, []);

  return (
    <section className={styles.card}>
      <div className={styles.cardHead}>
        <div style={{ fontFamily: 'var(--serif)', fontWeight: 300, fontSize: 15, letterSpacing: '-0.01em' }}>
          Featured Members
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '12px 0 4px' }}>
        {members.length === 0 && (
          <p style={{ fontSize: 12, color: '#7a6f80', fontFamily: 'var(--mono)', textAlign: 'center', padding: '12px 0' }}>
            No members yet
          </p>
        )}

        {members.map((m) => {
          const avatarSrc = resolveAvatar(m.avatar);
          return (
            <div key={m._id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {/* Avatar */}
              <div style={{
                width: 42, height: 42, borderRadius: '50%', flexShrink: 0,
                background: 'rgba(122,44,138,0.12)', overflow: 'hidden',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '2px solid rgba(122,44,138,0.20)',
              }}>
                {avatarSrc
                  ? <img src={avatarSrc} alt={m.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <span style={{ fontFamily: 'var(--serif)', fontWeight: 700, fontSize: 14, color: '#7a2c8a' }}>{initials(m.name)}</span>
                }
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--serif)', fontWeight: 300, fontSize: 14, letterSpacing: '-0.01em', color: '#2B3A42', lineHeight: 1.1 }}>
                  {m.name}
                </div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.10em', textTransform: 'uppercase', color: '#5a1f68', marginTop: 2 }}>
                  {m.friendCount} friend{m.friendCount !== 1 ? 's' : ''}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <Link
                  href={`/members/${m.handle}`}
                  style={{
                    padding: '5px 11px', borderRadius: 999,
                    border: '1px solid rgba(18,59,90,0.12)',
                    background: 'rgba(255,255,255,0.95)', color: '#5a1f68',
                    fontFamily: 'var(--sans)', fontSize: 10, fontWeight: 600,
                    letterSpacing: '0.04em', textTransform: 'uppercase',
                    textDecoration: 'none', whiteSpace: 'nowrap',
                  }}
                >
                  Profile
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
