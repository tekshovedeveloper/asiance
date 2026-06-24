import {
  activity,
  articles,
  files,
  groups,
  members,
  newsCategories,
  newsItems,
  products,
  threads,
} from './mock-data';
import type {
  Activity,
  Article,
  FileAsset,
  ForumThread,
  Group,
  GroupMember,
  GroupType,
  Member,
  NewsCategory,
  NewsItem,
  Product,
} from './types';
import type { DashboardUser } from "@/components/dashboard/types";


export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

async function fetchJson<T>(path: string, fallback: T, init?: RequestInit): Promise<T> {
  const deadline = new Promise<T>((resolve) => setTimeout(() => resolve(fallback), 4000));
  const request = (async () => {
    try {
      const response = await fetch(`${API_URL}${path}`, {
        ...init,
        next: init?.method || init?.cache === 'no-store' ? undefined : { revalidate: 60 },
        headers: {
          'Content-Type': 'application/json',
          ...(init?.headers ?? {}),
        },
      });
      if (!response.ok) return fallback;
      return response.json() as Promise<T>;
    } catch {
      return fallback;
    }
  })();
  return Promise.race([request, deadline]);
}

export function getProducts() {
  return fetchJson<Product[]>('/shop/products', products);
}

export async function getProduct(slug: string) {
  const fallback = products.find((product) => product.slug === slug) ?? products[0];
  console.log("the fallback",fallback )
  return fetchJson<Product>(`/shop/products/${slug}`, fallback);
}

export function getArticles(category?: string) {
  const fallback = category
    ? articles.filter((article) => article.category.toLowerCase().includes(category.toLowerCase()))
    : articles;
  const query = category ? `?category=${encodeURIComponent(category)}` : '';
  return fetchJson<Article[]>(`/articles${query}`, fallback);
}

export async function getArticle(slug: string) {
  const fallback = articles.find((article) => article.slug === slug) ?? articles[0];
  return fetchJson<Article>(`/articles/${slug}`, fallback);
}

export type NewsQuery = {
  category?: string;
  q?: string;
  featured?: boolean;
  breaking?: boolean;
  limit?: number;
};

export function getNews(options: NewsQuery = {}) {
  const params = new URLSearchParams();
  if (options.category) params.set('category', options.category);
  if (options.q) params.set('q', options.q);
  if (typeof options.featured === 'boolean') params.set('featured', String(options.featured));
  if (typeof options.breaking === 'boolean') params.set('breaking', String(options.breaking));
  if (options.limit) params.set('limit', String(options.limit));

  const query = params.toString() ? `?${params.toString()}` : '';
  const fallback = newsItems
    .filter((item) => item.status !== 'draft')
    .filter((item) => {
      const category = options.category?.toLowerCase();
      if (!category) return true;
      return item.categorySlug === category || item.categoryName.toLowerCase().includes(category);
    })
    .filter((item) => (typeof options.featured === 'boolean' ? item.featured === options.featured : true))
    .filter((item) => (typeof options.breaking === 'boolean' ? item.breaking === options.breaking : true))
    .filter((item) => {
      const q = options.q?.toLowerCase();
      if (!q) return true;
      return [item.title, item.excerpt, item.content, item.categoryName, item.sourceName]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(q));
    })
    .slice(0, options.limit ?? newsItems.length);

  return fetchJson<NewsItem[]>(`/news${query}`, fallback);
}

export async function getNewsItem(slug: string) {
  const fallback = newsItems.find((item) => item.slug === slug) ?? newsItems[0];
  return fetchJson<NewsItem>(`/news/${slug}`, fallback);
}

export function getNewsCategories() {
  return fetchJson<NewsCategory[]>('/news/categories', newsCategories);
}

export function getGroupTypes() {
  return fetchJson<GroupType[]>('/group-types', []);
}

export async function createGroupType(payload: { name: string; description?: string }) {
  return requestJson<GroupType>('/group-types', { method: 'POST', body: JSON.stringify(payload) });
}

export async function updateGroupType(id: string, payload: Partial<{ name: string; description: string }>) {
  return requestJson<GroupType>(`/group-types/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
}

export async function deleteGroupType(id: string) {
  return requestJson<{ ok: boolean }>(`/group-types/${id}`, { method: 'DELETE' });
}

export function getGroups() {
  return fetchJson<Group[]>('/groups', groups);
}

export function getMyGroups() {
  return requestJson<Group[]>('/groups/mine');
}

export async function getGroup(slug: string) {
  return fetchJson<Group>(
    `/groups/${slug}`,
    { name: '', slug, category: '', privacy: 'public', description: '', image: '', membersCount: 0, members: [], pendingMembers: [], blockedMembers: [], tags: [] } as unknown as Group,
    { cache: 'no-store' },
  );
}

export async function createGroup(payload: Partial<Group>) {
  return requestJson<Group>('/groups', { method: 'POST', body: JSON.stringify(payload) });
}

export async function updateGroup(slug: string, payload: Partial<Group>) {
  return requestJson<Group>(`/groups/${slug}`, { method: 'PATCH', body: JSON.stringify(payload) });
}

export async function deleteGroup(slug: string) {
  return requestJson<{ ok: boolean }>(`/groups/${slug}`, { method: 'DELETE' });
}

export async function joinGroup(slug: string) {
  return requestJson<Group & { status: string }>(`/groups/${slug}/join`, { method: 'POST' });
}

export async function leaveGroup(slug: string) {
  return requestJson<{ ok: boolean }>(`/groups/${slug}/leave`, { method: 'POST' });
}

export async function getGroupMembers(slug: string) {
  return requestJson<GroupMember[]>(`/groups/${slug}/members`, { method: 'GET' }, []);
}

export async function getGroupPending(slug: string) {
  return requestJson<GroupMember[]>(`/groups/${slug}/pending`, { method: 'GET' }, []);
}

export async function approveMember(slug: string, userId: string) {
  return requestJson<{ ok: boolean }>(`/groups/${slug}/approve/${userId}`, { method: 'POST' });
}

export async function removeGroupMember(slug: string, userId: string) {
  return requestJson<{ ok: boolean }>(`/groups/${slug}/remove/${userId}`, { method: 'POST' });
}

export async function blockGroupMember(slug: string, userId: string) {
  return requestJson<{ ok: boolean }>(`/groups/${slug}/block/${userId}`, { method: 'POST' });
}

export async function unblockGroupMember(slug: string, userId: string) {
  return requestJson<{ ok: boolean }>(`/groups/${slug}/unblock/${userId}`, { method: 'POST' });
}

export async function getGroupActivity(slug: string) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('asiance_token') : null;
  const res = await fetch(`${API_URL}/groups/${slug}/activity`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    cache: 'no-store',
  });
  if (!res.ok) return [] as Activity[];
  return res.json() as Promise<Activity[]>;
}

export function getMembers() {
  return fetchJson<Member[]>('/members', members);
}

export async function getMember(handle: string) {
  const normalized = handle.replace(/^@/, '');
  const fallback = members.find((member) => member.handle === normalized) ?? members[0];
  return fetchJson<Member>(`/members/${normalized}`, fallback);
}

export function getActivity() {
  return fetchJson<Activity[]>('/activity', [], { cache: 'no-store' });
}

export function getMyActivity() {
  return requestJson<Activity[]>('/activity/mine');
}

export function getMemberActivity(handle: string) {
  return fetchJson<Activity[]>(`/activity/by-handle/${handle}`, [], { cache: 'no-store' });
}

export function getTopMembers() {
  return fetchJson<{ _id: string; name: string; handle: string; avatar: string; bio: string; friendCount: number }[]>(
    '/members/top',
    [],
    { cache: 'no-store' },
  );
}

function authHeaders(init?: RequestInit) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('asiance_token') : null;
  return {
    ...(init?.headers ?? {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  } as HeadersInit;
}

async function requestJson<T>(path: string, init?: RequestInit, fallback?: T): Promise<T> {
  try {
    const response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(init),
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Please log in to continue.');
      }

      const contentType = response.headers.get('content-type') ?? '';
      if (contentType.includes('application/json')) {
        const errorBody = await response.json().catch(() => null);
        if (fallback !== undefined) {
          return fallback;
        }
        throw new Error(errorBody?.message || errorBody?.error || 'Request failed.');
      }

      const text = await response.text().catch(() => '');
      if (fallback !== undefined) {
        return fallback;
      }
      throw new Error(text || 'Request failed.');
    }

    return response.json() as Promise<T>;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    if (fallback !== undefined) {
      return fallback;
    }
    throw new Error('Request failed.');
  }
}

export type ActivityCreatePayload = {
  text: string;
  type?: Activity['type'];
  privacy?: 'public' | 'friends' | 'group' | 'private';
  groupSlug?: string;
  linkPreview?: string;
  quote?: string;
  hashtags?: string[];
  mentions?: string[];
  media?: Array<{ type: string; url: string; caption?: string }>;
  targetName?: string;
  targetSlug?: string;
};

export async function createActivity(payload: ActivityCreatePayload) {
  return requestJson<Activity>('/activity', { method: 'POST', body: JSON.stringify(payload) });
}

export async function updateActivity(activityId: string, payload: Partial<Activity>) {
  return requestJson<Activity>(`/activity/${activityId}`, { method: 'PATCH', body: JSON.stringify(payload) });
}

export async function deleteActivity(activityId: string) {
  return requestJson<{ ok: boolean; deletedId: string }>(`/activity/${activityId}/delete`, { method: 'POST' });
}

export async function likeActivity(activityId: string) {
  return requestJson<Activity>(`/activity/${activityId}/like`, { method: 'POST' });
}

export async function reactToActivity(activityId: string, reaction: string) {
  return requestJson<Activity>(`/activity/${activityId}/react`, {
    method: 'POST',
    body: JSON.stringify({ reaction }),
  });
}

export async function commentOnActivity(activityId: string, body: { body: string }) {
  return requestJson<Activity>(`/activity/${activityId}/comments`, { method: 'POST', body: JSON.stringify(body) });
}

export async function likeActivityComment(activityId: string, commentIndex: number) {
  return requestJson<Activity>(`/activity/${activityId}/comments/${commentIndex}/like`, { method: 'POST' });
}

export async function replyToActivityComment(activityId: string, commentIndex: number, body: { body: string }) {
  return requestJson<Activity>(`/activity/${activityId}/comments/${commentIndex}/replies`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function saveFavorite(activityId: string) {
  return requestJson<{ saved: boolean }>(`/favorites/${activityId}`, { method: 'POST' });
}

export async function getFavorites() {
  return requestJson<Activity[]>('/favorites', { method: 'GET' });
}

export async function getNotifications() {
  return requestJson<Array<{ _id?: string; message: string; type: string; read: boolean; createdAt?: string; link?: string }>>('/notifications', { method: 'GET' });
}

export async function getUnreadNotificationCount(): Promise<{ count: number }> {
  return requestJson<{ count: number }>('/notifications/unread-count', { method: 'GET' }, { count: 0 });
}

export async function markAllNotificationsRead() {
  return requestJson<{ ok: boolean }>('/notifications/read-all', { method: 'PATCH' });
}

export async function sendFriendRequest(userId: string) {
  return requestJson<{ _id?: string; status?: string }>(`/friends/${userId}/request`, { method: 'POST' });
}

export type FriendUser = {
  _id: string;
  name: string;
  handle: string;
  avatar?: string;
  status?: string;
  bio?: string;
};

export type FriendRequest = {
  friendshipId: string;
  requesterId: string;
  name: string;
  handle: string;
  avatar?: string;
  status?: string;
  bio?: string;
};

export async function getFriendsList(): Promise<FriendUser[]> {
  return requestJson<FriendUser[]>('/friends', { method: 'GET' }, []);
}

export type OutgoingRequest = { userId: string; friendshipId: string };

export async function getOutgoingRequests(): Promise<OutgoingRequest[]> {
  return requestJson<OutgoingRequest[]>('/friends/outgoing', { method: 'GET' }, []);
}

export async function getFriendRequests(): Promise<FriendRequest[]> {
  return requestJson<FriendRequest[]>('/friends/requests', { method: 'GET' }, []);
}

export async function uploadMedia(file: File): Promise<string> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('asiance_token') : null;
  const formData = new FormData();
  formData.append('file', file);
  const response = await fetch(`${API_URL}/uploads`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  if (!response.ok) throw new Error('Upload failed');
  const data = await response.json();
  return data.url as string;
}

export async function acceptFriendRequest(friendshipId: string) {
  return requestJson<{ status: string }>(`/friends/${friendshipId}/accept`, { method: 'POST' });
}

export async function rejectFriendRequest(friendshipId: string) {
  return requestJson<{ status: string }>(`/friends/${friendshipId}/reject`, { method: 'POST' });
}

export async function removeFriend(userId: string) {
  return requestJson<{ ok: boolean }>(`/friends/${userId}/remove`, { method: 'POST' });
}

export async function cancelFriendRequest(userId: string) {
  return requestJson<{ ok: boolean }>(`/friends/${userId}/cancel`, { method: 'POST' });
}

export function getThreads() {
  return fetchJson<ForumThread[]>('/forums/threads', threads);
}

export function getFiles() {
  return fetchJson<FileAsset[]>('/library', files);
}



export async function uploadImage(file: File) {
  const token = typeof window !== "undefined" ? localStorage.getItem("asiance_token") : null;

  const fd = new FormData();
  fd.append("file", file);

  const res = await fetch(`${API_URL}/uploads`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: fd,
  });

  if (!res.ok) throw new Error("Upload failed");

  const data = (await res.json()) as { url: string };

  // ✅ convert "/api/uploads/xxx.jpg" into "http://localhost:4000/api/uploads/xxx.jpg"
  const absoluteUrl = data.url.startsWith("http")
    ? data.url
    : `${API_URL.replace(/\/api$/, "")}${data.url}`;

  return { url: absoluteUrl };
}


export async function getMe() {
  // GET /api/members/me
  return requestJson<DashboardUser>("/members/me", { method: "GET" });
}

export async function getMyOrders() {
  return requestJson<any[]>('/shop/my-orders', { method: 'GET' }, []);
}

export async function cancelMyOrder(id: string) {
  return requestJson<any>(`/shop/my-orders/${id}/cancel`, { method: 'PATCH' });
}

export type UpdateMePayload = Partial<Pick<
  DashboardUser,
  "name" | "username" | "email" | "bio" | "avatarUrl" | "coverImageUrl"
>>;

export async function updateMe(payload: UpdateMePayload) {
  // PATCH /api/members/me
  return requestJson<DashboardUser>("/members/me", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

// ─── Chat / Messages ──────────────────────────────────────────────────────────

export type ChatMessage = {
  _id?: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  body: string;
  mediaUrl: string;
  mediaType: string;
  createdAt: string;
  threadId?: string;
};

export type ChatThread = {
  _id: string;
  title: string;
  participants: string[];
  messages: ChatMessage[];
  lastMessageAt: string;
  lastReadAt: Record<string, number>;
};

export async function getChatThreads(): Promise<ChatThread[]> {
  return requestJson<ChatThread[]>('/messages', { method: 'GET' }, []);
}

export async function createOrGetChatThread(userId: string): Promise<ChatThread> {
  return requestJson<ChatThread>(`/messages/thread/${userId}`, { method: 'POST' });
}

export async function getChatThread(threadId: string): Promise<ChatThread> {
  return requestJson<ChatThread>(`/messages/${threadId}`, { method: 'GET' });
}

export async function markChatThreadRead(threadId: string) {
  return requestJson<{ ok: boolean }>(`/messages/${threadId}/read`, { method: 'PATCH' });
}

export async function getUnreadMessageCount(): Promise<{ count: number }> {
  return requestJson<{ count: number }>('/messages/unread', { method: 'GET' }, { count: 0 });
}

export async function sendChatMessage(
  threadId: string,
  body: string,
  mediaUrl?: string,
  mediaType?: string,
): Promise<{ thread: ChatThread; message: ChatMessage }> {
  return requestJson(`/messages/${threadId}`, {
    method: 'POST',
    body: JSON.stringify({ body, mediaUrl, mediaType }),
  });
}

export async function deleteChatMessage(threadId: string, messageId: string) {
  return requestJson<{ ok: boolean }>(`/messages/${threadId}/message/${messageId}`, { method: 'DELETE' });
}

export async function deleteChatThread(threadId: string) {
  return requestJson<{ ok: boolean }>(`/messages/${threadId}`, { method: 'DELETE' });
}

export async function uploadChatMedia(file: File): Promise<string> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('asiance_token') : null;
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch(`${API_URL}/uploads`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: fd,
  });
  if (!res.ok) throw new Error('Upload failed');
  const data = (await res.json()) as { url: string };
  return data.url.startsWith('http') ? data.url : `${API_URL.replace(/\/api$/, '')}${data.url}`;
}



