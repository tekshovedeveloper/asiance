import Link from 'next/link';
import { Clock, Facebook, Instagram, Mail, Music2, ShoppingBag, UserRound, Youtube } from 'lucide-react';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import { getArticle, getArticles, getProducts } from '@/lib/api';
import { articles as fallbackArticles } from '@/lib/mock-data';
import type { Article, Product } from '@/lib/types';

type TocItem = {
  id: string;
  level: number;
  title: string;
};

const followLinks = [
  { label: 'Instagram', href: 'https://www.instagram.com/', icon: Instagram },
  { label: 'TikTok', href: 'https://www.tiktok.com/', icon: Music2 },
  { label: 'YouTube', href: 'https://www.youtube.com/', icon: Youtube },
  { label: 'Facebook', href: 'https://www.facebook.com/', icon: Facebook },
  { label: 'Email', href: 'mailto:support@asiance.co', icon: Mail },
];

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function decodeBasicHtml(value: string) {
  return value
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&');
}

function textToParagraphHtml(value: string) {
  return value
    .trim()
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${escapeHtml(paragraph.trim())}</p>`)
    .join('');
}

function stripHtml(value: string) {
  return decodeBasicHtml(value.replace(/<[^>]+>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim();
}

function makeAnchor(value: string, index: number) {
  const base = value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return base || `section-${index + 1}`;
}

function buildTableOfContents(html: string) {
  const counts = new Map<string, number>();

  return Array.from(html.matchAll(/<h([2-3])([^>]*)>([\s\S]*?)<\/h\1>/gi)).map((match, index) => {
    const title = stripHtml(match[3]) || `Section ${index + 1}`;
    const base = makeAnchor(title, index);
    const count = counts.get(base) ?? 0;
    counts.set(base, count + 1);

    return {
      id: count ? `${base}-${count + 1}` : base,
      level: Number(match[1]),
      title,
    };
  });
}

function applyHeadingAnchors(html: string, toc: TocItem[]) {
  let headingIndex = 0;

  return html.replace(/<h([2-3])([^>]*)>([\s\S]*?)<\/h\1>/gi, (full, level, attrs, content) => {
    const item = toc[headingIndex];
    headingIndex += 1;
    if (!item) return full;

    const nextAttrs = String(attrs).replace(/\s+id=(["']).*?\1/i, '');
    return `<h${level}${nextAttrs} id="${item.id}">${content}</h${level}>`;
  });
}

function readingMinutes(contentHtml: string) {
  const wordCount = stripHtml(contentHtml).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / 220));
}

function formatArticleDate(value?: string) {
  if (!value) return 'Published';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Published';

  return new Intl.DateTimeFormat('en', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

function uniqueArticles(items: Article[]) {
  const seen = new Set<string>();

  return items.filter((item) => {
    if (seen.has(item.slug)) return false;
    seen.add(item.slug);
    return true;
  });
}

function normalizeArticleCategory(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function articlesShareCategory(left: Article, right: Article) {
  const leftCategory = normalizeArticleCategory(left.category);
  const rightCategory = normalizeArticleCategory(right.category);

  return leftCategory === rightCategory || leftCategory.includes(rightCategory) || rightCategory.includes(leftCategory);
}

function pickRelatedArticles(article: Article, sameCategory: Article[], allArticles: Article[]) {
  const sameSourceCategoryArticles = uniqueArticles([
    ...sameCategory,
    ...allArticles.filter((item) => articlesShareCategory(item, article)),
  ]);
  return sameSourceCategoryArticles.filter((item) => item.slug !== article.slug).slice(0, 3);
}

function productMatchesArticle(product: Product, article: Article) {
  const articleCategory = article.category.toLowerCase();
  const productCategory = `${product.category} ${product.categorySlug ?? ''}`.toLowerCase();
  const articleTags = (article.tags ?? []).join(' ').toLowerCase();
  const lookup = `${articleCategory} ${articleTags}`;

  if (lookup.includes('beauty') && productCategory.includes('beauty')) return true;
  if (lookup.includes('fashion') && (productCategory.includes('fashion') || productCategory.includes('essentials'))) {
    return true;
  }
  if (lookup.includes('wedding') && productCategory.includes('wedding')) return true;
  if (lookup.includes('baby') || lookup.includes('family')) {
    return productCategory.includes('baby') || productCategory.includes('kids') || productCategory.includes('home');
  }
  if (lookup.includes('travel') && productCategory.includes('travel')) return true;

  return false;
}

function pickShopProducts(article: Article, products: Product[]) {
  return [
    ...products.filter((product) => productMatchesArticle(product, article)),
    ...products,
  ]
    .filter((product, index, list) => list.findIndex((item) => item.slug === product.slug) === index)
    .slice(0, 6);
}

function accidentalCodeBlockToHtml(value: string) {
  const text = decodeBasicHtml(value)
    .replace(/<\/p>\s*<p>/gi, '\n\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/?(p|pre|code)>/gi, '')
    .replace(/<[^>]+>/g, '');

  return textToParagraphHtml(text);
}

function articleContentHtml(content: string) {
  const trimmed = content.trim();
  if (!trimmed) return '';

  const hasHtml = /<\/?[a-z][\s\S]*>/i.test(trimmed);
  if (hasHtml) {
    const html = trimmed
      .replace(/<p>\s*<\/p>/gi, '')
      .replace(/<\/code><\/pre>\s*<pre><code>/gi, '\n\n');
    const accidentalCodeBlock = html.match(/^<pre><code>([\s\S]*)<\/code><\/pre>$/i);

    if (accidentalCodeBlock) {
      return accidentalCodeBlockToHtml(accidentalCodeBlock[1]);
    }

    return html;
  }

  return textToParagraphHtml(trimmed);
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticle(slug);
  const [sameCategoryArticles, allArticles, products] = await Promise.all([
    getArticles(article.category),
    getArticles(),
    getProducts(),
  ]);
  const contentHtml = articleContentHtml(article.content || '');
  const tocItems = buildTableOfContents(contentHtml);
  const contentWithAnchors = applyHeadingAnchors(contentHtml, tocItems);
  const tableOfContents = tocItems.length ? tocItems : [{ id: 'article-story', level: 2, title: 'Story' }];
  const currentArticleExistsInFetchedList = allArticles.some((item) => item.slug === article.slug);
  const relatedSource = currentArticleExistsInFetchedList ? allArticles : fallbackArticles;
  const relatedCategorySource = currentArticleExistsInFetchedList
    ? sameCategoryArticles
    : fallbackArticles.filter((item) => articlesShareCategory(item, article));
  const relatedArticles = pickRelatedArticles(article, relatedCategorySource, relatedSource);
  const shopProducts = pickShopProducts(article, products);
  const minutes = readingMinutes(contentHtml);

  return (
    <main>
      <SiteHeader active="Blog" />
      <section className="blog-detail-shell">
        <div className="blog-detail-grid">
          <article className="blog-detail-main">
            <header className="blog-detail-hero">
              <Link className="blog-back-link" href={`/blog?category=${encodeURIComponent(article.category)}`}>
                Back to {article.category}
              </Link>
              <span className="eyebrow">{article.category}</span>
              <h1 className="article-title">{article.title}</h1>
              {article.excerpt ? <p className="page-copy-article">{article.excerpt}</p> : null}
              <div className="blog-detail-meta">
                <span>
                  <UserRound size={15} aria-hidden="true" />
                  {article.authorName || 'Asiance Editors'}
                </span>
                <span>{formatArticleDate(article.publishedAt)}</span>
                <span>
                  <Clock size={15} aria-hidden="true" />
                  {minutes} min read
                </span>
              </div>
            </header>

            {article.image ? (
              <figure className="blog-detail-featured">
                <img src={article.image} alt={article.title} />
                <figcaption>{article.title}</figcaption>
              </figure>
            ) : null}
          </article>

          <aside className="blog-detail-sidebar" aria-label="Article sidebar">
            <section className="blog-toc-panel" aria-labelledby="blog-toc-title">
              <h2 id="blog-toc-title">Table of Contents</h2>
              <ol>
                {tableOfContents.map((item, index) => (
                  <li className={item.level === 3 ? 'is-subsection' : undefined} key={item.id}>
                    <a href={`#${item.id}`}>
                      <span>{String(index + 1).padStart(2, '0')}</span>
                      {item.title}
                    </a>
                  </li>
                ))}
              </ol>
            </section>

            {relatedArticles.length ? (
              <section className="blog-sidebar-section" aria-labelledby="related-stories-title">
                <h2 id="related-stories-title">Related Stories</h2>
                <div className="blog-related-list">
                  {relatedArticles.map((item) => (
                    <Link className="blog-related-item" href={`/blog/${item.slug}`} key={item.slug}>
                      {item.image ? <img src={item.image} alt="" /> : null}
                      <span>
                        <small>{item.category}</small>
                        <strong>{item.title}</strong>
                        <em>Read more</em>
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            ) : null}

            {shopProducts.length ? (
              <section className="blog-sidebar-section" aria-labelledby="shop-the-look-title">
                <div className="blog-sidebar-heading-row">
                  <h2 id="shop-the-look-title">Shop the Look</h2>
                  <Link href="/shop" aria-label="Shop all products">
                    <ShoppingBag size={16} aria-hidden="true" />
                  </Link>
                </div>
                <div className="blog-shop-grid">
                  {shopProducts.map((product) => (
                    <Link className="blog-shop-item" href={`/shop/${product.slug}`} key={product.slug}>
                      <span className="blog-shop-image">
                        <img src={product.image} alt={product.name} />
                      </span>
                      <strong>{product.name}</strong>
                      <span>${product.salePrice ?? product.price}</span>
                    </Link>
                  ))}
                </div>
              </section>
            ) : null}

            <section className="blog-sidebar-section" aria-labelledby="follow-asiance-title">
              <h2 id="follow-asiance-title">Follow Asiance</h2>
              <div className="blog-follow-links">
                {followLinks.map((item) => {
                  const Icon = item.icon;
                  const isMail = item.href.startsWith('mailto:');

                  return (
                    <a
                      href={item.href}
                      aria-label={item.label}
                      key={item.label}
                      rel={isMail ? undefined : 'noreferrer'}
                      target={isMail ? undefined : '_blank'}
                      title={item.label}
                    >
                      <Icon size={18} aria-hidden="true" />
                    </a>
                  );
                })}
              </div>
            </section>
          </aside>

          <article className="article-body ql-editor blog-detail-content" id="article-story">
            {contentWithAnchors ? <div dangerouslySetInnerHTML={{ __html: contentWithAnchors }} /> : null}
          </article>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
