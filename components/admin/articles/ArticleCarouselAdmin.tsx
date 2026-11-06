'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ExternalLink, Save, Search, Trash2 } from 'lucide-react';
import { API_URL } from '@/lib/api';
import type { Article, ArticleCarousel } from '@/lib/types';

const carouselSections = [
  { key: 'home', label: 'Homepage' },
  { key: 'beauty', label: 'Beauty' },
  { key: 'tech', label: 'Tech' },
  { key: 'fashion', label: 'Fashion' },
  { key: 'lifestyle', label: 'Lifestyle / Explore' },
  { key: 'baby', label: 'Baby' },
  { key: 'kids', label: 'Kids' },
  { key: 'wedding', label: 'Wedding' },
  { key: 'dating', label: 'Dating' },
  { key: 'travel', label: 'Travel' },
] as const;

type Props = {
  token: string;
};

function articleId(article: Article) {
  return article._id ?? '';
}

export function ArticleCarouselAdmin({ token }: Props) {
  const [section, setSection] = useState<(typeof carouselSections)[number]['key']>('home');
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [autoRotate, setAutoRotate] = useState(true);
  const [rotationIntervalMs, setRotationIntervalMs] = useState(6000);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const headers = useMemo(
    () => ({
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }),
    [token],
  );

  const loadArticles = useCallback(async () => {
    if (!token) return;
    const response = await fetch(`${API_URL}/articles/admin/items`, { headers });
    if (!response.ok) throw new Error('articles failed');
    const items = (await response.json()) as Article[];
    const now = Date.now();
    setArticles(
      items.filter((item) => {
        const published = !item.status || item.status === 'published';
        const publishedAt = item.publishedAt ? new Date(item.publishedAt).getTime() : 0;
        return published && (!publishedAt || publishedAt <= now) && Boolean(item._id);
      }),
    );
  }, [headers, token]);

  const loadCarousel = useCallback(async (nextSection: string) => {
    const response = await fetch(`${API_URL}/articles/carousels/${encodeURIComponent(nextSection)}`);
    if (!response.ok) throw new Error('carousel failed');
    const carousel = (await response.json()) as ArticleCarousel;
    setSelectedIds(carousel.articleIds ?? []);
    setAutoRotate(carousel.autoRotate !== false);
    setRotationIntervalMs(carousel.rotationIntervalMs ?? 6000);
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setStatus('');

    Promise.all([loadArticles(), loadCarousel(section)])
      .catch(() => {
        if (active) setStatus('Unable to load carousel settings. Check the API connection and admin login.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [loadArticles, loadCarousel, section]);

  const articlesById = useMemo(
    () => new Map(articles.map((article) => [articleId(article), article])),
    [articles],
  );
  const selectedArticles = selectedIds
    .map((id) => articlesById.get(id))
    .filter((article): article is Article => Boolean(article));
  const availableArticles = useMemo(() => {
    const search = query.trim().toLowerCase();
    return articles.filter((article) => {
      if (selectedIds.includes(articleId(article))) return false;
      if (!search) return true;
      return [article.title, article.category, article.authorName]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(search));
    });
  }, [articles, query, selectedIds]);

  function addArticle(id: string) {
    if (!id || selectedIds.includes(id) || selectedIds.length >= 24) return;
    setSelectedIds((current) => [...current, id]);
  }

  function removeArticle(id: string) {
    setSelectedIds((current) => current.filter((item) => item !== id));
  }

  function moveArticle(index: number, direction: -1 | 1) {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= selectedIds.length) return;
    setSelectedIds((current) => {
      const next = [...current];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      return next;
    });
  }

  async function saveCarousel() {
    if (!token) {
      setStatus('Login as admin to save carousel settings.');
      return;
    }

    setSaving(true);
    setStatus('');
    try {
      const response = await fetch(`${API_URL}/articles/admin/carousels/${section}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ articleIds: selectedIds, autoRotate, rotationIntervalMs }),
      });
      if (!response.ok) {
        const result = await response.json().catch(() => null);
        const message = Array.isArray(result?.message) ? result.message.join(' ') : result?.message;
        throw new Error(message || 'save failed');
      }
      const carousel = (await response.json()) as ArticleCarousel;
      setSelectedIds(carousel.articleIds);
      setStatus('Featured carousel saved. The public page now uses this order.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Carousel settings were not saved.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="article-carousel-admin">
      <div className="article-carousel-admin__head">
        <div>
          <h1>Featured Article Carousels</h1>
          <p>Select published articles, arrange their display order, and control automatic rotation for each page.</p>
        </div>
        <button type="button" onClick={() => void saveCarousel()} disabled={saving || loading}>
          <Save size={16} />
          {saving ? 'Saving…' : 'Save carousel'}
        </button>
      </div>

      {status ? <div className="notice notice-info">{status}</div> : null}

      <div className="article-carousel-admin__settings">
        <label>
          <span>Website section</span>
          <select value={section} onChange={(event) => setSection(event.target.value as typeof section)}>
            {carouselSections.map((item) => <option value={item.key} key={item.key}>{item.label}</option>)}
          </select>
        </label>
        <label className="article-carousel-admin__toggle">
          <input checked={autoRotate} onChange={(event) => setAutoRotate(event.target.checked)} type="checkbox" />
          <span>Rotate articles automatically</span>
        </label>
        <label>
          <span>Rotation interval</span>
          <select
            value={rotationIntervalMs}
            onChange={(event) => setRotationIntervalMs(Number(event.target.value))}
            disabled={!autoRotate}
          >
            <option value={3000}>3 seconds</option>
            <option value={5000}>5 seconds</option>
            <option value={6000}>6 seconds</option>
            <option value={8000}>8 seconds</option>
            <option value={10000}>10 seconds</option>
            <option value={15000}>15 seconds</option>
          </select>
        </label>
      </div>

      <div className="article-carousel-admin__grid">
        <div className="article-carousel-admin__panel">
          <div className="article-carousel-admin__panel-head">
            <div>
              <h2>Selected featured articles</h2>
              <span>{selectedArticles.length} selected · top item appears first</span>
            </div>
          </div>
          <ol className="article-carousel-admin__selected">
            {selectedArticles.map((article, index) => (
              <li key={articleId(article)}>
                <span className="article-carousel-admin__position">{index + 1}</span>
                <img src={article.image} alt="" />
                <span className="article-carousel-admin__article-copy">
                  <strong>{article.title}</strong>
                  <small>{article.category}</small>
                  <a href={`/blog/${article.slug}`} target="_blank" rel="noreferrer">
                    View published article <ExternalLink size={12} />
                  </a>
                </span>
                <span className="article-carousel-admin__actions">
                  <button type="button" onClick={() => moveArticle(index, -1)} disabled={index === 0} aria-label={`Move ${article.title} up`}><ArrowUp size={15} /></button>
                  <button type="button" onClick={() => moveArticle(index, 1)} disabled={index === selectedArticles.length - 1} aria-label={`Move ${article.title} down`}><ArrowDown size={15} /></button>
                  <button type="button" onClick={() => removeArticle(articleId(article))} aria-label={`Remove ${article.title}`}><Trash2 size={15} /></button>
                </span>
              </li>
            ))}
            {!selectedArticles.length ? <li className="article-carousel-admin__empty">No featured articles selected for this page.</li> : null}
          </ol>
        </div>

        <div className="article-carousel-admin__panel">
          <div className="article-carousel-admin__panel-head">
            <div>
              <h2>Published articles</h2>
              <span>Select an article to feature it on this page.</span>
            </div>
            <label className="article-carousel-admin__search">
              <Search size={15} />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search articles" />
            </label>
          </div>
          <div className="article-carousel-admin__available">
            {availableArticles.map((article) => (
              <button type="button" onClick={() => addArticle(articleId(article))} key={articleId(article)}>
                <img src={article.image} alt="" />
                <span>
                  <strong>{article.title}</strong>
                  <small>{article.category} · {article.authorName || 'admin'}</small>
                </span>
                <b>+ Add</b>
              </button>
            ))}
            {!availableArticles.length ? <p>No matching published articles are available.</p> : null}
          </div>
        </div>
      </div>
    </section>
  );
}
