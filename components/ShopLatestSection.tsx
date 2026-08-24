'use client';

import Link from 'next/link';
import { ArrowRight, Heart } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Product } from '@/lib/types';

const FAVORITES_KEY = 'asiance.favorite-products';

function formatPrice(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value);
}

type ShopLatestSectionProps = {
  products: Product[];
  title?: string;
  href?: string;
  linkLabel?: string;
};

export function ShopLatestSection({
  products,
  title = 'Shop the latest',
  href = '/shop?sort=latest',
  linkLabel = 'View all products',
}: ShopLatestSectionProps) {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

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

  function toggleFavorite(slug: string) {
    setFavorites((current) => {
      const next = new Set(current);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      window.localStorage.setItem(FAVORITES_KEY, JSON.stringify([...next]));
      return next;
    });
  }

  if (!products.length) return null;

  return (
    <section className="shop-latest-section" aria-labelledby="shop-latest-title">
      <div className="shop-latest-section__heading">
        <h2 id="shop-latest-title">{title}</h2>
        <Link href={href} className="shop-latest-section__all">
          {linkLabel}
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>

      <div className="shop-latest-list">
        {products.slice(0, 7).map((product) => {
          const isFavorite = favorites.has(product.slug);
          const price = product.salePrice ?? product.price;

          return (
            <article className="shop-latest-card" key={product.slug}>
              <div className="shop-latest-card__media">
                <Link
                  href={`/shop/${product.slug}`}
                  className="shop-latest-card__image"
                  aria-label={`View ${product.name}`}
                >
                  <img src={product.image} alt={product.name} />
                </Link>
                <button
                  type="button"
                  className={`shop-latest-card__favorite${isFavorite ? ' is-favorite' : ''}`}
                  onClick={() => toggleFavorite(product.slug)}
                  aria-label={`${isFavorite ? 'Remove' : 'Add'} ${product.name} ${
                    isFavorite ? 'from' : 'to'
                  } favorites`}
                  aria-pressed={isFavorite}
                  title={`${isFavorite ? 'Remove from' : 'Add to'} favorites`}
                >
                  <Heart size={18} aria-hidden="true" />
                </button>
              </div>

              <Link href={`/shop/${product.slug}`} className="shop-latest-card__details">
                <span>{product.category}</span>
                <strong>{product.name}</strong>
                <p>
                  {product.salePrice !== undefined ? (
                    <del>{formatPrice(product.price)}</del>
                  ) : null}
                  {formatPrice(price)}
                </p>
              </Link>
            </article>
          );
        })}
      </div>
    </section>
  );
}
