'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import type { Article } from '@/lib/types';
import { cloudinaryImageUrl } from '@/lib/cloudinary';

type FeaturedArticlesSectionProps = {
  articles: Article[];
  title?: string;
  href?: string;
  linkLabel?: string;
  autoRotate?: boolean;
  rotationIntervalMs?: number;
  sectionKey?: string;
};

export function FeaturedArticlesSection({
  articles,
  title = 'Featured articles',
  href = '/blog',
  linkLabel = 'View all articles',
  autoRotate = false,
  rotationIntervalMs = 6000,
  sectionKey = 'featured',
}: FeaturedArticlesSectionProps) {
  const railRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const goToArticle = useCallback((index: number) => {
    const rail = railRef.current;
    if (!rail || !articles.length) return;
    const nextIndex = Math.max(0, Math.min(index, articles.length - 1));
    const maxScroll = Math.max(0, rail.scrollWidth - rail.clientWidth);
    const left = articles.length > 1 ? (nextIndex / (articles.length - 1)) * maxScroll : 0;
    setActiveIndex(nextIndex);
    rail.scrollTo({ left, behavior: 'smooth' });
  }, [articles.length]);

  useEffect(() => {
    setActiveIndex((current) => Math.min(current, Math.max(0, articles.length - 1)));
  }, [articles.length]);

  useEffect(() => {
    if (!autoRotate || articles.length < 2) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const timer = window.setInterval(() => {
      goToArticle((activeIndex + 1) % articles.length);
    }, Math.max(3000, rotationIntervalMs));
    return () => window.clearInterval(timer);
  }, [activeIndex, articles.length, autoRotate, goToArticle, rotationIntervalMs]);

  function handleScroll() {
    const rail = railRef.current;
    if (!rail || articles.length < 2) return;
    const maxScroll = Math.max(0, rail.scrollWidth - rail.clientWidth);
    if (maxScroll < 2) return;
    const nextIndex = Math.round((rail.scrollLeft / maxScroll) * (articles.length - 1));
    setActiveIndex(Math.max(0, Math.min(nextIndex, articles.length - 1)));
  }

  if (!articles.length) return null;

  const headingId = `${sectionKey}-featured-articles-title`;

  return (
    <section className="featured-articles-section" aria-labelledby={headingId}>
      <div className="featured-articles-section__heading">
        <h2 id={headingId}>{title}</h2>
        <div className="featured-articles-section__actions">
          <Link href={href} className="featured-articles-section__all">
            {linkLabel}
            <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </div>
      </div>

      <div className="featured-articles-list" ref={railRef} onScroll={handleScroll}>
        {articles.map((article) => (
          <article className="featured-article-card" key={article.slug}>
            <Link href={`/blog/${article.slug}`} className="featured-article-card__link">
              <img src={cloudinaryImageUrl(article.image, 900)} alt="" />
              <span className="featured-article-card__scrim" aria-hidden="true" />
              <div className="featured-article-card__content">
                <span>{article.category}</span>
                <h3>{article.title}</h3>
                <p>by {article.authorName || 'admin'}</p>
              </div>
            </Link>
          </article>
        ))}
      </div>

      <div className="featured-articles-dots" aria-label={`${title} slides`}>
        {articles.map((article, index) => (
          <button
            className={index === activeIndex ? 'active' : ''}
            type="button"
            onClick={() => goToArticle(index)}
            aria-label={`Show ${article.title}`}
            aria-current={index === activeIndex ? 'true' : undefined}
            key={article.slug}
          />
        ))}
      </div>
    </section>
  );
}
