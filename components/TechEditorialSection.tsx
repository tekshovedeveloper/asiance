'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  BrainCircuit,
  ChevronLeft,
  ChevronRight,
  Heart,
  LockKeyhole,
  MessageCircle,
  MessagesSquare,
  Rocket,
  Sparkles,
  UsersRound,
} from 'lucide-react';
import type { Activity, Article, Product } from '@/lib/types';

const topics = [
  { name: 'Phones', image: '/tech/topics/phones.png', tag: 'phones' },
  { name: 'Laptops', image: '/tech/topics/laptops.png', tag: 'laptops' },
  { name: 'Wearables', image: '/tech/topics/wearables.png', tag: 'wearables' },
  { name: 'Audio', image: '/tech/topics/audio.png', tag: 'audio' },
  { name: 'Gaming', image: '/tech/topics/gaming.png', tag: 'gaming' },
  { name: 'Cameras', image: '/tech/topics/cameras.png', tag: 'cameras' },
  { name: 'Accessories', image: '/tech/topics/accessories.png', tag: 'accessories' },
  { name: 'AI Tools', image: '/tech/topics/ai-tools.png', tag: 'ai' },
];

const articleFallbacks: Article[] = [
  {
    title: 'Samsung Galaxy Buds3 Pro Review: Perfectly Tuned',
    slug: 'samsung-galaxy-buds3-pro-review-perfectly-tuned',
    category: 'Technology',
    excerpt: 'We tested the new Galaxy Buds3 Pro for sound, comfort, and AI features. Here is everything you need to know.',
    content: '',
    image: '/tech/stories/galaxy-buds3-pro.png',
    authorName: 'Asiance Tech Editors',
    featured: true,
  },
  {
    title: 'How AI Is Transforming Healthcare',
    slug: 'how-ai-is-transforming-healthcare',
    category: 'Technology', excerpt: '', content: '', image: '/tech/topics/ai-tools.png', authorName: 'Asiance Tech Editors',
  },
  {
    title: 'MacBook Air M3 vs. M2: What’s New?',
    slug: 'macbook-air-m3-vs-m2-whats-new',
    category: 'Technology', excerpt: '', content: '', image: '/tech/topics/laptops.png', authorName: 'Asiance Tech Editors',
  },
  {
    title: '5 Productivity Apps That Actually Save Time',
    slug: 'five-productivity-apps-that-actually-save-time',
    category: 'Technology', excerpt: '', content: '', image: '/tech/topics/phones.png', authorName: 'Asiance Tech Editors',
  },
  {
    title: 'The Rise of Asian Americans in Tech',
    slug: 'rise-of-asian-americans-in-tech',
    category: 'Technology', excerpt: '', content: '', image: '/tech/stories/asian-founders.png', authorName: 'Asiance Tech Editors',
  },
];

const productFallbacks: Product[] = [
  { name: 'Samsung Galaxy Buds3 Pro', slug: 'samsung-galaxy-buds3-pro', category: 'Technology', categorySlug: 'technology', price: 249.99, image: '/tech/products/galaxy-buds3-pro-angle.png', images: ['/tech/products/galaxy-buds3-pro-angle.png', '/tech/products/galaxy-buds3-pro-macro.png', '/tech/products/galaxy-buds3-pro-top.png'], description: '' },
  { name: 'Apple AirPods Max', slug: 'apple-airpods-max', category: 'Technology', categorySlug: 'technology', price: 549, image: '/tech/products/airpods-max.jpg', description: '' },
  { name: 'iPad Air (M2)', slug: 'ipad-air-m2', category: 'Technology', categorySlug: 'technology', price: 599, image: '/tech/products/ipad-air-m2.jpg', description: '' },
  { name: 'Anker 737 Power Bank', slug: 'anker-737-power-bank', category: 'Technology', categorySlug: 'technology', price: 109.99, image: '/tech/products/anker-737.png', description: '' },
  { name: 'Logitech MX Master 3S', slug: 'logitech-mx-master-3s', category: 'Technology', categorySlug: 'technology', price: 99.99, image: '/tech/products/mx-master-3s.png', description: '' },
  { name: 'Sony WH-1000XM5', slug: 'sony-wh1000xm5', category: 'Technology', categorySlug: 'technology', price: 399.99, image: '/tech/products/sony-wh1000xm5.png', description: '' },
  { name: 'The Frame TV (55\")', slug: 'the-frame-tv-55', category: 'Technology', categorySlug: 'technology', price: 1299.99, image: '/tech/products/frame-tv.jpg', description: '' },
];

const popularTopics = [
  { label: 'AI & Machine Learning', tag: 'ai', Icon: BrainCircuit },
  { label: 'Tech for Families', tag: 'family-tech', Icon: UsersRound },
  { label: 'Gadgets We Love', tag: 'gadgets', Icon: Sparkles },
  { label: 'Software & Apps', tag: 'apps', Icon: MessagesSquare },
  { label: 'Asian Founders to Watch', tag: 'startups', Icon: Rocket },
  { label: 'Privacy & Security', tag: 'privacy', Icon: LockKeyhole },
];

const communityFallbacks: Activity[] = [
  { actorName: 'Asiance Admin', actorHandle: 'admin', type: 'post', text: 'Best laptop for college students?', targetName: 'Best laptop for college students?', targetSlug: 'tech-community-best-laptop', likes: 0, comments: 0, media: [{ type: 'image', url: '/tech/community/best-laptop-question.png' }] },
  { actorName: 'Asiance Admin', actorHandle: 'admin', type: 'post', text: 'My minimalist tech desk setup', targetName: 'My minimalist tech desk setup', targetSlug: 'tech-community-minimalist-desk', likes: 0, comments: 0, media: [{ type: 'image', url: '/tech/community/minimalist-desk-tip.png' }] },
  { actorName: 'Asiance Admin', actorHandle: 'admin', type: 'post', text: 'Finally switched to Android — here’s what I love', targetName: 'Finally switched to Android — here’s what I love', targetSlug: 'tech-community-android-switch', likes: 0, comments: 0, media: [{ type: 'image', url: '/tech/community/android-switch-post.png' }] },
  { actorName: 'Asiance Admin', actorHandle: 'admin', type: 'post', text: 'DJI Mini 4 Pro Review: Worth the upgrade!', targetName: 'DJI Mini 4 Pro Review: Worth the upgrade!', targetSlug: 'tech-community-drone-review', likes: 0, comments: 0, media: [{ type: 'image', url: '/tech/community/drone-review.png' }] },
  { actorName: 'Asiance Admin', actorHandle: 'admin', type: 'post', text: 'AI tools that help me run my small business', targetName: 'AI tools that help me run my small business', targetSlug: 'tech-community-ai-business', likes: 0, comments: 0, media: [{ type: 'image', url: '/tech/community/ai-small-business.png' }] },
];

const communityLabels = ['Question', 'Tip', 'Post', 'Review', 'Discussion'];

const dealFallbacks: Product[] = [
  { name: 'Apple Watch Series 9', slug: 'apple-watch-series-9-deal', category: 'Technology', categorySlug: 'technology', price: 399, salePrice: 299, badge: '25% off', image: '/tech/deals/apple-watch-series-9.png', description: '' },
  { name: 'Kindle Paperwhite', slug: 'kindle-paperwhite-deal', category: 'Technology', categorySlug: 'technology', price: 149, salePrice: 119, badge: '20% off', image: '/tech/deals/kindle-paperwhite.png', description: '' },
  { name: 'Echo Dot (5th Gen)', slug: 'echo-dot-5th-gen-deal', category: 'Technology', categorySlug: 'technology', price: 49.99, salePrice: 29.99, badge: '40% off', image: '/tech/deals/echo-dot-5.png', description: '' },
];

const techBrands = ['Apple', 'Samsung', 'Google', 'Sony', 'Microsoft', 'Anker', 'DJI', 'logitech', 'ASUS', 'OnePlus', 'belkin'];

function money(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

function pickBySlug<T extends { slug: string }>(items: T[], fallback: T) {
  return items.find((item) => item.slug === fallback.slug) ?? fallback;
}

export function TechEditorialSection({ articles, products, activity }: { articles: Article[]; products: Product[]; activity: Activity[] }) {
  const productRail = useRef<HTMLDivElement>(null);
  const [featuredImageIndex, setFeaturedImageIndex] = useState(0);
  const featured = pickBySlug(articles, articleFallbacks[0]);
  const topStories = articleFallbacks.slice(1).map((story) => pickBySlug(articles, story));
  const shopProducts = productFallbacks.map((product) => pickBySlug(products, product));
  const communityPosts = communityFallbacks.map((fallback) =>
    activity.find((item) => item.targetSlug === fallback.targetSlug) ?? fallback,
  );
  const dealProducts = dealFallbacks.map((product) => pickBySlug(products, product));
  const featuredImages = [
    featured.image,
    '/tech/products/galaxy-buds3-pro-angle.png',
    '/tech/products/galaxy-buds3-pro-macro.png',
    '/tech/products/galaxy-buds3-pro-top.png',
  ];

  function scrollProducts(direction: number) {
    productRail.current?.scrollBy({ left: direction * 420, behavior: 'smooth' });
  }

  return (
    <section className="tech-editorial" aria-label="Explore Asiance technology">
      <div className="tech-editorial__grid">
        <div className="tech-editorial__main">
          <section className="tech-topics" aria-labelledby="tech-topics-title">
            <h2 id="tech-topics-title">Explore tech topics</h2>
            <div className="tech-topics__rail">
              {topics.map((topic) => (
                <Link href={`/blog?category=technology&tag=${topic.tag}`} key={topic.name}>
                  <span className="tech-topics__image"><img src={topic.image} alt="" /></span>
                  <span>{topic.name}</span>
                </Link>
              ))}
            </div>
          </section>

          <div className="tech-story-grid">
            <article className="tech-featured-story">
              <p className="tech-section-label">Featured story</p>
              <div className="tech-featured-story__body">
                <Link className="tech-featured-story__image" href={`/blog/${featured.slug}`}>
                  <img src={featuredImages[featuredImageIndex]} alt={`${featured.title} view ${featuredImageIndex + 1}`} />
                </Link>
                <div className="tech-featured-story__copy">
                  <span>Featured story</span>
                  <h2><Link href={`/blog/${featured.slug}`}>{featured.title}</Link></h2>
                  <p>{featured.excerpt}</p>
                  <Link className="tech-text-link" href={`/blog/${featured.slug}`}>Read the review <ArrowRight /></Link>
                </div>
              </div>
              <div className="tech-featured-story__gallery" aria-label="Featured story gallery">
                {featuredImages.map((image, index) => (
                  <button
                    className={featuredImageIndex === index ? 'is-active' : ''}
                    type="button"
                    onClick={() => setFeaturedImageIndex(index)}
                    aria-label={`Show Galaxy Buds3 Pro image ${index + 1}`}
                    aria-pressed={featuredImageIndex === index}
                    key={image}
                  >
                    <img src={image} alt="" />
                  </button>
                ))}
              </div>
            </article>

            <aside className="tech-top-stories" aria-labelledby="top-stories-title">
              <h2 id="top-stories-title">Top stories</h2>
              <div className="tech-top-stories__list">
                {topStories.map((story) => (
                  <Link href={`/blog/${story.slug}`} key={story.slug}>
                    <span className="tech-top-stories__image"><img src={story.image} alt="" /></span>
                    <span>{story.title}</span>
                  </Link>
                ))}
              </div>
              <Link className="tech-text-link" href="/blog?category=technology">View all news <ArrowRight /></Link>
            </aside>
          </div>

          <section className="tech-shop" aria-labelledby="tech-shop-title">
            <div className="tech-shop__heading">
              <h2 id="tech-shop-title">The Asiance tech shop</h2>
              <Link href="/shop?category=technology">Shop all <ArrowRight /></Link>
            </div>
            <div className="tech-shop__viewport">
              <button className="tech-shop__arrow tech-shop__arrow--left" type="button" onClick={() => scrollProducts(-1)} aria-label="Previous products"><ChevronLeft /></button>
              <div className="tech-shop__rail" ref={productRail}>
                {shopProducts.map((product) => (
                  <article className="tech-product-card" key={product.slug}>
                    <Link className="tech-product-card__image" href={`/shop/${product.slug}`}>
                      <img src={product.image} alt={product.name} />
                    </Link>
                    <button type="button" aria-label={`Save ${product.name}`}><Heart /></button>
                    <h3><Link href={`/shop/${product.slug}`}>{product.name}</Link></h3>
                    <p>{money(product.salePrice ?? product.price)}</p>
                  </article>
                ))}
              </div>
              <button className="tech-shop__arrow tech-shop__arrow--right" type="button" onClick={() => scrollProducts(1)} aria-label="Next products"><ChevronRight /></button>
            </div>
          </section>
        </div>

        <aside className="tech-editorial__aside">
          <section className="tech-community-card">
            <UsersRound aria-hidden="true" />
            <h2>Join the Asiance<br />tech community</h2>
            <p>Connect with tech lovers, share recommendations, ask questions, and stay up to date.</p>
            <Link href="/circles">Join now</Link>
            <small>Already a member? <Link href="/login">Sign in</Link></small>
          </section>

          <section className="tech-popular-topics">
            <h2>Popular topics</h2>
            <div>
              {popularTopics.map(({ label, tag, Icon }) => (
                <Link href={`/blog?category=technology&tag=${tag}`} key={label}>
                  <Icon aria-hidden="true" />
                  <span>{label}</span>
                  <ArrowRight aria-hidden="true" />
                </Link>
              ))}
            </div>
            <Link className="tech-text-link" href="/blog?category=technology">View all topics <ArrowRight /></Link>
          </section>
        </aside>
      </div>

      <div className="tech-community-deals">
        <section className="tech-community-feed" aria-labelledby="tech-community-feed-title">
          <div className="tech-community-deals__heading">
            <h2 id="tech-community-feed-title">From the community</h2>
            <Link href="/activity">View all posts <ArrowRight /></Link>
          </div>
          <div className="tech-community-feed__grid">
            {communityPosts.map((post, index) => {
              const href = post._id ? `/activity/${post._id}` : '/activity';
              const image = post.media?.find((media) => media.type === 'image')?.url ?? communityFallbacks[index].media?.[0]?.url ?? '';
              return (
                <article className="tech-community-post" key={post.targetSlug}>
                  <Link className="tech-community-post__image" href={href}><img src={image} alt="" /></Link>
                  <div className="tech-community-post__body">
                    <span>{communityLabels[index]}</span>
                    <h3><Link href={href}>{post.targetName || post.text}</Link></h3>
                    <div className="tech-community-post__meta">
                      <span className="tech-community-post__avatar">{post.actorName.charAt(0)}</span>
                      <strong>{post.actorName}</strong>
                      <span><Heart aria-hidden="true" />{post.likes ?? 0}</span>
                      <span><MessageCircle aria-hidden="true" />{post.comments ?? 0}</span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <aside className="tech-deals" aria-labelledby="tech-deals-title">
          <div className="tech-community-deals__heading">
            <h2 id="tech-deals-title">Top tech deals</h2>
            <Link href="/shop?category=technology">View all deals <ArrowRight /></Link>
          </div>
          <div className="tech-deals__list">
            {dealProducts.map((product) => (
              <Link href={`/shop/${product.slug}`} key={product.slug}>
                <span className="tech-deals__image"><img src={product.image} alt="" /></span>
                <span className="tech-deals__copy">
                  <strong>{product.name}</strong>
                  <small>
                    <b>{money(product.salePrice ?? product.price)}</b>
                    {product.salePrice ? <del>{money(product.price)}</del> : null}
                    {product.badge ? <em>{product.badge}</em> : null}
                  </small>
                </span>
              </Link>
            ))}
          </div>
        </aside>
      </div>

      <section className="tech-brands" aria-labelledby="tech-brands-title">
        <div className="tech-brands__heading">
          <h2 id="tech-brands-title">Brands we love</h2>
        </div>
        <div className="tech-brands__viewport">
          <div className="tech-brands__track">
            {[0, 1].map((group) => (
              <div className="tech-brands__group" aria-hidden={group === 1} key={group}>
                {techBrands.map((brand) => <span data-brand={brand.toLowerCase()} key={`${group}-${brand}`}>{brand}</span>)}
              </div>
            ))}
          </div>
        </div>
      </section>
    </section>
  );
}
