import type { Metadata } from 'next';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { ArrowRight, Flower2, Gift, Paintbrush, Scissors, Sparkles } from 'lucide-react';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import { BeautyEditorialSection } from '@/components/BeautyEditorialSection';
import { getActivity, getArticles, getProducts } from '@/lib/api';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Asiance Beauty | Honest Reviews, Expert Tips & Self-Care',
  description:
    'Honest beauty reviews, expert guidance, and Asian American perspectives on skincare, makeup, hair, and wellness.',
};

type BeautyCategory = {
  label: string;
  description: string;
  href: string;
  Icon: LucideIcon;
};

const beautyHighlights = [
  { number: '01', title: 'Expert tips', copy: 'Skincare, makeup, hair & more' },
  { number: '02', title: 'Honest reviews', copy: 'Real opinions from our community' },
  { number: '03', title: 'Clean & conscious', copy: 'Beauty that’s good for you & the planet' },
];

const beautyCategories: BeautyCategory[] = [
  {
    label: 'Skincare',
    description: 'Healthy skin, honest reviews',
    href: '/blog?category=Fashion%20and%20Beauty&tag=skincare',
    Icon: Sparkles,
  },
  {
    label: 'Makeup',
    description: 'Tips, trends & product picks',
    href: '/blog?category=Fashion%20and%20Beauty&tag=makeup',
    Icon: Paintbrush,
  },
  {
    label: 'Hair',
    description: 'Care tips & styling inspiration',
    href: '/blog?category=Fashion%20and%20Beauty&tag=hair',
    Icon: Scissors,
  },
  {
    label: 'Wellness',
    description: 'Mind, body & self-care',
    href: '/blog?category=Fashion%20and%20Beauty&tag=wellness',
    Icon: Flower2,
  },
  {
    label: 'Beauty bundle',
    description: 'Curated beauty delivered to you',
    href: '/shop?category=beauty',
    Icon: Gift,
  },
];

export default async function BeautyPage() {
  const [articles, products, beautyProducts, activity] = await Promise.all([
    getArticles('Fashion and Beauty'),
    getProducts({ category: 'fashion' }),
    getProducts({ category: 'beauty' }),
    getActivity(),
  ]);

  return (
    <main className="page-shell beauty-page">
      <SiteHeader active="Beauty" />

      <section className="beauty-hero" aria-labelledby="beauty-hero-title">
        <img
          className="beauty-hero__image"
          src="/beauty/beauty-hero.png"
          alt="Woman holding a violet skincare jar in a softly lit blush and lilac studio"
        />
        <div className="beauty-hero__scrim" aria-hidden="true" />

        <div className="beauty-hero__layout">
          <div className="beauty-hero__content">
            <span className="beauty-hero__eyebrow">Asiance beauty</span>
            <h1 id="beauty-hero-title">
              <span>Beauty</span>
              <span>That Reflects Us.</span>
            </h1>
            <p>Honest reviews. Expert tips.<br />Asian American perspective.</p>
            <Link className="beauty-hero__button" href="#beauty-categories">
              Explore beauty
              <ArrowRight aria-hidden="true" />
            </Link>
          </div>

          <aside className="beauty-hero__highlights" aria-label="Beauty highlights">
            {beautyHighlights.map((item) => (
              <Link href="/blog?category=Fashion%20and%20Beauty" key={item.number}>
                <span>{item.number}</span>
                <span>
                  <strong>{item.title}</strong>
                  <small>{item.copy}</small>
                </span>
              </Link>
            ))}
          </aside>
        </div>
      </section>

      <nav id="beauty-categories" className="beauty-category-strip" aria-label="Beauty categories">
        {beautyCategories.map(({ label, description, href, Icon }) => (
          <Link className="beauty-category-item" href={href} key={label}>
            <Icon aria-hidden="true" />
            <span className="beauty-category-item__copy">
              <strong>{label}</strong>
              <span>{description}</span>
              <small>Explore <ArrowRight aria-hidden="true" /></small>
            </span>
          </Link>
        ))}
      </nav>

      <BeautyEditorialSection articles={articles} products={products} beautyProducts={beautyProducts} activity={activity} />

      <SiteFooter />
    </main>
  );
}
