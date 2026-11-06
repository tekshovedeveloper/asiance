"use client";

import Link from "next/link";
import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { FileText, ImagePlus, Pencil, Save, Send, Trash2, X } from "lucide-react";
import { NewsEditor } from "@/components/NewsEditor";
import {
  deleteMyArticle,
  getArticleCategories,
  getMyArticles,
  submitArticle,
  updateMyArticle,
  uploadImage,
  type ArticleSubmitPayload,
} from "@/lib/api";
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

function articleStatus(article: Article): "draft" | "pending" | "published" {
  return article.status ?? "published";
}

function parseTags(value: string) {
  return value.split(",").map((tag) => tag.trim()).filter(Boolean);
}

function formFromArticle(article: Article): ArticleForm {
  return {
    title: article.title ?? "",
    category: article.category ?? "",
    excerpt: article.excerpt ?? "",
    content: article.content ?? "",
    image: article.image ?? "",
    tags: article.tags?.join(", ") ?? "",
    kind: article.featured ? "featured" : "normal",
  };
}

function formatDate(value?: string) {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return "Recently";
  return new Intl.DateTimeFormat("en", { month: "short", day: "2-digit", year: "numeric" }).format(date);
}

function viewTitle(view: ArticleDashboardView, editingArticle: Article | null) {
  if (view === "add") return editingArticle ? "Edit article" : "Add article";
  if (view === "published") return "Published articles";
  if (view === "draft") return "Draft articles";
  return "Pending articles";
}

function viewDescription(view: ArticleDashboardView, user: DashboardUser, editingArticle: Article | null) {
  if (view === "add" && editingArticle) {
    const status = articleStatus(editingArticle);
    if (status === "published") return "Editing a published article sends the updated version back to admin approval.";
    if (status === "pending") return "Update this pending article while it is waiting for admin approval.";
    return "Continue your draft, save it again, or submit it for approval.";
  }
  if (view === "add") return `Write as ${user.name}. Save a draft or submit your article for review.`;
  if (view === "pending") return "Articles waiting for admin approval. You can still edit or delete them.";
  if (view === "draft") return "Private drafts that only you can see. Continue writing whenever you are ready.";
  return "Approved articles that are live on the blog. Editing sends them back for approval.";
}

export function ArticlesPanel({ view, user, onNavigate }: {
  view: ArticleDashboardView;
  user: DashboardUser;
  onNavigate: (view: ArticleDashboardView) => void;
}) {
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<ArticleCategory[]>([]);
  const [form, setForm] = useState<ArticleForm>(emptyForm);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingSlug, setDeletingSlug] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [status, setStatus] = useState("");

  const publishedCount = useMemo(() => articles.filter((article) => articleStatus(article) === "published").length, [articles]);
  const pendingCount = useMemo(() => articles.filter((article) => articleStatus(article) === "pending").length, [articles]);
  const draftCount = useMemo(() => articles.filter((article) => articleStatus(article) === "draft").length, [articles]);
  const visibleArticles = useMemo(() => view === "add" ? [] : articles.filter((article) => articleStatus(article) === view), [articles, view]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const [nextCategories, nextArticles] = await Promise.all([getArticleCategories(), getMyArticles()]);
        if (!mounted) return;
        setCategories(nextCategories);
        setArticles(nextArticles);
        setForm((current) => ({ ...current, category: current.category || nextCategories[0]?.name || "Lifestyle" }));
      } catch {
        if (mounted) setStatus("Articles could not load right now.");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    void load();
    return () => { mounted = false; };
  }, []);

  async function refreshArticles() {
    setArticles(await getMyArticles());
  }

  function resetEditor(category = form.category || categories[0]?.name || "Lifestyle") {
    setEditingArticle(null);
    setForm({ ...emptyForm, category, kind: "normal" });
  }

  function startEditing(article: Article) {
    setEditingArticle(article);
    setForm(formFromArticle(article));
    setStatus("");
    onNavigate("add");
  }

  function cancelEditing() {
    resetEditor();
    setStatus("");
  }

  function articlePayload(nextStatus: "draft" | "pending"): ArticleSubmitPayload {
    return {
      title: form.title.trim(),
      category: form.category.trim() || categories[0]?.name || "Lifestyle",
      excerpt: form.excerpt.trim(),
      content: form.content.trim(),
      image: form.image.trim(),
      tags: parseTags(form.tags),
      featured: form.kind === "featured",
      status: nextStatus,
    };
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

  async function handleSaveDraft() {
    if (!form.title.trim()) {
      setStatus("Add a title before saving this draft.");
      return;
    }
    setSaving(true);
    setStatus("");
    try {
      const payload = articlePayload("draft");
      if (editingArticle) await updateMyArticle(editingArticle.slug, payload);
      else await submitArticle(payload);
      await refreshArticles();
      resetEditor(payload.category);
      setStatus("Draft saved. Only you can see it.");
      onNavigate("draft");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Draft was not saved.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      setStatus("Add a title and article content before sending it for approval.");
      return;
    }
    setSaving(true);
    setStatus("");
    try {
      const previousStatus = editingArticle ? articleStatus(editingArticle) : null;
      const payload = articlePayload("pending");
      if (editingArticle) await updateMyArticle(editingArticle.slug, payload);
      else await submitArticle(payload);
      await refreshArticles();
      resetEditor(payload.category);
      if (previousStatus === "published") setStatus("Changes sent for approval. The article will be published again after admin review.");
      else if (previousStatus === "pending") setStatus("Pending article updated and sent back to the review queue.");
      else if (previousStatus === "draft") setStatus("Draft sent to admin for approval.");
      else setStatus("Article sent to admin for approval.");
      onNavigate("pending");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Article was not submitted.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(article: Article) {
    if (!window.confirm(`Delete “${article.title}”? This cannot be undone.`)) return;
    setDeletingSlug(article.slug);
    setStatus("");
    try {
      await deleteMyArticle(article.slug);
      setArticles((current) => current.filter((item) => item.slug !== article.slug));
      if (editingArticle?.slug === article.slug) resetEditor();
      setStatus("Article deleted.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Article could not be deleted.");
    } finally {
      setDeletingSlug("");
    }
  }

  const articleTabs: Array<{ key: ArticleDashboardView; label: string; count?: number }> = [
    { key: "add", label: editingArticle ? "Edit Article" : "Add Article" },
    { key: "published", label: "Published", count: publishedCount },
    { key: "pending", label: "Pending", count: pendingCount },
    { key: "draft", label: "Drafts", count: draftCount },
  ];
  const editingStatus = editingArticle ? articleStatus(editingArticle) : null;
  const canSaveDraft = !editingArticle || editingStatus === "draft";
  const submitLabel = editingStatus === "published" ? "Submit changes for approval"
    : editingStatus === "pending" ? "Save pending changes"
      : editingStatus === "draft" ? "Submit draft for approval" : "Submit for approval";

  return (
    <section className={styles.tabsCard}>
      <div className={styles.tabsBar}>
        {articleTabs.map((tab) => (
          <button
            key={tab.key}
            className={`${styles.tab} ${view === tab.key ? styles.tabActive : ""}`}
            onClick={() => {
              if (tab.key === "add" && view === "add") cancelEditing();
              onNavigate(tab.key);
            }}
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
            <strong>{viewTitle(view, editingArticle)}</strong>
            <span className={styles.articleSubcopy}>{viewDescription(view, user, editingArticle)}</span>
          </div>
          {view === "add" && editingArticle ? (
            <button className={styles.articleCancelEdit} onClick={cancelEditing} type="button"><X size={15} /> Cancel edit</button>
          ) : null}
        </div>

        {status ? <div className={styles.articleNotice}>{status}</div> : null}

        {view === "add" ? (
          <form className={styles.articleComposer} onSubmit={handleSubmit}>
            <div className={styles.articleEditorCard}>
              <div className={styles.articleField}>
                <label>Title</label>
                <input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} placeholder="Give your article a clear headline" required />
              </div>
              <div className={styles.articleField}>
                <label>Content</label>
                <NewsEditor
                  value={form.content}
                  onChange={(content) => setForm((current) => ({ ...current, content }))}
                  onUploadImage={async (file) => (await uploadImage(file)).url}
                />
              </div>
              <div className={styles.articleField}>
                <label>Excerpt</label>
                <textarea value={form.excerpt} onChange={(event) => setForm((current) => ({ ...current, excerpt: event.target.value }))} placeholder="Short summary shown on the blog card" rows={4} />
              </div>
            </div>

            <aside className={styles.articleSideCard}>
              <div className={styles.articlePublishBox}>
                <h3>{editingArticle ? "Update article" : "Review queue"}</h3>
                <p>{editingStatus === "published" ? "Saving changes moves this live article back to Pending for admin review."
                  : editingStatus === "pending" ? "Your changes remain Pending until an admin approves the article."
                    : "Save privately as a draft or send this article to the admin dashboard as Pending."}</p>
                <div className={styles.articlePublishActions}>
                  {canSaveDraft ? (
                    <button className={styles.articleDraftButton} disabled={saving} onClick={handleSaveDraft} type="button">
                      <Save size={16} /> {saving ? "Saving..." : "Save draft"}
                    </button>
                  ) : null}
                  <button disabled={saving} type="submit"><Send size={16} /> {saving ? "Saving..." : submitLabel}</button>
                </div>
              </div>
              <div className={styles.articleField}>
                <label>Category</label>
                <select value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}>
                  {categories.map((category) => <option key={category.slug} value={category.name}>{category.name}</option>)}
                  {!categories.length ? <option value="Lifestyle">Lifestyle</option> : null}
                </select>
              </div>
              <div className={styles.articleField}>
                <label>Article type</label>
                <select value={form.kind} onChange={(event) => setForm((current) => ({ ...current, kind: event.target.value as "normal" | "featured" }))}>
                  <option value="normal">Normal article</option>
                  <option value="featured">Featured article</option>
                </select>
              </div>
              <div className={styles.articleField}>
                <label>Tags</label>
                <input value={form.tags} onChange={(event) => setForm((current) => ({ ...current, tags: event.target.value }))} placeholder="Culture, wellness, design" />
              </div>
              <div className={styles.articleImageBox}>
                <input ref={imageInputRef} accept="image/*" hidden onChange={handleImageUpload} type="file" />
                <button disabled={uploadingImage} onClick={() => imageInputRef.current?.click()} type="button">
                  <ImagePlus size={16} /> {uploadingImage ? "Uploading..." : "Upload cover image"}
                </button>
                <input value={form.image} onChange={(event) => setForm((current) => ({ ...current, image: event.target.value }))} placeholder="Or paste image URL" />
                {form.image ? <img src={form.image} alt="Article cover preview" /> : null}
              </div>
            </aside>
          </form>
        ) : (
          <div className={styles.articleListPanel}>
            {loading ? <div className={styles.friendsLoading}>Loading articles...</div> : null}
            {!loading && !visibleArticles.length ? (
              <div className={styles.friendsEmptyBox}>
                <div className={styles.friendsEmptyIcon}><FileText size={22} /></div>
                <span>No {view === "draft" ? "draft" : view} articles yet.</span>
                <button className={styles.articleEmptyAction} onClick={() => onNavigate("add")} type="button">Add Article</button>
              </div>
            ) : null}

            {visibleArticles.map((article) => {
              const itemStatus = articleStatus(article);
              return (
                <article className={styles.articleListItem} key={article._id ?? article.slug}>
                  {article.image ? <img className={styles.articleListImage} src={article.image} alt={article.title} />
                    : <div className={styles.articleListPlaceholder}><FileText size={24} /></div>}
                  <div className={styles.articleListBody}>
                    <h3>{article.title}</h3>
                    <div className={styles.articleListMeta}>
                      <span>{article.category}</span><span>{itemStatus}</span><span>{formatDate(article.publishedAt || article.submittedAt)}</span>
                    </div>
                    <p>{article.excerpt || "No excerpt added yet."}</p>
                    {article.tags?.length ? <div className={styles.articleTagRow}>{article.tags.slice(0, 4).map((tag) => <span key={tag}>{tag}</span>)}</div> : null}
                  </div>
                  <div className={styles.articleListActions}>
                    {itemStatus === "published" ? <Link className={styles.articleActionButton} href={`/blog/${article.slug}`}>View</Link>
                      : <span className={styles.articleStatusBadge}>{itemStatus === "pending" ? "Waiting approval" : "Private draft"}</span>}
                    <button className={styles.articleActionButton} onClick={() => startEditing(article)} type="button"><Pencil size={14} /> Edit</button>
                    <button
                      className={`${styles.articleActionButton} ${styles.articleDeleteButton}`}
                      disabled={deletingSlug === article.slug}
                      onClick={() => void handleDelete(article)}
                      type="button"
                    >
                      <Trash2 size={14} /> {deletingSlug === article.slug ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
