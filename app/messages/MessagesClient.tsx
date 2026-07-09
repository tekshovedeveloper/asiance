'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams, useRouter } from 'next/navigation';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { LoadingIndicator } from '@/components/LoadingIndicator';
import { useSocketContext } from '@/components/SocketProvider';
import {
  getMe,
  getChatThreads,
  createOrGetChatThread,
  getChatThread,
  markChatThreadRead,
  sendChatMessage,
  uploadChatMedia,
  deleteChatMessage,
  deleteChatThread,
  type ChatThread,
  type ChatMessage,
} from '@/lib/api';
import type { DashboardUser } from '@/components/dashboard/types';
import { Paperclip, Send, Smile, X, Trash2, Trash, Maximize2 } from 'lucide-react';

const FALLBACK_AVATAR = '/assets/profile/dymmy-profile.jpeg';

/** Generate a valid 24-char hex ObjectId on the client so the optimistic message always has _id */
function generateObjectId(): string {
  const ts = Math.floor(Date.now() / 1000).toString(16).padStart(8, '0');
  const rand = Array.from(crypto.getRandomValues(new Uint8Array(8)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return ts + rand; // 8 + 16 = 24 hex chars — valid ObjectId format
}

const EMOJIS = ['😊','😂','❤️','👍','😮','😢','🔥','🎉','👏','🙏','😎','😍','🤔','👋','✅'];

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

/** Show only the other person's name; thread title is stored as "A and B" */
function getThreadDisplayName(title: string, myName: string): string {
  if (!myName || !title) return title;
  const me = myName.trim();
  if (title.startsWith(me + ' and ')) return title.slice(me.length + 5);
  if (title.endsWith(' and ' + me)) return title.slice(0, -(me.length + 5));
  return title;
}

// ─── Media lightbox ───────────────────────────────────────────────────────────

function MediaLightbox({ url, type, onClose }: { url: string; type: string; onClose: () => void }) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const content = (
    <div className="lightbox-overlay" onClick={onClose}>
      <button type="button" className="lightbox-close" onClick={onClose} aria-label="Close">×</button>
      <div className="lightbox-box" onClick={(e) => e.stopPropagation()}>
        <div className="lightbox-media">
          {type === 'image' && (
            <img src={url} alt="media" className="lightbox-img" />
          )}
          {type === 'video' && (
            <video
              src={url}
              controls
              autoPlay
              style={{ maxWidth: '88vw', maxHeight: '80vh', borderRadius: 8, boxShadow: '0 8px 40px rgba(0,0,0,.6)' }}
            />
          )}
          {type === 'audio' && (
            <div className="lightbox-audio-box">
              <span className="lightbox-file-icon">🎵</span>
              <audio src={url} controls autoPlay className="lightbox-audio-player" />
            </div>
          )}
          {(type === 'document' || type === 'file') && (
            <div className="lightbox-audio-box">
              <span className="lightbox-file-icon">📄</span>
              <p className="lightbox-filename">{decodeURIComponent(url.split('/').pop() ?? 'File')}</p>
              <a href={url} target="_blank" rel="noreferrer" className="lightbox-open-link">Open File</a>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(content, document.body);
}

// ─── Media preview (clickable thumbnail in bubble) ────────────────────────────

function MediaPreview({ url, type }: { url: string; type: string }) {
  const [open, setOpen] = useState(false);
  if (!url) return null;

  if (type === 'image') {
    return (
      <>
        <img
          src={url}
          alt="media"
          onClick={() => setOpen(true)}
          style={{ maxWidth: 220, maxHeight: 180, borderRadius: 10, display: 'block', marginTop: 6, cursor: 'zoom-in' }}
        />
        {open && <MediaLightbox url={url} type={type} onClose={() => setOpen(false)} />}
      </>
    );
  }
  if (type === 'video') {
    return (
      <>
        <div
          onClick={() => setOpen(true)}
          style={{ position: 'relative', marginTop: 6, cursor: 'pointer', display: 'inline-block', borderRadius: 10, overflow: 'hidden' }}
        >
          <video src={url} style={{ maxWidth: 260, maxHeight: 180, display: 'block', pointerEvents: 'none' }} />
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.35)',
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.9)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: 18, marginLeft: 3, color: '#222' }}>▶</span>
            </div>
          </div>
        </div>
        {open && <MediaLightbox url={url} type={type} onClose={() => setOpen(false)} />}
      </>
    );
  }
  if (type === 'audio') {
    return (
      <>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
          <audio src={url} controls style={{ maxWidth: 200 }} />
          <button
            type="button"
            onClick={() => setOpen(true)}
            title="Open in viewer"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-muted)', padding: 4, display: 'flex' }}
          >
            <Maximize2 size={14} />
          </button>
        </div>
        {open && <MediaLightbox url={url} type={type} onClose={() => setOpen(false)} />}
      </>
    );
  }
  return (
    <>
      <a
        href={url}
        onClick={(e) => { e.preventDefault(); setOpen(true); }}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 6, color: 'var(--brand)', fontSize: 13, cursor: 'pointer' }}
      >
        <Paperclip size={14} /> Attachment
      </a>
      {open && <MediaLightbox url={url} type="document" onClose={() => setOpen(false)} />}
    </>
  );
}

// ─── Message bubble ───────────────────────────────────────────────────────────

function Bubble({ msg, isMe, onDelete }: { msg: ChatMessage; isMe: boolean; onDelete?: () => Promise<void> }) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!onDelete || deleting) return;
    setDeleting(true);
    try { await onDelete(); } finally { setDeleting(false); }
  }

  return (
    <div className={`chat-bubble-row ${isMe ? 'chat-bubble-row--me' : ''}`}>
      {!isMe && (
        <img
          src={msg.senderAvatar || FALLBACK_AVATAR}
          alt={msg.senderName}
          className="chat-bubble-avatar"
        />
      )}
      <div className={`chat-bubble ${isMe ? 'chat-bubble--me' : 'chat-bubble--them'}`}>
        {!isMe && <span className="chat-bubble-name">{msg.senderName}</span>}
        {msg.body && <p className="chat-bubble-text">{msg.body}</p>}
        {msg.mediaUrl && <MediaPreview url={msg.mediaUrl} type={msg.mediaType} />}
        <span className="chat-bubble-time">{formatTime(msg.createdAt)}</span>
      </div>
      {isMe && msg._id && (
        <button
          type="button"
          className="chat-bubble-delete-btn"
          title="Delete message"
          onClick={handleDelete}
          disabled={deleting}
        >
          <Trash2 size={13} />
        </button>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function MessagesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { socket, onNewMessage, onMessageSaved, onMessageDeleted, onTyping } = useSocketContext();

  const [me, setMe] = useState<DashboardUser | null>(null);
  const [threads, setThreadsState] = useState<ChatThread[]>([]);
  const [activeThread, setActiveThread] = useState<ChatThread | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [text, setText] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [pendingMedia, setPendingMedia] = useState<{ url: string; type: string; name: string } | null>(null);
  const [deletingThread, setDeletingThread] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Ref so socket callback always sees current user id even before state update
  const meIdRef = useRef<string | null>(null);

  // ── Load current user + threads ──────────────────────────────────────────
  useEffect(() => {
    async function init() {
      setLoading(true);
      try {
        const user = await getMe();
        setMe(user);
        meIdRef.current = user.id ?? null;
        const list = await getChatThreads();
        setThreadsState(list);

        const targetUserId = searchParams.get('user');
        const targetThreadId = searchParams.get('thread');

        if (targetUserId) {
          const t = await createOrGetChatThread(targetUserId);
          setActiveThread(t);
          setThreadsState((prev) => {
            const exists = prev.find((x) => x._id === t._id);
            return exists ? prev.map((x) => (x._id === t._id ? t : x)) : [t, ...prev];
          });
          router.replace(`/messages?thread=${t._id}`);
        } else if (targetThreadId) {
          const t = list.find((x) => x._id === targetThreadId);
          if (t) setActiveThread(t);
          else {
            const fetched = await getChatThread(targetThreadId);
            setActiveThread(fetched);
          }
        } else if (list.length > 0) {
          setActiveThread(list[0]);
        }
      } catch {
        // not logged in
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  // ── Mark thread read when opened ─────────────────────────────────────────
  useEffect(() => {
    if (!activeThread || !me?.id) return;
    markChatThreadRead(activeThread._id).catch(() => {});
    socket?.emit('mark-read', { threadId: activeThread._id });
    setThreadsState((prev) =>
      prev.map((t) => {
        if (t._id !== activeThread._id) return t;
        return { ...t, lastReadAt: { ...t.lastReadAt, [me.id!]: Date.now() } };
      }),
    );
  }, [activeThread?._id, me?.id]);

  // ── Real-time new messages ────────────────────────────────────────────────
  useEffect(() => {
    return onNewMessage((msg) => {
      const threadId = msg.threadId as string | undefined;
      if (!threadId) return;

      setThreadsState((prev) =>
        prev.map((t) => {
          if (t._id !== threadId) return t;
          if (msg._id && t.messages.some((m) => m._id === msg._id)) return t;
          return { ...t, messages: [...t.messages, msg], lastMessageAt: msg.createdAt };
        }),
      );

      setActiveThread((prev) => {
        if (!prev || prev._id !== threadId) return prev;
        if (msg._id && prev.messages.some((m) => m._id === msg._id)) return prev;
        return { ...prev, messages: [...prev.messages, msg], lastMessageAt: msg.createdAt };
      });
    });
  }, [onNewMessage]);

  // ── message-saved: server confirms the message; merge any server-side fields ─
  useEffect(() => {
    return onMessageSaved((savedMsg) => {
      const threadId = savedMsg.threadId;
      if (!threadId) return;
      setActiveThread((prev) => {
        if (!prev || prev._id !== threadId) return prev;
        // clientId matches the pre-generated _id we put in the optimistic message
        const clientId = (savedMsg as any).clientId as string | undefined;
        const msgs = prev.messages.map((m) => {
          if (clientId && m._id === clientId) return { ...m, ...savedMsg, _id: savedMsg._id ?? clientId };
          if (!clientId && !m._id && m.senderId === savedMsg.senderId && m.body === savedMsg.body) return savedMsg;
          return m;
        });
        return { ...prev, messages: msgs };
      });
    });
  }, [onMessageSaved]);

  // ── message-deleted: remove from state in real-time ──────────────────────
  useEffect(() => {
    return onMessageDeleted(({ threadId, messageId }) => {
      setActiveThread((prev) => {
        if (!prev || prev._id !== threadId) return prev;
        return { ...prev, messages: prev.messages.filter((m) => m._id !== messageId) };
      });
      setThreadsState((prev) =>
        prev.map((t) =>
          t._id === threadId
            ? { ...t, messages: t.messages.filter((m) => m._id !== messageId) }
            : t,
        ),
      );
    });
  }, [onMessageDeleted]);

  // ── Typing indicator ─────────────────────────────────────────────────────
  useEffect(() => {
    return onTyping((data) => {
      if (data.threadId !== activeThread?._id) return;
      setTypingUsers((prev) => {
        const next = new Set(prev);
        if (data.isTyping) next.add(data.userId);
        else next.delete(data.userId);
        return next;
      });
    });
  }, [onTyping, activeThread?._id]);

  // ── Auto-scroll ───────────────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeThread?.messages.length]);

  // ── Helpers ───────────────────────────────────────────────────────────────

  function handleTyping(value: string) {
    setText(value);
    if (!activeThread || !socket) return;
    socket.emit('typing', { threadId: activeThread._id, isTyping: value.length > 0 });
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      socket.emit('typing', { threadId: activeThread._id, isTyping: false });
    }, 2000);
  }

  async function handleSend() {
    if ((!text.trim() && !pendingMedia) || !activeThread || !me?.id) return;
    setSending(true);
    const body = text.trim();
    const media = pendingMedia;
    setText('');
    setPendingMedia(null);
    setShowEmoji(false);

    // Pre-generate the ObjectId on the client so the optimistic message has _id
    // immediately — no need to wait for message-saved to discover it.
    const msgId = generateObjectId();

    const optimistic: ChatMessage = {
      _id: msgId,
      senderId: me.id!,
      senderName: me.name,
      senderAvatar: me.avatarUrl ?? '',
      body,
      mediaUrl: media?.url ?? '',
      mediaType: media?.type ?? '',
      createdAt: new Date().toISOString(),
    };

    setActiveThread((prev) =>
      prev ? { ...prev, messages: [...prev.messages, optimistic] } : prev,
    );
    setThreadsState((prev) =>
      prev.map((t) =>
        t._id === activeThread._id ? { ...t, lastMessageAt: optimistic.createdAt } : t,
      ),
    );

    if (socket?.connected) {
      // Pass clientId so the server stores the message with this exact _id
      socket.emit('send-message', {
        threadId: activeThread._id,
        body,
        mediaUrl: media?.url ?? '',
        mediaType: media?.type ?? '',
        clientId: msgId,
      });
    } else {
      try {
        const { message } = await sendChatMessage(activeThread._id, body, media?.url, media?.type);
        setActiveThread((prev) => {
          if (!prev) return prev;
          const msgs = prev.messages.filter((m) => m._id !== msgId);
          return { ...prev, messages: [...msgs, message] };
        });
      } catch {
        setActiveThread((prev) => {
          if (!prev) return prev;
          return { ...prev, messages: prev.messages.filter((m) => m._id !== msgId) };
        });
      }
    }

    setSending(false);
  }

  async function handleDeleteMessage(threadId: string, messageId: string) {
    try {
      await deleteChatMessage(threadId, messageId);
      setActiveThread((prev) => {
        if (!prev) return prev;
        return { ...prev, messages: prev.messages.filter((m) => m._id !== messageId) };
      });
      setThreadsState((prev) =>
        prev.map((t) =>
          t._id === threadId
            ? { ...t, messages: t.messages.filter((m) => m._id !== messageId) }
            : t,
        ),
      );
    } catch (err) {
      alert((err as Error)?.message ?? 'Failed to delete message.');
    }
  }

  async function handleDeleteThread() {
    if (!activeThread || deletingThread) return;
    if (!confirm('Delete this entire conversation? This cannot be undone.')) return;
    setDeletingThread(true);
    try {
      await deleteChatThread(activeThread._id);
      setThreadsState((prev) => prev.filter((t) => t._id !== activeThread._id));
      setActiveThread(null);
      router.replace('/messages');
    } catch (err) {
      alert((err as Error)?.message ?? 'Failed to delete conversation.');
    } finally {
      setDeletingThread(false);
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingMedia(true);
    try {
      const url = await uploadChatMedia(file);
      let type = 'document';
      if (file.type.startsWith('image/')) type = 'image';
      else if (file.type.startsWith('video/')) type = 'video';
      else if (file.type.startsWith('audio/')) type = 'audio';
      setPendingMedia({ url, type, name: file.name });
    } catch {
      alert('Upload failed. Please try again.');
    } finally {
      setUploadingMedia(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  const openThread = useCallback((t: ChatThread) => {
    setActiveThread(t);
    router.replace(`/messages?thread=${t._id}`);
  }, [router]);

  // ─────────────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <main>
        <SiteHeader active="Activity" />
        <LoadingIndicator label="Loading conversations..." />
      </main>
    );
  }

  if (!me) {
    return (
      <main>
        <SiteHeader active="Activity" />
        <div style={{ padding: '80px 20px', textAlign: 'center' }}>
          <p>Please <a href="/login" style={{ color: 'var(--brand)' }}>log in</a> to view messages.</p>
        </div>
        <SiteFooter />
      </main>
    );
  }

  return (
    <main style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <SiteHeader active="Activity" />

      <div className="messenger-layout">
        {/* ── Sidebar ── */}
        <aside className="messenger-sidebar">
          <div className="messenger-sidebar-head">
            <h2 className="messenger-title">Messages</h2>
          </div>
          <div className="messenger-thread-list">
            {threads.length === 0 && (
              <p className="messenger-empty">No conversations yet. Visit a friend&apos;s profile to start chatting.</p>
            )}
            {threads.map((t) => {
              const unread = threadUnreadCount(t, me.id ?? '');
              const last = t.messages[t.messages.length - 1];
              const isActive = activeThread?._id === t._id;
              const displayName = getThreadDisplayName(t.title, me.name);
              return (
                <button
                  key={t._id}
                  type="button"
                  className={`messenger-thread-item ${isActive ? 'messenger-thread-item--active' : ''}`}
                  onClick={() => openThread(t)}
                >
                  <div className="messenger-thread-avatar">
                    <span>{displayName?.[0]?.toUpperCase() ?? '?'}</span>
                  </div>
                  <div className="messenger-thread-info">
                    <div className="messenger-thread-name">
                      {displayName}
                      {unread > 0 && <span className="messenger-unread-badge">{unread}</span>}
                    </div>
                    <div className="messenger-thread-preview">
                      {last ? (last.body || (last.mediaUrl ? '📎 Attachment' : '')) : 'No messages yet'}
                    </div>
                  </div>
                  {last && (
                    <div className="messenger-thread-time">{formatTime(last.createdAt)}</div>
                  )}
                </button>
              );
            })}
          </div>
        </aside>

        {/* ── Chat panel ── */}
        <div className="messenger-chat">
          {!activeThread ? (
            <div className="messenger-empty-state">
              <div className="messenger-empty-icon">💬</div>
              <h3>Select a conversation</h3>
              <p>Choose from your existing conversations or start a new one from a friend&apos;s profile.</p>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div className="messenger-chat-header">
                <div className="messenger-chat-header-info">
                  <div className="messenger-chat-header-avatar">
                    {getThreadDisplayName(activeThread.title, me.name)?.[0]?.toUpperCase() ?? '?'}
                  </div>
                  <div>
                    <div className="messenger-chat-header-name">
                      {getThreadDisplayName(activeThread.title, me.name)}
                    </div>
                    <div className="messenger-chat-header-status">
                      {typingUsers.size > 0 ? 'typing…' : 'online'}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  className="messenger-delete-chat-btn"
                  title="Delete conversation"
                  onClick={handleDeleteThread}
                  disabled={deletingThread}
                >
                  <Trash size={15} />
                  {deletingThread ? 'Deleting…' : 'Delete Chat'}
                </button>
              </div>

              {/* Messages */}
              <div className="messenger-messages">
                {activeThread.messages.length === 0 && (
                  <div className="messenger-no-messages">Say hello! 👋</div>
                )}
                {activeThread.messages.map((msg, i) => (
                  <Bubble
                    key={msg._id ?? i}
                    msg={msg}
                    isMe={msg.senderId.toString() === me.id}
                    onDelete={
                      msg._id
                        ? () => handleDeleteMessage(activeThread._id, msg._id!)
                        : undefined
                    }
                  />
                ))}
                {typingUsers.size > 0 && (
                  <div className="chat-typing-indicator">
                    <span /><span /><span />
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Pending media preview */}
              {pendingMedia && (
                <div className="messenger-pending-media">
                  {pendingMedia.type === 'image' ? (
                    <img src={pendingMedia.url} alt="preview" style={{ height: 60, borderRadius: 8 }} />
                  ) : (
                    <span style={{ fontSize: 13 }}>📎 {pendingMedia.name}</span>
                  )}
                  <button type="button" onClick={() => setPendingMedia(null)} className="messenger-remove-media">
                    <X size={14} />
                  </button>
                </div>
              )}

              {/* Emoji picker */}
              {showEmoji && (
                <div className="messenger-emoji-picker">
                  {EMOJIS.map((e) => (
                    <button
                      key={e}
                      type="button"
                      className="messenger-emoji-btn"
                      onClick={() => setText((t) => t + e)}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              )}

              {/* Input row */}
              <div className="messenger-input-row">
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
                  onChange={handleFileChange}
                />
                <button
                  type="button"
                  className="messenger-icon-btn"
                  title="Attach file"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingMedia}
                >
                  {uploadingMedia ? '…' : <Paperclip size={18} />}
                </button>
                <button
                  type="button"
                  className={`messenger-icon-btn ${showEmoji ? 'messenger-icon-btn--active' : ''}`}
                  title="Emoji"
                  onClick={() => setShowEmoji((v) => !v)}
                >
                  <Smile size={18} />
                </button>
                <input
                  className="messenger-text-input"
                  placeholder="Type a message…"
                  value={text}
                  onChange={(e) => handleTyping(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                />
                <button
                  type="button"
                  className="messenger-send-btn"
                  onClick={handleSend}
                  disabled={sending || (!text.trim() && !pendingMedia)}
                >
                  <Send size={16} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <SiteFooter />
    </main>
  );
}

function threadUnreadCount(thread: ChatThread, myId: string): number {
  const lastRead = thread.lastReadAt?.[myId] ?? 0;
  return thread.messages.filter(
    (m) => m.senderId.toString() !== myId && new Date(m.createdAt).getTime() > lastRead,
  ).length;
}
