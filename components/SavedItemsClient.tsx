'use client';

import Link from 'next/link';
import { Heart, MessageCircle, Package, Trash2, UsersRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getFavorites, saveFavorite } from '@/lib/api';
import type { Activity, NewsCategory, Product } from '@/lib/types';

const PRODUCT_FAVORITES_KEY = 'asiance.favorite-products';
const CATEGORY_FAVORITES_KEY = 'asiance.favorite-news-categories';

const categoryFallbackImages: Record<string, string> = {
  beauty: '/assets/categories/beauty.png',
  fashion: '/assets/categories/fashion.png',
  dating: '/assets/categories/dating.png',
  weddings: '/assets/categories/weddings.png',
  baby: '/assets/categories/baby.png',
  kids: '/assets/categories/kids.png',
  travel: '/assets/categories/travel.png',
  home: '/assets/categories/home.png',
  food: '/assets/categories/food.png',
};

function readSlugs(key: string) {
  try {
    const value = JSON.parse(window.localStorage.getItem(key) ?? '[]');
    return new Set(Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []);
  } catch {
    window.localStorage.removeItem(key);
    return new Set<string>();
  }
}

function formatPrice(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value);
}

function formatDate(value?: string) {
  if (!value) return 'Recently saved';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
}

export function SavedItemsClient({
  products,
  categories,
}: {
  products: Product[];
  categories: NewsCategory[];
}) {
  const [savedProducts, setSavedProducts] = useState<Product[]>([]);
  const [savedCategories, setSavedCategories] = useState<NewsCategory[]>([]);
  const [savedActivities, setSavedActivities] = useState<Activity[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);

  useEffect(() => {
    const productSlugs = readSlugs(PRODUCT_FAVORITES_KEY);
    const categorySlugs = readSlugs(CATEGORY_FAVORITES_KEY);

    setSavedProducts(products.filter((product) => productSlugs.has(product.slug)));
    setSavedCategories(categories.filter((category) => categorySlugs.has(category.slug)));

    void getFavorites()
      .then(setSavedActivities)
      .catch(() => setSavedActivities([]))
      .finally(() => setActivitiesLoading(false));
  }, [categories, products]);

  function removeProduct(slug: string) {
    setSavedProducts((current) => {
      const next = current.filter((product) => product.slug !== slug);
      const savedSlugs = readSlugs(PRODUCT_FAVORITES_KEY);
      savedSlugs.delete(slug);
      window.localStorage.setItem(PRODUCT_FAVORITES_KEY, JSON.stringify([...savedSlugs]));
      return next;
    });
  }

  function removeCategory(slug: string) {
    setSavedCategories((current) => {
      const next = current.filter((category) => category.slug !== slug);
      const savedSlugs = readSlugs(CATEGORY_FAVORITES_KEY);
      savedSlugs.delete(slug);
      window.localStorage.setItem(CATEGORY_FAVORITES_KEY, JSON.stringify([...savedSlugs]));
      return next;
    });
  }

  async function removeActivity(activityId?: string) {
    if (!activityId) return;

    try {
      const result = await saveFavorite(activityId);
      if (!result.saved) {
        setSavedActivities((current) => current.filter((activity) => activity._id !== activityId));
      }
    } catch {
      // Keep the item visible when the server could not update it.
    }
  }

  return (
    <div className="saved-page">
      <header className="saved-page__heading">
        <span className="eyebrow">Your collection</span>
        <h1>Saved</h1>
        <p>Products, communities, and conversations you want to revisit.</p>
      </header>

      <section className="saved-section" aria-labelledby="saved-products-title">
        <div className="saved-section__heading">
          <div>
            <Package size={21} aria-hidden="true" />
            <h2 id="saved-products-title">Products</h2>
          </div>
          <span>{savedProducts.length}</span>
        </div>
        {savedProducts.length ? (
          <div className="saved-products-grid">
            {savedProducts.map((product) => (
              <article className="saved-product-card" key={product.slug}>
                <Link href={`/shop/${product.slug}`} className="saved-product-card__image">
                  <img src={product.image} alt={product.name} />
                </Link>
                <div className="saved-product-card__details">
                  <span>{product.category}</span>
                  <Link href={`/shop/${product.slug}`}>{product.name}</Link>
                  <strong>{formatPrice(product.salePrice ?? product.price)}</strong>
                </div>
                <button
                  type="button"
                  className="saved-remove"
                  onClick={() => removeProduct(product.slug)}
                  aria-label={`Remove ${product.name} from saved products`}
                  title="Remove from saved"
                >
                  <Trash2 size={17} aria-hidden="true" />
                </button>
              </article>
            ))}
          </div>
        ) : (
          <div className="saved-empty">
            <Heart size={22} aria-hidden="true" />
            <p>No saved products yet.</p>
            <Link href="/shop">Explore the shop</Link>
          </div>
        )}
      </section>

      <section className="saved-section" aria-labelledby="saved-communities-title">
        <div className="saved-section__heading">
          <div>
            <UsersRound size={21} aria-hidden="true" />
            <h2 id="saved-communities-title">Communities</h2>
          </div>
          <span>{savedCategories.length}</span>
        </div>
        {savedCategories.length ? (
          <div className="saved-community-grid">
            {savedCategories.map((category) => {
              const fallbackImage = categoryFallbackImages[category.slug] ?? categoryFallbackImages.beauty;

              return (
                <article className="saved-community-card" key={category.slug}>
                  <Link href={`/community-news?category=${encodeURIComponent(category.slug)}`}>
                    <img
                      src={category.image || fallbackImage}
                      alt=""
                      onError={(event) => {
                        if (!event.currentTarget.src.endsWith(fallbackImage)) {
                          event.currentTarget.src = fallbackImage;
                        }
                      }}
                    />
                    <strong>{category.name}</strong>
                  </Link>
                  <button
                    type="button"
                    className="saved-remove"
                    onClick={() => removeCategory(category.slug)}
                    aria-label={`Remove ${category.name} from saved communities`}
                    title="Remove from saved"
                  >
                    <Trash2 size={17} aria-hidden="true" />
                  </button>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="saved-empty">
            <Heart size={22} aria-hidden="true" />
            <p>No saved communities yet.</p>
            <Link href="/community-news">Explore communities</Link>
          </div>
        )}
      </section>

      <section className="saved-section" aria-labelledby="saved-conversations-title">
        <div className="saved-section__heading">
          <div>
            <MessageCircle size={21} aria-hidden="true" />
            <h2 id="saved-conversations-title">Conversations</h2>
          </div>
          <span>{savedActivities.length}</span>
        </div>
        {activitiesLoading ? (
          <div className="loader-inline">
            <span className="loader-spinner" aria-hidden="true" />
            Loading saved conversations
          </div>
        ) : savedActivities.length ? (
          <div className="saved-activity-list">
            {savedActivities.map((activity, index) => {
              const image = activity.media?.find((item) => item.type === 'image')?.url;
              const activityHref = activity._id ? `/activity/${activity._id}` : '/activity';

              return (
                <article className="saved-activity-card" key={activity._id ?? `${activity.actorHandle}-${index}`}>
                  {image ? (
                    <Link href={activityHref} className="saved-activity-card__image">
                      <img src={image} alt="" />
                    </Link>
                  ) : null}
                  <div className="saved-activity-card__content">
                    <span>{activity.actorName} · {formatDate(activity.createdAt)}</span>
                    <Link href={activityHref}>{activity.text}</Link>
                    <p>{activity.targetName}</p>
                  </div>
                  <button
                    type="button"
                    className="saved-remove"
                    onClick={() => void removeActivity(activity._id)}
                    aria-label={`Remove conversation by ${activity.actorName} from saved`}
                    title="Remove from saved"
                  >
                    <Trash2 size={17} aria-hidden="true" />
                  </button>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="saved-empty">
            <Heart size={22} aria-hidden="true" />
            <p>No saved conversations yet.</p>
            <Link href="/activity">Browse activity</Link>
          </div>
        )}
      </section>
    </div>
  );
}
