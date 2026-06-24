import { ArticleCard } from '@/components/ArticleCard';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import { getArticles } from '@/lib/api';

export default async function BlogPage() {
  const articles = await getArticles();

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
