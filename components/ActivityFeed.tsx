'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { API_URL, commentOnActivity, deleteActivity, getFavorites, likeActivity, saveFavorite, updateActivity, uploadMedia } from '@/lib/api';
import type { Activity } from '@/lib/types';
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

function formatActivityDate(value?: string) {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return 'just now';

  return new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'UTC',
  }).format(date);
}

function firstLetter(value?: string) {
  return value?.trim().slice(0, 1).toUpperCase() || 'U';
}

export function ActivityFeed({ items }: { items: Activity[] }) {
  const [feedItems, setFeedItems] = useState(items);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [editingMedia, setEditingMedia] = useState<Activity['media']>([]);
  const [uploadingEditMedia, setUploadingEditMedia] = useState(false);
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [openComments, setOpenComments] = useState<Record<string, boolean>>({});
  const [cardStatus, setCardStatus] = useState<Record<string, string>>({});
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    try {
      setCurrentUser(JSON.parse(localStorage.getItem('asiance_user') ?? 'null'));
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

  const isAuthenticated = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return Boolean(currentUser && localStorage.getItem('asiance_token'));
  }, [currentUser]);

  function setStatus(activityId: string, message: string) {
    setCardStatus((prev) => ({ ...prev, [activityId]: message }));
  }

  function isLikedByCurrentUser(item: Activity) {
    if (!currentUser?.id) return false;
    return (item.likedBy ?? []).some((id) => id?.toString() === currentUser.id);
  }

  async function handleLike(activityId: string) {
    if (!isAuthenticated) {
      setStatus(activityId, 'Please sign in to like posts.');
      return;
    }
    try {
      const updated = await likeActivity(activityId);
      setFeedItems((prev) => prev.map((item) => (item._id === activityId ? updated : item)));
    } catch (error) {
      setStatus(activityId, error instanceof Error ? error.message : 'Unable to like this post right now.');
    }
  }

  async function handleComment(activityId: string) {
    if (!isAuthenticated) {
      setStatus(activityId, 'Please sign in to comment.');
      return;
    }
    const body = commentDrafts[activityId]?.trim();
    if (!body) return;
    try {
      const updated = await commentOnActivity(activityId, { body });
      setFeedItems((prev) => prev.map((item) => (item._id === activityId ? updated : item)));
      setCommentDrafts((prev) => ({ ...prev, [activityId]: '' }));
      setOpenComments((prev) => ({ ...prev, [activityId]: true }));
    } catch (error) {
      setStatus(activityId, error instanceof Error ? error.message : 'Unable to comment right now.');
    }
  }

  async function toggleSave(activityId: string) {
    if (!isAuthenticated) {
      setStatus(activityId, 'Please sign in to save posts.');
      return;
    }
    try {
      const result = await saveFavorite(activityId);
      setSavedIds((prev) =>
        result.saved ? (prev.includes(activityId) ? prev : [...prev, activityId]) : prev.filter((id) => id !== activityId),
      );
    } catch {
      setStatus(activityId, 'Unable to save right now.');
    }
  }

  async function handleDelete(activityId: string) {
    await deleteActivity(activityId);
    setFeedItems((prev) => prev.filter((item) => item._id !== activityId));
  }

  async function handleUpdate(activityId: string) {
    if (!editingText.trim()) return;
    const updated = await updateActivity(activityId, { text: editingText.trim(), media: editingMedia ?? [] });
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
      // silently fail — user sees no change
    } finally {
      setUploadingEditMedia(false);
      event.currentTarget.value = '';
    }
  }

  return (
    <div className="activity-list">
      {feedItems.map((item) => {
        const activityId = item._id ?? '';
        const commentsOpen = Boolean(openComments[activityId]);
        const cardMsg = cardStatus[activityId];

        return (
          <article
            className="activity-item activity-wall-item facebook-post-card"
            key={item._id ?? `${item.actorHandle}-${item.text}`}
          >
            <div className="activity-card-body">
              <div className="activity-card-topline">
                <div className="facebook-post-author">
                  <div className="avatar">{firstLetter(item.actorName)}</div>
                  <div>
                    <strong>{item.actorName}</strong>
                    <div className="activity-meta">
                      <Link href={`/members/${item.actorHandle}`}>@{item.actorHandle}</Link>
                      <span>{formatActivityDate(item.createdAt)}</span>
                      {item.privacy ? <span>{item.privacy}</span> : null}
                    </div>
                  </div>
                </div>
                {currentUser && currentUser.id === item.actorId ? (
                  <div className="activity-actions">
                    <button
                      type="button"
                      className="text-link"
                      onClick={() => { setEditingId(activityId); setEditingText(item.text); setEditingMedia(item.media ? [...item.media] : []); }}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="text-link"
                      onClick={() => handleDelete(activityId)}
                    >
                      Delete
                    </button>
                  </div>
                ) : null}
              </div>

              {editingId === item._id ? (
                <div className="activity-edit-box">
                  <textarea
                    value={editingText}
                    onChange={(event) => setEditingText(event.target.value)}
                    rows={3}
                  />
                  {(editingMedia ?? []).length > 0 ? (
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
                  ) : null}
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

              {editingId !== item._id && item.media && item.media.length > 0 ? (
                <MediaGrid items={item.media.map((m) => ({ ...m, url: resolveMediaUrl(m.url) }))} />
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
                <button
                  type="button"
                  className={isLikedByCurrentUser(item) ? 'chip-btn active' : 'chip-btn'}
                  onClick={() => handleLike(activityId)}
                >
                  {isLikedByCurrentUser(item) ? 'Unlike' : 'Like'}
                </button>
                <button
                  type="button"
                  className="chip-btn"
                  onClick={() => setOpenComments((prev) => ({ ...prev, [activityId]: true }))}
                >
                  Comment
                </button>
                <button
                  type="button"
                  className={savedIds.includes(activityId) ? 'chip-btn active' : 'chip-btn'}
                  onClick={() => toggleSave(activityId)}
                >
                  {savedIds.includes(activityId) ? 'Saved' : 'Save'}
                </button>
              </div>
              {cardMsg ? <p className="form-status" style={{ marginTop: 0 }}>{cardMsg}</p> : null}

              {commentsOpen ? (
                <div className="facebook-comments-panel">
                  {item.commentsList && item.commentsList.length > 0 ? (
                    <div className="activity-comments">
                      {item.commentsList.map((comment, index) => (
                        <div key={`${comment.authorName}-${index}`} className="activity-comment">
                          <div className="activity-comment-avatar">{firstLetter(comment.authorName)}</div>
                          <div className="activity-comment-main">
                            <div className="activity-comment-bubble">
                              <strong>{comment.authorName}</strong>
                              <span>{comment.body}</span>
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
                      onChange={(event) => setCommentDrafts((prev) => ({ ...prev, [activityId]: event.target.value }))}
                      rows={2}
                      placeholder="Write a comment..."
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
  );
}
