import type { Metadata } from 'next';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { ArrowRight, Baby, Blocks, Camera, Heart, Milk, Plane } from 'lucide-react';
import { BabyEditorialSection } from '@/components/BabyEditorialSection';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import { getArticles } from '@/lib/api';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Asiance Baby | Asiance',
  description: 'Motherhood, baby milestones, and family stories from Asiance.',
};

type BabyCategory = {
  label: string;
  slug: string;
  Icon: LucideIcon;
};

const babyCategories: BabyCategory[] = [
  { label: 'Pregnancy', slug: 'pregnancy', Icon: Baby },
  { label: 'Baby Care', slug: 'baby-care', Icon: Milk },
  { label: 'Milestones', slug: 'milestones', Icon: Blocks },
  { label: 'Mom Life', slug: 'mom-life', Icon: Heart },
  { label: 'Family Travel', slug: 'family-travel', Icon: Plane },
  { label: 'Photos & Memories', slug: 'photos-memories', Icon: Camera },
];

function BabyHeroQuoteCard() {
  return (
    <Link href="/blog?category=baby" className="baby-hero-quote">
      <Heart size={18} fill="currentColor" aria-hidden="true" />
      <span>New on the blog</span>
      <h2>A slow morning with my baby</h2>
      <p>Our cozy morning routine that sets the tone for a happy day.</p>
      <strong>
        Read more
        <ArrowRight size={17} aria-hidden="true" />
      </strong>
    </Link>
  );
}

function BabyHeroContent() {
  return (
    <div className="baby-hero__content">
      <h1 id="baby-hero-title">Asiance</h1>
      <div className="baby-hero__subtitle" aria-label="Baby">
        <span aria-hidden="true" />
        <Heart size={17} fill="currentColor" aria-hidden="true" />
        <strong>Baby</strong>
        <Heart size={17} fill="currentColor" aria-hidden="true" />
        <span aria-hidden="true" />
      </div>
      <p className="baby-hero__script">
        Little Moments. Big Joy.
        <Heart size={18} fill="currentColor" aria-hidden="true" />
      </p>
      <p className="baby-hero__copy">
        Celebrating motherhood, baby milestones, and the beautiful journey of raising our little
        ones.
      </p>
      <Link href="/blog?category=baby" className="baby-hero__button">
        Explore more
      </Link>
    </div>
  );
}

function BabyHeroCategoryStrip() {
  return (
    <nav className="baby-category-strip" aria-label="Asiance Baby categories">
      {babyCategories.map(({ label, slug, Icon }) => (
        <Link href={`/blog?category=${slug}`} className="baby-category-item" key={slug}>
          <Icon size={38} aria-hidden="true" />
          <span>{label}</span>
        </Link>
      ))}
    </nav>
  );
}

export default async function BabyPage() {
  const babyArticles = await getArticles('Asiance Baby');

  return (
    <main className="page-shell baby-page">
      <SiteHeader active="Asiance Baby" />

      <section className="baby-hero" aria-labelledby="baby-hero-title">
        <img
          className="baby-hero__image"
          src="https://res.cloudinary.com/ux81wsbq/image/upload/f_auto,q_auto:good,w_2400,c_limit/v1786547222/asiance/uploads/asiance-baby-background_dbh6jp.png"
          alt="A mother holding a smiling baby in a soft pink bedroom"
        />
        <div className="baby-hero__scrim" aria-hidden="true" />
        <div className="baby-hero__layout">
          <BabyHeroQuoteCard />
          <BabyHeroContent />
        </div>
        <BabyHeroCategoryStrip />
      </section>

      <BabyEditorialSection articles={babyArticles} />

      <SiteFooter />
    </main>
  );
}
