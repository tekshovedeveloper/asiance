'use client';

import { useEffect, useRef, useState } from 'react';
import {
  API_URL,
  commentOnActivity,
  createActivity,
  deleteActivity,
  getFavorites,
  getGroupActivity,
  getGroupMembers,
  joinGroup,
  leaveGroup,
  likeActivity,
  reactToActivity,
  saveFavorite,
  updateActivity,
  uploadMedia,
} from '@/lib/api';
import type { Activity, Group, GroupMember } from '@/lib/types';
import { MediaGrid } from './MediaGrid';

const API_ORIGIN = API_URL.replace(/\/api\/?$/, '');

function resolveMediaUrl(url: string) {
  if (!url || url.startsWith('http') || url.startsWith('blob:') || url.startsWith('data:')) return url;
  return `${API_ORIGIN}${url}`;
}

function detectMediaType(urlOrMime: string): string {
  const s = urlOrMime.toLowerCase();
  if (s.startsWith('video/') || /\.(mp4|mov|webm|avi|mkv)(\?|$)/.test(s)) return 'video';
  if (s.startsWith('audio/') || /\.(mp3|wav|ogg|aac|flac)(\?|$)/.test(s)) return 'audio';
  if (
    s.startsWith('application/') ||
    s.startsWith('text/plain') ||
    /\.(pdf|doc|docx|xls|xlsx|ppt|pptx|txt)(\?|$)/.test(s)
  ) return 'file';
  return 'image';
}

function firstLetter(value?: string) {
  return value?.trim().slice(0, 1).toUpperCase() || 'U';
}

function formatDate(value?: string) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat('en', {
    year: 'numeric', month: 'short', day: '2-digit',
    hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'UTC',
  }).format(d);
}

const REACTIONS = ['like', 'love', 'celebrate', 'laugh', 'sad', 'angry'] as const;

type Tab = 'feed' | 'members';

export function GroupPage({ group: initialGroup }: { group: Group }) {
  const [group, setGroup] = useState(initialGroup);
  const [tab, setTab] = useState<Tab>('feed');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [memberStatus, setMemberStatus] = useState<'member' | 'pending' | 'none'>('none');
  const [joinLoading, setJoinLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  // Feed state
  const [feedItems, setFeedItems] = useState<Activity[]>([]);
  const [feedLoading, setFeedLoading] = useState(false);
  const [feedError, setFeedError] = useState('');

  // Composer state
  const [composerText, setComposerText] = useState('');
  const [composerMedia, setComposerMedia] = useState<Array<{ type: string; url: string; caption?: string }>>([]);
  const [composerPrivacy, setComposerPrivacy] = useState<'public' | 'friends' | 'group' | 'private'>('group');
  const [composerPosting, setComposerPosting] = useState(false);
  const [composerUploading, setComposerUploading] = useState(false);
  const composerFileRef = useRef<HTMLInputElement>(null);

  // Save state
  const [savedIds, setSavedIds] = useState<string[]>([]);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [editingMedia, setEditingMedia] = useState<Activity['media']>([]);
  const [uploadingEditMedia, setUploadingEditMedia] = useState(false);

  // Members state
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);

  // Comment state
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [openComments, setOpenComments] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem('asiance_user') ?? 'null');
      setCurrentUser(u);
    } catch {
      setCurrentUser(null);
    }
  }, []);

  useEffect(() => {
    let active = true;
    getFavorites().then((favs) => {
      if (!active) return;
      setSavedIds(favs.map((f) => f._id ?? '').filter(Boolean));
    }).catch(() => {});
    return () => { active = false; };
  }, []);

  // Determine membership status
  useEffect(() => {
    if (!currentUser?.id) { setMemberStatus('none'); return; }
    const id = currentUser.id;
    const members = (group.members ?? []) as string[];
    const pending = (group.pendingMembers ?? []) as string[];
    if (members.some((m) => m === id || (m as any)?.toString?.() === id)) {
      setMemberStatus('member');
    } else if (pending.some((m) => m === id || (m as any)?.toString?.() === id)) {
      setMemberStatus('pending');
    } else {
      setMemberStatus('none');
    }
  }, [currentUser, group]);

  // Load feed when tab = feed
  useEffect(() => {
    if (tab !== 'feed') return;
    if (group.privacy === 'private' && memberStatus !== 'member') {
      setFeedError('This is a private group. Join to see posts.');
      return;
    }
    setFeedError('');
    setFeedLoading(true);
    getGroupActivity(group.slug)
      .then(setFeedItems)
      .catch(() => setFeedError('Could not load posts.'))
      .finally(() => setFeedLoading(false));
  }, [tab, group.slug, group.privacy, memberStatus]);

  // Load members when tab = members
  useEffect(() => {
    if (tab !== 'members') return;
    if (group.privacy === 'private' && memberStatus !== 'member') return;
    setMembersLoading(true);
    getGroupMembers(group.slug)
      .then(setMembers)
      .catch(() => {})
      .finally(() => setMembersLoading(false));
  }, [tab, group.slug, group.privacy, memberStatus]);

  async function handleJoin() {
    if (!currentUser) { setStatusMsg('Please sign in to join.'); return; }
    setJoinLoading(true);
    try {
      const res = await joinGroup(group.slug);
      if (res.status === 'pending') {
        setGroup((prev) => ({
          ...prev,
          pendingMembers: [...((prev.pendingMembers ?? []) as string[]), currentUser.id],
        }));
        setStatusMsg('Join request sent — awaiting admin approval.');
      } else {
        setGroup((prev) => ({
          ...prev,
          membersCount: prev.membersCount + 1,
          members: [...((prev.members ?? []) as string[]), currentUser.id],
        }));
        setStatusMsg('');
      }
    } catch (e) {
      setStatusMsg(e instanceof Error ? e.message : 'Could not join group.');
    } finally {
      setJoinLoading(false);
    }
  }

  async function handleLeave() {
    if (!currentUser) return;
    setJoinLoading(true);
    try {
      await leaveGroup(group.slug);
      const uid = currentUser.id;
      setGroup((prev) => ({
        ...prev,
        membersCount: Math.max(0, prev.membersCount - 1),
        members: ((prev.members ?? []) as string[]).filter(
          (m) => m !== uid && (m as any)?.toString?.() !== uid,
        ),
        pendingMembers: ((prev.pendingMembers ?? []) as string[]).filter(
          (m) => m !== uid && (m as any)?.toString?.() !== uid,
        ),
      }));
      setFeedItems([]);
      setStatusMsg('');
    } catch (e) {
      setStatusMsg(e instanceof Error ? e.message : 'Could not leave group.');
    } finally {
      setJoinLoading(false);
    }
  }

  async function handleComposerUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.currentTarget.files?.[0];
    if (!file) return;
    setComposerUploading(true);
    try {
      const url = await uploadMedia(file);
      setComposerMedia((prev) => [...prev, { type: detectMediaType(file.type), url }]);
    } catch {}
    finally {
      setComposerUploading(false);
      e.currentTarget.value = '';
    }
  }

  async function handlePost() {
    if (!composerText.trim()) return;
    setComposerPosting(true);
    try {
      const item = await createActivity({
        text: composerText.trim(),
        groupSlug: group.slug,
        privacy: composerPrivacy,
        media: composerMedia,
      });
      setFeedItems((prev) => [item, ...prev]);
      setComposerText('');
      setComposerMedia([]);
    } catch (e) {
      setStatusMsg(e instanceof Error ? e.message : 'Could not post.');
    } finally {
      setComposerPosting(false);
    }
  }

  function isLikedByCurrentUser(item: Activity) {
    if (!currentUser?.id) return false;
    return (item.likedBy ?? []).some((id) => id?.toString() === currentUser.id);
  }

  async function toggleSave(activityId: string) {
    try {
      const result = await saveFavorite(activityId);
      setSavedIds((prev) =>
        result.saved ? (prev.includes(activityId) ? prev : [...prev, activityId]) : prev.filter((id) => id !== activityId),
      );
    } catch {}
  }

  async function handleLike(activityId: string) {
    try {
      const updated = await likeActivity(activityId);
      setFeedItems((prev) => prev.map((item) => (item._id === activityId ? updated : item)));
    } catch {}
  }

  async function handleReact(activityId: string, reaction: string) {
    try {
      const updated = await reactToActivity(activityId, reaction);
      setFeedItems((prev) => prev.map((item) => (item._id === activityId ? updated : item)));
    } catch {}
  }

  async function handleComment(activityId: string) {
    const body = commentDrafts[activityId]?.trim();
    if (!body) return;
    try {
      const updated = await commentOnActivity(activityId, { body });
      setFeedItems((prev) => prev.map((item) => (item._id === activityId ? updated : item)));
      setCommentDrafts((prev) => ({ ...prev, [activityId]: '' }));
      setOpenComments((prev) => ({ ...prev, [activityId]: true }));
    } catch {}
  }

  async function handleUpdate(activityId: string) {
    const text = editingText.trim();
    if (!text) return;
    const updated = await updateActivity(activityId, { text, media: editingMedia ?? [] });
    setFeedItems((prev) => prev.map((item) => (item._id === activityId ? updated : item)));
    setEditingId(null);
    setEditingText('');
    setEditingMedia([]);
  }

  async function handleEditMediaUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    if (!file) return;
    setUploadingEditMedia(true);
    try {
      const url = await uploadMedia(file);
      setEditingMedia((prev) => [...(prev ?? []), { type: detectMediaType(file.type), url }]);
    } catch {}
    finally {
      setUploadingEditMedia(false);
      event.currentTarget.value = '';
    }
  }

  async function handleDelete(activityId: string) {
    await deleteActivity(activityId);
    setFeedItems((prev) => prev.filter((item) => item._id !== activityId));
  }

  const coverSrc = resolveMediaUrl(group.coverPhoto || '');
  const profileSrc = resolveMediaUrl(group.profilePicture || group.image || '');
  const canPost = memberStatus === 'member';
  const canSeeFeed = group.privacy === 'public' || memberStatus === 'member';

  return (
    <div className="group-page">
      {/* Cover + Profile header */}
      <div className="group-cover-wrap">
        {coverSrc
          ? <img src={coverSrc} alt="cover" className="group-cover-photo" />
          : <div className="group-cover-placeholder" />
        }
        <div className="group-header-row">
          <div className="group-avatar-wrap">
            {profileSrc
              ? <img src={profileSrc} alt={group.name} className="group-avatar" />
              : <div className="group-avatar-fallback">{firstLetter(group.name)}</div>
            }
          </div>
          <div className="group-header-info">
            <h1 className="group-name">{group.name}</h1>
            <div className="group-meta-row">
              {group.groupTypeSlug ? <span className="group-type-badge">{group.groupTypeSlug}</span> : null}
              <span className="group-privacy-badge">{group.privacy}</span>
              <span className="group-member-count">{group.membersCount} members</span>
            </div>
            {(group.bio || group.description) ? (
              <p className="group-bio">{group.bio || group.description}</p>
            ) : null}
          </div>
          <div className="group-join-area">
            {memberStatus === 'member' ? (
              <button
                className="btn btn-light group-join-btn"
                type="button"
                onClick={handleLeave}
                disabled={joinLoading}
              >
                {joinLoading ? '…' : 'Leave Group'}
              </button>
            ) : memberStatus === 'pending' ? (
              <span className="group-pending-badge">Request Pending</span>
            ) : (
              <button
                className="btn btn-dark group-join-btn"
                type="button"
                onClick={handleJoin}
                disabled={joinLoading}
              >
                {joinLoading ? '…' : group.privacy === 'private' ? 'Request to Join' : 'Join Group'}
              </button>
            )}
            {statusMsg ? <p className="form-status" style={{ marginTop: 6 }}>{statusMsg}</p> : null}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="group-tabs">
        <button
          type="button"
          className={`group-tab${tab === 'feed' ? ' active' : ''}`}
          onClick={() => setTab('feed')}
        >
          Posts
        </button>
        <button
          type="button"
          className={`group-tab${tab === 'members' ? ' active' : ''}`}
          onClick={() => setTab('members')}
        >
          Members ({group.membersCount})
        </button>
      </div>

      {/* Tab content */}
      <div className="group-tab-content section" style={{ paddingTop: 0 }}>

        {/* ── Feed tab ── */}
        {tab === 'feed' ? (
          <div className="group-feed-layout">
            <div className="group-feed-main">

              {/* Composer — only for members */}
              {canPost ? (
                <section className="dash-card activity-composer activity-wall-card activity-facebook-composer">
                  <div className="composer-topbar">
                    <div className="composer-avatar">{firstLetter(currentUser?.name ?? 'A')}</div>
                    <textarea
                      rows={3}
                      value={composerText}
                      onChange={(e) => setComposerText(e.target.value)}
                      placeholder={`Write something in ${group.name}…`}
                      className="composer-primary-input"
                    />
                  </div>
                  {composerMedia.length > 0 ? (
                    <div className="activity-edit-media-row">
                      {composerMedia.map((m, i) => (
                        <div key={i} className="activity-edit-thumb">
                          {m.type === 'image'
                            ? <img src={resolveMediaUrl(m.url)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : m.type === 'video'
                            ? <video src={resolveMediaUrl(m.url)} muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : <span style={{ fontSize: 28 }}>{m.type === 'audio' ? '🎵' : '📄'}</span>
                          }
                          <button
                            type="button"
                            className="activity-edit-thumb-remove"
                            onClick={() => setComposerMedia((prev) => prev.filter((_, idx) => idx !== i))}
                          >×</button>
                        </div>
                      ))}
                    </div>
                  ) : null}
                  <div className="activity-form-actions facebook-composer-actions">
                    <label className="chip-btn composer-upload-button">
                      {composerUploading ? 'Uploading…' : 'Photo/video/file'}
                      <input
                        type="file"
                        ref={composerFileRef}
                        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                        style={{ display: 'none' }}
                        onChange={handleComposerUpload}
                        disabled={composerUploading}
                      />
                    </label>
                    <select
                      className="pill-select"
                      value={composerPrivacy}
                      onChange={(e) => setComposerPrivacy(e.target.value as typeof composerPrivacy)}
                    >
                      <option value="public">Public</option>
                      <option value="friends">Friends</option>
                      <option value="group">Group</option>
                      <option value="private">Private</option>
                    </select>
                    <button
                      type="button"
                      className="btn btn-dark"
                      onClick={handlePost}
                      disabled={composerPosting || !composerText.trim()}
                    >
                      {composerPosting ? 'Posting…' : 'Post'}
                    </button>
                  </div>
                </section>
              ) : null}

              {/* Private gate */}
              {!canSeeFeed ? (
                <div className="group-private-gate">
                  <span className="group-private-icon">🔒</span>
                  <p>This is a private group. {memberStatus === 'pending' ? 'Your request is pending admin approval.' : 'Join to see posts.'}</p>
                </div>
              ) : feedLoading ? (
                <p className="form-status">Loading posts…</p>
              ) : feedError ? (
                <p className="form-status">{feedError}</p>
              ) : feedItems.length === 0 ? (
                <p className="form-status" style={{ color: '#999' }}>No posts yet. Be the first!</p>
              ) : (
                <div className="activity-list">
                  {feedItems.map((item) => {
                    const activityId = item._id ?? '';
                    const commentsOpen = Boolean(openComments[activityId]);
                    const isOwnPost = currentUser && currentUser.id === item.actorId;
                    return (
                      <article className="activity-item activity-wall-item facebook-post-card" key={activityId}>
                        <div className="activity-card-body">
                          <div className="activity-card-topline">
                            <div className="facebook-post-author">
                              <div className="avatar">{firstLetter(item.actorName)}</div>
                              <div>
                                <strong>{item.actorName}</strong>
                                <div className="activity-meta">
                                  <span>@{item.actorHandle}</span>
                                  <span>{formatDate(item.createdAt)}</span>
                                </div>
                              </div>
                            </div>
                            {isOwnPost ? (
                              <div className="activity-actions">
                                <button type="button" className="text-link" onClick={() => { setEditingId(activityId); setEditingText(item.text); setEditingMedia(item.media ? [...item.media] : []); }}>Edit</button>
                                <button type="button" className="text-link" onClick={() => handleDelete(activityId)}>Delete</button>
                              </div>
                            ) : null}
                          </div>
                          {editingId === activityId ? (
                            <div className="activity-edit-box">
                              <textarea value={editingText} onChange={(e) => setEditingText(e.target.value)} rows={3} />
                              {(editingMedia ?? []).length > 0 ? (
                                <div className="activity-edit-media-row">
                                  {(editingMedia ?? []).map((m, i) => (
                                    <div key={i} className="activity-edit-thumb">
                                      {m.type === 'image' ? <img src={resolveMediaUrl(m.url)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        : m.type === 'video' ? <video src={resolveMediaUrl(m.url)} muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        : <span style={{ fontSize: 28 }}>{m.type === 'audio' ? '🎵' : '📄'}</span>}
                                      <button type="button" className="activity-edit-thumb-remove" onClick={() => setEditingMedia((prev) => (prev ?? []).filter((_, idx) => idx !== i))}>×</button>
                                    </div>
                                  ))}
                                </div>
                              ) : null}
                              <label className="activity-edit-add-media">
                                {uploadingEditMedia ? 'Uploading…' : '＋ Add image / video'}
                                <input type="file" accept="image/*,video/*" style={{ display: 'none' }} onChange={handleEditMediaUpload} disabled={uploadingEditMedia} />
                              </label>
                              <div className="activity-form-actions">
                                <button type="button" className="btn btn-dark" onClick={() => handleUpdate(activityId)}>Save</button>
                                <button type="button" className="btn btn-light" onClick={() => { setEditingId(null); setEditingText(''); setEditingMedia([]); }}>Cancel</button>
                              </div>
                            </div>
                          ) : (
                            <p className="facebook-post-text">{item.text}</p>
                          )}
                          {editingId !== activityId && item.media && item.media.length > 0 ? (
                            <MediaGrid
                              items={item.media.map((m) => ({ ...m, url: resolveMediaUrl(m.url) }))}
                            />
                          ) : null}
                          <div className="facebook-post-stats">
                            <span>{item.likes ?? 0} likes</span>
                            <button
                              type="button"
                              className="text-link"
                              onClick={() => setOpenComments((prev) => ({ ...prev, [activityId]: !commentsOpen }))}
                            >
                              {commentsOpen ? 'Hide comments' : `${item.comments ?? 0} comments`}
                            </button>
                          </div>
                          <div className="activity-quick-actions">
                            <button type="button" className={isLikedByCurrentUser(item) ? 'chip-btn active' : 'chip-btn'} onClick={() => handleLike(activityId)}>
                              {isLikedByCurrentUser(item) ? 'Unlike' : 'Like'}
                            </button>
                            <button type="button" className="chip-btn" onClick={() => setOpenComments((prev) => ({ ...prev, [activityId]: true }))}>Comment</button>
                            <button type="button" className={savedIds.includes(activityId) ? 'chip-btn active' : 'chip-btn'} onClick={() => toggleSave(activityId)}>
                              {savedIds.includes(activityId) ? 'Saved' : 'Save'}
                            </button>
                          </div>
                          <div className="reaction-row">
                            {REACTIONS.map((reaction) => (
                              <button key={reaction} type="button" className="reaction-pill" onClick={() => handleReact(activityId, reaction)}>
                                <span>{reaction}</span>
                                <strong>{item.reactions?.[reaction] ?? 0}</strong>
                              </button>
                            ))}
                          </div>
                          {commentsOpen ? (
                            <div className="facebook-comments-panel">
                              {item.commentsList && item.commentsList.length > 0 ? (
                                <div className="activity-comments">
                                  {item.commentsList.map((c, i) => (
                                    <div key={i} className="activity-comment">
                                      <div className="activity-comment-avatar">{firstLetter(c.authorName)}</div>
                                      <div className="activity-comment-main">
                                        <div className="activity-comment-bubble">
                                          <strong>{c.authorName}</strong>
                                          <span>{c.body}</span>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : null}
                              <div className="activity-comment-box">
                                <div className="activity-comment-avatar">{firstLetter(currentUser?.name)}</div>
                                <textarea
                                  value={commentDrafts[activityId] ?? ''}
                                  onChange={(e) => setCommentDrafts((prev) => ({ ...prev, [activityId]: e.target.value }))}
                                  rows={2}
                                  placeholder="Write a comment…"
                                />
                                <button type="button" className="btn btn-dark" onClick={() => handleComment(activityId)}>Post</button>
                              </div>
                            </div>
                          ) : null}
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside className="group-feed-sidebar dash-card">
              <span className="eyebrow">About</span>
              <h3 style={{ margin: '4px 0 8px' }}>{group.name}</h3>
              <p style={{ fontSize: 14, color: '#666', margin: 0 }}>{group.bio || group.description}</p>
              {group.groupTypeSlug ? (
                <div style={{ marginTop: 12 }}>
                  <span className="eyebrow">Type</span>
                  <p style={{ margin: 0, fontSize: 14 }}>{group.groupTypeSlug}</p>
                </div>
              ) : null}
              <div style={{ marginTop: 12 }}>
                <span className="eyebrow">Privacy</span>
                <p style={{ margin: 0, fontSize: 14, textTransform: 'capitalize' }}>{group.privacy}</p>
              </div>
              <div style={{ marginTop: 12 }}>
                <span className="eyebrow">Members</span>
                <p style={{ margin: 0, fontSize: 14 }}>{group.membersCount}</p>
              </div>
            </aside>
          </div>
        ) : null}

        {/* ── Members tab ── */}
        {tab === 'members' ? (
          <div>
            {group.privacy === 'private' && memberStatus !== 'member' ? (
              <div className="group-private-gate">
                <span className="group-private-icon">🔒</span>
                <p>Members list is only visible to group members.</p>
              </div>
            ) : membersLoading ? (
              <p className="form-status">Loading members…</p>
            ) : members.length === 0 ? (
              <p className="form-status" style={{ color: '#999' }}>No members yet.</p>
            ) : (
              <div className="group-members-grid">
                {members.map((m) => (
                  <div key={m._id} className="group-member-card">
                    <div className="group-member-avatar">
                      {m.avatar
                        ? <img src={resolveMediaUrl(m.avatar)} alt={m.name} />
                        : <span>{firstLetter(m.name)}</span>
                      }
                    </div>
                    <div className="group-member-info">
                      <strong>{m.name}</strong>
                      <span>@{m.handle}</span>
                      {m.bio ? <p>{m.bio}</p> : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : null}
      </div>

    </div>
  );
}
