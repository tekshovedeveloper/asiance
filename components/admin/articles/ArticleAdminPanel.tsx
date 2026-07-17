'use client';

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import { Plus, Save, Search, X } from 'lucide-react';
import { NewsEditor } from '@/components/NewsEditor';
import { API_URL } from '@/lib/api';
import { articleCategories as fallbackArticleCategories, articles as fallbackArticles } from '@/lib/mock-data';
import type { Article, ArticleCategory } from '@/lib/types';

export type ArticleAdminView = 'articles-list' | 'articles-pending' | 'articles-add' | 'article-categories';

type ArticleFormState = {
  title: string;
  slug: string;
  categorySlug: string;
  excerpt: string;
  content: string;
  image: string;
  authorName: string;
  tags: string;
  featured: boolean;
  status: 'draft' | 'pending' | 'published';
  publishedAt: string;
};

type CategoryFormState = {
  name: string;
  slug: string;
  description: string;
  sortOrder: string;
};

type ArticleAdminPanelProps = {
  token: string;
  view: ArticleAdminView;
  onNavigate: (view: ArticleAdminView) => void;
  onChanged: () => void | Promise<void>;
  uploadImageFile: (file: File) => Promise<string>;
  uploadingImage: boolean;
};

const emptyArticleForm: ArticleFormState = {
  title: '',
  slug: '',
  categorySlug: fallbackArticleCategories[0]?.slug ?? 'lifestyle',
  excerpt: '',
  content: '',
  image: '',
  authorName: 'Asiance Editors',
  tags: '',
  featured: false,
  status: 'published',
  publishedAt: '',
};

const emptyCategoryForm: CategoryFormState = {
  name: '',
  slug: '',
  description: '',
  sortOrder: '0',
};

function makeSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function toDateTimeLocal(value?: string) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 16);
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

function formatArticleDate(item: Article) {
  if (item.status === 'pending') return 'Pending approval';
  if (item.status === 'draft') return 'Draft';
  if (!item.publishedAt) return 'Published';

  const date = new Date(item.publishedAt);
  if (Number.isNaN(date.getTime())) return 'Published';

  const dateText = `${date.toLocaleDateString('en-CA').replace(/-/g, '/')} at ${date.toLocaleTimeString(
    'en',
    {
      hour: 'numeric',
      minute: '2-digit',
    },
  )}`;

  return date.getTime() > Date.now() ? `Scheduled ${dateText}` : `Published ${dateText}`;
}

function articleStatusLabel(item: Article) {
  if (item.status === 'pending') return 'Pending';
  if (item.status === 'draft') return 'Draft';
  return 'Published';
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

function categoryFallbackFromArticles(items: Article[]) {
  const categories = new Map<string, ArticleCategory>();

  [
    ...fallbackArticleCategories,
    ...items.map((item) => ({ name: item.category, slug: makeSlug(item.category), sortOrder: undefined })),
  ]
    .filter((category) => category.name)
    .forEach((category, index) => {
      if (!categories.has(category.slug)) {
        categories.set(category.slug, { ...category, sortOrder: category.sortOrder ?? index });
      }
    });

  return Array.from(categories.values());
}

export function ArticleAdminPanel({
  token,
  view,
  onNavigate,
  onChanged,
  uploadImageFile,
  uploadingImage,
}: ArticleAdminPanelProps) {
  const [items, setItems] = useState<Article[]>(fallbackArticles);
  const [categories, setCategories] = useState<ArticleCategory[]>(categoryFallbackFromArticles(fallbackArticles));
  const [form, setForm] = useState<ArticleFormState>(emptyArticleForm);
  const [editingSlug, setEditingSlug] = useState('');
  const [categoryForm, setCategoryForm] = useState<CategoryFormState>(emptyCategoryForm);
  const [editingCategorySlug, setEditingCategorySlug] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'pending' | 'published'>('all');
  const [selectedArticles, setSelectedArticles] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState('');
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');

  const authHeaders = useMemo(
    () => ({
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }),
    [token],
  );

  const currentCategory = useMemo(
    () => categories.find((category) => category.slug === form.categorySlug),
    [categories, form.categorySlug],
  );

  const dateOptions = useMemo(() => {
    return Array.from(new Set(items.map((item) => monthKey(item.publishedAt)).filter(Boolean))).sort((a, b) =>
      b.localeCompare(a),
    );
  }, [items]);

  const filteredArticles = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return items.filter((item) => {
      const categorySlug = makeSlug(item.category);
      const itemStatus = item.status ?? 'published';
      const matchesSearch = query
        ? [item.title, item.authorName, item.category, item.excerpt]
            .filter(Boolean)
            .some((value) => value?.toLowerCase().includes(query))
        : true;
      const matchesCategory = categoryFilter === 'all' || categorySlug === categoryFilter;
      const matchesDate = dateFilter === 'all' || monthKey(item.publishedAt) === dateFilter;
      const matchesStatus = statusFilter === 'all' || itemStatus === statusFilter;
      return matchesSearch && matchesCategory && matchesDate && matchesStatus;
    });
  }, [categoryFilter, dateFilter, items, searchTerm, statusFilter]);

  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(filteredArticles.length / pageSize));
  const pageItems = filteredArticles.slice((page - 1) * pageSize, page * pageSize);
  const publishedCount = items.filter((item) => (item.status ?? 'published') === 'published').length;
  const pendingCount = items.filter((item) => item.status === 'pending').length;
  const draftCount = items.filter((item) => item.status === 'draft').length;
  const selectedOnPage = pageItems.length > 0 && pageItems.every((item) => selectedArticles.includes(item.slug));

  useEffect(() => {
    void loadArticles();
  }, [token]);

  useEffect(() => {
    setPage(1);
  }, [categoryFilter, dateFilter, searchTerm, statusFilter]);

  useEffect(() => {
    if (view === 'articles-pending') {
      setStatusFilter('pending');
    } else if (view === 'articles-list') {
      setStatusFilter('all');
    }
  }, [view]);

  async function loadArticles() {
    try {
      const [categoriesResponse, articlesResponse] = await Promise.all([
        fetch(`${API_URL}/articles/categories`),
        fetch(`${API_URL}${token ? '/articles/admin/items' : '/articles'}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        }),
      ]);

      if (!categoriesResponse.ok || !articlesResponse.ok) throw new Error('articles failed');

      const [nextCategories, nextItems] = (await Promise.all([
        categoriesResponse.json(),
        articlesResponse.json(),
      ])) as [ArticleCategory[], Article[]];

      const mergedCategories = categoryFallbackFromArticles(nextItems);
      nextCategories.forEach((category) => {
        const existingIndex = mergedCategories.findIndex((item) => item.slug === category.slug);
        if (existingIndex >= 0) {
          mergedCategories[existingIndex] = category;
        } else {
          mergedCategories.push(category);
        }
      });

      setItems(nextItems);
      setCategories(mergedCategories);
      setForm((current) => ({
        ...current,
        categorySlug: current.categorySlug || mergedCategories[0]?.slug || 'lifestyle',
      }));
    } catch {
      const fallbackCategories = categoryFallbackFromArticles(fallbackArticles);
      setItems(fallbackArticles);
      setCategories(fallbackCategories);
      setStatus('Showing fallback article data. Check API connection if changes do not save.');
    }
  }

  function resetForm() {
    setEditingSlug('');
    setForm({
      ...emptyArticleForm,
      categorySlug: categories[0]?.slug || 'lifestyle',
    });
  }

  function openAddArticle() {
    resetForm();
    onNavigate('articles-add');
  }

  function editArticle(item: Article) {
    const categorySlug = categories.find((category) => category.name === item.category)?.slug || makeSlug(item.category);

    setEditingSlug(item.slug);
    setForm({
      title: item.title,
      slug: item.slug,
      categorySlug,
      excerpt: item.excerpt ?? '',
      content: item.content ?? '',
      image: item.image ?? '',
      authorName: item.authorName ?? 'Asiance Editors',
      tags: tagsToInput(item.tags),
      featured: Boolean(item.featured),
      status: item.status ?? 'published',
      publishedAt: toDateTimeLocal(item.publishedAt),
    });
    onNavigate('articles-add');
  }

  async function saveArticle(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) {
      setStatus('Login as admin to save articles.');
      return;
    }

    const payload = {
      title: form.title,
      slug: form.slug || undefined,
      category: currentCategory?.name || form.categorySlug,
      excerpt: form.excerpt,
      content: form.content,
      image: form.image,
      authorName: form.authorName,
      tags: parseTags(form.tags),
      featured: form.featured,
      status: form.status,
      publishedAt: form.publishedAt ? new Date(form.publishedAt).toISOString() : undefined,
    };

    try {
      const response = await fetch(`${API_URL}/articles${editingSlug ? `/${editingSlug}` : ''}`, {
        method: editingSlug ? 'PATCH' : 'POST',
        headers: authHeaders,
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('save failed');

      setStatus(
        editingSlug
          ? 'Article updated.'
          : form.status === 'pending'
            ? 'Article saved as pending.'
            : 'Article published.',
      );
      resetForm();
      onNavigate('articles-list');
      await Promise.all([loadArticles(), onChanged()]);
    } catch {
      setStatus('Article was not saved. Check admin login and API connection.');
    }
  }

  async function deleteArticle(slug: string, confirmDelete = true) {
    if (!token) {
      setStatus('Login as admin to delete articles.');
      return false;
    }

    if (confirmDelete && !window.confirm('Delete this article?')) return false;

    try {
      const response = await fetch(`${API_URL}/articles/${slug}`, {
        method: 'DELETE',
        headers: authHeaders,
      });
      if (!response.ok) throw new Error('delete failed');
      if (editingSlug === slug) resetForm();
      return true;
    } catch {
      setStatus('Article was not deleted. Check admin login and API connection.');
      return false;
    }
  }

  async function approveArticle(slug: string) {
    if (!token) {
      setStatus('Login as admin to approve articles.');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/articles/${slug}/approve`, {
        method: 'PATCH',
        headers: authHeaders,
      });
      if (!response.ok) throw new Error('approve failed');
      setStatus('Article approved and published.');
      await Promise.all([loadArticles(), onChanged()]);
    } catch {
      setStatus('Article was not approved. Check admin login and API connection.');
    }
  }

  async function applyBulkAction() {
    if (bulkAction !== 'delete' || !selectedArticles.length) return;
    if (!window.confirm(`Delete ${selectedArticles.length} selected article(s)?`)) return;

    const results = await Promise.all(selectedArticles.map((slug) => deleteArticle(slug, false)));
    const deletedCount = results.filter(Boolean).length;
    setSelectedArticles([]);
    setBulkAction('');
    setStatus(`${deletedCount} article(s) deleted.`);
    await Promise.all([loadArticles(), onChanged()]);
  }

  async function handleArticleImageFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    if (!file) return;

    try {
      const url = await uploadImageFile(file);
      setForm((current) => ({ ...current, image: url }));
    } catch {
      // uploadImageFile already reports a user-facing message in the parent admin shell.
    } finally {
      event.currentTarget.value = '';
    }
  }

  function resetCategoryForm() {
    setEditingCategorySlug('');
    setCategoryForm(emptyCategoryForm);
  }

  function editCategory(category: ArticleCategory) {
    setEditingCategorySlug(category.slug);
    setCategoryForm({
      name: category.name,
      slug: category.slug,
      description: category.description ?? '',
      sortOrder: String(category.sortOrder ?? 0),
    });
    onNavigate('article-categories');
  }

  async function saveCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) {
      setStatus('Login as admin to save article categories.');
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/articles/categories${editingCategorySlug ? `/${editingCategorySlug}` : ''}`,
        {
          method: editingCategorySlug ? 'PATCH' : 'POST',
          headers: authHeaders,
          body: JSON.stringify({
            name: categoryForm.name,
            slug: categoryForm.slug || undefined,
            description: categoryForm.description,
            sortOrder: Number(categoryForm.sortOrder) || 0,
          }),
        },
      );

      if (!response.ok) throw new Error('category failed');

      setStatus(editingCategorySlug ? 'Article category updated.' : 'Article category created.');
      resetCategoryForm();
      await Promise.all([loadArticles(), onChanged()]);
    } catch {
      setStatus('Article category was not saved. Check admin login and API connection.');
    }
  }

  async function deleteCategory(slug: string) {
    if (!token) {
      setStatus('Login as admin to delete article categories.');
      return;
    }

    if (!window.confirm('Delete this category? Articles must be moved first.')) return;

    try {
      const response = await fetch(`${API_URL}/articles/categories/${slug}`, {
        method: 'DELETE',
        headers: authHeaders,
      });
      if (!response.ok) throw new Error('delete category failed');
      if (editingCategorySlug === slug) resetCategoryForm();
      setStatus('Article category deleted.');
      await Promise.all([loadArticles(), onChanged()]);
    } catch {
      setStatus('Article category was not deleted. Move its articles first, then try again.');
    }
  }

  function toggleSelection(slug: string) {
    setSelectedArticles((current) =>
      current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug],
    );
  }

  function togglePageSelection() {
    const pageSlugs = pageItems.map((item) => item.slug);
    setSelectedArticles((current) => {
      if (selectedOnPage) return current.filter((slug) => !pageSlugs.includes(slug));
      return Array.from(new Set([...current, ...pageSlugs]));
    });
  }

  if (view === 'articles-add') {
    return (
      <section className="wp-editor-screen">
        <div className="wp-editor-head">
          <h1>{editingSlug ? 'Edit Article' : 'Add New Article'}</h1>
          {editingSlug ? (
            <button onClick={resetForm} type="button">
              <X size={15} />
              Cancel edit
            </button>
          ) : null}
        </div>
        {status ? <div className="notice notice-info">{status}</div> : null}
        <form className="wp-editor-grid" onSubmit={saveArticle}>
          <div className="wp-editor-main">
            <input
              className="wp-title-input"
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
              placeholder="Add title"
              required
            />
            <input
              value={form.slug}
              onChange={(event) => setForm({ ...form, slug: event.target.value })}
              placeholder="Slug"
            />
            <div style={{ marginBottom: 16 }}>
              <h3 style={{ marginBottom: 8, fontSize: 14, fontWeight: 500 }}>Content</h3>
              <NewsEditor
                value={form.content}
                onChange={(content) => setForm({ ...form, content })}
                onUploadImage={uploadImageFile}
                allowCodeBlock={false}
              />
            </div>
            <textarea
              value={form.excerpt}
              onChange={(event) => setForm({ ...form, excerpt: event.target.value })}
              placeholder="Excerpt"
              rows={4}
            />
          </div>
          <aside className="wp-publish-side">
            <div className="wp-box">
              <h2>Publish</h2>
              <select
                value={form.status}
                onChange={(event) => setForm({ ...form, status: event.target.value as ArticleFormState['status'] })}
              >
                <option value="published">Published</option>
                <option value="pending">Pending approval</option>
                <option value="draft">Draft</option>
              </select>
              <input
                value={form.publishedAt}
                onChange={(event) => setForm({ ...form, publishedAt: event.target.value })}
                type="datetime-local"
              />
              <button type="submit">
                {editingSlug ? <Save size={14} /> : <Plus size={14} />}
                {editingSlug ? 'Update' : 'Publish'}
              </button>
            </div>
            <div className="wp-box">
              <h2>Article Options</h2>
              <label>
                <input
                  checked={form.featured}
                  onChange={(event) => setForm({ ...form, featured: event.target.checked })}
                  type="checkbox"
                />
                Featured
              </label>
              <input
                value={form.authorName}
                onChange={(event) => setForm({ ...form, authorName: event.target.value })}
                placeholder="Author"
              />
              <input
                value={form.tags}
                onChange={(event) => setForm({ ...form, tags: event.target.value })}
                placeholder="Tags, comma separated"
              />
            </div>
            <div className="wp-box">
              <h2>Article Categories</h2>
              <select
                value={form.categorySlug}
                onChange={(event) => setForm({ ...form, categorySlug: event.target.value })}
              >
                {categories.map((category) => (
                  <option value={category.slug} key={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="wp-box">
              <h2>Featured Image</h2>
              <input type="file" accept="image/*" onChange={handleArticleImageFile} disabled={uploadingImage} />
              <input
                value={form.image}
                onChange={(event) => setForm({ ...form, image: event.target.value })}
                placeholder="Image URL"
              />
              {form.image ? (
                <div className="upload-preview">
                  <img src={form.image} alt="Preview" />
                </div>
              ) : null}
            </div>
          </aside>
        </form>
      </section>
    );
  }

  if (view === 'article-categories') {
    return (
      <section className="wp-category-screen">
        <h1>Article Categories</h1>
        {status ? <div className="notice notice-info">{status}</div> : null}
        <div className="wp-category-grid">
          <form className="wp-category-form" onSubmit={saveCategory}>
            <h2>{editingCategorySlug ? 'Edit Article Category' : 'Add New Article Category'}</h2>
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
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="submit">{editingCategorySlug ? 'Update Category' : 'Add New Category'}</button>
              {editingCategorySlug ? (
                <button className="button-secondary" onClick={resetCategoryForm} type="button">
                  Cancel
                </button>
              ) : null}
            </div>
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
              {categories.map((category) => (
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
              {!categories.length ? (
                <tr>
                  <td colSpan={4}>No article categories found.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    );
  }

  return (
    <section className="wp-list-screen">
      <div className="wp-list-top">
        <div className="wp-view-links">
          <button
            className={statusFilter === 'all' ? 'active' : ''}
            onClick={() => setStatusFilter('all')}
            type="button"
          >
            All <span>({items.length})</span>
          </button>
          <span>|</span>
          <button
            className={statusFilter === 'published' ? 'active' : ''}
            onClick={() => setStatusFilter('published')}
            type="button"
          >
            Published <span>({publishedCount})</span>
          </button>
          <span>|</span>
          <button
            className={statusFilter === 'pending' ? 'active' : ''}
            onClick={() => setStatusFilter('pending')}
            type="button"
          >
            Pending <span>({pendingCount})</span>
          </button>
          <span>|</span>
          <button
            className={statusFilter === 'draft' ? 'active' : ''}
            onClick={() => setStatusFilter('draft')}
            type="button"
          >
            Draft <span>({draftCount})</span>
          </button>
        </div>
        <div className="wp-search">
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            aria-label="Search Articles"
          />
          <button type="button">
            <Search size={15} />
            Search Articles
          </button>
        </div>
      </div>

      {status ? <div className="notice notice-info">{status}</div> : null}

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
          {categories.map((category) => (
            <option value={category.slug} key={category.slug}>
              {category.name}
            </option>
          ))}
        </select>
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}>
          <option value="all">All statuses</option>
          <option value="published">Published</option>
          <option value="pending">Pending approval</option>
          <option value="draft">Draft</option>
        </select>
        <button type="button">Filter</button>
        <button className="wp-add-button" onClick={openAddArticle} type="button">
          Add New
        </button>
        <div className="wp-pagination">
          <span>{filteredArticles.length} items</span>
          <button disabled={page <= 1} onClick={() => setPage(1)} type="button">
            &laquo;
          </button>
          <button disabled={page <= 1} onClick={() => setPage((current) => current - 1)} type="button">
            &lsaquo;
          </button>
          <input readOnly value={page} aria-label="Current page" />
          <span>of {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage((current) => current + 1)} type="button">
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
              <th>Article Categories</th>
              <th>Status</th>
              <th>Date</th>
              <th>Featured</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((item) => (
              <tr key={item.slug}>
                <td className="check-column">
                  <input
                    checked={selectedArticles.includes(item.slug)}
                    onChange={() => toggleSelection(item.slug)}
                    type="checkbox"
                  />
                </td>
                <td className="title-column">
                  <button onClick={() => editArticle(item)} type="button">
                    {item.title}
                  </button>
                  <div className="row-links">
                    <button onClick={() => editArticle(item)} type="button">
                      Edit
                    </button>
                    {item.status === 'pending' ? (
                      <>
                        <span>|</span>
                        <button onClick={() => void approveArticle(item.slug)} type="button">
                          Approve
                        </button>
                      </>
                    ) : null}
                    <span>|</span>
                    <button onClick={() => void deleteArticle(item.slug)} type="button">
                      Delete
                    </button>
                  </div>
                </td>
                <td>{item.authorName || 'admin'}</td>
                <td>{item.category}</td>
                <td>{articleStatusLabel(item)}</td>
                <td>{formatArticleDate(item)}</td>
                <td>{item.featured ? 'Yes' : '-'}</td>
              </tr>
            ))}
            {!pageItems.length ? (
              <tr>
                <td colSpan={7}>No articles found.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
