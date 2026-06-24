'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MessageCircle, UserPlus, UserCheck, UserX, X } from 'lucide-react';
import { MemberActivityFeed } from '@/components/MemberActivityFeed';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import {
  getMemberActivity,
  getMe,
  getMember,
  getFriendsList,
  getOutgoingRequests,
  getFriendRequests,
  sendFriendRequest,
  cancelFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  createOrGetChatThread,
  type FriendRequest,
} from '@/lib/api';
import type { Activity, Member } from '@/lib/types';

type FriendStatus = 'none' | 'pending-out' | 'pending-in' | 'accepted' | 'me';

export default function MemberProfilePage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = use(params);
  const router = useRouter();

  const [member, setMember] = useState<Member | null>(null);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [myId, setMyId] = useState<string | null>(null);
  const [friendStatus, setFriendStatus] = useState<FriendStatus>('none');
  const [incomingReqId, setIncomingReqId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      setLoading(true);
      try {
        const [m, acts] = await Promise.all([getMember(handle), getMemberActivity(handle)]);
        setMember(m);
        setActivity(acts);

        const token = localStorage.getItem('asiance_token');
        if (!token) return;

        const me = await getMe();
        setMyId(me.id ?? null);

        const memberId = ((m as any).id ?? (m as any)._id ?? '').toString();

        if (me.id && memberId === me.id) {
          setFriendStatus('me');
          return;
        }

        const [friends, outgoing, incoming] = await Promise.all([
          getFriendsList(),
          getOutgoingRequests(),
          getFriendRequests(),
        ]);

        if (friends.some((f) => f._id.toString() === memberId)) {
          setFriendStatus('accepted');
        } else if (outgoing.some((o) => o.userId === memberId)) {
          setFriendStatus('pending-out');
        } else {
          const req = incoming.find((r) => r.requesterId?.toString() === memberId?.toString()) as FriendRequest | undefined;
          if (req) {
            setFriendStatus('pending-in');
            setIncomingReqId(req.friendshipId?.toString() ?? null);
          } else {
            setFriendStatus('none');
          }
        }
      } catch {
        // not logged in or member not found
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [handle]);

  async function handleAddFriend() {
    if (!member || busy) return;
    const memberId = ((member as any).id ?? (member as any)._id ?? '').toString();
    setBusy(true);
    try {
      await sendFriendRequest(memberId);
      setFriendStatus('pending-out');
    } catch { /* ignore */ }
    finally { setBusy(false); }
  }

  async function handleCancelRequest() {
    if (!member || busy) return;
    const memberId = ((member as any).id ?? (member as any)._id ?? '').toString();
    setBusy(true);
    try {
      if (friendStatus === 'pending-in' && incomingReqId) {
        await rejectFriendRequest(incomingReqId);
      } else {
        await cancelFriendRequest(memberId);
      }
      setFriendStatus('none');
      setIncomingReqId(null);
    } catch (err) {
      console.error('Cancel/decline request failed:', err);
    } finally {
      setBusy(false);
    }
  }

  async function handleAcceptRequest() {
    if (!incomingReqId || busy) return;
    setBusy(true);
    try {
      await acceptFriendRequest(incomingReqId);
      setFriendStatus('accepted');
      setIncomingReqId(null);
    } catch (err) {
      console.error('Accept request failed:', err);
      alert((err as Error)?.message ?? 'Failed to accept request. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  async function handleMessage() {
    if (!member || busy) return;
    const memberId = ((member as any).id ?? (member as any)._id ?? '').toString();
    setBusy(true);
    try {
      const thread = await createOrGetChatThread(memberId);
      router.push(`/messages?thread=${thread._id}`);
    } catch (err) {
      alert((err as Error)?.message ?? 'Could not open chat.');
    } finally {
      setBusy(false);
    }
  }

  if (loading || !member) {
    return (
      <main>
        <SiteHeader active="Members" />
        <div style={{ padding: '80px 20px', textAlign: 'center', color: 'var(--ink-muted)' }}>
          Loading profile…
        </div>
      </main>
    );
  }

  return (
    <main>
      <SiteHeader active="Members" />
      <div className="profile-cover" />
      <section className="profile-head">
        <div style={{ display: 'flex', alignItems: 'end', gap: 20 }}>
          <img className="profile-avatar" src={member.avatar} alt={member.name} />
          <div>
            <h1 className="profile-name">{member.name}</h1>
            <div className="profile-handle">
              @{member.handle} · {member.location}
            </div>
            <span className="small-link">{member.status}</span>
          </div>
        </div>

        {friendStatus !== 'me' && (
          <div className="profile-actions">
            {/* Message button — only if friends */}
            {friendStatus === 'accepted' && (
              <button className="btn" type="button" onClick={handleMessage} disabled={busy}>
                <MessageCircle size={15} /> {busy ? '…' : 'Message'}
              </button>
            )}

            {/* Add friend */}
            {friendStatus === 'none' && (
              <button className="btn btn-dark" type="button" onClick={handleAddFriend} disabled={busy}>
                <UserPlus size={15} /> {busy ? 'Sending…' : 'Add Friend'}
              </button>
            )}

            {/* Cancel outgoing request */}
            {friendStatus === 'pending-out' && (
              <button className="btn" type="button" onClick={handleCancelRequest} disabled={busy}>
                <X size={15} /> {busy ? '…' : 'Request Sent (Cancel)'}
              </button>
            )}

            {/* Accept incoming request */}
            {friendStatus === 'pending-in' && (
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-dark" type="button" onClick={handleAcceptRequest} disabled={busy}>
                  <UserCheck size={15} /> {busy ? '…' : 'Accept Request'}
                </button>
                <button className="btn" type="button" onClick={handleCancelRequest} disabled={busy}>
                  <UserX size={15} /> Decline
                </button>
              </div>
            )}

            {/* Already friends badge */}
            {friendStatus === 'accepted' && (
              <span className="pill" style={{ background: 'var(--brand-soft)', color: '#fff' }}>
                <UserCheck size={13} /> Friends
              </span>
            )}
          </div>
        )}
      </section>

      <section className="profile-layout">
        <aside className="profile-side">
          <h2>about</h2>
          <p>{member.bio}</p>
          <h2>interests</h2>
          <div className="shop-toolbar" style={{ padding: 0 }}>
            {(member.interests ?? []).map((interest) => (
              <span className="pill" key={interest}>{interest}</span>
            ))}
          </div>
        </aside>
        <div className="profile-feed">
          <div className="section-head">
            <div>
              <span className="eyebrow">profile activity</span>
              <h2>recent <em>updates.</em></h2>
            </div>
          </div>
          <MemberActivityFeed items={activity} />
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
