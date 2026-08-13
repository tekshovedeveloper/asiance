import type { Metadata } from 'next';
import type { LucideIcon } from 'lucide-react';
import { Heart, LockKeyhole, ShieldCheck } from 'lucide-react';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import { LoveEditorialSection } from '@/components/LoveEditorialSection';

export const metadata: Metadata = {
  title: 'Asiance Love | Asiance',
  description: 'Real connections and meaningful relationships in the Asiance community.',
};

type LoveBenefit = {
  title: string;
  copy: string;
  Icon: LucideIcon;
};

const loveBenefits: LoveBenefit[] = [
  {
    title: 'Verified Members',
    copy: 'Real people. Verified for your safety.',
    Icon: ShieldCheck,
  },
  {
    title: 'Meaningful Matches',
    copy: 'Smart matching for lasting connections.',
    Icon: Heart,
  },
  {
    title: 'Private & Secure',
    copy: 'Your privacy is our top priority.',
    Icon: LockKeyhole,
  },
];

function LoveHeroContent() {
  return (
    <div className="love-hero__content">
      <h1 id="love-hero-title">
        <span>Real Connections.</span>
        <span>
          Real <em>Asian Love.</em>
          <Heart size={34} fill="currentColor" aria-hidden="true" />
        </span>
      </h1>
      <p>
        The top Asian dating community
        <br />
        for meaningful relationships.
      </p>
    </div>
  );
}

function LoveBenefits() {
  return (
    <div className="love-benefits" aria-label="Asiance Love benefits">
      {loveBenefits.map(({ title, copy, Icon }) => (
        <div className="love-benefit" key={title}>
          <span className="love-benefit__icon">
            <Icon size={38} aria-hidden="true" />
          </span>
          <span className="love-benefit__copy">
            <strong>{title}</strong>
            <span>{copy}</span>
          </span>
        </div>
      ))}
    </div>
  );
}

export default function LovePage() {
  return (
    <main className="page-shell love-page">
      <SiteHeader active="Asiance Love" />

      <section className="love-hero" aria-labelledby="love-hero-title">
        <img
          className="love-hero__image"
          src="https://res.cloudinary.com/ux81wsbq/image/upload/v1786640163/asiance/site-assets/love/asiance-love-hero-png.png"
          alt="An Asian couple sharing a warm moment on a New York rooftop at dusk"
        />
        <div className="love-hero__scrim" aria-hidden="true" />
        <div className="love-hero__layout">
          <LoveHeroContent />
          <div aria-hidden="true" />
          <LoveBenefits />
        </div>
      </section>

      <LoveEditorialSection />

      <SiteFooter />
    </main>
  );
}
