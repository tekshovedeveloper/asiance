import Link from 'next/link';
import type { Article } from '@/lib/types';

export function ArticleCard({ article, large = false }: { article: Article; large?: boolean }) {
  return (
    <article className={`story-card ${large ? 'story-card-large' : ''}`}>
      <Link href={`/blog/${article.slug}`} className="story-image">
        <img src={article.image} alt={article.title} />
      </Link>
      <div className="story-body">
        <span className="eyebrow">{article.category}</span>
        <h3>{article.title}</h3>
        <p>{article.excerpt}</p>
        <Link href={`/blog/${article.slug}`} className="text-link">
          Read now
        </Link>
      </div>
    </article>
  );
}
