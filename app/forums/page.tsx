import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import { getThreads } from '@/lib/api';

export default async function ForumsPage() {
  const threads = await getThreads({ cache: 'no-store' });

  return (
    <main>
      <SiteHeader active="Activity" />
      <section className="page-hero">
        <span className="eyebrow">forums</span>
        <h1>
          threaded <em>conversations.</em>
        </h1>
        <p className="page-copy">
          Pinned threads, reply counts, categories, and last-activity ordering.
        </p>
      </section>
      <section className="forum-shell">
        <div className="forum-list">
          {threads.map((thread) => (
            <article className="forum-row" key={thread.slug}>
              <div>
                <span className="eyebrow">{thread.pinned ? 'pinned' : thread.category}</span>
                <h3>{thread.title}</h3>
                <p>{thread.excerpt}</p>
              </div>
              <strong>{thread.replies} replies</strong>
            </article>
          ))}
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
