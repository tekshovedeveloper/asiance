import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowRight,
  BookOpen,
  FileText,
  Heart,
  MessageCircleMore,
  Trophy,
  Utensils,
} from 'lucide-react';

const storyCards = [
  {
    title: 'Our Morning Routine with Two Littles',
    copy: 'A busy mom shares how they start the day right.',
    author: 'Michelle P.',
    likes: 128,
    tag: 'Parenting',
    image: 'https://res.cloudinary.com/ux81wsbq/image/upload/v1786640158/asiance/site-assets/kids/editorial/morning-routine-png.png',
    slug: 'our-morning-routine-with-two-littles',
  },
  {
    title: 'How We Teach Our Kids Kindness',
    copy: 'Raising empathetic and confident little humans.',
    author: 'Jason & Aria',
    likes: 96,
    tag: 'Education',
    image: 'https://res.cloudinary.com/ux81wsbq/image/upload/v1786640163/asiance/site-assets/kids/editorial/teach-kindness-png.png',
    slug: 'how-we-teach-our-kids-kindness',
  },
  {
    title: 'Weekend Fun: Easy DIY Projects',
    copy: 'Simple ideas to create lasting memories.',
    author: 'Linda K.',
    likes: 87,
    tag: 'Activities',
    image: 'https://res.cloudinary.com/ux81wsbq/image/upload/v1786640157/asiance/site-assets/kids/editorial/diy-projects-png.png',
    slug: 'weekend-fun-easy-diy-projects-for-kids',
  },
  {
    title: 'Our Family Trip to Japan with Kids',
    copy: 'Tips for a smooth and fun adventure.',
    author: 'The Chens',
    likes: 105,
    tag: 'Travel',
    image: 'https://res.cloudinary.com/ux81wsbq/image/upload/v1786640158/asiance/site-assets/kids/editorial/japan-family-trip-png.png',
    slug: 'our-family-trip-to-japan-with-kids',
  },
];

const popularTopics = [
  {
    title: 'Raising Bilingual Kids',
    copy: 'Tips and resources to support two languages.',
    image: 'https://res.cloudinary.com/ux81wsbq/image/upload/v1786640163/asiance/site-assets/kids/editorial/teach-kindness-png.png',
    slug: 'raising-bilingual-kids-simple-habits-that-work',
  },
  {
    title: 'After School Activities',
    copy: 'Ideas that build skills and confidence.',
    image: 'https://res.cloudinary.com/ux81wsbq/image/upload/v1786640157/asiance/site-assets/kids/editorial/diy-projects-png.png',
    slug: 'after-school-activities-build-skills-confidence',
  },
  {
    title: 'Positive Parenting',
    copy: 'Simple strategies for stronger connections.',
    image: 'https://res.cloudinary.com/ux81wsbq/image/upload/v1786640145/asiance/site-assets/categories/kids-png.png',
    slug: 'positive-parenting-strategies-stronger-connections',
  },
  {
    title: 'Screen Time Balance',
    copy: 'Healthy habits for the digital age.',
    image: 'https://res.cloudinary.com/ux81wsbq/image/upload/v1786640158/asiance/site-assets/kids/editorial/morning-routine-png.png',
    slug: 'family-guide-healthy-screen-time-balance',
  },
];

const ageGuides = [
  { label: 'Baby', range: '0 - 12 Months', image: 'https://res.cloudinary.com/ux81wsbq/image/upload/v1786640139/asiance/site-assets/categories/baby-png.png', slug: 'baby-guide-first-12-months' },
  { label: 'Toddler', range: '1 - 3 Years', image: 'https://res.cloudinary.com/ux81wsbq/image/upload/v1786640153/asiance/site-assets/kids/editorial/age-toddler-png.png', slug: 'toddler-guide-ages-one-to-three' },
  { label: 'Preschool', range: '3 - 5 Years', image: 'https://res.cloudinary.com/ux81wsbq/image/upload/v1786640157/asiance/site-assets/kids/editorial/diy-projects-png.png', slug: 'preschool-guide-ages-three-to-five' },
  { label: 'School Age', range: '6 - 12 Years', image: 'https://res.cloudinary.com/ux81wsbq/image/upload/v1786640163/asiance/site-assets/kids/editorial/teach-kindness-png.png', slug: 'school-age-guide-ages-six-to-twelve' },
  { label: 'Tweens & Teens', range: '13+ Years', image: 'https://res.cloudinary.com/ux81wsbq/image/upload/v1786640153/asiance/site-assets/kids/editorial/age-teen-png.png', slug: 'tweens-teens-guide-age-thirteen-and-up' },
];

type InspirationItem = {
  title: string;
  copy: string;
  href: string;
  Icon: LucideIcon;
};

const inspirationItems: InspirationItem[] = [
  { title: 'Lunchbox Ideas', copy: 'Fun & healthy recipes', href: '/blog/healthy-lunchbox-ideas-kids-will-eat', Icon: Utensils },
  { title: 'Book Recommendations', copy: "Stories they'll love", href: '/blog/beautiful-books-asian-kids-families-love', Icon: BookOpen },
  { title: 'Fun Printables', copy: 'Learn & play at home', href: '/blog/fun-printables-learning-play-at-home', Icon: FileText },
  { title: 'Conversation Starters', copy: 'Build strong connections', href: '/blog/conversation-starters-bring-families-closer', Icon: MessageCircleMore },
  { title: 'Family Challenges', copy: 'Try something new', href: '/blog/five-family-challenges-try-this-month', Icon: Trophy },
];

function PopularTopics() {
  return (
    <aside className="kids-popular" aria-labelledby="kids-popular-title">
      <h2 id="kids-popular-title">
        Popular Topics <Heart size={13} fill="currentColor" aria-hidden="true" />
      </h2>
      <div className="kids-popular__list">
        {popularTopics.map((topic) => (
          <Link href={`/blog/${topic.slug}`} className="kids-popular-row" key={topic.title}>
            <img src={topic.image} alt="" />
            <span>
              <strong>{topic.title}</strong>
              <span>{topic.copy}</span>
            </span>
          </Link>
        ))}
      </div>
      <Link href="/blog?category=asiance-kids" className="kids-popular__all">
        View all topics <ArrowRight size={15} aria-hidden="true" />
      </Link>
    </aside>
  );
}

function FamilyStories() {
  return (
    <section className="kids-stories" aria-labelledby="kids-stories-title">
      <h2 id="kids-stories-title">
        Real Families. Real Stories. <Heart size={13} fill="currentColor" aria-hidden="true" />
      </h2>
      <div className="kids-story-grid">
        {storyCards.map((story) => (
          <article className="kids-story-card" key={story.title}>
            <Link href={`/blog/${story.slug}`} className="kids-story-card__image">
              <img src={story.image} alt={story.title} />
            </Link>
            <span className="kids-story-card__tag">{story.tag}</span>
            <h3>
              <Link href={`/blog/${story.slug}`}>{story.title}</Link>
            </h3>
            <p>{story.copy}</p>
            <div className="kids-story-card__meta">
              <span>by {story.author}</span>
              <span><Heart size={13} aria-hidden="true" /> {story.likes}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function AgeGuides() {
  return (
    <aside className="kids-age-guides" aria-labelledby="kids-age-title">
      <h2 id="kids-age-title">
        Age Guides <Heart size={13} fill="currentColor" aria-hidden="true" />
      </h2>
      <div className="kids-age-guides__list">
        {ageGuides.map((guide) => (
          <Link href={`/blog/${guide.slug}`} className="kids-age-row" key={guide.label}>
            <img src={guide.image} alt="" />
            <span>
              <strong>{guide.label}</strong>
              <span>{guide.range}</span>
            </span>
            <ArrowRight size={15} aria-hidden="true" />
          </Link>
        ))}
      </div>
    </aside>
  );
}

function DailyInspiration() {
  return (
    <section className="kids-inspiration" aria-labelledby="kids-inspiration-title">
      <h2 id="kids-inspiration-title">
        Daily Inspiration <Heart size={13} fill="currentColor" aria-hidden="true" />
      </h2>
      <div className="kids-inspiration__grid">
        {inspirationItems.map(({ title, copy, href, Icon }) => (
          <Link href={href} className="kids-inspiration-item" key={title}>
            <Icon size={35} aria-hidden="true" />
            <span>
              <strong>{title}</strong>
              <span>{copy}</span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function KidsEditorialSection() {
  return (
    <section className="kids-editorial" aria-label="Asiance Kids stories and guides">
      <div className="kids-editorial__main">
        <PopularTopics />
        <FamilyStories />
        <AgeGuides />
      </div>
      <DailyInspiration />
    </section>
  );
}
