import type { Metadata } from 'next';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import {
  Building2,
  Camera,
  Flower2,
  Gem,
  Landmark,
  Luggage,
  Plane,
  TreePalm,
  Utensils,
} from 'lucide-react';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { TravelEditorialSection } from '@/components/TravelEditorialSection';
import { getArticles } from '@/lib/api';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Travel | Asiance',
  description: 'Curated Asiance travel inspiration across Asia.',
};

type TravelCategory = {
  label: string;
  slug: string;
  Icon: LucideIcon;
};

const travelCategories: TravelCategory[] = [
  { label: 'Asia', slug: 'asia', Icon: Landmark },
  { label: 'Beach Getaways', slug: 'beach-getaways', Icon: TreePalm },
  { label: 'City Guides', slug: 'city-guides', Icon: Building2 },
  { label: 'Wellness', slug: 'wellness', Icon: Flower2 },
  { label: 'Food & Culture', slug: 'food-culture', Icon: Utensils },
  { label: 'Travel Tips', slug: 'travel-tips', Icon: Camera },
  { label: 'Luxury Travel', slug: 'luxury-travel', Icon: Gem },
  { label: 'Experiences', slug: 'experiences', Icon: Luggage },
];

const travelTickerItems = [
  'Maldives is a top destination in 2026',
  'Bali wellness villas are made for slow summer stays',
  'Kyoto culture walks are leading spring itineraries',
  'Phuket island hopping remains a five-day favorite',
  'Seoul food streets are rising on city guide lists',
  'Sri Lanka train journeys are perfect scenic adventures',
];

export default async function TravelPage() {
  const travelArticles = await getArticles('Travel');
  const featuredArticle = travelArticles.find((article) => article.featured) ?? travelArticles[0];
  const remainingArticles = travelArticles.filter((article) => article.slug !== featuredArticle?.slug);
  const editorsPicks = remainingArticles.slice(0, 3);
  const inspiration = remainingArticles.slice(3, 6);

  return (
    <main className="page-shell travel-page">
      <SiteHeader active="Travel" />

      <section className="travel-hero" aria-labelledby="travel-hero-title">
        <img
          className="travel-hero__image"
          src="https://res.cloudinary.com/ux81wsbq/image/upload/f_auto,q_auto:good,w_2400,c_limit/v1785774496/asiance/uploads/travel-hero_ktcabc.png"
          alt="A tropical Asian bay surrounded by limestone mountains and a luxury resort"
        />
        <div className="travel-hero__scrim" aria-hidden="true" />

        <div className="travel-hero__content">
          <span className="travel-hero__script">Discover. Explore. Experience.</span>
          <h1 id="travel-hero-title">Asiance Travel</h1>
          <p>
            <span>Curated travel inspiration for the modern</span>
            <span>Asian traveler. From hidden gems to</span>
            <span>iconic destinations.</span>
          </p>
          <Link href="#" className="travel-hero__button">
            <span>Find your next escape</span>
            <Plane size={17} aria-hidden="true" />
          </Link>
        </div>
      </section>

      <nav className="travel-category-strip" aria-label="Travel categories">
        {travelCategories.map(({ label, slug, Icon }) => (
          <Link
            href={`/travel?category=${slug}`}
            className="travel-category-item"
            key={slug}
          >
            <span className="travel-category-item__icon">
              <Icon size={36} aria-hidden="true" />
            </span>
            <span className="travel-category-item__label">{label}</span>
          </Link>
        ))}
      </nav>

      <section className="travel-destination-ticker" aria-labelledby="travel-ticker-heading">
        <h2 id="travel-ticker-heading" className="visually-hidden">
          Travel destination highlights
        </h2>
        <ul className="visually-hidden">
          {travelTickerItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <div className="travel-destination-ticker__track" aria-hidden="true">
          {[...travelTickerItems, ...travelTickerItems].map((item, index) => (
            <span className="travel-destination-ticker__item" key={`${item}-${index}`}>
              <span className="travel-destination-ticker__text">{item}</span>
            </span>
          ))}
        </div>
      </section>

      <TravelEditorialSection
        featuredArticle={featuredArticle}
        editorsPicks={editorsPicks}
        inspiration={inspiration}
      />

      <SiteFooter />
    </main>
  );
}
