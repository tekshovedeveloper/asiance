import Link from 'next/link';
import { ActivityFeed } from '@/components/ActivityFeed';
import { CommunityCategoryStrip } from '@/components/CommunityCategoryStrip';
import { HomeHeroSlider } from '@/components/HomeHeroSlider';
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
  getHomeSlides,
  getMembers,
  getNews,
  getNewsCategories,
  getProducts,
} from '@/lib/api';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [products, articles, news, newsCategories, groups, activity, members, homeSlides] = await Promise.all([
    getProducts({ sort: 'latest' }),
    getArticles(),
    getNews({ limit: 12 }),
    getNewsCategories(),
    getGroups(),
    getActivity(),
    getMembers(),
    getHomeSlides(),
  ]);

  return (
    <main className="page-shell">
      <SiteHeader active="Home" />
      <HomeHeroSlider slides={homeSlides} />

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
