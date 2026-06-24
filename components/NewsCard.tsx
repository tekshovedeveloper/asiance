import Link from 'next/link';
import type { NewsItem } from '@/lib/types';

function formatNewsDate(value?: string) {
  if (!value) return 'Latest';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Latest';
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(date);
}

export function newsMeta(item: NewsItem) {
  return [formatNewsDate(item.publishedAt), item.sourceName].filter(Boolean).join(' / ');
}

export function NewsCard({ item, hero = false }: { item: NewsItem; hero?: boolean }) {
  return (
    <article className={`editorial-news-card ${hero ? 'editorial-news-card-hero' : ''}`}>
      <Link href={`/community-news/${item.slug}`} className="editorial-news-image">
        {item.image ? <img src={item.image} alt={item.title} /> : null}
      </Link>
      <div className="editorial-news-body">
        <div className="editorial-news-topline">
          <span>{item.categoryName}</span>
          {item.breaking ? <strong>Breaking</strong> : null}
        </div>
        <h3>
          <Link href={`/community-news/${item.slug}`}>{item.title}</Link>
        </h3>
        {hero ? <p>{item.excerpt}</p> : null}
        <div className="editorial-news-meta">{newsMeta(item)}</div>
      </div>
    </article>
  );
}
