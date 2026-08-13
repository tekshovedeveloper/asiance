import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowRight,
  CalendarHeart,
  ChevronRight,
  Diamond,
  Heart,
  MessageCircleMore,
  Sparkles,
  UsersRound,
} from 'lucide-react';

type LoveFeature = {
  title: string;
  copy: string;
  Icon: LucideIcon;
};

const loveFeatures: LoveFeature[] = [
  {
    title: 'Asian & Asian-Friendly',
    copy: 'A welcoming community that celebrates culture.',
    Icon: UsersRound,
  },
  {
    title: 'Advanced Matching',
    copy: 'Our algorithm learns what you love.',
    Icon: Sparkles,
  },
  {
    title: 'Great Conversations',
    copy: 'Start meaningful conversations easily.',
    Icon: MessageCircleMore,
  },
  {
    title: 'Events & Activities',
    copy: 'Meet in real life at curated events near you.',
    Icon: CalendarHeart,
  },
  {
    title: 'Premium Benefits',
    copy: 'Unlock more ways to connect and be seen.',
    Icon: Diamond,
  },
];

const successStories = [
  {
    names: 'Kevin & Jessica',
    slug: 'kevin-jessica-engaged-through-travel',
    status: 'Engaged',
    quote: 'We connected over our love for travel and good food. Now we are engaged!',
    image: 'https://res.cloudinary.com/ux81wsbq/image/upload/v1786640164/asiance/site-assets/love/stories/kevin-jessica-jpg.jpg',
  },
  {
    names: 'Andrew & Michelle',
    slug: 'andrew-michelle-best-decision',
    status: 'Married',
    quote: 'Asiance brought us together. Best decision ever!',
    image: 'https://res.cloudinary.com/ux81wsbq/image/upload/v1786640160/asiance/site-assets/love/stories/andrew-michelle-jpg.jpg',
  },
  {
    names: 'Tommy & Samantha',
    slug: 'tommy-samantha-first-message-to-forever',
    status: 'Wedding',
    quote: 'From our first message to forever. Thank you, Asiance!',
    image: 'https://res.cloudinary.com/ux81wsbq/image/upload/v1786640164/asiance/site-assets/love/stories/tommy-samantha-jpg.jpg',
  },
  {
    names: 'Daniel & Ashley',
    slug: 'daniel-ashley-more-than-a-match',
    status: 'Together',
    quote: 'We found more than a match, we found our best friend.',
    image: 'https://res.cloudinary.com/ux81wsbq/image/upload/v1786640162/asiance/site-assets/love/stories/daniel-ashley-jpg.jpg',
  },
];

const popularMembers = [
  {
    name: 'Emily, 28',
    handle: 'miratanaka',
    location: 'New York, NY',
    avatar: 'https://res.cloudinary.com/ux81wsbq/image/upload/v1786640168/asiance/site-assets/profile/dummy-profile-png.png',
  },
  {
    name: 'Jason, 31',
    handle: 'jack',
    location: 'San Francisco, CA',
    avatar: 'https://res.cloudinary.com/ux81wsbq/image/upload/v1786640168/asiance/site-assets/profile/dymmy-profile-jpeg.jpg',
  },
  {
    name: 'Lina, 26',
    handle: 'sanafarooq',
    location: 'Toronto, Canada',
    avatar: 'https://res.cloudinary.com/ux81wsbq/image/upload/v1786640168/asiance/site-assets/profile/dummy-profile-png.png',
  },
  {
    name: 'Brian, 29',
    handle: 'irishalden',
    location: 'Los Angeles, CA',
    avatar: 'https://res.cloudinary.com/ux81wsbq/image/upload/v1786640168/asiance/site-assets/profile/dymmy-profile-jpeg.jpg',
  },
  {
    name: 'Sophie, 27',
    handle: 'yunapark',
    location: 'Houston, TX',
    avatar: 'https://res.cloudinary.com/ux81wsbq/image/upload/v1786640168/asiance/site-assets/profile/dummy-profile-png.png',
  },
];

function LoveFeatureStrip() {
  return (
    <div className="love-feature-strip" aria-label="Asiance Love features">
      {loveFeatures.map(({ title, copy, Icon }) => (
        <div className="love-feature-item" key={title}>
          <Icon size={42} aria-hidden="true" />
          <span>
            <strong>{title}</strong>
            <span>{copy}</span>
          </span>
        </div>
      ))}
    </div>
  );
}

function SuccessStories() {
  return (
    <section className="love-stories" aria-labelledby="love-stories-title">
      <div className="love-section-heading">
        <h2 id="love-stories-title">
          Success Stories <Heart size={15} fill="currentColor" aria-hidden="true" />
        </h2>
        <Link href="/blog?category=relationships">
          View all stories <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>

      <div className="love-story-grid">
        {successStories.map((story) => (
          <article className="love-story-card" key={story.names}>
            <div className="love-story-card__image">
              <img src={story.image} alt={`${story.names} success story`} />
              <span>{story.status}</span>
            </div>
            <div className="love-story-card__body">
              <h3>{story.names}</h3>
              <p>&ldquo;{story.quote}&rdquo;</p>
              <Link href={`/blog/${story.slug}`}>
                Read their story <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function PopularMembers() {
  return (
    <aside className="love-popular" aria-labelledby="love-popular-title">
      <h2 id="love-popular-title">
        Popular on Asiance Dating <Heart size={15} fill="currentColor" aria-hidden="true" />
      </h2>

      <div className="love-popular__list">
        {popularMembers.map((member) => (
          <Link href={`/members/${member.handle}`} className="love-member-row" key={member.name}>
            <img src={member.avatar} alt="" />
            <span className="love-member-row__copy">
              <strong>{member.name}</strong>
              <span>
                {member.location}
                <small><i aria-hidden="true" /> Online now</small>
              </span>
            </span>
            <ChevronRight size={18} aria-hidden="true" />
          </Link>
        ))}
      </div>

      <Link href="/members" className="love-popular__all">
        Browse members <ArrowRight size={16} aria-hidden="true" />
      </Link>
    </aside>
  );
}

export function LoveEditorialSection() {
  return (
    <section className="love-editorial" aria-label="Asiance Love community">
      <LoveFeatureStrip />
      <div className="love-editorial__content">
        <SuccessStories />
        <PopularMembers />
      </div>
    </section>
  );
}
