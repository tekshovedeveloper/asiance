import type { Metadata } from 'next';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowRight,
  BrainCircuit,
  House,
  MessageSquareMore,
  Newspaper,
  Rocket,
  ShoppingBag,
  UsersRound,
} from 'lucide-react';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import { TechEditorialSection } from '@/components/TechEditorialSection';
import { getActivity, getArticles, getProducts } from '@/lib/api';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Asiance Tech | Smarter Living, Reviews & Innovation',
  description:
    'Expert technology reviews, smart recommendations, and Asian American perspectives on the innovations shaping everyday life.',
};

type TechCategory = {
  label: string;
  description: string;
  href: string;
  Icon: LucideIcon;
};

const trendingStories = [
  'The Best AI Tools for Everyday Life',
  'iPhone 16 Review: Is It Worth It?',
  'Asian Founders Changing the Game',
];

const techCategories: TechCategory[] = [
  {
    label: 'News',
    description: 'Latest tech news & updates.',
    href: '/blog?category=technology',
    Icon: Newspaper,
  },
  {
    label: 'Reviews',
    description: 'Honest reviews you can trust.',
    href: '/blog?category=technology&tag=reviews',
    Icon: MessageSquareMore,
  },
  {
    label: 'Buying Guides',
    description: 'Find the right tech for your life.',
    href: '/blog?category=technology&tag=buying-guides',
    Icon: ShoppingBag,
  },
  {
    label: 'Smart Home',
    description: 'Build a smarter, connected home.',
    href: '/blog?category=technology&tag=smart-home',
    Icon: House,
  },
  {
    label: 'AI & Future',
    description: "The future is now. Let's explore.",
    href: '/blog?category=technology&tag=ai',
    Icon: BrainCircuit,
  },
  {
    label: 'Startups',
    description: 'Discover Asian tech innovators.',
    href: '/blog?category=technology&tag=startups',
    Icon: Rocket,
  },
  {
    label: 'Community',
    description: 'Join the conversation & share ideas.',
    href: '/circles',
    Icon: UsersRound,
  },
];

function TechCategoryStrip() {
  return (
    <nav id="tech-categories" className="tech-category-strip" aria-label="Technology categories">
      {techCategories.map(({ label, description, href, Icon }) => (
        <Link className="tech-category-item" href={href} key={label}>
          <Icon aria-hidden="true" />
          <span className="tech-category-item__copy">
            <strong>{label}</strong>
            <span>{description}</span>
            <small>
              Explore
              <ArrowRight aria-hidden="true" />
            </small>
          </span>
        </Link>
      ))}
    </nav>
  );
}

export default async function TechPage() {
  const [articles, products, activity] = await Promise.all([
    getArticles('Technology'),
    getProducts({ category: 'technology' }),
    getActivity(),
  ]);

  return (
    <main className="page-shell tech-page">
      <SiteHeader active="Tech" />

      <section className="tech-hero" aria-labelledby="tech-hero-title">
        <img
          className="tech-hero__image"
          src="/tech/tech-hero.png"
          alt="A woman using a laptop in a softly lit purple smart-home studio"
        />
        <div className="tech-hero__scrim" aria-hidden="true" />

        <div className="tech-hero__layout">
          <div className="tech-hero__content">
            <span className="tech-hero__eyebrow">Smarter living starts here</span>
            <h1 id="tech-hero-title">
              <span>Technology</span>
              <span>that elevates</span>
              <span>every part of life.</span>
            </h1>
            <p>
              Expert reviews, smart recommendations, and Asian American perspectives on the tech
              that matters most.
            </p>
            <Link className="tech-hero__button" href="#tech-categories">
              Explore tech
              <ArrowRight aria-hidden="true" />
            </Link>
          </div>

          <aside className="tech-trending" aria-label="Trending technology stories">
            <h2>Trending now</h2>
            <ol>
              {trendingStories.map((story, index) => (
                <li key={story}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <Link href="/blog?category=technology">{story}</Link>
                </li>
              ))}
            </ol>
            <Link className="tech-trending__all" href="/blog?category=technology">
              View all articles
              <ArrowRight aria-hidden="true" />
            </Link>
          </aside>
        </div>
      </section>

      <TechCategoryStrip />

      <TechEditorialSection articles={articles} products={products} activity={activity} />

      <SiteFooter />
    </main>
  );
}
