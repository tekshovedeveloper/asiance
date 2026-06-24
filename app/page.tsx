import Link from 'next/link';
import { ActivityFeed } from '@/components/ActivityFeed';
import { ArticleCard } from '@/components/ArticleCard';
import { GroupCard } from '@/components/GroupCard';
import { NewsBbcSection } from '@/components/NewsBbcSection';
import { ProductCard } from '@/components/ProductCard';
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

export default async function HomePage() {
  const [products, articles, news, newsCategories, groups, activity, members] = await Promise.all([
    getProducts(),
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
      <section className="hero">
        <div
          className="hero-image-main"
          style={{
            backgroundImage:
              "linear-gradient(135deg, rgba(0,0,0,.48), rgba(0,0,0,.12) 55%), url('/assets/home/home1.jpg')",
          }}
        >
          <div className="hero-overlay">
            <div className="hero-eyebrow">The Seasonal Issue / Vol. 12</div>

            <h1 className="hero-title">
              Swimsuits, <em>basket bags,</em>
              <br />
              and every soft thing
              <br />
              summer asks for.
            </h1>

            <p className="hero-sub">
              A curated edit from our editors, wellbeing rituals, slow-living essentials,
              and the conversations happening around them.
            </p>

            <Link href="/shop" className="btn btn-arrow">
              Shop new drops
            </Link>
          </div>
        </div>

        <div
          className="hero-image-side"
          style={{
            backgroundImage:
              "linear-gradient(180deg, rgba(0,0,0,.18), rgba(0,0,0,.62)), url('/assets/home/home2.jpg')",
          }}
        >
          <div className="hero-overlay compact">
            <div className="hero-eyebrow">From the Blog / 04 min</div>

            <h2 className="hero-side-title">
              What <em>quiet luxury</em> really means in 2026
            </h2>

            <Link href="/blog/gentle-contrast-therapy" className="btn btn-arrow">
              Read the piece
            </Link>
          </div>
        </div>
      </section>

      <NewsBbcSection
        items={news}
        categories={newsCategories}
        title="What is moving the circle this week."
      />

      <section className="section warm">
        <div className="section-head">
          <div>
            <span className="eyebrow">circles</span>
            <h2>
              Find <em>your people</em> in a smaller room.
            </h2>
          </div>
          <Link href="/circles" className="text-link">
            Browse all circles
          </Link>
        </div>
        <div className="group-grid">
          {groups.slice(0, 6).map((group) => (
            <GroupCard group={group} key={group.slug} />
          ))}
        </div>
      </section>

      <section className="section">
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
      </section>

      <section className="section cool">
        <div className="section-head">
          <div>
            <span className="eyebrow">must-read</span>
            <h2>
              The <em>stories</em> of the week.
            </h2>
          </div>
          <Link href="/blog" className="text-link">
            All stories
          </Link>
        </div>
        <div className="story-grid">
          {articles.slice(0, 3).map((article, index) => (
            <ArticleCard article={article} large={index === 0} key={article.slug} />
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <span className="eyebrow">shop</span>
            <h2>
              New <em>arrivals</em> this week.
            </h2>
          </div>
          <Link href="/shop" className="text-link">
            Shop all
          </Link>
        </div>
        <div className="product-grid">
          {products.slice(0, 4).map((product) => (
            <ProductCard product={product} key={product.slug} />
          ))}
        </div>
      </section>

      <section className="home-cta">
        <div>
          <span className="eyebrow">membership</span>
          <h2>
            Join the <em>circle</em>.
          </h2>
        </div>
        <Link href="/register" className="btn">
          Create your account
        </Link>
      </section>
      <SiteFooter />
    </main>
  );
}
