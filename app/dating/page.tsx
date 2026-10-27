import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  ClipboardList,
  Flower2,
  HeartHandshake,
  MapPin,
  Plane,
  Shirt,
  Sparkles,
} from 'lucide-react';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import { WeddingMagazineSection } from '@/components/WeddingMagazineSection';
import { getActivity, getArticles, getProducts } from '@/lib/api';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Asiance Dating | Asiance',
  description: 'Thoughtful dating, real stories, and meaningful connections in the Asiance community.',
};

const datingTopics = [
  { title: 'Real Weddings', copy: 'Inspiring love stories from our community', href: '/blog/real-weddings-stories-and-inspiration', Icon: HeartHandshake },
  { title: 'Planning Guide', copy: 'Your step-by-step wedding roadmap', href: '/blog/complete-wedding-planning-timeline-guide', Icon: ClipboardList },
  { title: 'Fashion', copy: 'Dresses, attire & style inspiration', href: '/blog/wedding-fashion-and-bridal-style-guide', Icon: Shirt },
  { title: 'Beauty', copy: 'Bridal beauty tips for your big day', href: '/blog/bridal-beauty-and-wedding-hair-guide', Icon: Sparkles },
  { title: 'Venues', copy: 'Find the perfect place to say “I do”', href: '/blog/unique-wedding-venues-guide', Icon: MapPin },
  { title: 'Vendors', copy: 'Top-rated pros we love', href: '/blog/wedding-vendors-we-love-guide', Icon: Flower2 },
  { title: 'Honeymoons', copy: 'Dream destinations for every couple', href: '/blog/honeymoon-ideas-for-every-couple', Icon: Plane },
];

const trendingTopics = [
  { title: '2024 Wedding Dress Trends You’ll Love', href: '/blog/2024-wedding-dress-trends-loving' },
  { title: 'Asian Wedding Traditions Explained', href: '/blog/asian-wedding-traditions-guide' },
  { title: 'Real Weddings That Will Inspire You', href: '/blog/real-weddings-stories-and-inspiration' },
];

function DatingTrending() {
  return (
    <aside className="dating-trending" aria-labelledby="dating-trending-title">
      <h2 id="dating-trending-title">Trending now</h2>
      <ol>
        {trendingTopics.map((topic, index) => (
          <li key={topic.title}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            <Link href={topic.href}>
              <strong>{topic.title}</strong>
            </Link>
          </li>
        ))}
      </ol>
      <Link href="/blog?category=Weddings" className="dating-trending__all">
        View all topics <ArrowRight size={14} aria-hidden="true" />
      </Link>
    </aside>
  );
}

function DatingTopicStrip() {
  return (
    <nav className="dating-topic-strip" aria-label="Explore wedding topics">
      {datingTopics.map(({ title, copy, href, Icon }) => (
        <Link href={href} className="dating-topic" key={title}>
          <span className="dating-topic__icon"><Icon size={30} strokeWidth={1.6} aria-hidden="true" /></span>
          <span className="dating-topic__copy">
            <strong>{title}</strong>
            <span>{copy}</span>
            <em>Explore <ArrowRight size={12} aria-hidden="true" /></em>
          </span>
        </Link>
      ))}
    </nav>
  );
}

export default async function DatingPage() {
  const [articles, products, activity] = await Promise.all([
    getArticles('Weddings'),
    getProducts({ category: 'wedding' }),
    getActivity(),
  ]);

  return (
    <main className="page-shell dating-page">
      <SiteHeader active="Asiance Love" />

      <section className="dating-hero" aria-labelledby="dating-hero-title">
        <img
          className="dating-hero__image"
          src="/dating/weddings-hero.png"
          alt="An East Asian bride and groom standing together in a bright floral wedding venue"
        />
        <div className="dating-hero__scrim" aria-hidden="true" />
        <div className="dating-hero__layout">
          <div className="dating-hero__content">
            <span className="dating-hero__eyebrow">Asiance Weddings</span>
            <h1 id="dating-hero-title">
              <span>Beautiful</span>
              <span>beginnings.</span>
              <span>Timeless</span>
              <span>celebrations.</span>
            </h1>
            <p>Inspiration, planning tips, real stories and Asian American wedding experts — all in one meaningful place.</p>
            <Link href="/blog?category=Weddings" className="dating-hero__button">
              Explore weddings <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>
          <div aria-hidden="true" />
          <DatingTrending />
        </div>
      </section>

      <DatingTopicStrip />
      <WeddingMagazineSection articles={articles} products={products} activity={activity} />
      <SiteFooter />
    </main>
  );
}
