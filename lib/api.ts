import {
  activity,
  articleCategories,
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
  ArticleCategory,
  FileAsset,
  ForumThread,
  Group,
  GroupMember,
  GroupType,
  Member,
  NewsCategory,
  NewsItem,
  Product,
  ProductCategory,
} from './types';
import type { DashboardUser } from "@/components/dashboard/types";
import { showAppToast } from './app-toast';
import { assertUploadFileSize } from './upload-validation';


export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';
const SERVER_API_URL = process.env.API_INTERNAL_URL ?? API_URL;
const DEFAULT_FETCH_TIMEOUT_MS = 3000;
const PUBLIC_API_ORIGIN = API_URL.replace(/\/api\/?$/, '');

function absoluteUploadUrl(url: string) {
  return url.startsWith('http') ? url : `${API_URL.replace(/\/api$/, '')}${url}`;
}

async function readUploadErrorMessage(response: Response) {
  try {
    const data = await response.clone().json();
    const message = Array.isArray(data?.message) ? data.message.join(' ') : data?.message;

    if (typeof message === 'string' && message.trim()) {
      return message;
    }
  } catch {}

  return 'Upload failed. Please try again.';
}

export async function uploadApiFile(path: string, file: File, tokenOverride?: string | null) {
  assertUploadFileSize(file);

  const token = tokenOverride ?? (typeof window !== 'undefined' ? localStorage.getItem('asiance_token') : null);
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  if (!response.ok) {
    const message = await readUploadErrorMessage(response);

    if (response.status === 413 || message.toLowerCase().includes('too large')) {
      showAppToast(message, 'error');
    }

    throw new Error(message);
  }

  return response.json() as Promise<{ url: string; publicId?: string; resourceType?: string }>;
}

function apiUrl(path: string) {
  const baseUrl = typeof window === 'undefined' ? SERVER_API_URL : API_URL;
  return `${baseUrl}${path}`;
}

function normalizeApiData<T>(value: T): T {
  if (typeof value === 'string') {
    if (value.startsWith('/api/uploads/')) {
      return `${PUBLIC_API_ORIGIN}${value}` as T;
    }

    return value.replace(/^https?:\/\/(?:localhost|127\.0\.0\.1):4000/i, PUBLIC_API_ORIGIN) as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) => normalizeApiData(item)) as T;
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, normalizeApiData(item)]),
    ) as T;
  }

  return value;
}

async function fetchJson<T>(path: string, fallback: T, init?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(apiUrl(path), {
      ...init,
      cache: init?.cache ?? (init?.method ? undefined : 'no-store'),
      signal: init?.signal ?? controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers ?? {}),
      },
    });

    if (!response.ok) return fallback;
    const data = await response.json() as T;
    return normalizeApiData(data);
  } catch {
    return fallback;
  } finally {
    clearTimeout(timeout);
  }
}

export type ProductSortOption =
  | 'default'
  | 'popularity'
  | 'rating'
  | 'latest'
  | 'price-asc'
  | 'price-desc';

export type ProductQuery = {
  category?: string;
  sort?: ProductSortOption;
};

function productSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function filterProductsFallback(options: ProductQuery = {}) {
  const category = options.category?.toLowerCase();
  const filtered = category
    ? products.filter((product) => {
        const slug = product.categorySlug || productSlug(product.category);
        return slug === category || product.category.toLowerCase() === category;
      })
    : products;

  return [...filtered].sort((left, right) => {
    const leftPrice = left.salePrice ?? left.price;
    const rightPrice = right.salePrice ?? right.price;

    if (options.sort === 'price-asc') return leftPrice - rightPrice;
    if (options.sort === 'price-desc') return rightPrice - leftPrice;
    if (options.sort === 'latest') {
      return new Date(right.createdAt ?? 0).getTime() - new Date(left.createdAt ?? 0).getTime();
    }

    return (left.menuOrder ?? 0) - (right.menuOrder ?? 0);
  });
}

function productCategoryFallback() {
  const categories = new Map<string, ProductCategory>();

  products.forEach((product) => {
    const slug = product.categorySlug || productSlug(product.category);
    const existing = categories.get(slug);

    categories.set(slug, {
      name: existing?.name ?? product.category,
      slug,
      count: (existing?.count ?? 0) + 1,
    });
  });

  return Array.from(categories.values()).sort((left, right) => left.name.localeCompare(right.name));
}

export function getProducts(options: ProductQuery = {}) {
  const params = new URLSearchParams();

  if (options.category) params.set('category', options.category);
  if (options.sort && options.sort !== 'default') params.set('sort', options.sort);

  const query = params.toString() ? `?${params.toString()}` : '';
  return fetchJson<Product[]>(`/shop/products${query}`, filterProductsFallback(options));
}

export function getProductCategories() {
  return fetchJson<ProductCategory[]>('/shop/categories', productCategoryFallback());
}

export async function getProduct(slug: string) {
  const fallback = products.find((product) => product.slug === slug) ?? products[0];
  return fetchJson<Product>(`/shop/products/${slug}`, fallback);
}

export function getArticles(category?: string) {
  const fallback = category
    ? articles.filter((article) => article.category.toLowerCase().includes(category.toLowerCase()))
    : articles;
  const query = category ? `?category=${encodeURIComponent(category)}` : '';
  return fetchJson<Article[]>(`/articles${query}`, fallback);
}

export type ArticleSubmitPayload = {
  title: string;
  category: string;
  excerpt?: string;
  content?: string;
  image?: string;
  tags?: string[];
  featured?: boolean;
};

export function getMyArticles(status?: Article['status']) {
  const query = status ? `?status=${encodeURIComponent(status)}` : '';
  return requestJson<Article[]>(`/articles/me${query}`, { method: 'GET' }, []);
}

export async function submitArticle(payload: ArticleSubmitPayload) {
  return requestJson<Article>('/articles/submit', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function getArticleCategories() {
  return fetchJson<ArticleCategory[]>('/articles/categories', articleCategories);
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

export function getMembers(init?: RequestInit) {
  return fetchJson<Member[]>('/members', members, init);
}

export async function getMember(handle: string) {
  const normalized = handle.replace(/^@/, '');
  const fallback = members.find((member) => member.handle === normalized) ?? members[0];
  return fetchJson<Member>(`/members/${normalized}`, fallback);
}

export function getActivity() {
  return fetchJson<Activity[]>('/activity', [], { cache: 'no-store' });
}

export function getActivityItem(activityId: string) {
  return requestJson<Activity>(`/activity/${activityId}`, { method: 'GET' });
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
    const response = await fetch(apiUrl(path), {
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

    const data = await response.json() as T;
    return normalizeApiData(data);
  } catch (error) {
    if (fallback !== undefined) {
      return fallback;
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Request failed.');
  }
}

export type ActivityCreatePayload = {
  text: string;
  type?: Activity['type'];
  privacy?: 'public' | 'friends' | 'group' | 'private';
  featured?: boolean;
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

export async function getMemberFriends(handle: string): Promise<FriendUser[]> {
  return fetchJson<FriendUser[]>(`/members/${handle}/friends`, [], { cache: 'no-store' });
}

export type PublicPurchasedProduct = {
  key: string;
  name: string;
  slug?: string;
  image?: string;
  quantity: number;
  variationName?: string;
  lastPurchasedAt?: string;
};

export async function getMemberPurchasedProducts(handle: string): Promise<PublicPurchasedProduct[]> {
  return fetchJson<PublicPurchasedProduct[]>(
    `/shop/members/${handle}/purchased-products`,
    [],
    { cache: 'no-store' },
  );
}

export type OutgoingRequest = { userId: string; friendshipId: string };

export async function getOutgoingRequests(): Promise<OutgoingRequest[]> {
  return requestJson<OutgoingRequest[]>('/friends/outgoing', { method: 'GET' }, []);
}

export async function getFriendRequests(): Promise<FriendRequest[]> {
  return requestJson<FriendRequest[]>('/friends/requests', { method: 'GET' }, []);
}

export async function uploadMedia(file: File, tokenOverride?: string | null): Promise<string> {
  const data = await uploadApiFile('/uploads', file, tokenOverride);
  return data.url;
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

export function getThreads(init?: RequestInit) {
  return fetchJson<ForumThread[]>('/forums/threads', threads, init);
}

export function getFiles() {
  return fetchJson<FileAsset[]>('/library', files);
}



export async function uploadImage(file: File) {
  const data = await uploadApiFile('/uploads', file);
  return { url: absoluteUploadUrl(data.url) };
}

export async function uploadLibraryMedia(file: File, tokenOverride?: string | null): Promise<string> {
  const data = await uploadApiFile('/library/upload', file, tokenOverride);
  return data.url;
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
  | "name"
  | "username"
  | "email"
  | "bio"
  | "interests"
  | "avatarUrl"
  | "coverImageUrl"
  | "facebookUrl"
  | "instagramUrl"
  | "tiktokUrl"
  | "snapchatUrl"
  | "emailLink"
  | "showFriends"
  | "showProducts"
>>;

export async function updateMe(payload: UpdateMePayload) {
  // PATCH /api/members/me
  return requestJson<DashboardUser>("/members/me", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export type ContactInquiryPayload = {
  name: string;
  email: string;
  phone?: string;
  topic?: string;
  subject: string;
  message: string;
};

export async function submitContactInquiry(payload: ContactInquiryPayload) {
  return requestJson<{ ok: boolean; message: string }>('/contact', {
    method: 'POST',
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
  const data = await uploadApiFile('/uploads', file);
  return absoluteUploadUrl(data.url);
}
