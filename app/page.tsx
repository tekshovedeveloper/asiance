import Link from 'next/link';
import { ActivityFeed } from '@/components/ActivityFeed';
import { CommunityCategoryStrip } from '@/components/CommunityCategoryStrip';
import { CommunityHeroAccount } from '@/components/CommunityHeroAccount';
import { HomeMembershipCta } from '@/components/HomeMembershipCta';
import { HomePersonalizedSections } from '@/components/HomePersonalizedSections';
import { NewsBbcSection } from '@/components/NewsBbcSection';
import { ShopCategorySection } from '@/components/ShopCategorySection';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import {
  getActivity,
  getArticles,
  getGroups,
  getMembers,
  getNews,
  getNewsCategories,
  getProducts,
} from '@/lib/api';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [products, articles, news, newsCategories, groups, activity, members] = await Promise.all([
    getProducts({ sort: 'latest' }),
    getArticles(),
    getNews({ limit: 12 }),
    getNewsCategories(),
    getGroups(),
    getActivity(),
    getMembers(),
  ]);

  return (
    <main className="page-shell">
      <SiteHeader active="Home" />
      <section className="community-hero" aria-labelledby="community-hero-title">
        <img
          className="community-hero__image"
          src="https://res.cloudinary.com/ux81wsbq/image/upload/v1786640148/asiance/site-assets/home/asiance-community-hero-png.png"
          alt="A mother embracing her young child in a softly lit room"
        />
        <div className="community-hero__scrim" aria-hidden="true" />

        <div className="community-hero__content">
          <h1 id="community-hero-title" className="community-hero__title">
            A community
            <br />
            for <em>every chapter</em>
            <br />
            of your life.
          </h1>
          <p className="community-hero__copy">
            Beauty. Love. Family. Lifestyle.
            <br />
            All connected. All for you.
          </p>
          <div className="community-hero__actions">
            <Link href="/circles" className="community-hero__button community-hero__button--primary">
              Explore Circle
            </Link>
            <Link href="/shop" className="community-hero__button">
              Shop now
            </Link>
          </div>
        </div>

        <CommunityHeroAccount />
      </section>

      {newsCategories.length ? <CommunityCategoryStrip categories={newsCategories} /> : null}

      <HomePersonalizedSections products={products} articles={articles} groups={groups}>
        <ShopCategorySection />
      </HomePersonalizedSections>

      {/* <NewsBbcSection
        items={news}
        categories={newsCategories}
        title="What is moving the circle this week."
      /> */}

      {/* <section className="section">
        <div className="activity-layout">
          <div>
            <div className="section-head">
              <div>
                <span className="eyebrow">activity</span>
                <h2>
                  Live from the <em>circle.</em>
                </h2>
              </div>
              <Link href="/activity" className="text-link">
                See all activity
              </Link>
            </div>
            
            <ActivityFeed items={activity.slice(0, 4)} />
          </div>
          <aside className="dash-card">
            <span className="eyebrow">members</span>
            <h2>New this week</h2>
            <div className="activity-list">
              {members.slice(0, 5).map((member) => (
                <Link href={`/members/${member.handle}`} className="activity-item" key={member.handle}>
                  <img className="avatar" src={member.avatar} alt={member.name} />
                  <div>
                    <p>
                      <strong>{member.name}</strong>
                    </p>
                    <div className="activity-meta">{member.status}</div>
                  </div>
                </Link>
              ))}
            </div>
          </aside>
        </div>
      </section> */}

      <HomeMembershipCta />
      <SiteFooter />
    </main>
  );
}
