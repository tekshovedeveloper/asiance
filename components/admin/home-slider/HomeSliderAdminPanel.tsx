'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { Eye, EyeOff, Pencil, Plus, Save, Trash2 } from 'lucide-react';
import { API_URL, uploadMedia } from '@/lib/api';
import type { Article, HomeSlide, HomeSlidePayload } from '@/lib/types';
import styles from './HomeSliderAdminPanel.module.css';

const emptyForm: HomeSlidePayload = { articleId: '', image: '', imageAlt: '', sortOrder: 0, active: true };

function imageUrl(value: string) {
  return value.startsWith('/api/uploads/') ? `${API_URL.replace(/\/api\/?$/, '')}${value}` : value;
}

export function HomeSliderAdminPanel({ token }: { token: string }) {
  const [slides, setSlides] = useState<HomeSlide[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [form, setForm] = useState<HomeSlidePayload>(emptyForm);
  const [editingId, setEditingId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [loadFailed, setLoadFailed] = useState(false);
  const selectedArticle = articles.find((article) => article._id === form.articleId);

  const request = useCallback(async <T,>(path: string, init?: RequestInit): Promise<T> => {
    const response = await fetch(`${API_URL}/home-slides${path}`, {
      ...init,
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) throw new Error(Array.isArray(data?.message) ? data.message.join(' ') : data?.message || 'Unable to connect to the slider. Please try again.');
    return data as T;
  }, [token]);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadFailed(false);
    try {
      const [items, blogs] = await Promise.all([
        request<HomeSlide[]>('/admin/items'),
        request<Article[]>('/admin/articles'),
      ]);
      setSlides(items);
      setArticles(blogs);
      setError('');
    } catch (cause) {
      setLoadFailed(true);
      setError(cause instanceof Error ? cause.message : 'Could not load slides.');
    } finally {
      setLoading(false);
    }
  }, [request]);

  useEffect(() => { void load(); }, [load]);

  function reset(items = slides) {
    setEditingId('');
    setForm({ ...emptyForm, sortOrder: items.length ? Math.min(10000, Math.max(...items.map((slide) => slide.sortOrder)) + 1) : 0 });
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    if (saving || uploading) return;
    setSaving(true);
    setError('');
    setNotice('');
    try {
      await request(editingId ? `/${editingId}` : '', { method: editingId ? 'PATCH' : 'POST', body: JSON.stringify(form) });
      setNotice(editingId ? 'Slide updated.' : 'Slide added.');
      const items = await request<HomeSlide[]>('/admin/items');
      setSlides(items);
      reset(items);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'The slide could not be saved.');
    } finally {
      setSaving(false);
    }
  }

  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Please choose an image file.'); return; }
    setUploading(true);
    setError('');
    try {
      const url = await uploadMedia(file, token);
      setForm((current) => ({ ...current, image: imageUrl(url) }));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'The image could not be uploaded.');
    } finally {
      setUploading(false);
    }
  }

  function edit(slide: HomeSlide) {
    setEditingId(slide._id);
    setForm({ articleId: slide.articleId || '', image: slide.image, imageAlt: slide.imageAlt, sortOrder: slide.sortOrder, active: slide.active });
    setError('');
    setNotice('');
  }

  async function changeSlide(slide: HomeSlide, remove = false) {
    if (remove && !window.confirm('Delete this slide?')) return;
    setSaving(true);
    setError('');
    setNotice('');
    try {
      await request(`/${slide._id}`, remove ? { method: 'DELETE' } : {
        method: 'PATCH',
        body: JSON.stringify({ articleId: slide.articleId, image: slide.image, imageAlt: slide.imageAlt, sortOrder: slide.sortOrder, active: !slide.active }),
      });
      if (editingId === slide._id) reset();
      setNotice(remove ? 'Slide deleted.' : slide.active ? 'Slide hidden.' : 'Slide shown.');
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'The slide could not be changed.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className={styles.screen}>
      <div className="wp-list-top">
        <h1>Home Slider</h1>
        <Link href="/" target="_blank" className="button-secondary">View homepage</Link>
      </div>
      <p className={styles.description}>The original community banner is always the first slide. The Welcome back card stays visible on every slide.</p>
      {notice ? <div className="notice notice-info" role="status">{notice}</div> : null}
      {error ? <div className="notice notice-error" role="alert">{error}</div> : null}
      {loadFailed ? <button type="button" onClick={() => void load()}>Retry loading slides</button> : null}
      <div className={styles.layout}>
        <form className={styles.form} onSubmit={save}>
          <h2>{editingId ? 'Edit slide' : 'Add slide'}</h2>
          <fieldset disabled={loading || saving || uploading || loadFailed}>
            <label htmlFor="home-slide-blog">Blog</label>
            <select id="home-slide-blog" value={form.articleId} onChange={(event) => setForm({ ...form, articleId: event.target.value })} required>
              <option value="">Select a published blog</option>
              {form.articleId && !selectedArticle ? <option value={form.articleId} disabled>Blog unavailable — select another</option> : null}
              {articles.map((article) => <option key={article._id} value={article._id}>{article.title}</option>)}
            </select>
            {!loading && !articles.length ? <p>Publish a blog in Articles before adding a slide.</p> : null}
            {selectedArticle ? (
              <div className={styles.blogPreview}>
                <strong>{selectedArticle.title}</strong>
                <p>{selectedArticle.excerpt || 'Add an excerpt in the article editor to show it here.'}</p>
                <Link href={`/blog/${selectedArticle.slug}`} target="_blank">Read more</Link>
              </div>
            ) : null}
            <label htmlFor="home-slide-upload">Slider image</label>
            <input id="home-slide-upload" type="file" accept="image/*" onChange={upload} />
            <label htmlFor="home-slide-image">Image URL</label>
            <input id="home-slide-image" value={form.image} onChange={(event) => setForm({ ...form, image: event.target.value })} placeholder="Upload an image or paste its URL" required maxLength={2048} pattern="(https?://.*|/api/uploads/.*)" />
            {form.image ? <img className={styles.imagePreview} src={imageUrl(form.image)} alt="Slider image preview" /> : null}
            <p className={styles.help}>Use a wide image, with space on the left for the blog title and excerpt.</p>
            <label htmlFor="home-slide-alt">Image description</label>
            <input id="home-slide-alt" value={form.imageAlt} onChange={(event) => setForm({ ...form, imageAlt: event.target.value })} placeholder="Describe the image" maxLength={300} />
            <label htmlFor="home-slide-order">Display order</label>
            <input id="home-slide-order" type="number" min={0} max={10000} step={1} value={form.sortOrder} onChange={(event) => setForm({ ...form, sortOrder: Number(event.target.value) })} required />
            <p className={styles.help}>Lower numbers appear first after the community banner.</p>
            <label className={styles.checkbox}>
              <input type="checkbox" checked={form.active} onChange={(event) => setForm({ ...form, active: event.target.checked })} />Show on homepage
            </label>
            <div className={styles.actions}>
              <button type="submit" disabled={!selectedArticle}>{editingId ? <Save size={15} /> : <Plus size={15} />}{saving ? 'Saving…' : editingId ? 'Save slide' : 'Add slide'}</button>
              {editingId ? <button type="button" className="button-secondary" onClick={() => reset()}>Cancel edit</button> : null}
            </div>
          </fieldset>
          {uploading ? <p role="status">Uploading image…</p> : null}
        </form>
        <div className={styles.list}>
          <h2>Blog slides ({slides.length})</h2>
          {loading ? <p>Loading slides…</p> : !loadFailed && !slides.length ? <p>No blog slides yet. Add your first slide using the form.</p> : null}
          {slides.map((slide) => {
            const available = articles.some((article) => article._id === slide.articleId);
            return (
              <article key={slide._id} className={styles.card}>
                <img src={imageUrl(slide.image)} alt={slide.imageAlt || slide.article?.title || 'Slide image'} />
                <div className={styles.cardCopy}>
                  <h3>{slide.article?.title || 'Blog unavailable'}</h3>
                  <p>Order: {slide.sortOrder} · {!available ? 'Blog unavailable' : slide.active ? 'Visible' : 'Hidden'}</p>
                  <div className={styles.actions}>
                    <button type="button" className="button-secondary" onClick={() => edit(slide)} disabled={saving || uploading}><Pencil size={14} />Edit</button>
                    <button type="button" className="button-secondary" onClick={() => void changeSlide(slide)} disabled={saving || uploading || !available}>{slide.active ? <EyeOff size={14} /> : <Eye size={14} />}{slide.active ? 'Hide' : 'Show'}</button>
                    <button type="button" className="button-secondary" onClick={() => void changeSlide(slide, true)} disabled={saving || uploading}><Trash2 size={14} />Delete</button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
