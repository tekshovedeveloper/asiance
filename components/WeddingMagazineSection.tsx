'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  Flower2,
  Heart,
  MapPin,
  Plane,
  Shirt,
  Sparkles,
  UsersRound,
} from 'lucide-react';
import type { Activity, Article, Product } from '@/lib/types';

const images = {
  featuredGarden: '/dating/wedding-magazine/featured-garden-wedding.png',
  pearlPins: '/dating/wedding-magazine/pearl-hair-pins.png',
  weddingHanger: '/dating/wedding-magazine/personalised-hanger.png',
  bouquetRibbon: '/dating/wedding-magazine/silk-ribbon-bouquet.png',
  vowBooks: '/dating/wedding-magazine/vow-books.png',
  bridesmaidGift: '/dating/wedding-magazine/bridesmaid-gift-box.png',
  weddingCandle: '/dating/wedding-magazine/scented-candle.png',
  planning: 'https://res.cloudinary.com/ux81wsbq/image/upload/v1786549598/asiance/uploads/planning_ncgvzr.png',
  venues: 'https://res.cloudinary.com/ux81wsbq/image/upload/v1786549609/asiance/uploads/venues_vtqkox.png',
  fashion: 'https://res.cloudinary.com/ux81wsbq/image/upload/v1786549611/asiance/uploads/fashion_k4gfau.png',
  decor: 'https://res.cloudinary.com/ux81wsbq/image/upload/v1786549613/asiance/uploads/decor_pzzyty.png',
  honeymoons: 'https://res.cloudinary.com/ux81wsbq/image/upload/v1786549625/asiance/uploads/honeymoons_h985i7.png',
  aria: 'https://res.cloudinary.com/ux81wsbq/image/upload/v1786549633/asiance/uploads/aria-jason_wprvnv.png',
  priya: 'https://res.cloudinary.com/ux81wsbq/image/upload/v1786549639/asiance/uploads/priya-rohan_cletcz.png',
  michelle: 'https://res.cloudinary.com/ux81wsbq/image/upload/v1786549641/asiance/uploads/michelle-daniel_oxfng3.png',
};

const weddingTopicHrefs = {
  realWeddings: '/blog/real-weddings-stories-and-inspiration',
  planning: '/blog/complete-wedding-planning-timeline-guide',
  fashion: '/blog/wedding-fashion-and-bridal-style-guide',
  beauty: '/blog/bridal-beauty-and-wedding-hair-guide',
  venues: '/blog/unique-wedding-venues-guide',
  vendors: '/blog/wedding-vendors-we-love-guide',
  honeymoons: '/blog/honeymoon-ideas-for-every-couple',
  engagements: '/blog/engagement-stories-and-proposal-ideas',
  traditions: '/blog/asian-wedding-traditions-guide',
};

const topics = [
  { label: 'Real Weddings', image: images.featuredGarden, href: weddingTopicHrefs.realWeddings },
  { label: 'Wedding Fashion', image: '/dating/community/dress-choice.png', href: weddingTopicHrefs.fashion },
  { label: 'Bridal Beauty', image: images.priya, href: weddingTopicHrefs.beauty },
  { label: 'Planning Tips', image: images.decor, href: weddingTopicHrefs.planning },
  { label: 'Venues', image: images.venues, href: weddingTopicHrefs.venues },
  { label: 'Vendors We Love', image: images.bouquetRibbon, href: weddingTopicHrefs.vendors },
  { label: 'Engagements', image: images.honeymoons, href: weddingTopicHrefs.engagements },
];

const articleFallbacks: Article[] = [
  {
    title: 'Aria & Jason’s Romantic Garden Wedding in NYC',
    slug: 'aria-jason-romantic-garden-wedding-nyc',
    category: 'Weddings',
    excerpt: 'A modern celebration filled with meaningful traditions, lush florals and timeless style.',
    content: '', image: images.featuredGarden, authorName: 'Asiance Weddings', featured: true,
  },
  { title: '10 Budget-Friendly Ways to Elevate Your Wedding', slug: 'budget-friendly-ways-to-elevate-your-wedding', category: 'Weddings', excerpt: '', content: '', image: images.planning, authorName: 'Asiance Weddings' },
  { title: '2024 Wedding Dress Trends We’re Loving', slug: '2024-wedding-dress-trends-loving', category: 'Weddings', excerpt: '', content: '', image: images.fashion, authorName: 'Asiance Weddings' },
  { title: 'Bridal Skincare Timeline for Glowing Skin', slug: 'bridal-skincare-timeline-glowing-skin', category: 'Weddings', excerpt: '', content: '', image: images.priya, authorName: 'Asiance Weddings' },
  { title: 'Asian Wedding Traditions & Their Beautiful Meanings', slug: 'asian-wedding-traditions-beautiful-meaning', category: 'Weddings', excerpt: '', content: '', image: images.decor, authorName: 'Asiance Weddings' },
  { title: 'Best Honeymoon Destinations for Every Season', slug: 'best-honeymoon-destinations-for-every-season', category: 'Weddings', excerpt: '', content: '', image: images.honeymoons, authorName: 'Asiance Weddings' },
  { title: 'Wedding Reception Lighting Ideas That Feel Magical', slug: 'wedding-reception-lighting-ideas', category: 'Weddings', excerpt: '', content: '', image: '/dating/community/table-settings.png', authorName: 'Asiance Weddings' },
];

const productFallbacks: Product[] = [
  { name: 'Minimal Pearl Hair Pins Set', slug: 'minimal-pearl-hair-pins-set', category: 'Wedding', categorySlug: 'wedding', price: 46, image: images.pearlPins, description: '' },
  { name: 'Personalised Wedding Hanger', slug: 'personalised-wedding-hanger', category: 'Wedding', categorySlug: 'wedding', price: 28, image: images.weddingHanger, description: '' },
  { name: 'Silk Ribbon Bouquet Tie', slug: 'silk-ribbon-bouquet-tie', category: 'Wedding', categorySlug: 'wedding', price: 32, image: images.bouquetRibbon, description: '' },
  { name: 'Custom Wedding Vow Books', slug: 'custom-wedding-vow-books', category: 'Wedding', categorySlug: 'wedding', price: 36, image: images.vowBooks, description: '' },
  { name: 'Bridesmaid Gift Box Set', slug: 'bridesmaid-gift-box-set', category: 'Wedding', categorySlug: 'wedding', price: 56, image: images.bridesmaidGift, description: '' },
  { name: 'Scented Candle “Happily Ever After”', slug: 'scented-candle-happily-ever-after', category: 'Wedding', categorySlug: 'wedding', price: 24, image: images.weddingCandle, description: '' },
];

const communityFallbacks: Activity[] = [
  { actorName: 'admin', actorHandle: 'admin', type: 'post', text: 'Our proposal story in Santorini', targetName: 'Our Proposal Story in Santorini', targetSlug: 'wedding-community-santorini-proposal', likes: 128, comments: 14, media: [{ type: 'image', url: '/dating/community/proposal-santorini.png' }] },
  { actorName: 'admin', actorHandle: 'admin', type: 'post', text: 'Help! Which dress should I choose?', targetName: 'Help! Which Dress Should I Choose?', targetSlug: 'wedding-community-dress-choice', likes: 98, comments: 32, media: [{ type: 'image', url: '/dating/community/dress-choice.png' }] },
  { actorName: 'admin', actorHandle: 'admin', type: 'post', text: 'How we saved on our wedding', targetName: 'How We Saved on Our Wedding', targetSlug: 'wedding-community-budget-tip', likes: 76, comments: 20, media: [{ type: 'image', url: images.featuredGarden }] },
  { actorName: 'admin', actorHandle: 'admin', type: 'post', text: 'Tea ceremony decor ideas', targetName: 'Tea Ceremony Decor Ideas', targetSlug: 'wedding-community-tea-ceremony', likes: 54, comments: 18, media: [{ type: 'image', url: '/dating/community/tea-ceremony.png' }] },
  { actorName: 'admin', actorHandle: 'admin', type: 'post', text: 'Minimalist wedding table settings', targetName: 'Minimalist Wedding Table Settings', targetSlug: 'wedding-community-table-settings', likes: 83, comments: 11, media: [{ type: 'image', url: '/dating/community/table-settings.png' }] },
];

const communityLabels = ['Story', 'Question', 'Tip', 'Post', 'Inspiration'];

const inspirationTopics = [
  { label: 'Modern Romance', image: '/dating/community/dress-choice.png', href: weddingTopicHrefs.realWeddings },
  { label: 'Garden Weddings', image: images.featuredGarden, href: weddingTopicHrefs.realWeddings },
  { label: 'Tea Ceremonies', image: '/dating/community/tea-ceremony.png', href: weddingTopicHrefs.traditions },
  { label: 'South Asian Weddings', image: images.michelle, href: weddingTopicHrefs.traditions },
  { label: 'Korean Weddings', image: '/dating/community/bride-feature.png', href: weddingTopicHrefs.traditions },
  { label: 'Beach Weddings', image: images.honeymoons, href: weddingTopicHrefs.honeymoons },
  { label: 'Fall Weddings', image: '/dating/community/table-settings.png', href: weddingTopicHrefs.venues },
  { label: 'Luxury Weddings', image: images.venues, href: weddingTopicHrefs.venues },
];

const timeline = [
  { title: '12–18 Months Out', copy: 'What to do first', image: '/dating/community/dress-choice.png' },
  { title: '6–12 Months Out', copy: 'Booking your dream team', image: images.featuredGarden },
  { title: '3–6 Months Out', copy: 'Details that make it yours', image: images.decor },
  { title: 'The Final Countdown', copy: 'Last minute must-dos', image: images.michelle },
];

const popularTopics = [
  { label: 'Unique Wedding Venues', href: weddingTopicHrefs.venues, Icon: MapPin },
  { label: 'Asian Wedding Traditions', href: weddingTopicHrefs.traditions, Icon: Flower2 },
  { label: 'Bridal Fashion & Style', href: weddingTopicHrefs.fashion, Icon: Shirt },
  { label: 'Bride Beauty & Hair', href: weddingTopicHrefs.beauty, Icon: Sparkles },
  { label: 'Real Weddings', href: weddingTopicHrefs.realWeddings, Icon: Heart },
  { label: 'Wedding Planning Tips', href: weddingTopicHrefs.planning, Icon: BriefcaseBusiness },
  { label: 'Honeymoon Ideas', href: weddingTopicHrefs.honeymoons, Icon: Plane },
];

const gallery = [images.featuredGarden, images.planning, images.decor, images.venues, images.bouquetRibbon];

function money(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}

function pickBySlug<T extends { slug: string }>(items: T[], fallback: T) {
  return items.find((item) => item.slug === fallback.slug) ?? fallback;
}

function WeddingCommunity({ activity }: { activity: Activity[] }) {
  const posts = communityFallbacks.map((fallback) =>
    activity.find((item) => item.targetSlug === fallback.targetSlug) ?? fallback,
  );

  return (
    <section className="wedding-community-showcase" aria-labelledby="wedding-community-showcase-title">
      <div className="wedding-community-showcase__heading">
        <h2 id="wedding-community-showcase-title">From the community <ArrowRight /></h2>
      </div>
      <div className="wedding-community-showcase__grid">
        {posts.map((post, index) => {
          const fallback = communityFallbacks[index];
          const href = post._id ? `/activity/${post._id}` : '/activity';
          const image = post.media?.find((item) => item.type === 'image')?.url ?? fallback.media?.[0]?.url ?? '';
          return (
            <article key={post.targetSlug}>
              <Link href={href} className="wedding-community-showcase__image"><img src={image} alt="" /></Link>
              <small>{communityLabels[index]}</small>
              <h3><Link href={href}>{post.targetName || post.text}</Link></h3>
              <div className="wedding-community-showcase__meta">
                <span>A</span>
                <strong>admin</strong>
                <em><Heart />{fallback.likes || 0}</em>
              </div>
            </article>
          );
        })}
        <Link className="wedding-community-showcase__feature" href="/activity">
          <img src="/dating/community/bride-feature.png" alt="A bride standing in an elegant wedding reception room" />
        </Link>
      </div>

      <div className="wedding-inspiration-topics">
        <h2>Get inspired</h2>
        <div>
          {inspirationTopics.map((topic) => (
            <Link href={topic.href} key={topic.label}>
              <span><img src={topic.image} alt="" /></span>
              <strong>{topic.label}</strong>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function WeddingMagazineSection({ articles, products, activity }: { articles: Article[]; products: Product[]; activity: Activity[] }) {
  const [featuredImage, setFeaturedImage] = useState(0);
  const trendingRail = useRef<HTMLDivElement>(null);
  const featured = pickBySlug(articles, articleFallbacks[0]);
  const trending = articleFallbacks.slice(1).map((item) => pickBySlug(articles, item));
  const shop = productFallbacks.map((item) => pickBySlug(products, item));
  const featuredGallery = [featured.image, ...gallery.filter((image) => image !== featured.image)].slice(0, 5);

  function scrollTrending(direction: number) {
    const rail = trendingRail.current;
    if (!rail) return;
    const firstCard = rail.querySelector<HTMLElement>('article');
    const step = (firstCard?.offsetWidth ?? 320) + 10;
    rail.scrollBy({ left: direction * step, behavior: 'smooth' });
  }

  return (
    <section className="wedding-magazine" aria-label="Explore Asiance weddings">
      <div className="wedding-magazine__main">
        <section className="wedding-magazine__topics" aria-labelledby="wedding-topics-title">
          <div className="wedding-magazine__heading">
            <h2 id="wedding-topics-title">Explore Asiance Weddings</h2>
            <Link href={weddingTopicHrefs.planning}>Wedding planning timeline</Link>
          </div>
          <div className="wedding-magazine__topic-rail">
            {topics.map((topic) => (
              <Link href={topic.href} key={topic.label}>
                <span><img src={topic.image} alt="" /></span>
                <strong>{topic.label}</strong>
              </Link>
            ))}
          </div>
        </section>

        <div className="wedding-magazine__feature-row">
          <article className="wedding-magazine__featured">
            <p className="wedding-magazine__label">Featured wedding</p>
            <div className="wedding-magazine__featured-body">
              <Link href={`/blog/${featured.slug}`} className="wedding-magazine__featured-image">
                <img src={featuredGallery[featuredImage]} alt={`${featured.title} gallery view ${featuredImage + 1}`} />
              </Link>
              <div className="wedding-magazine__featured-copy">
                <span>Real wedding</span>
                <h2><Link href={`/blog/${featured.slug}`}>{featured.title}</Link></h2>
                <p>{featured.excerpt}</p>
                <Link href={`/blog/${featured.slug}`}>Read their story <ArrowRight /></Link>
              </div>
            </div>
            <div className="wedding-magazine__gallery" aria-label="Featured wedding gallery">
              {featuredGallery.map((image, index) => (
                <button type="button" className={featuredImage === index ? 'is-active' : ''} onClick={() => setFeaturedImage(index)} aria-label={`Show wedding image ${index + 1}`} aria-pressed={featuredImage === index} key={`${image}-${index}`}>
                  <img src={image} alt="" />
                </button>
              ))}
            </div>
          </article>

          <aside className="wedding-magazine__timeline" aria-labelledby="wedding-timeline-title">
            <h2 id="wedding-timeline-title">Wedding planning timeline</h2>
            <div>
              {timeline.map((step) => (
                <Link href={weddingTopicHrefs.planning} key={step.title}>
                  <img src={step.image} alt="" />
                  <span><strong>{step.title}</strong><small>{step.copy}</small></span>
                </Link>
              ))}
            </div>
            <Link className="wedding-magazine__text-link" href={weddingTopicHrefs.planning}>View full timeline <ArrowRight /></Link>
          </aside>
        </div>

        <section className="wedding-magazine__trending" aria-labelledby="wedding-trending-title">
          <div className="wedding-magazine__heading">
            <h2 id="wedding-trending-title">Trending now</h2>
            <Link href="/blog?category=Weddings">View all articles <ArrowRight /></Link>
          </div>
          <div className="wedding-magazine__rail-wrap">
            <button type="button" onClick={() => scrollTrending(-1)} aria-label="Previous wedding stories"><ChevronLeft /></button>
            <div className="wedding-magazine__article-rail" ref={trendingRail}>
              {trending.map((article, index) => (
                <article key={article.slug}>
                  <Link href={`/blog/${article.slug}`}><img src={article.image} alt="" /></Link>
                  <small>{['Planning', 'Fashion', 'Beauty', 'Inspiration', 'Honeymoons', 'Decor'][index]}</small>
                  <h3><Link href={`/blog/${article.slug}`}>{article.title}</Link></h3>
                </article>
              ))}
            </div>
            <button type="button" onClick={() => scrollTrending(1)} aria-label="Next wedding stories"><ChevronRight /></button>
          </div>
        </section>

        <section className="wedding-magazine__shop" aria-labelledby="wedding-shop-title">
          <div className="wedding-magazine__heading">
            <h2 id="wedding-shop-title">The Asiance Wedding Shop</h2>
            <Link href="/shop?category=wedding">Shop all <ArrowRight /></Link>
          </div>
          <div className="wedding-magazine__product-grid">
            {shop.map((product) => (
              <article key={product.slug}>
                <Link href={`/shop/${product.slug}`} className="wedding-magazine__product-image"><img src={product.image} alt={product.name} /></Link>
                <button type="button" aria-label={`Save ${product.name}`}><Heart /></button>
                <h3><Link href={`/shop/${product.slug}`}>{product.name}</Link></h3>
                <p>{money(product.salePrice ?? product.price)}</p>
              </article>
            ))}
          </div>
        </section>
      </div>

      <aside className="wedding-magazine__sidebar">
        <section className="wedding-magazine__community">
          <UsersRound aria-hidden="true" />
          <h2>Join the Asiance<br />Weddings Community</h2>
          <p>Connect with brides, vendors and real couples who get you.</p>
          <Link href="/circles/asiance-weddings-community">Join now</Link>
          <small>Already a member? <Link href="/login">Sign in</Link></small>
        </section>

        <section className="wedding-magazine__popular">
          <h2>Popular topics</h2>
          <div>
            {popularTopics.map(({ label, href, Icon }) => (
              <Link href={href} key={label}><Icon /><span>{label}</span><ArrowRight /></Link>
            ))}
          </div>
          <Link className="wedding-magazine__text-link" href="/blog?category=Weddings">View all topics <ArrowRight /></Link>
        </section>

        <section className="wedding-magazine__vendors">
          <h2>Find your dream team</h2>
          <p>Browse trusted vendors from our community.</p>
          <Link href="/members">Find vendors <ArrowRight /></Link>
          <img src="/dating/community/table-settings.png" alt="An elegant wedding reception table with flowers" />
        </section>
      </aside>

      <WeddingCommunity activity={activity} />
    </section>
  );
}
