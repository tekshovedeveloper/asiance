import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { NewsCard } from '@/components/NewsCard';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import { getNews, getNewsItem } from '@/lib/api';

export default async function NewsDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = await getNewsItem(slug);
  const related = (await getNews({ category: item.categorySlug, limit: 4 })).filter(
    (newsItem) => newsItem.slug !== item.slug,
  );

  return (
    <main>
      <SiteHeader active="Community News" />
      <section className="article-hero news-article-hero">
        <span className="eyebrow">{item.categoryName}</span>
        {item.breaking ? <span className="news-breaking-inline">Breaking</span> : null}
        <h1 className="article-title">{item.title}</h1>
        <p className="page-copy" style={{ marginLeft: 'auto', marginRight: 'auto' }}>
          {item.excerpt}
        </p>
        {item.sourceUrl ? (
          <a className="news-source-link" href={item.sourceUrl} target="_blank" rel="noreferrer">
            <ExternalLink size={14} />
            {item.sourceName || 'Source'}
          </a>
        ) : item.sourceName ? (
          <div className="news-source-link">{item.sourceName}</div>
        ) : null}
      </section>
      {item.image ? <img className="article-image" src={item.image} alt={item.title} /> : null}
      <article className="article-body ql-editor" dangerouslySetInnerHTML={{ __html: item.content || '' }} />
      {related.length ? (
        <section className="section news-related-section">
          <div className="section-head">
            <div>
              <span className="eyebrow">more in {item.categoryName}</span>
              <h2>Keep reading.</h2>
            </div>
            <Link href={`/community-news?category=${item.categorySlug}`} className="text-link">
              Category
            </Link>
          </div>
          <div className="news-archive-grid">
            {related.map((newsItem) => (
              <NewsCard item={newsItem} key={newsItem.slug} />
            ))}
          </div>
        </section>
      ) : null}
      <SiteFooter />
    </main>
  );
}
