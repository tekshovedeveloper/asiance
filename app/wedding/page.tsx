import type { Metadata } from 'next';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { ArrowRight, ClipboardCheck, Heart, Store, Users } from 'lucide-react';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import { WeddingEditorialSection } from '@/components/WeddingEditorialSection';
import { getArticles } from '@/lib/api';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Asiance Weddings | Asiance',
  description: 'Wedding inspiration, planning guidance, trusted vendors, and community stories.',
};

type WeddingBenefit = {
  title: string;
  copy: string;
  href: string;
  Icon: LucideIcon;
};

const weddingBenefits: WeddingBenefit[] = [
  {
    title: 'Real Inspiration',
    copy: 'Stunning real weddings from our community.',
    href: '/blog?category=Weddings',
    Icon: Heart,
  },
  {
    title: 'Expert Planning',
    copy: 'Tips, timelines, and guides to make it stress-free.',
    href: '/blog?category=Weddings',
    Icon: ClipboardCheck,
  },
  {
    title: 'Trusted Vendors',
    copy: 'Curated vendors who understand your vision.',
    href: '/blog?category=Weddings',
    Icon: Store,
  },
  {
    title: 'Community Love',
    copy: 'Connect, share, and get advice from real couples.',
    href: '/circles',
    Icon: Users,
  },
];

function WeddingHeroContent() {
  return (
    <div className="wedding-hero__content">
      <span className="wedding-hero__eyebrow">Asiance Weddings</span>
      <h1 id="wedding-hero-title">
        <span>Your Love Story.</span>
        <em>
          Your Way.
          <Heart size={34} aria-hidden="true" />
        </em>
      </h1>
      <p>
        Inspiration, planning tips, and a community that celebrates Asian love in all its beautiful
        forms.
      </p>
      <Link href="/blog?category=Weddings" className="wedding-hero__button">
        Plan your wedding
        <ArrowRight size={19} aria-hidden="true" />
      </Link>
    </div>
  );
}

function WeddingBenefits() {
  return (
    <nav className="wedding-benefits" aria-label="Wedding resources">
      {weddingBenefits.map(({ title, copy, href, Icon }) => (
        <Link href={href} className="wedding-benefit" key={title}>
          <span className="wedding-benefit__icon">
            <Icon size={30} aria-hidden="true" />
          </span>
          <span className="wedding-benefit__content">
            <strong>{title}</strong>
            <span>{copy}</span>
          </span>
        </Link>
      ))}
    </nav>
  );
}

export default async function WeddingPage() {
  const weddingArticles = await getArticles('Weddings');

  return (
    <main className="page-shell wedding-page">
      <SiteHeader active="Asiance Weddings" />

      <section className="wedding-hero" aria-labelledby="wedding-hero-title">
        <img
          className="wedding-hero__image"
          src="https://res.cloudinary.com/ux81wsbq/image/upload/f_auto,q_auto:good,w_2400,c_limit/v1786548445/asiance/uploads/asiance-weddings-background_gvupfg.png"
          alt="A bride and groom holding a blue and white wedding bouquet"
        />
        <div className="wedding-hero__scrim" aria-hidden="true" />
        <div className="wedding-hero__layout">
          <div aria-hidden="true" />
          <WeddingHeroContent />
          <WeddingBenefits />
        </div>
      </section>

      <WeddingEditorialSection articles={weddingArticles} />

      <SiteFooter />
    </main>
  );
}
