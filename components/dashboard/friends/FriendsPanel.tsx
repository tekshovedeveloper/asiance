"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../dashboard.module.css";
import {
  getFriendsList,
  getFriendRequests,
  getOutgoingRequests,
  getMembers,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
  sendFriendRequest,
  cancelFriendRequest,
  getMe,
  createOrGetChatThread,
  type FriendUser,
  type FriendRequest,
} from "@/lib/api";
import type { Member } from "@/lib/types";

const FALLBACK_AVATAR = "/assets/profile/dymmy-profile.jpeg";

type SubTab = "friendships" | "requests" | "all-members";
type SortOption = "last-active" | "newest" | "alphabetical";
type MemberStatus = "none" | "pending" | "accepted" | "me";

// ─── helpers ────────────────────────────────────────────────────────────────

function Avatar({ src, name }: { src?: string; name: string }) {
  return (
    <div className={styles.friendAvatar}>
      <img src={src?.trim() || FALLBACK_AVATAR} alt={name} className={styles.friendAvatarImg} />
    </div>
  );
}

function EmptyState() {
  return (
    <div className={styles.friendsEmptyBox}>
      <div className={styles.friendsEmptyIcon}>
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="10" fill="rgba(255,255,255,0.15)" stroke="white" />
          <line x1="12" y1="11" x2="12" y2="17" />
          <circle cx="12" cy="8" r="0.5" fill="white" stroke="white" strokeWidth="1.5" />
        </svg>
      </div>
      <span>Sorry, no members were found.</span>
    </div>
  );
}

// ─── friend row (accepted) ───────────────────────────────────────────────────

function FriendRow({ user, onRemove }: { user: FriendUser; onRemove: () => Promise<void> }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msgBusy, setMsgBusy] = useState(false);

  async function handleMessage() {
    const userId = user._id.toString();
    if (!userId || msgBusy) return;
    setMsgBusy(true);
    try {
      const thread = await createOrGetChatThread(userId);
      router.push(`/messages?thread=${thread._id}`);
    } catch (err) {
      alert((err as Error)?.message ?? 'Could not open chat.');
    } finally { setMsgBusy(false); }
  }

  return (
    <div className={styles.friendCard}>
      <Avatar src={user.avatar} name={user.name} />
      <div className={styles.friendInfo}>
        <div className={styles.friendName}>{user.name}</div>
        <div className={styles.friendHandle}>@{user.handle}</div>
        <div className={styles.friendStatus}>{user.status || "Member"}</div>
      </div>
      <div className={styles.friendActions}>
        <a href={`/members/${user.handle}`} className={styles.friendBtn}>Profile</a>
        <button type="button" className={styles.friendBtn} onClick={handleMessage} disabled={msgBusy}>
          {msgBusy ? "…" : "Message"}
        </button>
        <button
          type="button"
          className={styles.friendBtnDanger}
          onClick={async () => { setBusy(true); try { await onRemove(); } finally { setBusy(false); } }}
          disabled={busy}
        >
          {busy ? "…" : "Unfriend"}
        </button>
      </div>
    </div>
  );
}

// ─── request row (incoming) ──────────────────────────────────────────────────

function RequestRow({
  request,
  onAccept,
  onReject,
}: {
  request: FriendRequest;
  onAccept: () => Promise<void>;
  onReject: () => Promise<void>;
}) {
  const [busy, setBusy] = useState<"accept" | "reject" | null>(null);
  const handle = async (action: "accept" | "reject") => {
    setBusy(action);
    try {
      action === "accept" ? await onAccept() : await onReject();
    } catch (err) {
      console.error(`Failed to ${action} friend request:`, err);
      alert((err as Error)?.message ?? `Failed to ${action} request. Please try again.`);
    } finally {
      setBusy(null);
    }
  };
  return (
    <div className={styles.friendCard}>
      <Avatar src={request.avatar} name={request.name} />
      <div className={styles.friendInfo}>
        <div className={styles.friendName}>{request.name}</div>
        <div className={styles.friendHandle}>@{request.handle}</div>
        <div className={styles.friendStatus}>Sent you a friend request</div>
      </div>
      <div className={styles.friendActions}>
        <a href={`/members/${request.handle}`} className={styles.friendBtn}>Profile</a>
        <button
          type="button"
          className={styles.friendBtnAccept}
          onClick={() => handle("accept")}
          disabled={busy !== null}
        >
          {busy === "accept" ? "…" : "Accept"}
        </button>
        <button
          type="button"
          className={styles.friendBtnDanger}
          onClick={() => handle("reject")}
          disabled={busy !== null}
        >
          {busy === "reject" ? "…" : "Reject"}
        </button>
      </div>
    </div>
  );
}

// ─── all-members row ─────────────────────────────────────────────────────────

function MemberRow({
  member,
  status,
  onStatusChange,
}: {
  member: Member;
  status: MemberStatus;
  onStatusChange: (id: string, s: MemberStatus) => void;
}) {
  const [busy, setBusy] = useState(false);
  const memberId = (member.id ?? member._id ?? "").toString();

  const handleAdd = async () => {
    if (!memberId || status !== "none") return;
    setBusy(true);
    try {
      await sendFriendRequest(memberId);
      onStatusChange(memberId, "pending");
    } catch { /* not logged in */ }
    finally { setBusy(false); }
  };

  const handleCancel = async () => {
    if (!memberId || status !== "pending") return;
    setBusy(true);
    try {
      await cancelFriendRequest(memberId);
      onStatusChange(memberId, "none");
    } catch { /* error */ }
    finally { setBusy(false); }
  };

  return (
    <div className={styles.friendCard}>
      <Avatar src={member.avatar} name={member.name} />
      <div className={styles.friendInfo}>
        <div className={styles.friendName}>{member.name}</div>
        <div className={styles.friendHandle}>@{member.handle}</div>
        <div className={styles.friendStatus}>{member.status || "Member"}</div>
      </div>
      <div className={styles.friendActions}>
        <a href={`/members/${member.handle}`} className={styles.friendBtn}>Profile</a>

        {status === "me" && (
          <span className={styles.friendBtnSelf}>You</span>
        )}

        {status === "accepted" && (
          <span className={styles.friendBtnFriends}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            Friends
          </span>
        )}

        {status === "pending" && (
          <button
            type="button"
            className={styles.friendBtnCancel}
            onClick={handleCancel}
            disabled={busy}
          >
            {busy ? "…" : (
              <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
                Cancel Request
              </>
            )}
          </button>
        )}

        {status === "none" && (
          <button
            type="button"
            className={styles.friendBtnAdd}
            onClick={handleAdd}
            disabled={busy}
          >
            {busy ? "…" : (
              <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <line x1="19" y1="8" x2="19" y2="14" />
                  <line x1="16" y1="11" x2="22" y2="11" />
                </svg>
                Add Friend
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── main panel ─────────────────────────────────────────────────────────────

export function FriendsPanel() {
  const [subTab, setSubTab] = useState<SubTab>("friendships");
  const [sort, setSort] = useState<SortOption>("last-active");

  const [friends, setFriends] = useState<FriendUser[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [allMembers, setAllMembers] = useState<Member[]>([]);
  const [memberStatuses, setMemberStatuses] = useState<Record<string, MemberStatus>>({});
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [allLoaded, setAllLoaded] = useState(false);

  // Load friendships + requests + current user once
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const me = await getMe();
        setCurrentUserId(me.id ?? null);
        const [f, r] = await Promise.all([getFriendsList(), getFriendRequests()]);
        setFriends(f);
        setRequests(r);
      } catch { /* not logged in */ }
      finally { setLoading(false); }
    }
    load();
  }, []);

  // Load all members + statuses when "All Members" tab is first opened
  useEffect(() => {
    if (subTab !== "all-members" || allLoaded) return;

    async function loadAll() {
      setLoading(true);
      try {
        const [members, outgoing, friendList] = await Promise.all([
          getMembers(),
          getOutgoingRequests(),
          getFriendsList(),
        ]);
        setAllMembers(members);
        const statuses: Record<string, MemberStatus> = {};
        if (currentUserId) statuses[currentUserId] = "me";
        for (const f of friendList) statuses[f._id.toString()] = "accepted";
        for (const o of outgoing) statuses[o.userId] = "pending";
        setMemberStatuses(statuses);
        setAllLoaded(true);
      } catch { /* ignore */ }
      finally { setLoading(false); }
    }
    loadAll();
  }, [subTab, currentUserId, allLoaded]);

  const applySort = <T extends { name?: string }>(list: T[]): T[] => {
    if (sort === "alphabetical") return [...list].sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""));
    return list;
  };

  const handleStatusChange = (userId: string, newStatus: MemberStatus) =>
    setMemberStatuses((prev) => ({ ...prev, [userId]: newStatus }));

  const isEmpty =
    !loading && (
      (subTab === "friendships" && friends.length === 0) ||
      (subTab === "requests" && requests.length === 0) ||
      (subTab === "all-members" && allMembers.length === 0)
    );

  return (
    <div className={styles.friendsContainer}>
      {/* Sub-tab bar */}
      <div className={styles.friendsSubTabBar}>
        {(["friendships", "requests", "all-members"] as SubTab[]).map((tab) => (
          <button
            key={tab}
            type="button"
            className={`${styles.friendsSubTab} ${subTab === tab ? styles.friendsSubTabActive : ""}`}
            onClick={() => setSubTab(tab)}
          >
            {tab === "friendships" && "Friendships"}
            {tab === "requests" && (
              <>
                Requests
                {requests.length > 0 && <span className={styles.friendsBadge}>{requests.length}</span>}
              </>
            )}
            {tab === "all-members" && "All Members"}
          </button>
        ))}
      </div>

      {/* Sort row */}
      <div className={styles.friendsSortRow}>
        <select
          className={styles.friendsSort}
          value={sort}
          onChange={(e) => setSort(e.target.value as SortOption)}
        >
          <option value="last-active">Last Active</option>
          <option value="newest">Newest</option>
          <option value="alphabetical">Alphabetical</option>
        </select>
      </div>

      {/* Content */}
      {loading ? (
        <div className={styles.friendsLoading}>Loading…</div>
      ) : isEmpty ? (
        <EmptyState />
      ) : subTab === "friendships" ? (
        <div className={styles.friendsList}>
          {applySort(friends).map((f) => (
            <FriendRow
              key={String(f._id)}
              user={f}
              onRemove={async () => {
                await removeFriend(String(f._id));
                setFriends((prev) => prev.filter((x) => x._id !== f._id));
              }}
            />
          ))}
        </div>
      ) : subTab === "requests" ? (
        <div className={styles.friendsList}>
          {applySort(requests).map((r) => (
            <RequestRow
              key={String(r.friendshipId)}
              request={r}
              onAccept={async () => {
                await acceptFriendRequest(String(r.friendshipId));
                setRequests((prev) => prev.filter((x) => x.friendshipId !== r.friendshipId));
              }}
              onReject={async () => {
                await rejectFriendRequest(String(r.friendshipId));
                setRequests((prev) => prev.filter((x) => x.friendshipId !== r.friendshipId));
              }}
            />
          ))}
        </div>
      ) : (
        <div className={styles.friendsList}>
          {applySort(allMembers).map((m) => {
            const mid = (m.id ?? m._id ?? "").toString();
            return (
              <MemberRow
                key={m.handle}
                member={m}
                status={memberStatuses[mid] ?? "none"}
                onStatusChange={handleStatusChange}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
