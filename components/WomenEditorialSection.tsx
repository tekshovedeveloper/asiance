import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowRight,
  Baby,
  ChevronRight,
  Flame,
  Gem,
  Heart,
  HeartHandshake,
  Plane,
  Shirt,
  UsersRound,
} from 'lucide-react';
import { cloudinaryImageUrl } from '@/lib/cloudinary';
import type { Activity, Article } from '@/lib/types';

type WomenEditorialSectionProps = {
  articles: Article[];
  activity: Activity[];
};

type WomenDestination = {
  label: string;
  copy: string;
  href: string;
  Icon: LucideIcon;
};

const womenDestinations: WomenDestination[] = [
  {
    label: 'Fashion',
    copy: 'Designer stories, beauty notes, and style inspiration',
    href: '/fashion',
    Icon: Shirt,
  },
  {
    label: 'Dating',
    copy: 'Find love and build meaningful connections',
    href: '/love',
    Icon: HeartHandshake,
  },
  {
    label: 'Weddings',
    copy: 'Planning tips and beautiful real weddings',
    href: '/wedding',
    Icon: Gem,
  },
  {
    label: 'Baby',
    copy: 'Pregnancy, baby care, and mom life',
    href: '/baby',
    Icon: Baby,
  },
  {
    label: 'Kids',
    copy: 'Raising happy, confident kids',
    href: '/kids',
    Icon: UsersRound,
  },
  {
    label: 'Travel',
    copy: 'Destinations and tips for every adventure',
    href: '/travel',
    Icon: Plane,
  },
];

const articleFallbacks: Record<string, Article> = {
  'five-minute-skin-reset-humid-mornings': {
    title: 'A Five-Minute Skin Reset for Humid Summer Mornings',
    slug: 'five-minute-skin-reset-humid-mornings',
    category: 'Fashion & Beauty',
    excerpt: 'A lighter morning ritual for warm, humid days.',
    content: '',
    image: 'https://res.cloudinary.com/ux81wsbq/image/upload/v1786640139/asiance/site-assets/articles/summer-skin-reset-png.png',
    authorName: 'Asiance Editors',
  },
  'make-room-for-better-conversations': {
    title: 'How to Make Room for Better Conversations',
    slug: 'make-room-for-better-conversations',
    category: 'Relationships',
    excerpt: 'Simple habits that help both people feel heard.',
    content: '',
    image: 'https://res.cloudinary.com/ux81wsbq/image/upload/v1786640139/asiance/site-assets/articles/better-conversations-png.png',
    authorName: 'Sophie Tran',
  },
  'intimate-garden-wedding-that-feels-like-you': {
    title: 'How to Plan an Intimate Garden Wedding That Feels Like You',
    slug: 'intimate-garden-wedding-that-feels-like-you',
    category: 'Weddings',
    excerpt: 'A thoughtful celebration with meaningful details and room to breathe.',
    content: '',
    image: 'https://res.cloudinary.com/ux81wsbq/image/upload/v1786640132/asiance/site-assets/articles/intimate-garden-wedding-png.png',
    authorName: 'Mina Park',
  },
  'baby-room-ideas': {
    title: 'Baby Room Ideas',
    slug: 'baby-room-ideas',
    category: 'Asiance Baby',
    excerpt: 'Beautiful, functional spaces that grow with your little one.',
    content: '',
    image: 'https://res.cloudinary.com/ux81wsbq/image/upload/v1786640138/asiance/site-assets/articles/calm-nursery-bedtime-png.png',
    authorName: 'Asiance Editors',
  },
  'best-first-foods': {
    title: 'Best First Foods',
    slug: 'best-first-foods',
    category: 'Asiance Baby',
    excerpt: 'A simple guide to starting solids with confidence.',
    content: '',
    image: 'https://res.cloudinary.com/ux81wsbq/image/upload/v1786640139/asiance/site-assets/categories/baby-png.png',
    authorName: 'Asiance Editors',
  },
  'cultural-guide-kyoto-japan': {
    title: 'A Cultural Guide to Kyoto, Japan',
    slug: 'cultural-guide-kyoto-japan',
    category: 'Travel',
    excerpt: 'Temples, traditions, and thoughtful ways to experience Kyoto.',
    content: '',
    image: 'https://res.cloudinary.com/ux81wsbq/image/upload/v1786640158/asiance/site-assets/kids/editorial/japan-family-trip-png.png',
    authorName: 'Asiance Editors',
  },
};

const trendingSlugs = [
  'five-minute-skin-reset-humid-mornings',
  'make-room-for-better-conversations',
  'intimate-garden-wedding-that-feels-like-you',
  'baby-room-ideas',
];

const featuredSlugs = [
  'five-minute-skin-reset-humid-mornings',
  'intimate-garden-wedding-that-feels-like-you',
  'best-first-foods',
  'cultural-guide-kyoto-japan',
];

const communityFallbacks = [
  {
    name: 'Emily C.',
    message: "shared a photo from her little one's first trip!",
    image: 'https://res.cloudinary.com/ux81wsbq/image/upload/v1786640158/asiance/site-assets/kids/editorial/japan-family-trip-png.png',
    time: '2h ago',
  },
  {
    name: 'Sophie L.',
    message: 'posted in Dating Tips: How I healed before finding love.',
    image: 'https://res.cloudinary.com/ux81wsbq/image/upload/v1786640141/asiance/site-assets/categories/fashion-png.png',
    time: '5h ago',
  },
  {
    name: 'Nancy K.',
    message: 'saved a new beauty favorite to her collection.',
    image: 'https://res.cloudinary.com/ux81wsbq/image/upload/v1786640165/asiance/site-assets/products/cloud-milk-toner-png.png',
    time: '6h ago',
  },
];

function resolveArticleList(articles: Article[], slugs: string[]) {
  const articleMap = new Map(articles.map((article) => [article.slug, article]));
  return slugs.map((slug) => articleMap.get(slug) ?? articleFallbacks[slug]);
}

function formatActivityTime(value?: string) {
  if (!value) return 'Recently';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Recently';
  const hours = Math.max(1, Math.round((Date.now() - date.getTime()) / 3_600_000));
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

function CategoryStrip() {
  return (
    <nav className="women-destination-strip" aria-label="Explore Asiance destinations">
      {womenDestinations.map(({ label, copy, href, Icon }) => (
        <Link href={href} className="women-destination" key={label}>
          <Icon size={38} aria-hidden="true" />
          <strong>{label}</strong>
          <span>{copy}</span>
          <small>
            Explore <ArrowRight size={14} aria-hidden="true" />
          </small>
        </Link>
      ))}
    </nav>
  );
}

function TrendingNow({ articles }: { articles: Article[] }) {
  return (
    <aside className="women-trending" aria-labelledby="women-trending-title">
      <h2 id="women-trending-title">
        <Flame size={16} fill="currentColor" aria-hidden="true" /> Trending Now
      </h2>
      <div className="women-trending__list">
        {articles.map((article) => (
          <Link href={`/blog/${article.slug}`} className="women-trending-row" key={article.slug}>
            <img src={cloudinaryImageUrl(article.image, 320)} alt="" />
            <span>
              <strong>{article.title}</strong>
              <small>{article.category}</small>
            </span>
          </Link>
        ))}
      </div>
      <Link href="/blog" className="women-panel-link">
        View all trending <ArrowRight size={15} aria-hidden="true" />
      </Link>
    </aside>
  );
}

function FeaturedStories({ articles }: { articles: Article[] }) {
  return (
    <section className="women-featured" aria-labelledby="women-featured-title">
      <h2 id="women-featured-title">
        Featured Stories <Heart size={15} fill="currentColor" aria-hidden="true" />
      </h2>
      <div className="women-featured__grid">
        {articles.map((article) => (
          <article className="women-featured-card" key={article.slug}>
            <Link href={`/blog/${article.slug}`} className="women-featured-card__image">
              <img src={cloudinaryImageUrl(article.image, 720)} alt={article.title} />
              <span>{article.category}</span>
            </Link>
            <div className="women-featured-card__body">
              <h3>
                <Link href={`/blog/${article.slug}`}>{article.title}</Link>
              </h3>
              <p>{article.excerpt}</p>
              <small>by {article.authorName}</small>
            </div>
          </article>
        ))}
      </div>
      <Link href="/blog" className="women-featured__all">
        View all stories <ArrowRight size={16} aria-hidden="true" />
      </Link>
    </section>
  );
}

function CommunityPanel({ activity }: { activity: Activity[] }) {
  const communityItems = communityFallbacks.map((fallback, index) => {
    const item = activity[index];
    const media = item?.media?.find((entry) => entry.type === 'image');
    return item
      ? {
          name: item.actorName,
          message: item.text,
          image: media?.url || fallback.image,
          time: formatActivityTime(item.createdAt),
          href: item._id ? `/activity/${item._id}` : '/activity',
        }
      : { ...fallback, href: '/activity' };
  });

  return (
    <aside className="women-community" aria-labelledby="women-community-title">
      <h2 id="women-community-title">
        From Our Community <Heart size={15} fill="currentColor" aria-hidden="true" />
      </h2>
      <div className="women-community__list">
        {communityItems.map((item, index) => (
          <Link href={item.href} className="women-community-row" key={`${item.name}-${index}`}>
            <img src={item.image} alt="" />
            <span>
              <strong>{item.name}</strong>
              <span>{item.message}</span>
              <small>{item.time}</small>
            </span>
            <ChevronRight size={17} aria-hidden="true" />
          </Link>
        ))}
      </div>
      <Link href="/activity" className="women-panel-link">
        Join the conversation <ArrowRight size={15} aria-hidden="true" />
      </Link>
    </aside>
  );
}

export function WomenEditorialSection({ articles, activity }: WomenEditorialSectionProps) {
  const trending = resolveArticleList(articles, trendingSlugs);
  const featured = resolveArticleList(articles, featuredSlugs);

  return (
    <section className="women-editorial" aria-label="Asiance stories and destinations">
      <CategoryStrip />
      <div className="women-editorial__content">
        <TrendingNow articles={trending} />
        <FeaturedStories articles={featured} />
        <CommunityPanel activity={activity} />
      </div>
    </section>
  );
}
