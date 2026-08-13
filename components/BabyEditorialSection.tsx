import Link from 'next/link';
import { ArrowRight, Heart } from 'lucide-react';
import { cloudinaryImageUrl } from '@/lib/cloudinary';
import type { Article } from '@/lib/types';

const milestoneItems = [
  {
    title: 'First Smile',
    copy: 'Pure magic.',
    image:
      'https://res.cloudinary.com/ux81wsbq/image/upload/v1786546799/asiance/uploads/WhatsApp_Image_2026-08-12_at_7.24.59_PM_zougzh.jpg',
  },
  {
    title: 'Sitting Up',
    copy: 'Hello, world!',
    image:
      'https://res.cloudinary.com/ux81wsbq/image/upload/v1786546800/asiance/uploads/WhatsApp_Image_2026-08-12_at_7.25.00_PM_q8lnqy.jpg',
  },
  {
    title: 'First Steps',
    copy: 'Tiny steps, big adventure.',
    image:
      'https://res.cloudinary.com/ux81wsbq/image/upload/v1786546803/asiance/uploads/WhatsApp_Image_2026-08-12_at_7.25.00_PM_1_eiwefl.jpg',
  },
  {
    title: 'Bath Time Fun',
    copy: 'Splish, splash, giggle!',
    image:
      'https://res.cloudinary.com/ux81wsbq/image/upload/v1786546804/asiance/uploads/WhatsApp_Image_2026-08-12_at_7.25.00_PM_2_e96w8t.jpg',
  },
];

const momLifeItems = [
  {
    title: 'Finding Balance',
    copy: 'Juggling it all and choosing grace.',
    image:
      'https://res.cloudinary.com/ux81wsbq/image/upload/v1786546807/asiance/uploads/WhatsApp_Image_2026-08-12_at_7.25.00_PM_4_m5dgwj.jpg',
  },
  {
    title: 'Postpartum',
    copy: 'Healing, growing, and showing up for myself.',
    image:
      'https://res.cloudinary.com/ux81wsbq/image/upload/v1786546806/asiance/uploads/WhatsApp_Image_2026-08-12_at_7.25.00_PM_3_mroi9m.jpg',
  },
  {
    title: 'Mom Guilt',
    copy: 'Letting go of pressure and choosing joy.',
    image:
      'https://res.cloudinary.com/ux81wsbq/image/upload/v1786546808/asiance/uploads/WhatsApp_Image_2026-08-12_at_7.25.00_PM_5_shwbnl.jpg',
  },
];

const popularFallbacks: Article[] = [
  {
    title: 'Best First Foods',
    slug: 'best-first-foods',
    category: 'Asiance Baby',
    excerpt: 'A simple guide to starting solids with confidence.',
    content: '',
    image:
      'https://res.cloudinary.com/ux81wsbq/image/upload/v1786546809/asiance/uploads/WhatsApp_Image_2026-08-12_at_7.25.01_PM_pt22fg.jpg',
    authorName: 'Asiance Editors',
  },
  {
    title: 'Stroller Guide',
    slug: 'stroller-guide',
    category: 'Asiance Baby',
    excerpt: 'The top strollers Asian moms love in 2024.',
    content: '',
    image:
      'https://res.cloudinary.com/ux81wsbq/image/upload/v1786546811/asiance/uploads/WhatsApp_Image_2026-08-12_at_7.25.01_PM_1_i1bnjw.jpg',
    authorName: 'Asiance Editors',
  },
  {
    title: 'Sleep Training 101',
    slug: 'sleep-training-101',
    category: 'Asiance Baby',
    excerpt: 'Gentle methods that actually work.',
    content: '',
    image:
      'https://res.cloudinary.com/ux81wsbq/image/upload/v1786546812/asiance/uploads/WhatsApp_Image_2026-08-12_at_7.25.01_PM_2_nlsrcx.jpg',
    authorName: 'Asiance Editors',
  },
  {
    title: 'Travelling with Baby',
    slug: 'travelling-with-baby',
    category: 'Asiance Baby',
    excerpt: 'Tips for stress-free family adventures.',
    content: '',
    image:
      'https://res.cloudinary.com/ux81wsbq/image/upload/v1786546813/asiance/uploads/WhatsApp_Image_2026-08-12_at_7.25.01_PM_3_ekh3ke.jpg',
    authorName: 'Asiance Editors',
  },
  {
    title: 'Baby Room Ideas',
    slug: 'baby-room-ideas',
    category: 'Asiance Baby',
    excerpt: 'Beautiful, functional spaces we love.',
    content: '',
    image:
      'https://res.cloudinary.com/ux81wsbq/image/upload/v1786546814/asiance/uploads/WhatsApp_Image_2026-08-12_at_7.25.01_PM_4_iphedd.jpg',
    authorName: 'Asiance Editors',
  },
];

type BabyEditorialSectionProps = {
  articles: Article[];
};

function BabyMilestones() {
  return (
    <section className="baby-milestones" aria-labelledby="baby-milestones-title">
      <div className="baby-editorial-intro">
        <h2 id="baby-milestones-title">Baby Milestones</h2>
        <Heart size={13} fill="currentColor" aria-hidden="true" />
        <p>Cherishing every little step of their growing up.</p>
        <Link href="/blog?category=Asiance%20Baby" className="baby-editorial-intro__button">
          Explore all
        </Link>
      </div>

      <div className="baby-milestone-grid">
        {milestoneItems.map((item) => (
          <article className="baby-milestone-card" key={item.title}>
            <img src={cloudinaryImageUrl(item.image, 620)} alt={item.title} />
            <div>
              <h3>{item.title}</h3>
              <p>{item.copy}</p>
              <Heart size={10} fill="currentColor" aria-hidden="true" />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function MomLife() {
  return (
    <section className="baby-mom-life" aria-labelledby="baby-mom-life-title">
      <div className="baby-editorial-intro baby-editorial-intro--mom">
        <h2 id="baby-mom-life-title">Mom Life</h2>
        <Heart size={13} fill="currentColor" aria-hidden="true" />
        <p>Real talk, real stories, real motherhood.</p>
        <Link href="/blog?category=Asiance%20Baby" className="baby-editorial-intro__action">
          Read more
          <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </div>

      <div className="baby-mom-life__stories">
        {momLifeItems.map((item, index) => (
          <article className={`baby-mom-story baby-mom-story--${index + 1}`} key={item.title}>
            <img src={cloudinaryImageUrl(item.image, 620)} alt={item.title} />
            <div>
              <h3>{item.title}</h3>
              <p>{item.copy}</p>
              <span aria-hidden="true" />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function PopularBabyArticles({ articles }: BabyEditorialSectionProps) {
  const articlesBySlug = new Map(articles.map((article) => [article.slug, article]));
  const popularArticles = popularFallbacks.map(
    (fallback) => articlesBySlug.get(fallback.slug) ?? fallback,
  );

  return (
    <aside className="baby-popular" aria-labelledby="baby-popular-title">
      <div className="baby-popular__heading">
        <h2 id="baby-popular-title">Popular on Asiance Baby</h2>
        <Heart size={11} fill="currentColor" aria-hidden="true" />
      </div>
      <div className="baby-popular__list">
        {popularArticles.map((article) => (
          <Link href={`/blog/${article.slug}`} className="baby-popular-card" key={article.slug}>
            <img src={cloudinaryImageUrl(article.image, 480)} alt="" />
            <div>
              <h3>{article.title}</h3>
              <p>{article.excerpt}</p>
            </div>
          </Link>
        ))}
      </div>
    </aside>
  );
}

export function BabyEditorialSection({ articles }: BabyEditorialSectionProps) {
  return (
    <div className="baby-editorial">
      <div className="baby-editorial__main">
        <BabyMilestones />
        <MomLife />
      </div>
      <PopularBabyArticles articles={articles} />
    </div>
  );
}
