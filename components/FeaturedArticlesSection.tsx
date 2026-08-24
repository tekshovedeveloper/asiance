import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { Article } from '@/lib/types';
import { cloudinaryImageUrl } from '@/lib/cloudinary';

type FeaturedArticlesSectionProps = {
  articles: Article[];
  title?: string;
  href?: string;
  linkLabel?: string;
};

export function FeaturedArticlesSection({
  articles,
  title = 'Featured articles',
  href = '/blog',
  linkLabel = 'View all articles',
}: FeaturedArticlesSectionProps) {
  const featuredArticles = articles.slice(0, 4);

  if (!featuredArticles.length) return null;

  return (
    <section className="featured-articles-section" aria-labelledby="featured-articles-title">
      <div className="featured-articles-section__heading">
        <h2 id="featured-articles-title">{title}</h2>
        <Link href={href} className="featured-articles-section__all">
          {linkLabel}
          <ArrowRight size={17} aria-hidden="true" />
        </Link>
      </div>

      <div className="featured-articles-list">
        {featuredArticles.map((article) => (
          <article className="featured-article-card" key={article.slug}>
            <Link href={`/blog/${article.slug}`} className="featured-article-card__link">
              <img src={cloudinaryImageUrl(article.image, 900)} alt="" />
              <span className="featured-article-card__scrim" aria-hidden="true" />
              <div className="featured-article-card__content">
                <span>{article.category}</span>
                <h3>{article.title}</h3>
                <p>by {article.authorName}</p>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
