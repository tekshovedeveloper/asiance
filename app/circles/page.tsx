import { GroupCard } from '@/components/GroupCard';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import { getGroups } from '@/lib/api';

export default async function CirclesPage() {
  const groups = await getGroups();

  return (
    <main>
      <SiteHeader active="Circles" />
      <section className="page-hero">
        <span className="eyebrow">groups renamed</span>
        <h1>
          the <em>circles.</em>
        </h1>
        <p className="page-copy">
          BuddyPress-style groups rebuilt with softer language, join states, member counts, and
          future forums.
        </p>
      </section>
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="group-grid">
          {groups.map((group) => (
            <GroupCard group={group} key={group.slug} />
          ))}
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
