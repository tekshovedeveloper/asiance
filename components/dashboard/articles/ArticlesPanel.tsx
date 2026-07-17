"use client";

import Link from "next/link";
import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { FileText, ImagePlus, Send } from "lucide-react";
import { NewsEditor } from "@/components/NewsEditor";
import { getArticleCategories, getMyArticles, submitArticle, uploadImage } from "@/lib/api";
import type { Article, ArticleCategory } from "@/lib/types";
import styles from "../dashboard.module.css";
import type { ArticleDashboardView, DashboardUser } from "../types";

type ArticleForm = {
  title: string;
  category: string;
  excerpt: string;
  content: string;
  image: string;
  tags: string;
  kind: "normal" | "featured";
};

const emptyForm: ArticleForm = {
  title: "",
  category: "",
  excerpt: "",
  content: "",
  image: "",
  tags: "",
  kind: "normal",
};

function articleStatus(article: Article) {
  return article.status ?? "published";
}

function parseTags(value: string) {
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function formatDate(value?: string) {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return "Recently";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(date);
}

function viewTitle(view: ArticleDashboardView) {
  if (view === "add") return "Add article";
  if (view === "published") return "Published articles";
  return "Pending articles";
}

function viewDescription(view: ArticleDashboardView, user: DashboardUser) {
  if (view === "add") return `Write as ${user.name}. Your article will be reviewed before it appears on the blog.`;
  if (view === "pending") return "Articles waiting for admin approval.";
  return "Approved articles that are live on the blog.";
}

export function ArticlesPanel({
  view,
  user,
  onNavigate,
}: {
  view: ArticleDashboardView;
  user: DashboardUser;
  onNavigate: (view: ArticleDashboardView) => void;
}) {
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<ArticleCategory[]>([]);
  const [form, setForm] = useState<ArticleForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [status, setStatus] = useState("");

  const publishedCount = useMemo(
    () => articles.filter((article) => articleStatus(article) === "published").length,
    [articles],
  );
  const pendingCount = useMemo(
    () => articles.filter((article) => articleStatus(article) === "pending").length,
    [articles],
  );

  const visibleArticles = useMemo(() => {
    if (view === "add") return [];
    return articles.filter((article) => articleStatus(article) === view);
  }, [articles, view]);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      try {
        const [nextCategories, nextArticles] = await Promise.all([
          getArticleCategories(),
          getMyArticles(),
        ]);

        if (!mounted) return;

        setCategories(nextCategories);
        setArticles(nextArticles);
        setForm((current) => ({
          ...current,
          category: current.category || nextCategories[0]?.name || "Lifestyle",
        }));
      } catch {
        if (mounted) setStatus("Articles could not load right now.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void load();

    return () => {
      mounted = false;
    };
  }, []);

  async function refreshArticles() {
    const nextArticles = await getMyArticles();
    setArticles(nextArticles);
  }

  async function handleImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setStatus("");
    try {
      const uploaded = await uploadImage(file);
      setForm((current) => ({ ...current, image: uploaded.url }));
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Image upload failed.");
    } finally {
      setUploadingImage(false);
      event.currentTarget.value = "";
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = form.title.trim();
    const category = form.category.trim() || categories[0]?.name || "Lifestyle";
    const content = form.content.trim();

    if (!title || !content) {
      setStatus("Add a title and article content before sending it for approval.");
      return;
    }

    setSaving(true);
    setStatus("");
    try {
      const created = await submitArticle({
        title,
        category,
        excerpt: form.excerpt.trim(),
        content,
        image: form.image.trim(),
        tags: parseTags(form.tags),
        featured: form.kind === "featured",
      });

      setArticles((current) => [created, ...current]);
      await refreshArticles();
      setForm({
        ...emptyForm,
        category,
        kind: "normal",
      });
      setStatus("Article sent to admin for approval.");
      onNavigate("pending");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Article was not submitted.");
    } finally {
      setSaving(false);
    }
  }

  const articleTabs: Array<{ key: ArticleDashboardView; label: string; count?: number }> = [
    { key: "add", label: "Add Article" },
    { key: "published", label: "Published", count: publishedCount },
    { key: "pending", label: "Pending", count: pendingCount },
  ];

  return (
    <section className={styles.tabsCard}>
      <div className={styles.tabsBar}>
        {articleTabs.map((tab) => (
          <button
            key={tab.key}
            className={`${styles.tab} ${view === tab.key ? styles.tabActive : ""}`}
            onClick={() => onNavigate(tab.key)}
            type="button"
          >
            {tab.label}
            {typeof tab.count === "number" ? <span className={styles.articleTabCount}>{tab.count}</span> : null}
          </button>
        ))}
      </div>

      <div className={styles.tabsBody}>
        <div className={styles.subhead}>
          <div>
            <strong>{viewTitle(view)}</strong>
            <span className={styles.articleSubcopy}>{viewDescription(view, user)}</span>
          </div>
        </div>

        {status ? <div className={styles.articleNotice}>{status}</div> : null}

        {view === "add" ? (
          <form className={styles.articleComposer} onSubmit={handleSubmit}>
            <div className={styles.articleEditorCard}>
            <div className={styles.articleField}>
              <label>Title</label>
              <input
                value={form.title}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                placeholder="Give your article a clear headline"
                required
              />
            </div>

            <div className={styles.articleField}>
              <label>Content</label>
              <NewsEditor
                value={form.content}
                onChange={(content) => setForm((current) => ({ ...current, content }))}
                onUploadImage={async (file) => {
                  const uploaded = await uploadImage(file);
                  return uploaded.url;
                }}
                allowCodeBlock={false}
              />
            </div>

            <div className={styles.articleField}>
              <label>Excerpt</label>
              <textarea
                value={form.excerpt}
                onChange={(event) => setForm((current) => ({ ...current, excerpt: event.target.value }))}
                placeholder="Short summary shown on the blog card"
                rows={4}
              />
            </div>
            </div>

            <aside className={styles.articleSideCard}>
              <div className={styles.articlePublishBox}>
              <h3>Review queue</h3>
              <p>Submitting sends this article to the admin dashboard as Pending.</p>
              <button disabled={saving} type="submit">
                <Send size={16} />
                {saving ? "Sending..." : "Submit for approval"}
              </button>
            </div>

            <div className={styles.articleField}>
              <label>Category</label>
              <select
                value={form.category}
                onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
              >
                {categories.map((category) => (
                  <option key={category.slug} value={category.name}>
                    {category.name}
                  </option>
                ))}
                {!categories.length ? <option value="Lifestyle">Lifestyle</option> : null}
              </select>
            </div>

            <div className={styles.articleField}>
              <label>Article type</label>
              <select
                value={form.kind}
                onChange={(event) => setForm((current) => ({ ...current, kind: event.target.value as "normal" | "featured" }))}
              >
                <option value="normal">Normal article</option>
                <option value="featured">Featured article</option>
              </select>
            </div>

            <div className={styles.articleField}>
              <label>Tags</label>
              <input
                value={form.tags}
                onChange={(event) => setForm((current) => ({ ...current, tags: event.target.value }))}
                placeholder="Culture, wellness, design"
              />
            </div>

            <div className={styles.articleImageBox}>
              <input
                ref={imageInputRef}
                accept="image/*"
                hidden
                onChange={handleImageUpload}
                type="file"
              />
              <button disabled={uploadingImage} onClick={() => imageInputRef.current?.click()} type="button">
                <ImagePlus size={16} />
                {uploadingImage ? "Uploading..." : "Upload cover image"}
              </button>
              <input
                value={form.image}
                onChange={(event) => setForm((current) => ({ ...current, image: event.target.value }))}
                placeholder="Or paste image URL"
              />
              {form.image ? <img src={form.image} alt="Article cover preview" /> : null}
            </div>
            </aside>
          </form>
        ) : (
          <div className={styles.articleListPanel}>
            {loading ? <div className={styles.friendsLoading}>Loading articles...</div> : null}
            {!loading && !visibleArticles.length ? (
              <div className={styles.friendsEmptyBox}>
                <div className={styles.friendsEmptyIcon}>
                  <FileText size={22} />
                </div>
                <span>No {view} articles yet.</span>
                <button className={styles.articleEmptyAction} onClick={() => onNavigate("add")} type="button">
                  Add Article
                </button>
              </div>
            ) : null}

            {visibleArticles.map((article) => (
              <article className={styles.articleListItem} key={article.slug}>
                {article.image ? (
                  <img className={styles.articleListImage} src={article.image} alt={article.title} />
                ) : (
                  <div className={styles.articleListPlaceholder}>
                    <FileText size={24} />
                  </div>
                )}
                <div className={styles.articleListBody}>
                  <h3>{article.title}</h3>
                  <div className={styles.articleListMeta}>
                    <span>{article.category}</span>
                    <span>{articleStatus(article)}</span>
                    <span>{formatDate(article.publishedAt || article.submittedAt)}</span>
                  </div>
                  <p>{article.excerpt || "No excerpt added yet."}</p>
                  {article.tags?.length ? (
                    <div className={styles.articleTagRow}>
                      {article.tags.slice(0, 4).map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </div>
                  ) : null}
                </div>
                <div className={styles.articleListActions}>
                  {articleStatus(article) === "published" ? (
                    <Link className={styles.friendBtn} href={`/blog/${article.slug}`}>View</Link>
                  ) : (
                    <span className={styles.friendBtnSelf}>Waiting approval</span>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
