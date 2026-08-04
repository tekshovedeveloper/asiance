import Link from 'next/link';
import type { Article } from '@/lib/types';
import { cloudinaryImageUrl } from '@/lib/cloudinary';

export function ArticleCard({ article, large = false }: { article: Article; large?: boolean }) {
  return (
    <article className={`story-card ${large ? 'story-card-large' : ''}`}>
      <Link href={`/blog/${article.slug}`} className="story-image">
        <img src={cloudinaryImageUrl(article.image, large ? 1400 : 900)} alt={article.title} />
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
