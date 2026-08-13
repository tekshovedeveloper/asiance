import type { CSSProperties } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import { WomenEditorialSection } from '@/components/WomenEditorialSection';
import { getActivity, getArticles } from '@/lib/api';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Explore | Asiance',
  description: 'Explore Asiance stories, communities, and inspiration for every chapter of life.',
};

const memberAvatars = [
  { src: 'https://res.cloudinary.com/ux81wsbq/image/upload/v1786640141/asiance/site-assets/categories/beauty-png.png', position: '50% 36%' },
  { src: 'https://res.cloudinary.com/ux81wsbq/image/upload/v1786640141/asiance/site-assets/categories/fashion-png.png', position: '50% 28%' },
  { src: 'https://res.cloudinary.com/ux81wsbq/image/upload/v1786640168/asiance/site-assets/profile/dymmy-profile-jpeg.jpg', position: '50% 32%' },
  { src: 'https://res.cloudinary.com/ux81wsbq/image/upload/v1786640164/asiance/site-assets/love/stories/kevin-jessica-jpg.jpg', position: '33% 36%' },
  { src: 'https://res.cloudinary.com/ux81wsbq/image/upload/v1786640160/asiance/site-assets/love/stories/andrew-michelle-jpg.jpg', position: '69% 34%' },
  { src: 'https://res.cloudinary.com/ux81wsbq/image/upload/v1786640193/asiance/site-assets/wedding/editorial/priya-rohan-png.png', position: '34% 34%' },
];

function WomenHeroCopy() {
  return (
    <div className="women-hero__content">
      <h1 id="women-hero-title">
        <span>Live Beautifully.</span>
        <span>Love Deeply.</span>
        <span className="women-hero__last-line">
          Inspire Daily.
          <Heart size={28} fill="currentColor" aria-hidden="true" />
        </span>
      </h1>
      <p>
        <strong>Asiance</strong> is your community for beauty, love, family and everything in between.
      </p>
      <div className="women-hero__actions">
        <Link href="/register" className="women-hero__primary-button">
          Join our community
        </Link>
        <span>
          It&apos;s free!
          <Heart size={13} fill="currentColor" aria-hidden="true" />
        </span>
      </div>
    </div>
  );
}

function WomenMemberCard() {
  return (
    <aside className="women-member-card" aria-label="Join the Asiance women community">
      <p className="women-member-card__script">
        You&apos;re not alone.
        <Heart size={17} fill="currentColor" aria-hidden="true" />
      </p>
      <p className="women-member-card__copy">
        Join thousands of Asian &amp; mixed-heritage women sharing real stories, advice and support.
      </p>
      <div className="women-member-card__avatars" aria-label="Asiance community members">
        {memberAvatars.map((avatar, index) => (
          <img
            key={`${avatar.src}-${index}`}
            src={avatar.src}
            alt=""
            style={{ '--avatar-position': avatar.position } as CSSProperties}
          />
        ))}
      </div>
      <strong className="women-member-card__count">50K+ Members</strong>
      <Link href="/register" className="women-member-card__button">
        Become a member
      </Link>
    </aside>
  );
}

export default async function WomenPage() {
  const [articles, activity] = await Promise.all([getArticles(), getActivity()]);

  return (
    <main className="page-shell women-page">
      <SiteHeader active="Explore" />

      <section className="women-hero" aria-labelledby="women-hero-title">
        <img
          className="women-hero__image"
          src="https://res.cloudinary.com/ux81wsbq/image/upload/v1786640187/asiance/site-assets/women/asiance-women-hero-png.png"
          alt="A stylish Asian woman overlooking a warm sunset city skyline"
        />
        <div className="women-hero__scrim" aria-hidden="true" />
        <div className="women-hero__layout">
          <WomenHeroCopy />
          <WomenMemberCard />
        </div>
      </section>

      <WomenEditorialSection articles={articles} activity={activity} />

      <SiteFooter />
    </main>
  );
}
