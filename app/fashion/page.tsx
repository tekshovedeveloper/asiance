import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import { FashionEditorialSections } from '@/components/FashionEditorialSections';
import { getArticles, getMembers, getProducts } from '@/lib/api';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Asiance Fashion | Asiance',
  description: 'Designer stories, style inspiration, and Asian fashion voices from Asiance.',
};

const fashionFeatureLinks = [
  {
    number: '01',
    title: 'Designer Spotlight',
    copy: 'Anna Sui on her lasting legacy in fashion',
  },
  {
    number: '02',
    title: 'Creative Journey',
    copy: 'From Queens to the runway and beyond',
  },
  {
    number: '03',
    title: 'Asian American Icon',
    copy: 'How Anna Sui paved the way for us all',
  },
];

export default async function FashionPage() {
  const [articles, products, members] = await Promise.all([
    getArticles('Fashion'),
    getProducts({ category: 'fashion' }),
    getMembers({ cache: 'no-store' }),
  ]);

  return (
    <main className="page-shell fashion-page">
      <SiteHeader active="Explore Asiance" />

      <section className="fashion-hero" aria-labelledby="fashion-hero-title">
        <picture className="fashion-hero__picture">
          <source media="(max-width: 820px)" srcSet="/fashion/anna-sui-hero.png" />
          <img className="fashion-hero__image" src="/fashion/anna-sui-hero-reference.png" alt="Anna Sui seated in her studio wearing a black and purple patterned blouse" />
        </picture>
        <div className="fashion-hero__scrim" aria-hidden="true" />

        <div className="fashion-hero__layout">
          <div className="fashion-hero__content">
            <span className="fashion-hero__eyebrow">Fashion Icon</span>
            <h1 id="fashion-hero-title">
              <span>Anna Sui</span>
              <span>Fearless.</span>
              <span>Feminine.</span>
              <span>Forever.</span>
            </h1>
            <p>The queen of eclectic fashion on creativity, culture, and staying true to your dreams.</p>
            <Link
              href="/blog?category=fashion"
              className="fashion-hero__button"
            >
              <span>Read the feature</span>
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>

          <aside className="fashion-hero__rail" aria-label="Fashion feature highlights">
            {fashionFeatureLinks.map((item) => (
              <Link
                href="/blog?category=fashion"
                className="fashion-hero__rail-item"
                key={item.number}
              >
                <span className="fashion-hero__rail-number">{item.number}</span>
                <span className="fashion-hero__rail-copy">
                  <strong>{item.title}</strong>
                  <span>{item.copy}</span>
                </span>
              </Link>
            ))}
          </aside>
        </div>

        <nav className="fashion-hero__desktop-actions" aria-label="Anna Sui feature links">
          <Link href="/blog?category=fashion" className="fashion-hero__desktop-action fashion-hero__desktop-action--feature" aria-label="Read the Anna Sui feature" />
          {fashionFeatureLinks.map((item, index) => (
            <Link
              href="/blog?category=fashion"
              className={`fashion-hero__desktop-action fashion-hero__desktop-action--rail-${index + 1}`}
              aria-label={`${item.title}: ${item.copy}`}
              key={item.number}
            />
          ))}
        </nav>
      </section>

      <FashionEditorialSections articles={articles} products={products} members={members} />

      <SiteFooter />
    </main>
  );
}
