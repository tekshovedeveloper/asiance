'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import type { Activity, Article, Product } from '@/lib/types';

type Props = {
  articles: Article[];
  products: Product[];
  beautyProducts: Product[];
  activity: Activity[];
};

const beautyFallbacks: Article[] = [
  { title: 'Glass Skin Essentials', slug: 'glass-skin-essentials', category: 'Fashion and Beauty', excerpt: '', content: '', image: '/beauty/highlights/glass-skin-essentials.png', authorName: 'Asiance Beauty Editors' },
  { title: 'Soft Glam Guide', slug: 'soft-glam-guide', category: 'Fashion and Beauty', excerpt: '', content: '', image: '/beauty/highlights/soft-glam-guide.png', authorName: 'Asiance Beauty Editors' },
  { title: 'Heatless Hair Ideas', slug: 'heatless-hair-ideas', category: 'Fashion and Beauty', excerpt: '', content: '', image: '/beauty/highlights/heatless-hair-ideas.png', authorName: 'Asiance Beauty Editors' },
  { title: 'Self-Care Favorites', slug: 'self-care-favorites', category: 'Fashion and Beauty', excerpt: '', content: '', image: '/beauty/highlights/self-care-favorites.png', authorName: 'Asiance Beauty Editors' },
];

const fashionFallbacks: Article[] = [
  { title: 'Summer Essentials', slug: 'summer-essentials', category: 'Fashion and Beauty', excerpt: '', content: '', image: 'https://res.cloudinary.com/ux81wsbq/image/upload/v1788528504/asiance/uploads/summer-essentials_zu4wqj.png', authorName: 'Asiance Editors' },
  { title: 'Workwear Refresh', slug: 'workwear-refresh', category: 'Fashion and Beauty', excerpt: '', content: '', image: 'https://res.cloudinary.com/ux81wsbq/image/upload/v1788528505/asiance/uploads/workwear-refresh_lv8x6d.png', authorName: 'Asiance Editors' },
  { title: 'Accessories That Elevate', slug: 'accessories-that-elevate', category: 'Fashion and Beauty', excerpt: '', content: '', image: 'https://res.cloudinary.com/ux81wsbq/image/upload/v1788528508/asiance/uploads/accessories-elevate_vb8mzm.png', authorName: 'Asiance Editors' },
  { title: 'Real Style. Real Stories.', slug: 'real-style-real-stories', category: 'Fashion and Beauty', excerpt: '', content: '', image: 'https://res.cloudinary.com/ux81wsbq/image/upload/v1788528501/asiance/uploads/real-style-stories_suzsan.png', authorName: 'Asiance Editors' },
];

const productFallbacks: Product[] = [
  { name: 'Halter Knit Top', slug: 'halter-knit-top', category: 'Fashion', categorySlug: 'fashion', price: 68, image: '/beauty/products/halter-knit-top.png', description: '' },
  { name: 'Satin Slip Dress', slug: 'satin-slip-dress', category: 'Fashion', categorySlug: 'fashion', price: 89, image: '/beauty/products/satin-slip-dress.png', description: '' },
  { name: 'Linen Blazer', slug: 'linen-blazer', category: 'Fashion', categorySlug: 'fashion', price: 128, image: 'https://res.cloudinary.com/ux81wsbq/image/upload/v1788528505/asiance/uploads/linen-blazer_v0keni.png', description: '' },
  { name: 'Ribbed Tank Top', slug: 'ribbed-tank-top', category: 'Fashion', categorySlug: 'fashion', price: 42, image: 'https://res.cloudinary.com/ux81wsbq/image/upload/v1788528506/asiance/uploads/ribbed-tank-top_yv9qeg.png', description: '' },
  { name: 'Leather Shoulder Bag', slug: 'leather-shoulder-bag', category: 'Fashion', categorySlug: 'fashion', price: 78, image: 'https://res.cloudinary.com/ux81wsbq/image/upload/v1788528498/asiance/uploads/leather-shoulder-bag_cakjlm.png', description: '' },
  { name: 'Strappy Heeled Sandal', slug: 'strappy-heeled-sandal', category: 'Fashion', categorySlug: 'fashion', price: 88, image: 'https://res.cloudinary.com/ux81wsbq/image/upload/v1788528499/asiance/uploads/strappy-heeled-sandal_x0vbgw.png', description: '' },
  { name: 'Floral Maxi Dress', slug: 'floral-maxi-dress', category: 'Fashion', categorySlug: 'fashion', price: 168, image: 'https://res.cloudinary.com/ux81wsbq/image/upload/v1788528506/asiance/uploads/floral-maxi-dress_rumbmn.png', description: '' },
];

const trendingProductFallbacks: Product[] = [
  { name: 'Heartleaf Balancing Toner', slug: 'heartleaf-balancing-toner', category: 'Beauty', categorySlug: 'beauty', price: 26, image: '/beauty/trending/heartleaf-balancing-toner.png', description: '' },
  { name: 'Snail Mucin Dew Essence', slug: 'snail-mucin-dew-essence', category: 'Beauty', categorySlug: 'beauty', price: 32, image: '/beauty/trending/snail-mucin-dew-essence.png', description: '' },
  { name: 'Dew Lip Glow Duo', slug: 'dew-lip-glow-duo', category: 'Beauty', categorySlug: 'beauty', price: 36, image: '/beauty/trending/dew-lip-glow-duo.png', description: '' },
  { name: 'Cloud Milk Toner', slug: 'cloud-milk-toner', category: 'Beauty', categorySlug: 'beauty', price: 34, image: '/beauty/trending/cloud-milk-toner.png', description: '' },
];

const trendingProductImages: Record<string, string> = Object.fromEntries(
  trendingProductFallbacks.map((product) => [product.slug, product.image]),
);

const communityFallbacks: Activity[] = [
  { actorName: 'Asiance Admin', actorHandle: 'admin', type: 'post', text: 'My 10-Step Nighttime Routine for Glass Skin', targetName: 'My 10-Step Nighttime Routine for Glass Skin', targetSlug: 'beauty-community-nighttime-routine', likes: 0, comments: 0, media: [{ type: 'image', url: '/beauty/highlights/glass-skin-essentials.png' }] },
  { actorName: 'Asiance Admin', actorHandle: 'admin', type: 'post', text: '5 Everyday Makeup Looks We Love', targetName: '5 Everyday Makeup Looks We Love', targetSlug: 'beauty-community-makeup-looks', likes: 0, comments: 0, media: [{ type: 'image', url: '/beauty/highlights/soft-glam-guide.png' }] },
  { actorName: 'Asiance Admin', actorHandle: 'admin', type: 'post', text: 'How I Keep My Hair Healthy & Shiny', targetName: 'How I Keep My Hair Healthy & Shiny', targetSlug: 'beauty-community-healthy-hair', likes: 0, comments: 0, media: [{ type: 'image', url: '/beauty/highlights/heatless-hair-ideas.png' }] },
];

const beautyLabels = ['Skincare', 'Makeup', 'Hair', 'Wellness'];
const beautyActions = ['Shop now', 'Read more', 'Read more', 'Shop now'];
const fashionLabels = ['Trending now', 'Style guide', 'The edit', 'Community'];
const fashionActions = ['Shop now', 'Read more', 'Shop now', 'See more'];

function orderedBySlug<T extends { slug: string }>(items: T[], fallbacks: T[]) {
  return fallbacks.map((fallback) => items.find((item) => item.slug === fallback.slug) ?? fallback);
}

function HighlightCard({ article, label, action }: { article: Article; label: string; action: string }) {
  return (
    <Link className="beauty-highlight-card" href={`/blog/${article.slug}`}>
      <img src={article.image} alt="" />
      <span className="beauty-highlight-card__shade" aria-hidden="true" />
      <span className="beauty-highlight-card__copy">
        <small>{label}</small>
        <strong>{article.title}</strong>
        <span>{action} <ArrowRight aria-hidden="true" /></span>
      </span>
    </Link>
  );
}

export function BeautyEditorialSection({ articles, products, beautyProducts, activity }: Props) {
  const productRail = useRef<HTMLDivElement>(null);
  const beautyStories = orderedBySlug(articles, beautyFallbacks);
  const fashionStories = orderedBySlug(articles, fashionFallbacks);
  const shopProducts = orderedBySlug(products, productFallbacks);
  const trendingProducts = orderedBySlug(beautyProducts, trendingProductFallbacks);
  const communityPosts = communityFallbacks.map((fallback) =>
    activity.find((item) => item.targetSlug === fallback.targetSlug) ?? fallback,
  );

  function scrollProducts(direction: number) {
    productRail.current?.scrollBy({ left: direction * Math.max(260, productRail.current.clientWidth * 0.72), behavior: 'smooth' });
  }

  return (
    <section className="beauty-editorial" aria-label="Beauty and fashion highlights">
      <div className="beauty-highlight-columns">
        <section className="beauty-highlight-section" aria-labelledby="beauty-highlights-title">
          <div className="beauty-editorial-heading">
            <h2 id="beauty-highlights-title">Beauty highlights</h2>
            <Link href="/blog?category=Fashion%20and%20Beauty&tag=beauty">View all <ArrowRight /></Link>
          </div>
          <div className="beauty-highlight-grid">
            {beautyStories.map((article, index) => (
              <HighlightCard article={article} label={beautyLabels[index]} action={beautyActions[index]} key={article.slug} />
            ))}
          </div>
        </section>

        <section className="beauty-highlight-section" aria-labelledby="fashion-highlights-title">
          <div className="beauty-editorial-heading">
            <h2 id="fashion-highlights-title">Fashion highlights</h2>
            <Link href="/blog?category=fashion">View all <ArrowRight /></Link>
          </div>
          <div className="beauty-highlight-grid">
            {fashionStories.map((article, index) => (
              <HighlightCard article={article} label={fashionLabels[index]} action={fashionActions[index]} key={article.slug} />
            ))}
          </div>
        </section>
      </div>

      <div className="beauty-shop-row">
        <section className="beauty-shop-look" aria-labelledby="beauty-shop-look-title">
          <div className="beauty-editorial-heading">
            <h2 id="beauty-shop-look-title">Shop the look</h2>
            <Link href="/shop?category=fashion">View all <ArrowRight /></Link>
          </div>
          <div className="beauty-product-wrap">
            <button className="beauty-product-arrow beauty-product-arrow--left" type="button" onClick={() => scrollProducts(-1)} aria-label="Previous products"><ArrowLeft /></button>
            <div className="beauty-product-rail" ref={productRail}>
              {shopProducts.map((product) => (
                <Link className="beauty-product-card" href={`/shop/${product.slug}`} key={product.slug}>
                  <span><img src={product.image} alt={product.name} /></span>
                  <strong>{product.name}</strong>
                  <small>${Number(product.price).toFixed(product.price % 1 ? 2 : 0)}</small>
                </Link>
              ))}
            </div>
            <button className="beauty-product-arrow beauty-product-arrow--right" type="button" onClick={() => scrollProducts(1)} aria-label="Next products"><ArrowRight /></button>
          </div>
        </section>

        <Link className="beauty-editors-pick" href="/blog/summer-glow-essentials">
          <span className="beauty-editors-pick__copy">
            <small>Editor’s pick</small>
            <strong>Summer Glow<br />Essentials</strong>
            <span>Our must-have products for sun-kissed, healthy skin all season long.</span>
            <b>Read the guide <ArrowRight /></b>
          </span>
          <img src="/beauty/bundle/beauty-bundle.png" alt="Curated pink and cream beauty products" />
        </Link>
      </div>

      <div className="beauty-discover-row">
        <section className="beauty-trending-products" aria-labelledby="beauty-trending-products-title">
          <div className="beauty-editorial-heading">
            <h2 id="beauty-trending-products-title">Trending now</h2>
            <Link href="/shop?category=beauty">View all <ArrowRight /></Link>
          </div>
          <div className="beauty-trending-products__grid">
            {trendingProducts.map((product) => (
              <Link href={`/shop/${product.slug}`} key={product.slug}>
                <span><img src={trendingProductImages[product.slug] ?? product.image} alt={product.name} /></span>
                <strong>{product.name}</strong>
                <small>${Number(product.price).toFixed(product.price % 1 ? 2 : 0)}</small>
              </Link>
            ))}
          </div>
        </section>

        <section className="beauty-community" aria-labelledby="beauty-community-title">
          <div className="beauty-editorial-heading">
            <h2 id="beauty-community-title">From the community</h2>
            <Link href="/activity">View all <ArrowRight /></Link>
          </div>
          <div className="beauty-community__grid">
            {communityPosts.map((post, index) => {
              const href = post._id ? `/activity/${post._id}` : '/activity';
              const image = post.media?.find((item) => item.type === 'image')?.url ?? communityFallbacks[index].media?.[0]?.url ?? '';
              return (
                <Link href={href} key={post.targetSlug}>
                  <span className="beauty-community__image"><img src={image} alt="" /></span>
                  <small>{['Skincare', 'Makeup', 'Hair'][index]}</small>
                  <strong>{post.targetName || post.text}</strong>
                  <span className="beauty-community__author">By @{post.actorHandle}</span>
                </Link>
              );
            })}
          </div>
        </section>

        <Link className="beauty-bundle-card" href="/shop/the-asiance-beauty-bundle">
          <img src="/beauty/bundle/beauty-bundle.png" alt="The Asiance Beauty Bundle with curated beauty products" />
          <span className="beauty-bundle-card__shade" aria-hidden="true" />
          <span className="beauty-bundle-card__copy">
            <small>Discover. Try. Love.</small>
            <strong>The ASIANCE<br />Beauty Bundle</strong>
            <span>Curated beauty samples delivered bi-monthly. Try new. Love more.</span>
            <b>Learn more <ArrowRight /></b>
          </span>
        </Link>
      </div>
    </section>
  );
}
