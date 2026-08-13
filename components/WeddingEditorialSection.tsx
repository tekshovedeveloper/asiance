import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import {
  CalendarDays,
  CircleDollarSign,
  Flower2,
  Heart,
  MapPin,
  Plane,
  Shirt,
  Store,
} from 'lucide-react';
import { cloudinaryImageUrl } from '@/lib/cloudinary';
import type { Article } from '@/lib/types';

const weddingImages = {
  planning:
    'https://res.cloudinary.com/ux81wsbq/image/upload/v1786549598/asiance/uploads/planning_ncgvzr.png',
  venues:
    'https://res.cloudinary.com/ux81wsbq/image/upload/v1786549609/asiance/uploads/venues_vtqkox.png',
  fashion:
    'https://res.cloudinary.com/ux81wsbq/image/upload/v1786549611/asiance/uploads/fashion_k4gfau.png',
  decor:
    'https://res.cloudinary.com/ux81wsbq/image/upload/v1786549613/asiance/uploads/decor_pzzyty.png',
  honeymoons:
    'https://res.cloudinary.com/ux81wsbq/image/upload/v1786549625/asiance/uploads/honeymoons_h985i7.png',
  aria:
    'https://res.cloudinary.com/ux81wsbq/image/upload/v1786549633/asiance/uploads/aria-jason_wprvnv.png',
  priya:
    'https://res.cloudinary.com/ux81wsbq/image/upload/v1786549639/asiance/uploads/priya-rohan_cletcz.png',
  michelle:
    'https://res.cloudinary.com/ux81wsbq/image/upload/v1786549641/asiance/uploads/michelle-daniel_oxfng3.png',
};

type WeddingCategory = {
  title: string;
  copy: string;
  href: string;
  image: string;
  Icon: LucideIcon;
};

const weddingCategories: WeddingCategory[] = [
  {
    title: 'Planning',
    copy: 'Guides & Checklists',
    href: '/blog?category=Weddings',
    image: weddingImages.planning,
    Icon: CalendarDays,
  },
  {
    title: 'Venues',
    copy: 'Find Your Perfect Spot',
    href: '/blog?category=Weddings',
    image: weddingImages.venues,
    Icon: MapPin,
  },
  {
    title: 'Fashion',
    copy: 'Bridal & Style',
    href: '/blog?category=Weddings',
    image: weddingImages.fashion,
    Icon: Shirt,
  },
  {
    title: 'Decor',
    copy: 'Design & Details',
    href: '/blog?category=Weddings',
    image: weddingImages.decor,
    Icon: Flower2,
  },
  {
    title: 'Honeymoons',
    copy: 'Dream Destinations',
    href: '/travel',
    image: weddingImages.honeymoons,
    Icon: Plane,
  },
];

const planningResources = [
  {
    title: '12+ Month Timeline',
    copy: 'Stay on track with our month-by-month guide.',
    Icon: CalendarDays,
  },
  {
    title: 'Budget Planner',
    copy: 'Smart budgeting tips to plan with confidence.',
    Icon: CircleDollarSign,
  },
  {
    title: 'Vendor Checklist',
    copy: 'Find and book the best vendors.',
    Icon: Store,
  },
  {
    title: 'Ceremony Ideas',
    copy: 'Unique ideas to make your day unforgettable.',
    Icon: Heart,
  },
];

const featuredFallbacks: Article[] = [
  {
    title: 'Aria & Jason',
    slug: 'aria-jason-napa-wedding',
    category: 'Weddings',
    excerpt: 'Garden Romance in Napa',
    content: '',
    image: weddingImages.aria,
    authorName: 'Asiance Weddings',
  },
  {
    title: 'Priya & Rohan',
    slug: 'priya-rohan-indian-wedding',
    category: 'Weddings',
    excerpt: 'Colorful Indian Celebration',
    content: '',
    image: weddingImages.priya,
    authorName: 'Asiance Weddings',
  },
  {
    title: 'Michelle & Daniel',
    slug: 'michelle-daniel-new-york-wedding',
    category: 'Weddings',
    excerpt: 'Modern Chic in New York',
    content: '',
    image: weddingImages.michelle,
    authorName: 'Asiance Weddings',
  },
];

const inspirationImages = [
  weddingImages.decor,
  weddingImages.planning,
  weddingImages.venues,
  weddingImages.aria,
  weddingImages.honeymoons,
  weddingImages.fashion,
  weddingImages.priya,
  weddingImages.michelle,
];

type WeddingEditorialSectionProps = {
  articles: Article[];
};

function BrowseCategories() {
  return (
    <section className="wedding-browse" aria-labelledby="wedding-browse-title">
      <h2 id="wedding-browse-title">Browse by Category</h2>
      <div className="wedding-category-grid">
        {weddingCategories.map(({ title, copy, href, image, Icon }) => (
          <Link href={href} className="wedding-category-card" key={title}>
            <img src={cloudinaryImageUrl(image, 640)} alt="" />
            <span className="wedding-category-card__shade" aria-hidden="true" />
            <span className="wedding-category-card__content">
              <Icon size={29} aria-hidden="true" />
              <strong>{title}</strong>
              <span>{copy}</span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function PlanningRow() {
  return (
    <div className="wedding-planning-row">
      <section className="wedding-journey" aria-labelledby="wedding-journey-title">
        <h2 id="wedding-journey-title">
          Start Your Journey
          <Heart size={24} aria-hidden="true" />
        </h2>
        <p>From “Yes!” to “I do,” we’re here for every step of your journey.</p>
        <Link href="/blog?category=Weddings">Get started</Link>
      </section>

      <section className="wedding-resources" aria-labelledby="wedding-resources-title">
        <h2 id="wedding-resources-title">Planning Resources</h2>
        <div className="wedding-resource-grid">
          {planningResources.map(({ title, copy, Icon }) => (
            <Link href="/blog?category=Weddings" className="wedding-resource" key={title}>
              <Icon size={32} aria-hidden="true" />
              <strong>{title}</strong>
              <span>{copy}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function DailyInspiration() {
  return (
    <section className="wedding-inspiration" aria-labelledby="wedding-inspiration-title">
      <div className="wedding-section-heading">
        <h2 id="wedding-inspiration-title">Daily Wedding Inspiration</h2>
        <span aria-hidden="true" />
      </div>
      <div className="wedding-inspiration__strip">
        {inspirationImages.map((image, index) => (
          <Link href="/blog?category=Weddings" key={`${image}-${index}`}>
            <img src={cloudinaryImageUrl(image, 480)} alt="" />
          </Link>
        ))}
      </div>
    </section>
  );
}

function FeaturedWeddings({ articles }: WeddingEditorialSectionProps) {
  const articleMap = new Map(articles.map((article) => [article.slug, article]));
  const featured = featuredFallbacks.map((fallback) => articleMap.get(fallback.slug) ?? fallback);
  const likes = ['2.3K', '1.8K', '1.6K'];

  return (
    <aside className="wedding-featured" aria-labelledby="wedding-featured-title">
      <h2 id="wedding-featured-title">Featured Real Weddings</h2>
      <div className="wedding-featured__list">
        {featured.map((article, index) => (
          <Link href={`/blog/${article.slug}`} className="wedding-featured-card" key={article.slug}>
            <img src={cloudinaryImageUrl(article.image, 620)} alt="" />
            <span>
              <strong>{article.title}</strong>
              <span>{article.excerpt}</span>
              <small>
                <Heart size={15} aria-hidden="true" />
                {likes[index]}
              </small>
            </span>
          </Link>
        ))}
      </div>
      <Link href="/blog?category=Weddings" className="wedding-featured__all">
        View all real weddings
      </Link>
    </aside>
  );
}

export function WeddingEditorialSection({ articles }: WeddingEditorialSectionProps) {
  return (
    <div className="wedding-editorial">
      <div className="wedding-editorial__main">
        <BrowseCategories />
        <PlanningRow />
        <DailyInspiration />
      </div>
      <FeaturedWeddings articles={articles} />
    </div>
  );
}
