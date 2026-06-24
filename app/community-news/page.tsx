import Link from 'next/link';
import { NewsCard } from '@/components/NewsCard';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import { getNews, getNewsCategories } from '@/lib/api';

export default async function CommunityNewsPage({
  searchParams,
}: {
  searchParams?: Promise<{ category?: string }>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const selectedCategory = resolvedSearchParams.category ?? '';
  const [items, categories] = await Promise.all([
    getNews({ category: selectedCategory || undefined, limit: 100 }),
    getNewsCategories(),
  ]);
  const breakingItems = items.filter((item) => item.breaking);

  return (
    <main>
      <SiteHeader active="Community News" />
      <section className="page-hero">
        <span className="eyebrow">community news</span>
        <h1>
          the <em>weekly</em> signal.
        </h1>
        <p className="page-copy">The WordPress-style news desk, rebuilt as dynamic editorial channels.</p>
      </section>
      <div className="shop-toolbar">
        <Link className={`pill ${!selectedCategory ? 'active' : ''}`} href="/community-news">
          All
        </Link>
        {categories.map((category) => (
          <Link
            className={`pill ${selectedCategory === category.slug ? 'active' : ''}`}
            href={`/community-news?category=${category.slug}`}
            key={category.slug}
          >
            {category.name}
          </Link>
        ))}
      </div>
      {breakingItems.length ? (
        <div className="news-ticker news-ticker-archive" aria-label="Breaking news">
          <div className="news-ticker-track">
            {[...breakingItems, ...breakingItems].map((item, index) => (
              <Link href={`/community-news/${item.slug}`} key={`${item.slug}-${index}`}>
                <span>Breaking</span>
                {item.title}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="news-archive-grid">
          {items.map((item, index) => (
            <NewsCard item={item} hero={index === 0} key={item.slug} />
          ))}
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
