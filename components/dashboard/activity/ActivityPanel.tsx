'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  API_URL,
  commentOnActivity,
  createActivity,
  deleteActivity,
  getFavorites,
  getMyActivity,
  likeActivity,
  likeActivityComment,
  reactToActivity,
  replyToActivityComment,
  saveFavorite,
  updateActivity,
  uploadMedia,
} from '@/lib/api';
import type { Activity } from '@/lib/types';
import { MediaGrid } from '@/components/MediaGrid';

const API_ORIGIN = API_URL.replace(/\/api\/?$/, '');

function resolveMediaUrl(url: string) {
  if (!url || url.startsWith('http') || url.startsWith('blob:') || url.startsWith('data:')) return url;
  return `${API_ORIGIN}${url}`;
}

function detectMediaType(urlOrMime: string): string {
  const s = urlOrMime.toLowerCase();
  if (s.startsWith('video/') || /\.(mp4|mov|webm|avi|mkv)(\?|$)/.test(s)) return 'video';
  if (s.startsWith('audio/') || /\.(mp3|wav|ogg|aac|flac)(\?|$)/.test(s)) return 'audio';
  if (s.startsWith('application/') || s.startsWith('text/plain') || /\.(pdf|doc|docx|xls|xlsx|ppt|pptx|txt)(\?|$)/.test(s)) return 'file';
  return 'image';
}

function mediaThumb(m: { type: string; url: string; caption?: string }, src: string) {
  if (m.type === 'video') return <video src={src} muted />;
  if (m.type === 'image') return <img src={src} alt={m.caption || ''} />;
  const icon = m.type === 'audio' ? '🎵' : '📄';
  const filename = src.split('/').pop()?.split('?')[0] ?? m.type;
  return (
    <div className="media-file-placeholder">
      <span className="media-file-icon">{icon}</span>
      <span className="media-file-label">{filename}</span>
    </div>
  );
}

function formatDate(value?: string) {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return 'just now';
  return new Intl.DateTimeFormat('en', {
    year: 'numeric', month: 'short', day: '2-digit',
    hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'UTC',
  }).format(date);
}

function firstLetter(value?: string) {
  return value?.trim().slice(0, 1).toUpperCase() || 'U';
}

const REACTIONS = ['like', 'love', 'celebrate', 'laugh', 'sad', 'angry'] as const;

export function ActivityPanel() {
  const [feedItems, setFeedItems] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState('');
  const [privacy, setPrivacy] = useState<'public' | 'friends' | 'group' | 'private'>('public');
  const [composerMedia, setComposerMedia] = useState<Activity['media']>([]);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [editingMedia, setEditingMedia] = useState<Activity['media']>([]);
  const [uploadingEditMedia, setUploadingEditMedia] = useState(false);
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [openComments, setOpenComments] = useState<Record<string, boolean>>({});
  const [openReplyBoxes, setOpenReplyBoxes] = useState<Record<string, boolean>>({});
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [status, setStatus] = useState('');

  useEffect(() => {
    try {
      setCurrentUser(JSON.parse(localStorage.getItem('asiance_user') ?? 'null'));
    } catch {
      setCurrentUser(null);
    }
  }, []);

  useEffect(() => {
    getMyActivity()
      .then((data) => setFeedItems(data ?? []))
      .catch(() => setFeedItems([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    getFavorites()
      .then((favs) => setSavedIds(favs.map((f) => f._id ?? '').filter(Boolean)))
      .catch(() => {});
  }, []);

  const isAuthenticated = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return Boolean(currentUser && localStorage.getItem('asiance_token'));
  }, [currentUser]);

  function requireAuth(message = 'Please log in first.') {
    if (!isAuthenticated) { setStatus(message); return false; }
    return true;
  }

  function isLikedByCurrentUser(item: Activity) {
    if (!currentUser?.id) return false;
    return (item.likedBy ?? []).some((id) => id?.toString() === currentUser.id);
  }

  function isCommentLiked(comment: NonNullable<Activity['commentsList']>[number]) {
    if (!currentUser?.id) return false;
    return (comment.likedBy ?? []).some((id) => id?.toString() === currentUser.id);
  }

  function commentKey(activityId: string, commentIndex: number) {
    return `${activityId}:${commentIndex}`;
  }

  async function refreshFeed() {
    const latest = await getMyActivity().catch(() => []);
    setFeedItems(latest);
  }

  async function handleMediaPick(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.currentTarget.files ?? []);
    if (!files.length) return;
    setUploadingMedia(true);
    try {
      for (const file of files) {
        const url = await uploadMedia(file);
        setComposerMedia((prev) => [...(prev ?? []), { type: detectMediaType(file.type), url }]);
      }
    } catch {
      setStatus('Media upload failed.');
    } finally {
      setUploadingMedia(false);
      event.currentTarget.value = '';
    }
  }

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    if (!requireAuth('Please sign in before posting.')) return;
    const text = draft.trim();
    const allMedia = [...(composerMedia ?? [])];
    if (!text && !allMedia.length) { setStatus('Write something or add media before posting.'); return; }
    try {
      await createActivity({ text: text || 'Shared media', type: 'post', privacy, media: allMedia.length > 0 ? allMedia : undefined });
      await refreshFeed();
      setDraft('');
      setPrivacy('public');
      setComposerMedia([]);
      setStatus('Your post is live.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Unable to post right now.');
    }
  }

  async function handleLike(activityId: string) {
    if (!requireAuth('Please sign in to like posts.')) return;
    try {
      const updated = await likeActivity(activityId);
      setFeedItems((prev) => prev.map((item) => (item._id === activityId ? updated : item)));
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Unable to like this post.');
    }
  }

  async function handleReact(activityId: string, reaction: string) {
    if (!requireAuth()) return;
    try {
      const updated = await reactToActivity(activityId, reaction);
      setFeedItems((prev) => prev.map((item) => (item._id === activityId ? updated : item)));
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Unable to react.');
    }
  }

  async function handleComment(activityId: string) {
    if (!requireAuth('Please sign in to comment.')) return;
    const body = commentDrafts[activityId]?.trim();
    if (!body) return;
    try {
      const updated = await commentOnActivity(activityId, { body });
      setFeedItems((prev) => prev.map((item) => (item._id === activityId ? updated : item)));
      setCommentDrafts((prev) => ({ ...prev, [activityId]: '' }));
      setOpenComments((prev) => ({ ...prev, [activityId]: true }));
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Unable to comment.');
    }
  }

  async function handleCommentLike(activityId: string, commentIndex: number) {
    if (!requireAuth()) return;
    try {
      const updated = await likeActivityComment(activityId, commentIndex);
      setFeedItems((prev) => prev.map((item) => (item._id === activityId ? updated : item)));
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Unable to like comment.');
    }
  }

  async function handleReply(activityId: string, commentIndex: number) {
    if (!requireAuth()) return;
    const key = commentKey(activityId, commentIndex);
    const body = replyDrafts[key]?.trim();
    if (!body) return;
    try {
      const updated = await replyToActivityComment(activityId, commentIndex, { body });
      setFeedItems((prev) => prev.map((item) => (item._id === activityId ? updated : item)));
      setReplyDrafts((prev) => ({ ...prev, [key]: '' }));
      setOpenReplyBoxes((prev) => ({ ...prev, [key]: false }));
      setOpenComments((prev) => ({ ...prev, [activityId]: true }));
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Unable to reply.');
    }
  }

  async function handleDelete(activityId: string) {
    await deleteActivity(activityId);
    setFeedItems((prev) => prev.filter((item) => item._id !== activityId));
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
    } catch {
      setStatus('Media upload failed.');
    } finally {
      setUploadingEditMedia(false);
      event.currentTarget.value = '';
    }
  }

  async function toggleSave(activityId: string) {
    if (!requireAuth('Please sign in to save posts.')) return;
    try {
      const result = await saveFavorite(activityId);
      setSavedIds((prev) =>
        result.saved ? (prev.includes(activityId) ? prev : [...prev, activityId]) : prev.filter((id) => id !== activityId),
      );
    } catch {
      setStatus('Unable to update favorites.');
    }
  }

  return (
    <div>
      {/* Composer */}
      <section className="dash-card activity-composer activity-wall-card activity-facebook-composer" style={{ marginBottom: 18 }}>
        <form onSubmit={handleCreate} className="activity-form">
          <div className="composer-topbar">
            <div className="composer-avatar">{firstLetter(currentUser?.name)}</div>
            <textarea
              rows={3}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="What's on your mind?"
              className="composer-primary-input"
            />
          </div>

          {(composerMedia ?? []).length > 0 && (
            <div className="activity-edit-media-row">
              {(composerMedia ?? []).map((m, i) => (
                <div key={i} className="activity-edit-thumb">
                  {mediaThumb(m, m.url)}
                  <button type="button" className="activity-edit-thumb-remove" onClick={() => setComposerMedia((prev) => (prev ?? []).filter((_, idx) => idx !== i))}>×</button>
                </div>
              ))}
            </div>
          )}

          <div className="activity-form-actions facebook-composer-actions">
            <label className="chip-btn composer-upload-button">
              {uploadingMedia ? 'Uploading...' : 'Photo/video/file'}
              <input type="file" accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt" onChange={handleMediaPick} hidden multiple />
            </label>
            <select className="pill-select" value={privacy} onChange={(e) => setPrivacy(e.target.value as any)}>
              <option value="public">Public</option>
              <option value="friends">Friends</option>
              <option value="group">Group</option>
              <option value="private">Private</option>
            </select>
            <button type="submit" className="btn btn-dark">Post</button>
          </div>
        </form>
        {status && <p className="form-status">{status}</p>}
      </section>

      {/* Feed */}
      <section className="dash-card activity-wall-card activity-feed-shell">
        {loading ? (
          <p style={{ color: '#9ca3af', padding: '24px 0', textAlign: 'center' }}>Loading…</p>
        ) : feedItems.length === 0 ? (
          <p style={{ color: '#9ca3af', padding: '24px 0', textAlign: 'center' }}>No posts yet. Share your first update above!</p>
        ) : (
          <div className="activity-list">
            {feedItems.map((item) => {
              const activityId = item._id ?? '';
              const commentsOpen = Boolean(openComments[activityId]);

              return (
                <article className="activity-item activity-wall-item facebook-post-card" key={activityId}>
                  <div className="activity-card-body">
                    <div className="activity-card-topline">
                      <div className="facebook-post-author">
                        <div className="avatar">{firstLetter(item.actorName)}</div>
                        <div>
                          <strong>{item.actorName}</strong>
                          <div className="activity-meta">
                            <Link href={`/members/${item.actorHandle}`}>@{item.actorHandle}</Link>
                            <span>{formatDate(item.createdAt)}</span>
                            <span>{item.privacy ?? 'public'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="activity-actions">
                        <button type="button" className="text-link" onClick={() => { setEditingId(activityId); setEditingText(item.text); setEditingMedia(item.media ? [...item.media] : []); }}>Edit</button>
                        <button type="button" className="text-link" onClick={() => handleDelete(activityId)}>Delete</button>
                      </div>
                    </div>

                    {editingId === item._id ? (
                      <div className="activity-edit-box">
                        <textarea value={editingText} onChange={(e) => setEditingText(e.target.value)} rows={3} />
                        {(editingMedia ?? []).length > 0 && (
                          <div className="activity-edit-media-row">
                            {(editingMedia ?? []).map((m, i) => {
                              const src = resolveMediaUrl(m.url);
                              return (
                                <div key={i} className="activity-edit-thumb">
                                  {mediaThumb(m, src)}
                                  <button type="button" className="activity-edit-thumb-remove" onClick={() => setEditingMedia((prev) => (prev ?? []).filter((_, idx) => idx !== i))}>×</button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                        <label className="activity-edit-add-media">
                          {uploadingEditMedia ? 'Uploading…' : '＋ Add image / video'}
                          <input type="file" accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt" style={{ display: 'none' }} onChange={handleEditMediaUpload} disabled={uploadingEditMedia} />
                        </label>
                        <div className="activity-form-actions">
                          <button type="button" className="btn btn-dark" onClick={() => handleUpdate(activityId)}>Save</button>
                          <button type="button" className="btn btn-light" onClick={() => { setEditingId(null); setEditingText(''); setEditingMedia([]); }}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <p className="facebook-post-text">{item.text}</p>
                    )}

                    {editingId !== item._id && item.media && item.media.length > 0 && (
                      <MediaGrid items={item.media.map((m) => ({ ...m, url: resolveMediaUrl(m.url) }))} />
                    )}

                    <div className="facebook-post-stats">
                      <span>{item.likes ?? 0} likes</span>
                      <button type="button" className="text-link" onClick={() => setOpenComments((prev) => ({ ...prev, [activityId]: !commentsOpen }))}>
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

                    {commentsOpen && (
                      <div className="facebook-comments-panel">
                        {item.commentsList && item.commentsList.length > 0 && (
                          <div className="activity-comments">
                            {item.commentsList.map((comment, index) => {
                              const key = commentKey(activityId, index);
                              const replyBoxOpen = Boolean(openReplyBoxes[key]);
                              return (
                                <div key={`${comment.authorName}-${index}`} className="activity-comment">
                                  <div className="activity-comment-avatar">{firstLetter(comment.authorName)}</div>
                                  <div className="activity-comment-main">
                                    <div className="activity-comment-bubble">
                                      <strong>{comment.authorName}</strong>
                                      <span>{comment.body}</span>
                                    </div>
                                    <div className="activity-comment-actions">
                                      <button type="button" className={isCommentLiked(comment) ? 'text-link active' : 'text-link'} onClick={() => handleCommentLike(activityId, index)}>
                                        {isCommentLiked(comment) ? 'Unlike' : 'Like'}
                                      </button>
                                      <button type="button" className="text-link" onClick={() => setOpenReplyBoxes((prev) => ({ ...prev, [key]: !replyBoxOpen }))}>Reply</button>
                                      <span>{comment.likes ?? 0} likes</span>
                                    </div>
                                    {comment.replies && comment.replies.length > 0 && (
                                      <div className="activity-replies">
                                        {comment.replies.map((reply, replyIndex) => (
                                          <div key={`${reply.authorName}-${replyIndex}`} className="activity-reply">
                                            <div className="activity-comment-avatar small">{firstLetter(reply.authorName)}</div>
                                            <div className="activity-comment-bubble">
                                              <strong>{reply.authorName}</strong>
                                              <span>{reply.body}</span>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                    {replyBoxOpen && (
                                      <div className="activity-reply-box">
                                        <input value={replyDrafts[key] ?? ''} onChange={(e) => setReplyDrafts((prev) => ({ ...prev, [key]: e.target.value }))} placeholder="Write a reply..." />
                                        <button type="button" className="btn btn-dark" onClick={() => handleReply(activityId, index)}>Reply</button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                        <div className="activity-comment-box">
                          <div className="activity-comment-avatar">{firstLetter(currentUser?.name)}</div>
                          <textarea value={commentDrafts[activityId] ?? ''} onChange={(e) => setCommentDrafts((prev) => ({ ...prev, [activityId]: e.target.value }))} rows={2} placeholder="Write a comment..." />
                          <button type="button" className="btn btn-dark" onClick={() => handleComment(activityId)}>Post</button>
                        </div>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
