import Link from 'next/link';
import { NewsCard } from '@/components/NewsCard';
import { NewsStoriesSlider } from '@/components/NewsStoriesSlider';
import type { NewsCategory, NewsItem } from '@/lib/types';

export function NewsBbcSection({
  items,
  categories,
  title = 'What is moving the circle this week.',
  eyebrow = 'community news',
}: {
  items: NewsItem[];
  categories: NewsCategory[];
  title?: string;
  eyebrow?: string;
}) {
  if (!items.length) return null;

  const hero = items.find((item) => item.featured) ?? items[0];
  const sideItems = items.filter((item) => item.slug !== hero.slug).slice(0, 4);
  const tickerItems = items.filter((item) => item.breaking).length
    ? items.filter((item) => item.breaking)
    : items.slice(0, 4);
  const categoryCards = categories
    .map((category) => ({
      category,
      item: items.find((newsItem) => newsItem.categorySlug === category.slug),
    }))
    .filter(({ item }) => item)
    .slice(0, 4);

  return (
    <section className="section news-section">
      <div className="section-head">
        <div>
          <span className="eyebrow">{eyebrow}</span>
          <h2>{title}</h2>
        </div>
        <Link href="/community-news" className="text-link">
          All news
        </Link>
      </div>

      <div className="news-ticker" aria-label="Breaking news">
        <div className="news-ticker-track">
          {[...tickerItems, ...tickerItems].map((item, index) => (
            <Link href={`/community-news/${item.slug}`} key={`${item.slug}-${index}`}>
              <span>Breaking</span>
              {item.title}
            </Link>
          ))}
        </div>
      </div>

      {/* <div className="news-bbc-grid">
        <NewsCard item={hero} hero />
        <div className="news-side-grid">
          {sideItems.map((item) => (
            <NewsCard item={item} key={item.slug} />
          ))}
        </div>
      </div> */}

      <NewsStoriesSlider items={items.slice(0, 10)} />

      {/* {categoryCards.length ? (
        <div className="news-category-row">
          {categoryCards.map(({ category, item }) => {
            if (!item) return null;
            return (
              <Link
                href={`/community-news/${item.slug}`}
                className="news-category-card"
                key={category.slug}
              >
                <img src={item.image} alt={item.title} />
                <span>{category.name}</span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.excerpt}</p>
                </div>
              </Link>
            );
          })}
        </div>
      ) : null} */}
    </section>
  );
}
