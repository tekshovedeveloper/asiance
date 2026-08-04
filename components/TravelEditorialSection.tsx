import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { Article } from '@/lib/types';
import { cloudinaryImageUrl } from '@/lib/cloudinary';

type TravelEditorialSectionProps = {
  featuredArticle?: Article;
  editorsPicks: Article[];
  inspiration: Article[];
};

function featuredTitle(title: string) {
  const [place, ...rest] = title.split(':');
  return {
    place: place.trim(),
    subtitle: rest.join(':').trim() || title,
  };
}

function articleLabel(article: Article, fallback: string) {
  return article.tags?.find(Boolean) || fallback;
}

export function TravelEditorialSection({
  featuredArticle,
  editorsPicks,
  inspiration,
}: TravelEditorialSectionProps) {
  if (!featuredArticle) return null;

  const title = featuredTitle(featuredArticle.title);

  return (
    <section className="travel-editorial" aria-label="Travel articles">
      <div className="travel-editorial__featured">
        <h2>Featured Destination</h2>
        <Link href={`/blog/${featuredArticle.slug}`} className="travel-featured-card">
          <img src={cloudinaryImageUrl(featuredArticle.image, 1200)} alt="" />
          <span className="travel-featured-card__scrim" aria-hidden="true" />
          <div className="travel-featured-card__content">
            <span className="travel-featured-card__place">{title.place}</span>
            <h3>{title.subtitle}</h3>
            <p>{featuredArticle.excerpt}</p>
            <span className="travel-featured-card__button">Explore {title.place}</span>
          </div>
        </Link>
      </div>

      <div className="travel-editorial__picks">
        <h2>Editor&apos;s Picks</h2>
        <div className="travel-picks-grid">
          {editorsPicks.map((article) => (
            <article className="travel-pick-card" key={article.slug}>
              <Link href={`/blog/${article.slug}`} className="travel-pick-card__image">
                <img src={cloudinaryImageUrl(article.image, 720)} alt="" />
                <span>{articleLabel(article, 'Travel Guide')}</span>
              </Link>
              <h3>
                <Link href={`/blog/${article.slug}`}>{article.title}</Link>
              </h3>
              <p>{article.excerpt}</p>
            </article>
          ))}
        </div>
      </div>

      <aside className="travel-inspiration" aria-labelledby="travel-inspiration-title">
        <h2 id="travel-inspiration-title">Travel Inspiration</h2>
        <div className="travel-inspiration__list">
          {inspiration.map((article) => (
            <Link href={`/blog/${article.slug}`} className="travel-inspiration__item" key={article.slug}>
              <img src={cloudinaryImageUrl(article.image, 360)} alt="" />
              <span>
                <strong>{article.title}</strong>
                <small>{articleLabel(article, 'Travel')}</small>
              </span>
            </Link>
          ))}
        </div>
        <Link href="/blog?category=travel" className="travel-inspiration__all">
          View all articles
          <ArrowRight size={17} aria-hidden="true" />
        </Link>
      </aside>
    </section>
  );
}
