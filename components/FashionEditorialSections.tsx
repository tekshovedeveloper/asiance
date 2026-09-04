'use client';

import { useRef, type RefObject } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import type { Article, Member, Product } from '@/lib/types';

type Props = {
  articles: Article[];
  products: Product[];
  members: Member[];
};

const latestMeta = [
  ['Trending now', 'Shop now'],
  ['Style guide', 'Read more'],
  ['The edit', 'Shop now'],
  ['Community', 'See more'],
  ['Runway report', 'Discover'],
];

const latestSlugs = [
  'summer-essentials',
  'workwear-refresh',
  'accessories-that-elevate',
  'real-style-real-stories',
  'nyfw-top-shows',
];

const fallbackLatest: Article[] = [
  ['Summer Essentials', 'summer-essentials', 'https://res.cloudinary.com/ux81wsbq/image/upload/v1788528504/asiance/uploads/summer-essentials_zu4wqj.png'],
  ['Workwear Refresh', 'workwear-refresh', 'https://res.cloudinary.com/ux81wsbq/image/upload/v1788528505/asiance/uploads/workwear-refresh_lv8x6d.png'],
  ['Accessories That Elevate', 'accessories-that-elevate', 'https://res.cloudinary.com/ux81wsbq/image/upload/v1788528508/asiance/uploads/accessories-elevate_vb8mzm.png'],
  ['Real Style. Real Stories.', 'real-style-real-stories', 'https://res.cloudinary.com/ux81wsbq/image/upload/v1788528501/asiance/uploads/real-style-stories_suzsan.png'],
  ['NYFW: Top Shows', 'nyfw-top-shows', 'https://res.cloudinary.com/ux81wsbq/image/upload/v1788528504/asiance/uploads/nyfw-top-shows_p7rtak.png'],
].map(([title, slug, image]) => ({
  title,
  slug,
  image,
  category: 'Fashion and Beauty',
  excerpt: '',
  content: '',
  authorName: 'Asiance Editors',
  status: 'published',
}));

const fallbackProducts: Product[] = [
  ['Floral Maxi Dress', 'floral-maxi-dress', 168, 'https://res.cloudinary.com/ux81wsbq/image/upload/v1788528506/asiance/uploads/floral-maxi-dress_rumbmn.png'],
  ['Linen Blazer', 'linen-blazer', 128, 'https://res.cloudinary.com/ux81wsbq/image/upload/v1788528505/asiance/uploads/linen-blazer_v0keni.png'],
  ['Ribbed Tank Top', 'ribbed-tank-top', 42, 'https://res.cloudinary.com/ux81wsbq/image/upload/v1788528506/asiance/uploads/ribbed-tank-top_yv9qeg.png'],
  ['Leather Shoulder Bag', 'leather-shoulder-bag', 78, 'https://res.cloudinary.com/ux81wsbq/image/upload/v1788528498/asiance/uploads/leather-shoulder-bag_cakjlm.png'],
  ['Strappy Heeled Sandal', 'strappy-heeled-sandal', 88, 'https://res.cloudinary.com/ux81wsbq/image/upload/v1788528499/asiance/uploads/strappy-heeled-sandal_x0vbgw.png'],
].map(([name, slug, price, image]) => ({
  name: String(name),
  slug: String(slug),
  price: Number(price),
  image: String(image),
  category: 'Fashion',
  categorySlug: 'fashion',
  description: '',
}));

const communityFallback = [
  { title: 'My 10-Step Nighttime Routine', label: 'Skincare', image: '/fashion/summer-essentials.png' },
  { title: 'NYC Summer Street Style', label: 'Street style', image: '/fashion/workwear-refresh.png' },
  { title: 'Heatless Waves That Last', label: 'Hair', image: '/fashion/real-style-stories.png' },
];

function orderedBySlug<T extends { slug: string }>(items: T[], slugs: string[], fallback: T[]) {
  return slugs.map((slug, index) => items.find((item) => item.slug === slug) ?? fallback[index]);
}

function RailButtons({ onPrevious, onNext, label }: { onPrevious: () => void; onNext: () => void; label: string }) {
  return (
    <div className="fashion-carousel-buttons" aria-label={`${label} carousel controls`}>
      <button type="button" onClick={onPrevious} aria-label={`Previous ${label}`} title={`Previous ${label}`}>
        <ArrowLeft size={14} aria-hidden="true" />
      </button>
      <button type="button" onClick={onNext} aria-label={`Next ${label}`} title={`Next ${label}`}>
        <ArrowRight size={14} aria-hidden="true" />
      </button>
    </div>
  );
}

export function FashionEditorialSections({ articles, products, members }: Props) {
  const productRail = useRef<HTMLDivElement>(null);
  const inspirationRail = useRef<HTMLDivElement>(null);
  const latest = orderedBySlug(articles, latestSlugs, fallbackLatest);
  const shopProducts = orderedBySlug(products, fallbackProducts.map((item) => item.slug), fallbackProducts);
  const spotlightMembers = members.filter((member) => member.avatar).slice(0, 5);
  const community = latest.slice(0, 4).map((article, index) => ({
    title: article.title,
    image: article.image,
    label: ['Summer style', 'Workwear', 'Accessories', 'Community'][index],
  }));
  const scroll = (ref: RefObject<HTMLDivElement | null>, direction: number) => {
    ref.current?.scrollBy({ left: direction * Math.max(220, ref.current.clientWidth * 0.7), behavior: 'smooth' });
  };

  return (
    <div className="fashion-editorial">
      <section className="fashion-section fashion-latest" aria-labelledby="fashion-latest-title">
        <div className="fashion-section__heading">
          <h2 id="fashion-latest-title">The Latest</h2>
          <Link href="/blog?category=fashion">View all <ArrowRight size={14} aria-hidden="true" /></Link>
        </div>
        <div className="fashion-latest__grid">
          {latest.map((article, index) => (
            <Link className="fashion-story-card" href={`/blog/${article.slug}`} key={article.slug}>
              <img src={article.image} alt="" />
              <span className="fashion-story-card__shade" aria-hidden="true" />
              <span className="fashion-story-card__copy">
                <small>{latestMeta[index][0]}</small>
                <strong>{article.title}</strong>
                <span>{latestMeta[index][1]} <ArrowRight size={13} aria-hidden="true" /></span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <div className="fashion-split-row">
        <section className="fashion-section fashion-shop" aria-labelledby="fashion-shop-title">
          <div className="fashion-section__heading">
            <h2 id="fashion-shop-title">Shop the Look</h2>
            <Link href="/shop?category=fashion">View all <ArrowRight size={14} aria-hidden="true" /></Link>
          </div>
          <div className="fashion-product-wrap">
            <RailButtons label="products" onPrevious={() => scroll(productRail, -1)} onNext={() => scroll(productRail, 1)} />
            <div className="fashion-product-rail" ref={productRail}>
              {shopProducts.map((product) => (
                <Link href={`/shop/${product.slug}`} className="fashion-product" key={product.slug}>
                  <img src={product.image} alt={product.name} />
                  <strong>{product.name}</strong>
                  <span>${product.price}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
        <Link href="/shop?category=fashion" className="fashion-promo fashion-promo--coquette">
          <img src="https://res.cloudinary.com/ux81wsbq/image/upload/v1788528494/asiance/uploads/coquette-summer_lgepy2.png" alt="Pink bow shoulder bag arranged with cherry blossoms" />
          <span className="fashion-promo__copy">
            <small>Editor's pick</small>
            <strong>Coquette<br />Summer</strong>
            <span>Romantic details, soft textures, and pieces we love right now.</span>
            <b>Shop the edit <ArrowRight size={14} aria-hidden="true" /></b>
          </span>
        </Link>
      </div>

      <div className="fashion-split-row fashion-split-row--third">
        <section className="fashion-section fashion-trending" aria-labelledby="fashion-trending-title">
          <div className="fashion-section__heading">
            <h2 id="fashion-trending-title">Trending Now</h2>
            <Link href="/shop?category=beauty">View all <ArrowRight size={14} aria-hidden="true" /></Link>
          </div>
          <div className="fashion-mini-products">
            {shopProducts.slice(0, 4).map((product) => (
              <Link href={`/shop/${product.slug}`} key={product.slug}>
                <img src={product.image} alt={product.name} />
                <strong>{product.name}</strong>
                <span>${product.price}</span>
              </Link>
            ))}
          </div>
        </section>
        <section className="fashion-section fashion-community" aria-labelledby="fashion-community-title">
          <div className="fashion-section__heading">
            <h2 id="fashion-community-title">From the Community</h2>
            <Link href="/activity">View all <ArrowRight size={14} aria-hidden="true" /></Link>
          </div>
          <div className="fashion-community__grid">
            {(community.length ? community.slice(0, 3) : communityFallback).map((item) => (
              <article key={item.title}>
                <img src={item.image} alt="" />
                <small>{item.label}</small>
                <strong>{item.title}</strong>
                <span>By @asiance</span>
              </article>
            ))}
          </div>
        </section>
        <Link href="/register" className="fashion-promo fashion-promo--beauty">
          <img src="https://res.cloudinary.com/ux81wsbq/image/upload/v1788528505/asiance/uploads/beauty-bundle_havt9z.png" alt="Asiance beauty bundle with curated skincare products" />
          <span className="fashion-promo__copy">
            <small>Discover. Try. Love.</small>
            <strong>The ASIANCE<br />Beauty Bundle</strong>
            <span>Curated beauty samples delivered bi-monthly. Try new. Love more.</span>
            <b>Learn more <ArrowRight size={14} aria-hidden="true" /></b>
          </span>
        </Link>
      </div>

      <div className="fashion-bottom-row">
        <section className="fashion-section fashion-spotlight" aria-labelledby="fashion-spotlight-title">
          <div className="fashion-section__heading">
            <h2 id="fashion-spotlight-title">Style Spotlight</h2>
            <Link href="/members">View all members <ArrowRight size={14} aria-hidden="true" /></Link>
          </div>
          <div className="fashion-spotlight__grid">
            {(spotlightMembers.length ? spotlightMembers : members.slice(0, 5)).map((member) => (
              <Link href={`/members/${member.handle}`} key={member.handle}>
                <img src={member.avatar || '/assets/profile/dummy-profile.png'} alt={member.name} />
                <strong>{member.name}</strong>
              </Link>
            ))}
          </div>
        </section>
        <section className="fashion-section fashion-inspiration" aria-labelledby="fashion-inspiration-title">
          <div className="fashion-section__heading">
            <h2 id="fashion-inspiration-title">Community Style</h2>
            <Link href="/blog?category=fashion">View all <ArrowRight size={14} aria-hidden="true" /></Link>
          </div>
          <div className="fashion-inspiration__wrap">
            <RailButtons label="fashion inspiration" onPrevious={() => scroll(inspirationRail, -1)} onNext={() => scroll(inspirationRail, 1)} />
            <div className="fashion-inspiration__rail" ref={inspirationRail}>
              {latest.slice(0, 4).map((article) => (
                <Link href={`/blog/${article.slug}`} key={article.slug} aria-label={article.title}>
                  <img src={article.image} alt="" />
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
