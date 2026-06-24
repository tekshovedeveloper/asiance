'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { joinGroup, leaveGroup } from '@/lib/api';
import type { Group } from '@/lib/types';

export function GroupCard({ group }: { group: Group }) {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [memberStatus, setMemberStatus] = useState<'member' | 'pending' | 'none'>('none');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem('asiance_user') ?? 'null');
      setCurrentUser(u);
      if (u?.id) {
        const members = (group.members ?? []) as string[];
        const pending = (group.pendingMembers ?? []) as string[];
        if (members.some((m: any) => m === u.id || m?.toString?.() === u.id)) {
          setMemberStatus('member');
        } else if (pending.some((m: any) => m === u.id || m?.toString?.() === u.id)) {
          setMemberStatus('pending');
        }
      }
    } catch {
      setCurrentUser(null);
    }
  }, [group.members, group.pendingMembers]);

  async function handleJoin() {
    if (!currentUser) return;
    setLoading(true);
    try {
      const res = await joinGroup(group.slug);
      setMemberStatus(res.status === 'pending' ? 'pending' : 'member');
    } catch {}
    finally { setLoading(false); }
  }

  async function handleLeave() {
    if (!currentUser) return;
    setLoading(true);
    try {
      await leaveGroup(group.slug);
      setMemberStatus('none');
    } catch {}
    finally { setLoading(false); }
  }

  return (
    <article className="group-card">
      <Link href={`/circles/${group.slug}`} className="group-image">
        <img src={group.image} alt={group.name} />
      </Link>
      <div className="group-body">
        <div className="group-topline">
          <span>{group.privacy}</span>
          <span>{group.membersCount} members</span>
        </div>
        <h3>{group.name}</h3>
        <p>{group.description}</p>
        <div className="group-actions">
          <Link href={`/circles/${group.slug}`} className="small-link">
            View circle
          </Link>
          {memberStatus === 'member' ? (
            <button className="small-button small-button-leave" type="button" onClick={handleLeave} disabled={loading}>
              {loading ? '…' : 'Leave'}
            </button>
          ) : memberStatus === 'pending' ? (
            <button className="small-button" type="button" disabled>
              Pending
            </button>
          ) : (
            <button className="small-button" type="button" onClick={handleJoin} disabled={loading || !currentUser}>
              {loading ? '…' : group.privacy === 'private' ? 'Request' : 'Join'}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
