'use client';

import Link from 'next/link';
import { ArrowRight, Heart } from 'lucide-react';
import { useEffect, useState, type MouseEvent } from 'react';
import type { NewsCategory } from '@/lib/types';

const FAVORITES_KEY = 'asiance.favorite-news-categories';
const CATEGORY_API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';
const legacyCategorySlugs = new Set([
  'news',
  'entertainment',
  'fashion-beauty',
  'sex-health',
  'lifestyle',
  'tech',
]);

const categoryFallbackImages: Record<string, string> = {
  beauty: 'https://res.cloudinary.com/ux81wsbq/image/upload/v1786640141/asiance/site-assets/categories/beauty-png.png',
  fashion: 'https://res.cloudinary.com/ux81wsbq/image/upload/v1786640141/asiance/site-assets/categories/fashion-png.png',
  dating: 'https://res.cloudinary.com/ux81wsbq/image/upload/v1786640142/asiance/site-assets/categories/dating-png.png',
  weddings: 'https://res.cloudinary.com/ux81wsbq/image/upload/v1786640148/asiance/site-assets/categories/weddings-png.png',
  baby: 'https://res.cloudinary.com/ux81wsbq/image/upload/v1786640139/asiance/site-assets/categories/baby-png.png',
  kids: 'https://res.cloudinary.com/ux81wsbq/image/upload/v1786640145/asiance/site-assets/categories/kids-png.png',
  travel: 'https://res.cloudinary.com/ux81wsbq/image/upload/v1786640145/asiance/site-assets/categories/travel-png.png',
  home: 'https://res.cloudinary.com/ux81wsbq/image/upload/v1786640146/asiance/site-assets/categories/home-png.png',
  food: 'https://res.cloudinary.com/ux81wsbq/image/upload/v1786640143/asiance/site-assets/categories/food-png.png',
};

type CommunityCategoryStripProps = {
  categories: NewsCategory[];
};

function visibleCategories(categories: NewsCategory[]) {
  return categories
    .filter((category) => !legacyCategorySlugs.has(category.slug))
    .sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999) || a.name.localeCompare(b.name))
    .slice(0, 9);
}

export function CommunityCategoryStrip({ categories }: CommunityCategoryStripProps) {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [displayCategories, setDisplayCategories] = useState(() => visibleCategories(categories));

  useEffect(() => {
    const controller = new AbortController();

    void fetch(`${CATEGORY_API_URL}/news/categories`, {
      cache: 'no-store',
      signal: controller.signal,
    })
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error('Category request failed'))))
      .then((data: NewsCategory[]) => setDisplayCategories(visibleCategories(data)))
      .catch(() => undefined);

    return () => controller.abort();
  }, []);

  useEffect(() => {
    try {
      const stored = JSON.parse(window.localStorage.getItem(FAVORITES_KEY) ?? '[]');
      if (Array.isArray(stored)) {
        setFavorites(new Set(stored.filter((value): value is string => typeof value === 'string')));
      }
    } catch {
      window.localStorage.removeItem(FAVORITES_KEY);
    }
  }, []);

  function toggleFavorite(event: MouseEvent<HTMLButtonElement>, slug: string) {
    event.preventDefault();
    event.stopPropagation();

    setFavorites((current) => {
      const next = new Set(current);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      window.localStorage.setItem(FAVORITES_KEY, JSON.stringify([...next]));
      return next;
    });
  }

  return (
    <section className="community-category-section" aria-labelledby="community-category-title">
      <div className="community-category-section__heading">
        <h2 id="community-category-title">Explore our News communities</h2>
        <Link href="/community-news" className="community-category-section__all">
          View all communities
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>

      <div className="community-category-list">
        {displayCategories.map((category) => {
          const isFavorite = favorites.has(category.slug);
          const fallbackImage = categoryFallbackImages[category.slug] ?? categoryFallbackImages.beauty;

          return (
            <article className="community-category-item" key={category.slug}>
              <Link
                href={`/community-news?category=${encodeURIComponent(category.slug)}`}
                className="community-category-item__link"
              >
                <span className="community-category-item__image">
                  <img
                    src={category.image || fallbackImage}
                    alt=""
                    onError={(event) => {
                      if (!event.currentTarget.src.endsWith(fallbackImage)) {
                        event.currentTarget.src = fallbackImage;
                      }
                    }}
                  />
                </span>
                <strong>{category.name}</strong>
              </Link>
              <button
                type="button"
                className={`community-category-item__favorite${isFavorite ? ' is-favorite' : ''}`}
                onClick={(event) => toggleFavorite(event, category.slug)}
                aria-label={`${isFavorite ? 'Remove' : 'Add'} ${category.name} ${
                  isFavorite ? 'from' : 'to'
                } favorites`}
                aria-pressed={isFavorite}
                title={`${isFavorite ? 'Remove from' : 'Add to'} favorites`}
              >
                <Heart size={18} aria-hidden="true" />
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
