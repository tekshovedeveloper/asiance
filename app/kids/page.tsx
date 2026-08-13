import type { Metadata } from 'next';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import {
  BookOpen,
  Heart,
  HeartPulse,
  Luggage,
  Palette,
  Shirt,
  ShoppingBag,
  Utensils,
} from 'lucide-react';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import { KidsEditorialSection } from '@/components/KidsEditorialSection';

export const metadata: Metadata = {
  title: 'Asiance Kids | Asiance',
  description: 'Parenting ideas, learning, wellness, travel, and joyful family stories from Asiance.',
};

type KidsCategory = {
  label: string;
  href: string;
  Icon: LucideIcon;
};

const kidsCategories: KidsCategory[] = [
  { label: 'Parenting Tips', href: '/blog?category=family', Icon: Heart },
  { label: 'School & Learning', href: '/blog?category=family', Icon: BookOpen },
  { label: 'Activities', href: '/blog?category=family', Icon: Palette },
  { label: 'Health & Wellness', href: '/blog?category=family', Icon: HeartPulse },
  { label: 'Style & Gear', href: '/shop', Icon: Shirt },
  { label: 'Food & Nutrition', href: '/blog?category=food', Icon: Utensils },
  { label: 'Travel with Kids', href: '/travel', Icon: Luggage },
  { label: 'Shop Favorites', href: '/shop', Icon: ShoppingBag },
];

function KidsHeroContent() {
  return (
    <div className="kids-hero__content">
      <h1 id="kids-hero-title">Asiance</h1>
      <div className="kids-hero__subtitle" aria-label="Kids">
        <span aria-hidden="true" />
        <Heart size={17} fill="currentColor" aria-hidden="true" />
        <strong>Kids</strong>
        <Heart size={17} fill="currentColor" aria-hidden="true" />
        <span aria-hidden="true" />
      </div>
      <p className="kids-hero__script">
        Raising Happy. Confident. Kind Kids.
        <Heart size={17} fill="currentColor" aria-hidden="true" />
      </p>
      <p className="kids-hero__copy">
        Inspiring Asian and mixed-heritage families with real stories, expert advice, and fun ideas
        for every stage of childhood.
      </p>
      <Link href="/blog?category=family" className="kids-hero__button">
        Explore now
      </Link>
    </div>
  );
}

function KidsCategoryGrid() {
  return (
    <nav className="kids-category-grid" aria-label="Asiance Kids categories">
      {kidsCategories.map(({ label, href, Icon }) => (
        <Link className="kids-category-item" href={href} key={label}>
          <Icon size={34} aria-hidden="true" />
          <span>{label}</span>
        </Link>
      ))}
    </nav>
  );
}

export default function KidsPage() {
  return (
    <main className="page-shell kids-page">
      <SiteHeader active="Asiance Kids" />

      <section className="kids-hero" aria-labelledby="kids-hero-title">
        <img
          className="kids-hero__image"
          src="https://res.cloudinary.com/ux81wsbq/image/upload/v1786640163/asiance/site-assets/kids/asiance-kids-hero-png.png"
          alt="Two smiling siblings playing together in a warm family playroom"
        />
        <div className="kids-hero__scrim" aria-hidden="true" />
        <div className="kids-hero__layout">
          <KidsHeroContent />
        </div>
        <KidsCategoryGrid />
      </section>

      <KidsEditorialSection />

      <SiteFooter />
    </main>
  );
}
