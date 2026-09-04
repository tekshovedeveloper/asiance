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
    copy: 'Sandy Liang on creativity, identity & staying true',
  },
  {
    number: '02',
    title: 'Her World',
    copy: "Inside Sandy's NYC studio & inspirations",
  },
  {
    number: '03',
    title: 'Asian American Voices',
    copy: 'Why representation in fashion matters',
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
        <img
          className="fashion-hero__image"
          src="/blog/sandy-liang-hero-wide.png"
          alt="Sandy Liang seated in her studio surrounded by sketches, bows, and flowers"
        />
        <div className="fashion-hero__scrim" aria-hidden="true" />

        <div className="fashion-hero__layout">
          <div className="fashion-hero__content">
            <span className="fashion-hero__eyebrow">Fashion Icon</span>
            <h1 id="fashion-hero-title">
              <span>Sandy Liang</span>
              <span>Soft. Feminine.</span>
              <span>Unapologetically Her.</span>
            </h1>
            <p>The designer redefining modern femininity, one bow at a time.</p>
            <Link
              href="/blog/sandy-liang-soft-feminine-unapologetically-her"
              className="fashion-hero__button"
            >
              <span>Read the feature</span>
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>

          <aside className="fashion-hero__rail" aria-label="Fashion feature highlights">
            {fashionFeatureLinks.map((item) => (
              <Link
                href="/blog/sandy-liang-soft-feminine-unapologetically-her"
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
      </section>

      <FashionEditorialSections articles={articles} products={products} members={members} />

      <SiteFooter />
    </main>
  );
}
