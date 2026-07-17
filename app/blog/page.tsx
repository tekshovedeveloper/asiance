import Link from 'next/link';
import { ArticleCard } from '@/components/ArticleCard';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import { getArticleCategories, getArticles } from '@/lib/api';

export default async function BlogPage({
  searchParams,
}: {
  searchParams?: Promise<{ category?: string }>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const selectedCategory = resolvedSearchParams.category ?? '';
  const categories = await getArticleCategories();
  const selectedCategoryName = categories.find((category) => category.slug === selectedCategory)?.name;
  const articles = await getArticles(selectedCategoryName);

  return (
    <main>
      <SiteHeader active="Blog" />
      <section className="page-hero">
        <span className="eyebrow">journal</span>
        <h1>
          stories with a <em>room</em> beneath them.
        </h1>
        <p className="page-copy">
          Each article carries a discussion layer, replacing static WordPress comments with a
          quieter community mechanic.
        </p>
      </section>
      <div className="shop-toolbar">
        <Link className={`pill ${!selectedCategory ? 'active' : ''}`} href="/blog">
          All
        </Link>
        {categories.map((category) => (
          <Link
            className={`pill ${selectedCategory === category.slug ? 'active' : ''}`}
            href={`/blog?category=${category.slug}`}
            key={category.slug}
          >
            {category.name}
          </Link>
        ))}
      </div>
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="story-grid">
          {articles.map((article, index) => (
            <ArticleCard article={article} large={index === 0} key={article.slug} />
          ))}
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
