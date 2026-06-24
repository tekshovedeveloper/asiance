'use client';

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import {
  BarChart3,
  FileText,
  FolderPlus,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Newspaper,
  PackagePlus,
  Pencil,
  Plus,
  Save,
  Search,
  Tags,
  Trash2,
  UsersRound,
  X,
} from 'lucide-react';
import {
  API_URL,
  approveMember,
  blockGroupMember,
  createGroupType,
  deleteGroup,
  deleteGroupType,
  deleteActivity,
  getGroupActivity,
  getGroupMembers,
  getGroupPending,
  getGroupTypes,
  removeGroupMember,
  unblockGroupMember,
  updateActivity,
  updateGroup,
  uploadMedia,
} from '@/lib/api';
import { NewsEditor } from '@/components/NewsEditor';
import { ProductAdminPanel } from '@/components/admin/products';
import { OrderAdminPanel } from '@/components/admin/orders/OrderAdminPanel';
import { ShippingAdminPanel } from '@/components/admin/shipping/ShippingAdminPanel';
import { UserAdminPanel } from '@/components/admin/users/UserAdminPanel';
import {
  articles,
  groups,
  newsCategories as fallbackNewsCategories,
  newsItems as fallbackNewsItems,
  products,
} from '@/lib/mock-data';
import type { Activity, Group, GroupMember, GroupType, NewsCategory, NewsItem } from '@/lib/types';

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

function mediaThumb(m: { type: string; url: string; caption?: string }) {
  const src = resolveMediaUrl(m.url);
  if (m.type === 'video') return <video src={src} muted style={{ width: '100%', height: '100%', objectFit: 'contain' }} />;
  if (m.type === 'image') return <img src={src} alt={m.caption || ''} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />;
  const icon = m.type === 'audio' ? '🎵' : '📄';
  const filename = src.split('/').pop()?.split('?')[0] ?? m.type;
  return (
    <div className="media-file-placeholder">
      <span className="media-file-icon">{icon}</span>
      <span className="media-file-label">{filename}</span>
    </div>
  );
}

type Stats = {
  members: number;
  articles: number;
  news: number;
  newsCategories: number;
  products: number;
  orders: number;
  groups: number;
  activities: number;
  revenue: number;
  shipping: number;
};

type AdminView =
  | 'overview'
  | 'news-list'
  | 'news-add'
  | 'news-categories'
  | 'products'
  | 'orders'
  | 'shipping'
  | 'articles'
  | 'circles'
  | 'group-types'
  | 'groups-list'
  | 'activity'
  | 'users';

type NewsFormState = {
  title: string;
  slug: string;
  categorySlug: string;
  excerpt: string;
  content: string;
  image: string;
  authorName: string;
  tags: string;
  featured: boolean;
  breaking: boolean;
  sourceName: string;
  sourceUrl: string;
  status: 'draft' | 'published';
  publishedAt: string;
};

type CategoryFormState = {
  name: string;
  slug: string;
  description: string;
  sortOrder: string;
};

const fallbackStats: Stats = {
  members: 842,
  articles: articles.length,
  news: fallbackNewsItems.length,
  newsCategories: fallbackNewsCategories.length,
  products: products.length,
  orders: 24,
  shipping: 0,
  groups: groups.length,
  activities: 7242,
  revenue: 18240,
};

const emptyNewsForm: NewsFormState = {
  title: '',
  slug: '',
  categorySlug: 'news',
  excerpt: '',
  content: '',
  image: '',
  authorName: 'Asiance Editors',
  tags: '',
  featured: false,
  breaking: false,
  sourceName: '',
  sourceUrl: '',
  status: 'published',
  publishedAt: '',
};

const emptyCategoryForm: CategoryFormState = {
  name: '',
  slug: '',
  description: '',
  sortOrder: '0',
};

function toDateTimeLocal(value?: string) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 16);
}

function formatAdminDate(value?: string) {
  if (!value) return 'Published';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Published';
  return `Published ${date.toLocaleDateString('en-CA').replace(/-/g, '/')} at ${date.toLocaleTimeString(
    'en',
    {
      hour: 'numeric',
      minute: '2-digit',
    },
  )}`;
}

function monthKey(value?: string) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function monthLabel(key: string) {
  const [year, month] = key.split('-').map(Number);
  return new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' }).format(
    new Date(year, month - 1, 1),
  );
}

function tagsToInput(tags?: string[]) {
  return tags?.join(', ') ?? '';
}

function parseTags(value: string) {
  return value
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export function AdminPanel() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [authChecked, setAuthChecked] = useState(false);
  const [stats, setStats] = useState<Stats>(fallbackStats);
  const [status, setStatus] = useState('');
  const [activeView, setActiveView] = useState<AdminView>('news-list');
  const [newsItems, setNewsItems] = useState<NewsItem[]>(fallbackNewsItems);
  const [newsCategories, setNewsCategories] = useState<NewsCategory[]>(fallbackNewsCategories);
  const [newsForm, setNewsForm] = useState<NewsFormState>(emptyNewsForm);
  const [editingNewsSlug, setEditingNewsSlug] = useState('');
  const [categoryForm, setCategoryForm] = useState<CategoryFormState>(emptyCategoryForm);
  const [editingCategorySlug, setEditingCategorySlug] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedNews, setSelectedNews] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState('');
  const [page, setPage] = useState(1);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [activityItems, setActivityItems] = useState<Activity[]>([]);
  const [activityEditingId, setActivityEditingId] = useState<string | null>(null);
  const [activityEditingText, setActivityEditingText] = useState('');
  const [activityEditingMedia, setActivityEditingMedia] = useState<Activity['media']>([]);
  const [activityUploadingMedia, setActivityUploadingMedia] = useState(false);

  // Group types state
  const [groupTypesList, setGroupTypesList] = useState<GroupType[]>([]);
  const [groupTypeName, setGroupTypeName] = useState('');
  const [groupTypeDesc, setGroupTypeDesc] = useState('');
  const [groupTypesSaving, setGroupTypesSaving] = useState(false);

  // Groups management state
  const [adminGroups, setAdminGroups] = useState<Group[]>([]);
  const [adminGroupsLoading, setAdminGroupsLoading] = useState(false);
  const [managingGroupSlug, setManagingGroupSlug] = useState<string | null>(null);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [pendingMembers, setPendingMembers] = useState<GroupMember[]>([]);
  const [blockedMembers, setBlockedMembers] = useState<GroupMember[]>([]);
  const [memberActionLoading, setMemberActionLoading] = useState<string | null>(null);
  const [groupActivityItems, setGroupActivityItems] = useState<Activity[]>([]);
  const [groupActivityLoading, setGroupActivityLoading] = useState(false);

  // Group create/edit form
  const [groupForm, setGroupForm] = useState({
    name: '', bio: '', description: '', privacy: 'public' as 'public' | 'private',
    groupTypeSlug: '', profilePicture: '', coverPhoto: '', image: '',
  });
  const [editingGroupSlug, setEditingGroupSlug] = useState<string | null>(null);
  const [groupFormUploading, setGroupFormUploading] = useState<'profile' | 'cover' | null>(null);

  const currentCategory = useMemo(
    () => newsCategories.find((category) => category.slug === newsForm.categorySlug),
    [newsCategories, newsForm.categorySlug],
  );

  const dateOptions = useMemo(() => {
    return Array.from(new Set(newsItems.map((item) => monthKey(item.publishedAt)).filter(Boolean))).sort(
      (a, b) => b.localeCompare(a),
    );
  }, [newsItems]);

  const filteredNews = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return newsItems.filter((item) => {
      const matchesSearch = query
        ? [item.title, item.authorName, item.categoryName, item.excerpt, item.sourceName]
            .filter(Boolean)
            .some((value) => value?.toLowerCase().includes(query))
        : true;
      const matchesCategory = categoryFilter === 'all' || item.categorySlug === categoryFilter;
      const matchesDate = dateFilter === 'all' || monthKey(item.publishedAt) === dateFilter;
      return matchesSearch && matchesCategory && matchesDate;
    });
  }, [categoryFilter, dateFilter, newsItems, searchTerm]);

  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(filteredNews.length / pageSize));
  const pageItems = filteredNews.slice((page - 1) * pageSize, page * pageSize);
  const publishedCount = newsItems.filter((item) => item.status !== 'draft').length;
  const selectedOnPage = pageItems.length > 0 && pageItems.every((item) => selectedNews.includes(item.slug));

useEffect(() => {
  async function checkAdminAccess() {
    const savedToken = localStorage.getItem('asiance_token') ?? '';
    const savedUser = localStorage.getItem('asiance_user');

    let savedRole: string | undefined;

    try {
      savedRole = savedUser ? JSON.parse(savedUser)?.role : undefined;
    } catch {
      savedRole = undefined;
    }

    if (!savedToken || savedRole !== 'admin') {
      router.replace('/login');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${savedToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Auth check failed');
      }

      const user = await response.json();

      if (user.role !== 'admin') {
        localStorage.removeItem('asiance_token');
        localStorage.removeItem('asiance_user');
        router.replace('/dashboard');
        return;
      }

      localStorage.setItem('asiance_user', JSON.stringify(user));
      setToken(savedToken);
      setAuthChecked(true);

      await Promise.all([
        loadNews(savedToken),
        loadStats(savedToken),
        loadActivityItems(),
      ]);
    } catch {
      localStorage.removeItem('asiance_token');
      localStorage.removeItem('asiance_user');
      router.replace('/login');
    }
  }

  void checkAdminAccess();
}, [router]);
  function authHeaders(authToken = token) {
    return {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    };
  }

  async function loadActivityItems() {
    try {
      const t = typeof window !== 'undefined' ? (localStorage.getItem('asiance_token') ?? '') : '';
      const res = await fetch(`${API_URL}/activity`, {
        headers: t ? { Authorization: `Bearer ${t}` } : {},
      });
      if (!res.ok) return;
      const items: Activity[] = await res.json();
      setActivityItems(items);
    } catch {
      // keep existing items on failure
    }
  }

  async function handleAdminDeleteActivity(activityId: string) {
    if (!window.confirm('Delete this activity post?')) return;
    try {
      await deleteActivity(activityId);
      setActivityItems((prev) => prev.filter((item) => item._id !== activityId));
      setGroupActivityItems((prev) => prev.filter((item) => item._id !== activityId));
      setStatus('Activity deleted.');
    } catch {
      setStatus('Failed to delete activity.');
    }
  }

  async function handleAdminUpdateActivity(activityId: string) {
    if (!activityEditingText.trim()) return;
    try {
      const updated = await updateActivity(activityId, { text: activityEditingText.trim(), media: activityEditingMedia ?? [] });
      setActivityItems((prev) => prev.map((item) => (item._id === activityId ? updated : item)));
      setGroupActivityItems((prev) => prev.map((item) => (item._id === activityId ? updated : item)));
      setActivityEditingId(null);
      setActivityEditingText('');
      setActivityEditingMedia([]);
      setStatus('Activity updated.');
    } catch {
      setStatus('Failed to update activity.');
    }
  }

  async function handleAdminActivityMediaUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    if (!file) return;
    setActivityUploadingMedia(true);
    try {
      const url = await uploadMedia(file);
      setActivityEditingMedia((prev) => [...(prev ?? []), { type: detectMediaType(file.type), url }]);
    } catch {
      setStatus('Media upload failed.');
    } finally {
      setActivityUploadingMedia(false);
      event.currentTarget.value = '';
    }
  }

  async function uploadImageFile(file: File) {
    if (!token) {
      setStatus('Login as admin to upload images.');
      throw new Error('Upload requires admin authentication.');
    }

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_URL}/library/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      if (!data?.url) {
        throw new Error('Invalid upload response');
      }

      setStatus('Image uploaded successfully.');
      return data.url as string;
    } catch {
      setStatus('Image upload failed. Check admin login and API connection.');
      throw new Error('Upload failed');
    } finally {
      setUploadingImage(false);
    }
  }

  async function handleNewsImageFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    if (!file) return;

    try {
      const url = await uploadImageFile(file);
      setNewsForm((current) => ({ ...current, image: url }));
    } catch {
      // upload error already handled in uploadImageFile
    }
  }

  async function handleFormImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    if (!file) return;

    try {
      const url = await uploadImageFile(file);
      const urlInput = event.currentTarget.form?.querySelector<HTMLInputElement>('input[name="image"]');
      if (urlInput) {
        urlInput.value = url;
      }
    } catch {
      // upload error already handled in uploadImageFile
    }
  }

  async function loadStats(authToken = token) {
    if (!authToken) {
      setStats(fallbackStats);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/admin/stats`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (!response.ok) throw new Error('stats failed');
      setStats(await response.json());
    } catch {
      setStats(fallbackStats);
      setStatus('Showing fallback data. Login as admin after MongoDB is seeded.');
    }
  }

  async function loadNews(authToken = token) {
    try {
      const [categoriesResponse, newsResponse] = await Promise.all([
        fetch(`${API_URL}/news/categories`),
        fetch(`${API_URL}${authToken ? '/news/admin/items' : '/news?limit=100'}`, {
          headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
        }),
      ]);

      if (!categoriesResponse.ok || !newsResponse.ok) throw new Error('news failed');

      const [categories, items] = await Promise.all([
        categoriesResponse.json(),
        newsResponse.json(),
      ]);
      setNewsCategories(categories);
      setNewsItems(items);
      setNewsForm((current) => ({
        ...current,
        categorySlug: current.categorySlug || categories[0]?.slug || 'news',
      }));
    } catch {
      setNewsCategories(fallbackNewsCategories);
      setNewsItems(fallbackNewsItems);
    }
  }

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: String(form.get('email')),
          password: String(form.get('password')),
        }),
      });
      if (!response.ok) throw new Error('login failed');
      const data = await response.json();

if (data.user?.role !== 'admin') {
  setStatus('Only admin users can access this dashboard.');
  return;
}

localStorage.setItem('asiance_token', data.accessToken);
localStorage.setItem('asiance_user', JSON.stringify(data.user));

setToken(data.accessToken);
setAuthChecked(true);

await Promise.all([
  loadStats(data.accessToken),
  loadNews(data.accessToken),
]);

setStatus('Admin connected.');
    } catch {
      setStatus('Admin login failed. Seed the API or check credentials.');
    }
  }

  function logout() {
    localStorage.removeItem('asiance_token');
    localStorage.removeItem('asiance_user');
    router.replace('/login');
  }

  function resetNewsForm() {
    setEditingNewsSlug('');
    setNewsForm({
      ...emptyNewsForm,
      categorySlug: newsCategories[0]?.slug || 'news',
    });
  }

  function openAddNews() {
    resetNewsForm();
    setActiveView('news-add');
  }

  function editNews(item: NewsItem) {
    setActiveView('news-add');
    setEditingNewsSlug(item.slug);
    setNewsForm({
      title: item.title,
      slug: item.slug,
      categorySlug: item.categorySlug,
      excerpt: item.excerpt ?? '',
      content: item.content ?? '',
      image: item.image ?? '',
      authorName: item.authorName ?? 'Asiance Editors',
      tags: tagsToInput(item.tags),
      featured: Boolean(item.featured),
      breaking: Boolean(item.breaking),
      sourceName: item.sourceName ?? '',
      sourceUrl: item.sourceUrl ?? '',
      status: item.status ?? 'published',
      publishedAt: toDateTimeLocal(item.publishedAt),
    });
  }

  async function saveNews(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) {
      setStatus('Login as admin to save news.');
      return;
    }

    const payload = {
      title: newsForm.title,
      slug: newsForm.slug || undefined,
      categorySlug: newsForm.categorySlug,
      categoryName: currentCategory?.name,
      excerpt: newsForm.excerpt,
      content: newsForm.content,
      image: newsForm.image,
      authorName: newsForm.authorName,
      tags: parseTags(newsForm.tags),
      featured: newsForm.featured,
      breaking: newsForm.breaking,
      sourceName: newsForm.sourceName,
      sourceUrl: newsForm.sourceUrl,
      status: newsForm.status,
      publishedAt: newsForm.publishedAt ? new Date(newsForm.publishedAt).toISOString() : undefined,
    };

    try {
      const response = await fetch(`${API_URL}/news${editingNewsSlug ? `/${editingNewsSlug}` : ''}`, {
        method: editingNewsSlug ? 'PATCH' : 'POST',
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('save failed');
      setStatus(editingNewsSlug ? 'News updated.' : 'News posted.');
      resetNewsForm();
      setActiveView('news-list');
      await Promise.all([loadNews(), loadStats()]);
    } catch {
      setStatus('News was not saved. Check admin login and API connection.');
    }
  }

  async function deleteNews(slug: string, confirmDelete = true) {
    if (!token) {
      setStatus('Login as admin to delete news.');
      return false;
    }

    if (confirmDelete && !window.confirm('Delete this news post?')) return false;

    try {
      const response = await fetch(`${API_URL}/news/${slug}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      if (!response.ok) throw new Error('delete failed');
      if (editingNewsSlug === slug) resetNewsForm();
      return true;
    } catch {
      setStatus('News was not deleted. Check admin login and API connection.');
      return false;
    }
  }

  async function applyBulkAction() {
    if (bulkAction !== 'delete' || !selectedNews.length) return;
    if (!window.confirm(`Delete ${selectedNews.length} selected news post(s)?`)) return;

    const results = await Promise.all(selectedNews.map((slug) => deleteNews(slug, false)));
    const deletedCount = results.filter(Boolean).length;
    setSelectedNews([]);
    setBulkAction('');
    setStatus(`${deletedCount} news post(s) deleted.`);
    await Promise.all([loadNews(), loadStats()]);
  }

  function resetCategoryForm() {
    setEditingCategorySlug('');
    setCategoryForm(emptyCategoryForm);
  }

  function editCategory(category: NewsCategory) {
    setActiveView('news-categories');
    setEditingCategorySlug(category.slug);
    setCategoryForm({
      name: category.name,
      slug: category.slug,
      description: category.description ?? '',
      sortOrder: String(category.sortOrder ?? 0),
    });
  }

  async function saveCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) {
      setStatus('Login as admin to save categories.');
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/news/categories${editingCategorySlug ? `/${editingCategorySlug}` : ''}`,
        {
          method: editingCategorySlug ? 'PATCH' : 'POST',
          headers: authHeaders(),
          body: JSON.stringify({
            name: categoryForm.name,
            slug: categoryForm.slug || undefined,
            description: categoryForm.description,
            sortOrder: Number(categoryForm.sortOrder) || 0,
          }),
        },
      );
      if (!response.ok) throw new Error('category failed');
      setStatus(editingCategorySlug ? 'Category updated.' : 'Category created.');
      resetCategoryForm();
      await Promise.all([loadNews(), loadStats()]);
    } catch {
      setStatus('Category was not saved. Check admin login and API connection.');
    }
  }

  async function deleteCategory(slug: string) {
    if (!token) {
      setStatus('Login as admin to delete categories.');
      return;
    }

    const confirmed = window.confirm('Delete this category? News posts must be moved first.');
    if (!confirmed) return;

    try {
      const response = await fetch(`${API_URL}/news/categories/${slug}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      if (!response.ok) throw new Error('delete category failed');
      setStatus('Category deleted.');
      if (editingCategorySlug === slug) resetCategoryForm();
      await Promise.all([loadNews(), loadStats()]);
    } catch {
      setStatus('Category was not deleted. Move its news posts first, then try again.');
    }
  }

  function toggleNewsSelection(slug: string) {
    setSelectedNews((current) =>
      current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug],
    );
  }

  function togglePageSelection() {
    const pageSlugs = pageItems.map((item) => item.slug);
    setSelectedNews((current) => {
      if (selectedOnPage) return current.filter((slug) => !pageSlugs.includes(slug));
      return Array.from(new Set([...current, ...pageSlugs]));
    });
  }

  async function createProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = {
      name: String(form.get('name')),
      category: String(form.get('category')),
      price: Number(form.get('price')),
      image: String(form.get('image')),
      description: String(form.get('description')),
      stock: Number(form.get('stock')),
    };

    try {
      const response = await fetch(`${API_URL}/shop/products`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('create failed');
      setStatus('Product created.');
      event.currentTarget.reset();
      await loadStats();
    } catch {
      setStatus('Product was not saved. Check admin login and API connection.');
    }
  }

  async function createArticle(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = {
      title: String(form.get('title')),
      category: String(form.get('category')),
      excerpt: String(form.get('excerpt')),
      content: String(form.get('content')),
      image: String(form.get('image')),
      authorName: String(form.get('authorName')),
    };

    try {
      const response = await fetch(`${API_URL}/articles`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('create failed');
      setStatus('Article published.');
      event.currentTarget.reset();
      await loadStats();
    } catch {
      setStatus('Article was not saved. Check admin login and API connection.');
    }
  }

  // ─── Group Types ────────────────────────────────────────────────────────────

  async function loadGroupTypes() {
    try {
      const types = await getGroupTypes();
      setGroupTypesList(types);
    } catch {}
  }

  async function handleCreateGroupType(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!groupTypeName.trim()) return;
    setGroupTypesSaving(true);
    try {
      const gt = await createGroupType({ name: groupTypeName.trim(), description: groupTypeDesc.trim() });
      setGroupTypesList((prev) => [...prev, gt]);
      setGroupTypeName('');
      setGroupTypeDesc('');
      setStatus('Group type created.');
    } catch {
      setStatus('Failed to create group type.');
    } finally {
      setGroupTypesSaving(false);
    }
  }

  async function handleDeleteGroupType(id: string) {
    if (!window.confirm('Delete this group type?')) return;
    try {
      await deleteGroupType(id);
      setGroupTypesList((prev) => prev.filter((gt) => gt._id !== id));
      setStatus('Group type deleted.');
    } catch {
      setStatus('Failed to delete group type.');
    }
  }

  // ─── Groups management ──────────────────────────────────────────────────────

  async function loadAdminGroups() {
    setAdminGroupsLoading(true);
    try {
      const res = await fetch(`${API_URL}/groups`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) return;
      setAdminGroups(await res.json());
    } catch {} finally {
      setAdminGroupsLoading(false);
    }
  }

  async function openManageGroup(slug: string) {
    setManagingGroupSlug(slug);
    setGroupActivityItems([]);
    setGroupActivityLoading(true);
    try {
      const [m, p, acts] = await Promise.all([
        getGroupMembers(slug).catch(() => [] as GroupMember[]),
        getGroupPending(slug).catch(() => [] as GroupMember[]),
        getGroupActivity(slug).catch(() => [] as Activity[]),
      ]);
      setGroupMembers(m);
      setPendingMembers(p);
      setBlockedMembers([]);
      setGroupActivityItems(acts);
    } catch {} finally {
      setGroupActivityLoading(false);
    }
  }

  async function handleApproveMember(slug: string, userId: string) {
    setMemberActionLoading(userId);
    try {
      await approveMember(slug, userId);
      setPendingMembers((prev) => prev.filter((m) => m._id !== userId));
      const approved = pendingMembers.find((m) => m._id === userId);
      if (approved) setGroupMembers((prev) => [...prev, approved]);
      setStatus('Member approved.');
    } catch {
      setStatus('Failed to approve member.');
    } finally {
      setMemberActionLoading(null);
    }
  }

  async function handleRemoveMember(slug: string, userId: string) {
    if (!window.confirm('Remove this member from the group?')) return;
    setMemberActionLoading(userId);
    try {
      await removeGroupMember(slug, userId);
      setGroupMembers((prev) => prev.filter((m) => m._id !== userId));
      setStatus('Member removed.');
    } catch {
      setStatus('Failed to remove member.');
    } finally {
      setMemberActionLoading(null);
    }
  }

  async function handleBlockMember(slug: string, userId: string) {
    if (!window.confirm('Block this member? They will be removed and cannot rejoin.')) return;
    setMemberActionLoading(userId);
    try {
      await blockGroupMember(slug, userId);
      setGroupMembers((prev) => prev.filter((m) => m._id !== userId));
      setPendingMembers((prev) => prev.filter((m) => m._id !== userId));
      setStatus('Member blocked.');
    } catch {
      setStatus('Failed to block member.');
    } finally {
      setMemberActionLoading(null);
    }
  }

  async function handleUnblockMember(slug: string, userId: string) {
    setMemberActionLoading(userId);
    try {
      await unblockGroupMember(slug, userId);
      setBlockedMembers((prev) => prev.filter((m) => m._id !== userId));
      setStatus('Member unblocked.');
    } catch {
      setStatus('Failed to unblock member.');
    } finally {
      setMemberActionLoading(null);
    }
  }

  async function uploadGroupPhoto(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_URL}/uploads`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    if (!res.ok) throw new Error('Upload failed');
    const data = await res.json();
    return data.url as string;
  }

  async function handleGroupProfilePicUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    if (!file) return;
    setGroupFormUploading('profile');
    try {
      const url = await uploadGroupPhoto(file);
      setGroupForm((prev) => ({ ...prev, profilePicture: url, image: url }));
    } catch {
      setStatus('Profile picture upload failed.');
    } finally {
      setGroupFormUploading(null);
      event.currentTarget.value = '';
    }
  }

  async function handleGroupCoverUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    if (!file) return;
    setGroupFormUploading('cover');
    try {
      const url = await uploadGroupPhoto(file);
      setGroupForm((prev) => ({ ...prev, coverPhoto: url }));
    } catch {
      setStatus('Cover photo upload failed.');
    } finally {
      setGroupFormUploading(null);
      event.currentTarget.value = '';
    }
  }

  function openEditGroup(g: Group) {
    setEditingGroupSlug(g.slug);
    setGroupForm({
      name: g.name ?? '',
      bio: (g as any).bio ?? g.description ?? '',
      description: g.description ?? '',
      privacy: (g.privacy as 'public' | 'private') ?? 'public',
      groupTypeSlug: g.groupTypeSlug ?? '',
      profilePicture: (g as any).profilePicture ?? g.image ?? '',
      coverPhoto: (g as any).coverPhoto ?? '',
      image: g.image ?? '',
    });
    setActiveView('circles');
  }

  async function handleDeleteGroup(slug: string) {
    if (!window.confirm('Delete this group and all its posts? This cannot be undone.')) return;
    try {
      await deleteGroup(slug);
      setAdminGroups((prev) => prev.filter((g) => g.slug !== slug));
      if (managingGroupSlug === slug) {
        setManagingGroupSlug(null);
        setGroupMembers([]);
        setPendingMembers([]);
        setGroupActivityItems([]);
      }
      setStatus('Group deleted.');
      await loadStats();
    } catch {
      setStatus('Failed to delete group.');
    }
  }

  async function createGroup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload = {
      name: groupForm.name,
      bio: groupForm.bio,
      description: groupForm.description || groupForm.bio,
      privacy: groupForm.privacy,
      groupTypeSlug: groupForm.groupTypeSlug,
      profilePicture: groupForm.profilePicture,
      image: groupForm.image || groupForm.profilePicture,
      coverPhoto: groupForm.coverPhoto,
    };

    try {
      if (editingGroupSlug) {
        const updated = await updateGroup(editingGroupSlug, payload);
        setAdminGroups((prev) => prev.map((g) => (g.slug === editingGroupSlug ? { ...g, ...updated } : g)));
        setEditingGroupSlug(null);
        setStatus('Group updated.');
      } else {
        const response = await fetch(`${API_URL}/groups`, {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error('create failed');
        setStatus('Group created.');
      }
      setGroupForm({ name: '', bio: '', description: '', privacy: 'public', groupTypeSlug: '', profilePicture: '', coverPhoto: '', image: '' });
      await Promise.all([loadStats(), loadAdminGroups()]);
    } catch {
      setStatus(editingGroupSlug ? 'Group was not updated. Check admin login.' : 'Group was not saved. Check admin login and API connection.');
    }
  }
if (!authChecked) {
  return (
    <main className="wp-admin-main">
      <p>Checking admin access...</p>
    </main>
  );
}
  return (
    <div className="wp-admin-shell">
      <aside className="wp-admin-side">
        <div className="wp-admin-brand">asiance admin</div>
        <nav aria-label="Admin sections">
          <button
            className={`wp-menu-item ${activeView.startsWith('news') ? 'active' : ''}`}
            onClick={() => setActiveView('news-list')}
            type="button"
          >
            <Megaphone size={18} />
            <span>News</span>
          </button>
          <div className="wp-submenu">
            <button onClick={() => setActiveView('news-list')} type="button">
              All News
            </button>
            <button onClick={openAddNews} type="button">
              Add New News Item
            </button>
            <button onClick={() => setActiveView('news-categories')} type="button">
              News Categories
            </button>
          </div>
          <button
            className={`wp-menu-item ${activeView === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveView('overview')}
            type="button"
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </button>
          <button
            className={`wp-menu-item ${activeView === 'products' ? 'active' : ''}`}
            onClick={() => setActiveView('products')}
            type="button"
          >
            <PackagePlus size={18} />
            <span>Products</span>
          </button>

          <button
  className={`wp-menu-item ${activeView === 'orders' ? 'active' : ''}`}
  onClick={() => setActiveView('orders')}
  type="button"
>
  <BarChart3 size={18} />
  <span>Orders</span>
</button>

<button
  className={`wp-menu-item ${activeView === 'shipping' ? 'active' : ''}`}
  onClick={() => setActiveView('shipping')}
  type="button"
>
  <PackagePlus size={18} />
  <span>Shipping</span>
</button>


          <button
            className={`wp-menu-item ${activeView === 'articles' ? 'active' : ''}`}
            onClick={() => setActiveView('articles')}
            type="button"
          >
            <FileText size={18} />
            <span>Articles</span>
          </button>
          <button
            className={`wp-menu-item ${['circles', 'group-types', 'groups-list'].includes(activeView) ? 'active' : ''}`}
            onClick={() => { setActiveView('circles'); if (groupTypesList.length === 0) void loadGroupTypes(); if (adminGroups.length === 0) void loadAdminGroups(); }}
            type="button"
          >
            <FolderPlus size={18} />
            <span>Groups</span>
          </button>
          <div className="wp-submenu">
            <button onClick={() => { setActiveView('circles'); if (groupTypesList.length === 0) void loadGroupTypes(); if (adminGroups.length === 0) void loadAdminGroups(); }} type="button">Create Group</button>
            <button onClick={() => { setActiveView('groups-list'); if (adminGroups.length === 0) void loadAdminGroups(); }} type="button">Manage Groups</button>
            <button onClick={() => { setActiveView('group-types'); if (groupTypesList.length === 0) void loadGroupTypes(); }} type="button">Group Types</button>
          </div>
          <button
            className={`wp-menu-item ${activeView === 'activity' ? 'active' : ''}`}
            onClick={() => { setActiveView('activity'); if (activityItems.length === 0) void loadActivityItems(); }}
            type="button"
          >
            <BarChart3 size={18} />
            <span>Activity</span>
          </button>
          <button
            className={`wp-menu-item ${activeView === 'users' ? 'active' : ''}`}
            onClick={() => setActiveView('users')}
            type="button"
          >
            <UsersRound size={18} />
            <span>Users</span>
          </button>
        </nav>
        <div style={{ marginTop: 'auto', padding: '16px 8px 8px' }}>
          <button
            onClick={logout}
            type="button"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              width: '100%',
              padding: '10px 14px',
              background: 'none',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 6,
              color: 'rgba(255,255,255,0.7)',
              fontSize: 14,
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.08)';
              (e.currentTarget as HTMLButtonElement).style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'none';
              (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.7)';
            }}
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="wp-admin-main">
        {activeView === 'news-list' ? (
          <section className="wp-list-screen">
            <div className="wp-list-top">
              <div className="wp-view-links">
                <button className="active" onClick={() => setCategoryFilter('all')} type="button">
                  All <span>({newsItems.length})</span>
                </button>
                <span>|</span>
                <button onClick={() => setDateFilter('all')} type="button">
                  Published <span>({publishedCount})</span>
                </button>
              </div>
              <div className="wp-search">
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  aria-label="Search News"
                />
                <button type="button">
                  <Search size={15} />
                  Search News
                </button>
              </div>
            </div>

            <div className="wp-toolbar">
              <select value={bulkAction} onChange={(event) => setBulkAction(event.target.value)}>
                <option value="">Bulk actions</option>
                <option value="delete">Delete</option>
              </select>
              <button onClick={() => void applyBulkAction()} type="button">
                Apply
              </button>
              <select value={dateFilter} onChange={(event) => setDateFilter(event.target.value)}>
                <option value="all">All dates</option>
                {dateOptions.map((key) => (
                  <option value={key} key={key}>
                    {monthLabel(key)}
                  </option>
                ))}
              </select>
              <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
                <option value="all">All categories</option>
                {newsCategories.map((category) => (
                  <option value={category.slug} key={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>
              <button type="button">Filter</button>
              <button className="wp-add-button" onClick={openAddNews} type="button">
                Add New
              </button>
              <div className="wp-pagination">
                <span>{filteredNews.length} items</span>
                <button disabled={page <= 1} onClick={() => setPage(1)} type="button">
                  &laquo;
                </button>
                <button disabled={page <= 1} onClick={() => setPage((current) => current - 1)} type="button">
                  &lsaquo;
                </button>
                <input readOnly value={page} aria-label="Current page" />
                <span>of {totalPages}</span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((current) => current + 1)}
                  type="button"
                >
                  &rsaquo;
                </button>
                <button disabled={page >= totalPages} onClick={() => setPage(totalPages)} type="button">
                  &raquo;
                </button>
              </div>
            </div>

            <div className="wp-table-wrap">
              <table className="wp-news-table">
                <thead>
                  <tr>
                    <th className="check-column">
                      <input checked={selectedOnPage} onChange={togglePageSelection} type="checkbox" />
                    </th>
                    <th>Title</th>
                    <th>Author</th>
                    <th>News Categories</th>
                    <th>Date</th>
                    <th>Categories</th>
                    <th>Featured</th>
                    <th>Breaking</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((item) => (
                    <tr key={item.slug}>
                      <td className="check-column">
                        <input
                          checked={selectedNews.includes(item.slug)}
                          onChange={() => toggleNewsSelection(item.slug)}
                          type="checkbox"
                        />
                      </td>
                      <td className="title-column">
                        <button onClick={() => editNews(item)} type="button">
                          {item.title}
                        </button>
                        <div className="row-links">
                          <button onClick={() => editNews(item)} type="button">
                            Edit
                          </button>
                          <span>|</span>
                          <button onClick={() => void deleteNews(item.slug)} type="button">
                            Delete
                          </button>
                        </div>
                      </td>
                      <td>{item.authorName || 'admin'}</td>
                      <td>{item.categoryName}</td>
                      <td>{formatAdminDate(item.publishedAt)}</td>
                      <td>{item.categoryName}</td>
                      <td>{item.featured ? 'Yes' : '-'}</td>
                      <td>{item.breaking ? 'Yes' : '-'}</td>
                    </tr>
                  ))}
                  {!pageItems.length ? (
                    <tr>
                      <td colSpan={8}>No news found.</td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}

        {activeView === 'news-add' ? (
          <section className="wp-editor-screen">
            <div className="wp-editor-head">
              <h1>{editingNewsSlug ? 'Edit News Item' : 'Add New News Item'}</h1>
              {editingNewsSlug ? (
                <button onClick={resetNewsForm} type="button">
                  <X size={15} />
                  Cancel edit
                </button>
              ) : null}
            </div>
            <form className="wp-editor-grid" onSubmit={saveNews}>
              <div className="wp-editor-main">
                <input
                  className="wp-title-input"
                  value={newsForm.title}
                  onChange={(event) => setNewsForm({ ...newsForm, title: event.target.value })}
                  placeholder="Add title"
                  required
                />
                <input
                  value={newsForm.slug}
                  onChange={(event) => setNewsForm({ ...newsForm, slug: event.target.value })}
                  placeholder="Slug"
                />
                <div style={{ marginBottom: '16px' }}>
                  <h3 style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>Content</h3>
                  <NewsEditor
                    value={newsForm.content}
                    onChange={(content) => setNewsForm({ ...newsForm, content })}
                  />
                </div>
                <textarea
                  value={newsForm.excerpt}
                  onChange={(event) => setNewsForm({ ...newsForm, excerpt: event.target.value })}
                  placeholder="Excerpt"
                  rows={4}
                />
              </div>
              <aside className="wp-publish-side">
                <div className="wp-box">
                  <h2>Publish</h2>
                  <select
                    value={newsForm.status}
                    onChange={(event) =>
                      setNewsForm({ ...newsForm, status: event.target.value as NewsFormState['status'] })
                    }
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                  <input
                    value={newsForm.publishedAt}
                    onChange={(event) => setNewsForm({ ...newsForm, publishedAt: event.target.value })}
                    type="datetime-local"
                  />
                  <button type="submit">
                    {editingNewsSlug ? <Save size={14} /> : <Plus size={14} />}
                    {editingNewsSlug ? 'Update' : 'Publish'}
                  </button>
                </div>
                <div className="wp-box">
                  <h2>News Options</h2>
                  <label>
                    <input
                      checked={newsForm.featured}
                      onChange={(event) => setNewsForm({ ...newsForm, featured: event.target.checked })}
                      type="checkbox"
                    />
                    Featured (use in hero)
                  </label>
                  <label>
                    <input
                      checked={newsForm.breaking}
                      onChange={(event) => setNewsForm({ ...newsForm, breaking: event.target.checked })}
                      type="checkbox"
                    />
                    Breaking
                  </label>
                  <input
                    value={newsForm.sourceName}
                    onChange={(event) => setNewsForm({ ...newsForm, sourceName: event.target.value })}
                    placeholder="Source Name"
                  />
                  <input
                    value={newsForm.sourceUrl}
                    onChange={(event) => setNewsForm({ ...newsForm, sourceUrl: event.target.value })}
                    placeholder="Source URL"
                  />
                </div>
                <div className="wp-box">
                  <h2>News Categories</h2>
                  <select
                    value={newsForm.categorySlug}
                    onChange={(event) => setNewsForm({ ...newsForm, categorySlug: event.target.value })}
                  >
                    {newsCategories.map((category) => (
                      <option value={category.slug} key={category.slug}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="wp-box">
                  <h2>Featured Image</h2>
                  <input type="file" accept="image/*" onChange={handleNewsImageFile} disabled={uploadingImage} />
                  <input
                    value={newsForm.image}
                    onChange={(event) => setNewsForm({ ...newsForm, image: event.target.value })}
                    placeholder="Image URL"
                  />
                  {newsForm.image ? (
                    <div className="upload-preview">
                      <img src={newsForm.image} alt="Preview" />
                    </div>
                  ) : null}
                  <input
                    value={newsForm.authorName}
                    onChange={(event) => setNewsForm({ ...newsForm, authorName: event.target.value })}
                    placeholder="Author"
                  />
                  <input
                    value={newsForm.tags}
                    onChange={(event) => setNewsForm({ ...newsForm, tags: event.target.value })}
                    placeholder="Tags, comma separated"
                  />
                </div>
              </aside>
            </form>
          </section>
        ) : null}

        {activeView === 'news-categories' ? (
          <section className="wp-category-screen">
            <h1>News Categories</h1>
            <div className="wp-category-grid">
              <form className="wp-category-form" onSubmit={saveCategory}>
                <h2>{editingCategorySlug ? 'Edit News Category' : 'Add New News Category'}</h2>
                <input
                  value={categoryForm.name}
                  onChange={(event) => setCategoryForm({ ...categoryForm, name: event.target.value })}
                  placeholder="Name"
                  required
                />
                <input
                  value={categoryForm.slug}
                  onChange={(event) => setCategoryForm({ ...categoryForm, slug: event.target.value })}
                  placeholder="Slug"
                />
                <input
                  value={categoryForm.sortOrder}
                  onChange={(event) => setCategoryForm({ ...categoryForm, sortOrder: event.target.value })}
                  placeholder="Sort order"
                  type="number"
                />
                <textarea
                  value={categoryForm.description}
                  onChange={(event) => setCategoryForm({ ...categoryForm, description: event.target.value })}
                  placeholder="Description"
                  rows={5}
                />
                <button type="submit">{editingCategorySlug ? 'Update Category' : 'Add New Category'}</button>
              </form>
              <table className="wp-news-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Slug</th>
                    <th>Description</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {newsCategories.map((category) => (
                    <tr key={category.slug}>
                      <td>{category.name}</td>
                      <td>{category.slug}</td>
                      <td>{category.description || '-'}</td>
                      <td>
                        <button onClick={() => editCategory(category)} type="button">
                          Edit
                        </button>
                        <button onClick={() => void deleteCategory(category.slug)} type="button">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}

        {activeView === 'overview' ? (
          <section className="admin-overview-grid">
            <Stat icon={<UsersRound size={18} />} label="members" value={stats.members} />
            <Stat icon={<Newspaper size={18} />} label="news" value={stats.news} />
            <Stat icon={<Tags size={18} />} label="categories" value={stats.newsCategories} />
            <Stat icon={<BarChart3 size={18} />} label="revenue" value={`$${stats.revenue}`} />
            <Stat icon={<FileText size={18} />} label="articles" value={stats.articles} />
            <Stat icon={<PackagePlus size={18} />} label="products" value={stats.products} />
            <Stat icon={<FolderPlus size={18} />} label="circles" value={stats.groups} />
            <Stat icon={<BarChart3 size={18} />} label="orders" value={stats.orders} />
          </section>
        ) : null}

        {activeView === 'products' ? <ProductAdminPanel token={token} onChanged={() => loadStats()} /> : null}

        {activeView === 'orders' ? <OrderAdminPanel token={token} onChanged={() => loadStats()} /> : null}

        {activeView === 'shipping' ? ( <ShippingAdminPanel token={token} onChanged={() => loadStats()} /> ) : null}
        
        
        {activeView === 'articles' ? (
          <section className="admin-forms wp-simple-form">
            <form className="panel-form" onSubmit={createArticle}>
              <h2>New article</h2>
              <input name="title" placeholder="Title" required />
              <input name="category" placeholder="Category" required />
              <input name="authorName" placeholder="Author" defaultValue="Asiance Editors" />
              <input type="file" accept="image/*" onChange={handleFormImageUpload} disabled={uploadingImage} />
              <input name="image" placeholder="Image URL" required />
              <textarea name="excerpt" placeholder="Excerpt" rows={3} required />
              <textarea name="content" placeholder="Body" rows={5} required />
              <button className="btn btn-dark" type="submit">
                Publish
              </button>
            </form>
          </section>
        ) : null}

        {activeView === 'circles' ? (
          <section className="wp-list-screen">
            <div className="wp-list-top">
              <h1>{editingGroupSlug ? 'Edit Group' : 'Create Group'}</h1>
              {editingGroupSlug ? (
                <button
                  type="button"
                  className="btn"
                  style={{ fontSize: 13 }}
                  onClick={() => { setEditingGroupSlug(null); setGroupForm({ name: '', bio: '', description: '', privacy: 'public', groupTypeSlug: '', profilePicture: '', coverPhoto: '', image: '' }); }}
                >
                  <X size={14} /> Cancel Edit
                </button>
              ) : null}
            </div>
            <div className="wp-group-form-wrap">
              <form className="wp-group-form" onSubmit={createGroup}>

                <div className="wp-group-form-section">
                  <div className="wp-group-form-col">
                    <label className="wp-field-label">Group Name *</label>
                    <input
                      placeholder="Group name"
                      required
                      value={groupForm.name}
                      onChange={(e) => setGroupForm((p) => ({ ...p, name: e.target.value }))}
                    />

                    <label className="wp-field-label" style={{ marginTop: 16 }}>Group Type</label>
                    <select
                      value={groupForm.groupTypeSlug}
                      onChange={(e) => setGroupForm((p) => ({ ...p, groupTypeSlug: e.target.value }))}
                    >
                      <option value="">— None —</option>
                      {groupTypesList.map((gt) => (
                        <option key={gt._id} value={gt.slug}>{gt.name}</option>
                      ))}
                    </select>

                    <label className="wp-field-label" style={{ marginTop: 16 }}>Privacy</label>
                    <select
                      value={groupForm.privacy}
                      onChange={(e) => setGroupForm((p) => ({ ...p, privacy: e.target.value as 'public' | 'private' }))}
                    >
                      <option value="public">Public — anyone can see posts</option>
                      <option value="private">Private — only approved members see posts</option>
                    </select>

                    <label className="wp-field-label" style={{ marginTop: 16 }}>Bio / Description</label>
                    <textarea
                      placeholder="What is this group about?"
                      rows={4}
                      value={groupForm.bio}
                      onChange={(e) => setGroupForm((p) => ({ ...p, bio: e.target.value }))}
                      style={{ width: '100%', resize: 'vertical', border: '1px solid #ddd', borderRadius: 6, padding: '10px 12px', fontSize: 14 }}
                    />
                  </div>

                  <div className="wp-group-form-col">
                    <label className="wp-field-label">Profile Picture</label>
                    <div className="wp-group-upload-row">
                      <label className="wp-group-upload-btn">
                        {groupFormUploading === 'profile' ? 'Uploading…' : '↑ Upload'}
                        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleGroupProfilePicUpload} disabled={groupFormUploading !== null} />
                      </label>
                      {groupForm.profilePicture
                        ? <img src={groupForm.profilePicture} alt="profile" className="wp-group-pic-preview" />
                        : <div className="wp-group-pic-placeholder">No image</div>}
                    </div>
                    <input
                      placeholder="Or paste image URL"
                      value={groupForm.profilePicture}
                      onChange={(e) => setGroupForm((p) => ({ ...p, profilePicture: e.target.value, image: e.target.value }))}
                      style={{ marginTop: 8, width: '100%', border: '1px solid #ddd', borderRadius: 6, padding: '8px 10px', fontSize: 13 }}
                    />

                    <label className="wp-field-label" style={{ marginTop: 20 }}>Cover Photo</label>
                    <div className="wp-group-upload-row">
                      <label className="wp-group-upload-btn">
                        {groupFormUploading === 'cover' ? 'Uploading…' : '↑ Upload'}
                        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleGroupCoverUpload} disabled={groupFormUploading !== null} />
                      </label>
                      {groupForm.coverPhoto
                        ? <img src={groupForm.coverPhoto} alt="cover" className="wp-group-cover-preview" />
                        : <div className="wp-group-cover-placeholder">No cover</div>}
                    </div>
                    <input
                      placeholder="Or paste cover URL"
                      value={groupForm.coverPhoto}
                      onChange={(e) => setGroupForm((p) => ({ ...p, coverPhoto: e.target.value }))}
                      style={{ marginTop: 8, width: '100%', border: '1px solid #ddd', borderRadius: 6, padding: '8px 10px', fontSize: 13 }}
                    />
                  </div>
                </div>

                <div style={{ paddingTop: 8 }}>
                  <button className="btn btn-dark" type="submit" style={{ minWidth: 160 }}>
                    {editingGroupSlug ? 'Update Group' : 'Create Group'}
                  </button>
                  {status && <p style={{ marginTop: 8, fontSize: 13, color: '#666' }}>{status}</p>}
                </div>
              </form>
            </div>
          </section>
        ) : null}

        {activeView === 'group-types' ? (
          <section className="wp-category-screen">
            <h1>Group Types</h1>
            <div className="wp-category-grid">
              <form className="wp-category-form" onSubmit={handleCreateGroupType}>
                <h2>New Group Type</h2>
                <input
                  placeholder="Type name (e.g. Sports, Technology)"
                  required
                  value={groupTypeName}
                  onChange={(e) => setGroupTypeName(e.target.value)}
                />
                <input
                  placeholder="Description (optional)"
                  value={groupTypeDesc}
                  onChange={(e) => setGroupTypeDesc(e.target.value)}
                />
                <button type="submit" disabled={groupTypesSaving}>
                  {groupTypesSaving ? 'Creating…' : 'Add Group Type'}
                </button>
              </form>

              <div>
                <div className="wp-table-wrap" style={{ overflowX: 'auto' }}>
                  <table className="wp-news-table wp-compact-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Slug</th>
                        <th>Description</th>
                        <th style={{ width: 80 }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {groupTypesList.length === 0 ? (
                        <tr><td colSpan={4} style={{ color: '#999', textAlign: 'center', padding: 24 }}>No group types yet. Add one on the left.</td></tr>
                      ) : groupTypesList.map((gt) => (
                        <tr key={gt._id}>
                          <td><strong>{gt.name}</strong></td>
                          <td style={{ color: '#666', fontSize: 13 }}>{gt.slug}</td>
                          <td style={{ color: '#666', fontSize: 13 }}>{gt.description || '—'}</td>
                          <td>
                            <button
                              type="button"
                              className="text-link"
                              style={{ color: '#b32d2e' }}
                              onClick={() => gt._id && void handleDeleteGroupType(gt._id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>
        ) : null}

        {activeView === 'groups-list' ? (
          <section className="wp-list-screen">
            <div className="wp-list-top">
              <h1>Manage Groups</h1>
              <button className="btn btn-dark" type="button" onClick={() => void loadAdminGroups()} style={{ fontSize: 13 }}>
                Refresh
              </button>
            </div>

            {managingGroupSlug ? (
              <div className="wp-member-manage">
                <button
                  type="button"
                  className="text-link"
                  style={{ fontSize: 13, marginBottom: 16 }}
                  onClick={() => { setManagingGroupSlug(null); setGroupMembers([]); setPendingMembers([]); setGroupActivityItems([]); setActivityEditingId(null); }}
                >
                  ← Back to groups list
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                  <h2 className="wp-manage-group-title" style={{ margin: 0 }}>
                    {adminGroups.find((g) => g.slug === managingGroupSlug)?.name ?? managingGroupSlug}
                  </h2>
                  <button
                    type="button"
                    className="admin-action-btn"
                    onClick={() => { const g = adminGroups.find((grp) => grp.slug === managingGroupSlug); if (g) openEditGroup(g); }}
                  >
                    <Pencil size={13} /> Edit
                  </button>
                  <button
                    type="button"
                    className="admin-action-btn admin-action-btn--danger"
                    onClick={() => managingGroupSlug && void handleDeleteGroup(managingGroupSlug)}
                  >
                    <Trash2 size={13} /> Delete Group
                  </button>
                </div>

                {pendingMembers.length > 0 && (
                  <div className="wp-member-section">
                    <h3 className="wp-member-section-title">
                      Pending Approval <span className="wp-count-badge">{pendingMembers.length}</span>
                    </h3>
                    <div className="wp-table-wrap">
                      <table className="wp-news-table wp-compact-table">
                        <thead><tr><th>Name</th><th>Handle</th><th style={{ width: 180 }}>Actions</th></tr></thead>
                        <tbody>
                          {pendingMembers.map((m) => (
                            <tr key={m._id}>
                              <td><strong>{m.name}</strong></td>
                              <td style={{ color: '#666', fontSize: 13 }}>@{m.handle}</td>
                              <td>
                                <div className="wp-action-group">
                                  <button
                                    type="button"
                                    className="btn btn-dark wp-action-btn"
                                    disabled={memberActionLoading === m._id}
                                    onClick={() => void handleApproveMember(managingGroupSlug, m._id)}
                                  >
                                    {memberActionLoading === m._id ? '…' : 'Approve'}
                                  </button>
                                  <button
                                    type="button"
                                    className="wp-action-btn wp-action-danger"
                                    disabled={memberActionLoading === m._id}
                                    onClick={() => void handleBlockMember(managingGroupSlug, m._id)}
                                  >
                                    Block
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div className="wp-member-section">
                  <h3 className="wp-member-section-title">
                    Members <span className="wp-count-badge">{groupMembers.length}</span>
                  </h3>
                  {groupMembers.length === 0 ? (
                    <p style={{ color: '#999', fontSize: 14, padding: '16px 0' }}>No members yet.</p>
                  ) : (
                    <div className="wp-table-wrap">
                      <table className="wp-news-table wp-compact-table">
                        <thead><tr><th>Name</th><th>Handle</th><th>Bio</th><th style={{ width: 160 }}>Actions</th></tr></thead>
                        <tbody>
                          {groupMembers.map((m) => (
                            <tr key={m._id}>
                              <td><strong>{m.name}</strong></td>
                              <td style={{ color: '#666', fontSize: 13 }}>@{m.handle}</td>
                              <td style={{ color: '#666', fontSize: 13, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.bio || '—'}</td>
                              <td>
                                <div className="wp-action-group">
                                  <button
                                    type="button"
                                    className="wp-action-btn wp-action-warn"
                                    disabled={memberActionLoading === m._id}
                                    onClick={() => void handleRemoveMember(managingGroupSlug, m._id)}
                                  >
                                    {memberActionLoading === m._id ? '…' : 'Remove'}
                                  </button>
                                  <button
                                    type="button"
                                    className="wp-action-btn wp-action-danger"
                                    disabled={memberActionLoading === m._id}
                                    onClick={() => void handleBlockMember(managingGroupSlug, m._id)}
                                  >
                                    Block
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Group Posts */}
                <div className="wp-member-section">
                  <h3 className="wp-member-section-title">
                    Group Posts <span className="wp-count-badge">{groupActivityItems.length}</span>
                  </h3>
                  {groupActivityLoading ? (
                    <p style={{ color: '#999', fontSize: 14, padding: '16px 0' }}>Loading posts…</p>
                  ) : groupActivityItems.length === 0 ? (
                    <p style={{ color: '#999', fontSize: 14, padding: '16px 0' }}>No posts in this group yet.</p>
                  ) : (
                    <div className="wp-table-wrap" style={{ overflowX: 'auto' }}>
                      <table className="wp-news-table wp-compact-table" style={{ tableLayout: 'fixed' }}>
                        <colgroup>
                          <col style={{ width: 130 }} />
                          <col />
                          <col style={{ width: 80 }} />
                          <col style={{ width: 90 }} />
                          <col style={{ width: 110 }} />
                        </colgroup>
                        <thead>
                          <tr>
                            <th>Author</th>
                            <th>Post</th>
                            <th>Media</th>
                            <th>Date</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {groupActivityItems.map((item) => {
                            const activityId = item._id ?? '';
                            const isEditing = activityEditingId === activityId;
                            return (
                              <tr key={activityId}>
                                <td>
                                  <strong>{item.actorName}</strong>
                                  <div style={{ fontSize: 12, color: '#666' }}>@{item.actorHandle}</div>
                                </td>
                                <td className="title-column" style={{ wordBreak: 'break-word', overflow: 'hidden', minWidth: 0 }}>
                                  {isEditing ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 }}>
                                      <textarea
                                        value={activityEditingText}
                                        onChange={(e) => setActivityEditingText(e.target.value)}
                                        rows={3}
                                        style={{ width: '100%', boxSizing: 'border-box', resize: 'vertical' }}
                                      />
                                      {(activityEditingMedia ?? []).length > 0 ? (
                                        <div className="activity-edit-media-row">
                                          {(activityEditingMedia ?? []).map((m, i) => (
                                            <div key={i} className="activity-edit-thumb">
                                              {mediaThumb(m)}
                                              <button
                                                type="button"
                                                className="activity-edit-thumb-remove"
                                                onClick={() => setActivityEditingMedia((prev) => (prev ?? []).filter((_, idx) => idx !== i))}
                                              >×</button>
                                            </div>
                                          ))}
                                        </div>
                                      ) : null}
                                      <label className="activity-edit-add-media">
                                        {activityUploadingMedia ? 'Uploading…' : '＋ Add image / video'}
                                        <input type="file" accept="image/*,video/*" style={{ display: 'none' }} onChange={handleAdminActivityMediaUpload} disabled={activityUploadingMedia} />
                                      </label>
                                      <div style={{ display: 'flex', gap: 6 }}>
                                        <button type="button" onClick={() => void handleAdminUpdateActivity(activityId)} style={{ fontSize: 12 }}>Save</button>
                                        <button type="button" onClick={() => { setActivityEditingId(null); setActivityEditingText(''); setActivityEditingMedia([]); }} style={{ fontSize: 12 }}>Cancel</button>
                                      </div>
                                    </div>
                                  ) : (
                                    <span>{item.text}</span>
                                  )}
                                </td>
                                <td style={{ fontSize: 12 }}>
                                  {item.media && item.media.length > 0 ? (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                      {item.media.map((m, i) => (
                                        <div key={i} style={{ width: 40, height: 40, borderRadius: 3, border: '1px solid #ddd', overflow: 'hidden', flexShrink: 0 }}>
                                          {mediaThumb(m)}
                                        </div>
                                      ))}
                                    </div>
                                  ) : <span style={{ color: '#aaa' }}>—</span>}
                                </td>
                                <td style={{ fontSize: 12, whiteSpace: 'nowrap' }}>
                                  {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '-'}
                                </td>
                                <td style={{ whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                    <button
                                      type="button"
                                      className="admin-action-btn"
                                      onClick={() => { setActivityEditingId(activityId); setActivityEditingText(item.text); setActivityEditingMedia(item.media ? [...item.media] : []); }}
                                    >
                                      <Pencil size={13} /> Edit
                                    </button>
                                    <button
                                      type="button"
                                      className="admin-action-btn admin-action-btn--danger"
                                      onClick={() => void handleAdminDeleteActivity(activityId)}
                                    >
                                      <Trash2 size={13} /> Delete
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              adminGroupsLoading ? (
                <p style={{ color: '#999', padding: 24 }}>Loading groups…</p>
              ) : adminGroups.length === 0 ? (
                <p style={{ color: '#999', padding: 24 }}>No groups found. Create one first.</p>
              ) : (
                <div className="wp-table-wrap">
                  <table className="wp-news-table wp-compact-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Type</th>
                        <th>Privacy</th>
                        <th style={{ width: 80 }}>Members</th>
                        <th style={{ width: 160 }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminGroups.map((g) => (
                        <tr key={g.slug}>
                          <td>
                            <strong>{g.name}</strong>
                            <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>{g.slug}</div>
                          </td>
                          <td style={{ fontSize: 13, color: '#666' }}>{g.groupTypeSlug || '—'}</td>
                          <td>
                            <span className={`wp-privacy-badge ${g.privacy === 'private' ? 'wp-privacy-private' : 'wp-privacy-public'}`}>
                              {g.privacy}
                            </span>
                          </td>
                          <td style={{ textAlign: 'center' }}>{g.membersCount}</td>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                              <button
                                type="button"
                                className="btn btn-dark wp-action-btn"
                                onClick={() => void openManageGroup(g.slug)}
                              >
                                Manage Members
                              </button>
                              <button
                                type="button"
                                className="admin-action-btn"
                                onClick={() => openEditGroup(g)}
                              >
                                <Pencil size={13} /> Edit Group
                              </button>
                              <button
                                type="button"
                                className="admin-action-btn admin-action-btn--danger"
                                onClick={() => void handleDeleteGroup(g.slug)}
                              >
                                <Trash2 size={13} /> Delete Group
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}
          </section>
        ) : null}

        {activeView === 'activity' ? (
          <section className="wp-list-screen">
            <div className="wp-list-top">
              <h1>Activity Posts</h1>
              <span style={{ color: '#666', fontSize: '14px' }}>{activityItems.length} total posts</span>
            </div>
            <div className="wp-table-wrap">
              <table className="wp-news-table" style={{ tableLayout: 'fixed' }}>
                <colgroup>
                  <col style={{ width: 140 }} />
                  <col />
                  <col style={{ width: 100 }} />
                  <col style={{ width: 55 }} />
                  <col style={{ width: 70 }} />
                  <col style={{ width: 90 }} />
                  <col style={{ width: 120 }} />
                </colgroup>
                <thead>
                  <tr>
                    <th>Author</th>
                    <th>Post</th>
                    <th>Media</th>
                    <th>Likes</th>
                    <th>Comments</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {activityItems.map((item) => {
                    const activityId = item._id ?? '';
                    const isEditing = activityEditingId === activityId;
                    return (
                      <tr key={activityId}>
                        <td>
                          <strong>{item.actorName}</strong>
                          <div style={{ fontSize: '12px', color: '#666' }}>@{item.actorHandle}</div>
                          {item.actorId ? <div style={{ fontSize: '11px', color: '#aaa' }}>ID: {item.actorId}</div> : null}
                        </td>
                        <td className="title-column" style={{ wordBreak: 'break-word', overflow: 'hidden', minWidth: 0 }}>
                          {isEditing ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: 0 }}>
                              <textarea
                                value={activityEditingText}
                                onChange={(e) => setActivityEditingText(e.target.value)}
                                rows={3}
                                style={{ width: '100%', boxSizing: 'border-box', resize: 'vertical' }}
                              />
                              {/* media preview while editing */}
                              {(activityEditingMedia ?? []).length > 0 ? (
                                <div className="activity-edit-media-row">
                                  {(activityEditingMedia ?? []).map((m, i) => (
                                    <div key={i} className="activity-edit-thumb">
                                      {mediaThumb(m)}
                                      <button
                                        type="button"
                                        className="activity-edit-thumb-remove"
                                        onClick={() => setActivityEditingMedia((prev) => (prev ?? []).filter((_, idx) => idx !== i))}
                                      >×</button>
                                    </div>
                                  ))}
                                </div>
                              ) : null}
                              <label className="activity-edit-add-media">
                                {activityUploadingMedia ? 'Uploading…' : '＋ Add image / video'}
                                <input type="file" accept="image/*,video/*" style={{ display: 'none' }} onChange={handleAdminActivityMediaUpload} disabled={activityUploadingMedia} />
                              </label>
                              <div style={{ display: 'flex', gap: '6px' }}>
                                <button type="button" onClick={() => void handleAdminUpdateActivity(activityId)} style={{ fontSize: '12px' }}>
                                  Save
                                </button>
                                <button type="button" onClick={() => { setActivityEditingId(null); setActivityEditingText(''); setActivityEditingMedia([]); }} style={{ fontSize: '12px' }}>
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <span>{item.text}</span>
                          )}
                        </td>
                        <td style={{ fontSize: '12px' }}>
                          {item.media && item.media.length > 0 ? (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                              {item.media.map((m, i) => (
                                <div key={i} style={{ width: 48, height: 48, borderRadius: 3, border: '1px solid #ddd', overflow: 'hidden', flexShrink: 0 }}>
                                  {mediaThumb(m)}
                                </div>
                              ))}
                            </div>
                          ) : <span style={{ color: '#aaa' }}>—</span>}
                        </td>
                        <td>{item.likes ?? 0}</td>
                        <td>{item.comments ?? 0}</td>
                        <td style={{ fontSize: '12px', whiteSpace: 'nowrap' }}>
                          {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '-'}
                        </td>
                        <td style={{ whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <button
                              type="button"
                              className="admin-action-btn"
                              onClick={() => { setActivityEditingId(activityId); setActivityEditingText(item.text); setActivityEditingMedia(item.media ? [...item.media] : []); }}
                            >
                              <Pencil size={13} /> Edit
                            </button>
                            <button
                              type="button"
                              className="admin-action-btn admin-action-btn--danger"
                              onClick={() => void handleAdminDeleteActivity(activityId)}
                            >
                              <Trash2 size={13} /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {activityItems.length === 0 ? (
                    <tr>
                      <td colSpan={7}>No activity posts found.</td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}
        {activeView === 'users' ? (
          <UserAdminPanel token={token} onChanged={() => void loadStats()} />
        ) : null}
      </main>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: ReactNode; label: string | number; value: string | number }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
