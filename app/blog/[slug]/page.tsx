import { MessageSquare } from 'lucide-react';
import { ActivityFeed } from '@/components/ActivityFeed';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import { getActivity, getArticle } from '@/lib/api';

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [article, activity] = await Promise.all([getArticle(slug), getActivity()]);

  return (
    <main>
      <SiteHeader active="Blog" />
      <section className="article-hero">
        <span className="eyebrow">{article.category}</span>
        <h1 className="article-title">{article.title}</h1>
        <p className="page-copy" style={{ marginLeft: 'auto', marginRight: 'auto' }}>
          {article.excerpt}
        </p>
      </section>
      <img className="article-image" src={article.image} alt={article.title} />
      <article className="article-body">
        <p>{article.content}</p>
        <p>
          The redesigned Asiance treats the article as a doorway: read the piece, then continue
          into a focused thread with people who care about the same ritual.
        </p>
      </article>
      <section className="article-discussion">
        <div className="section-head">
          <div>
            <span className="eyebrow">
              <MessageSquare size={14} /> conversation · {article.discussionCount ?? 0}
            </span>
            <h2>
              the <em>conversation.</em>
            </h2>
          </div>
          <button className="btn btn-dark" type="button">
            Post reply
          </button>
        </div>
        <ActivityFeed items={activity.slice(0, 3)} />
      </section>
      <SiteFooter />
    </main>
  );
}
