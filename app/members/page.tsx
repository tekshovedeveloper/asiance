import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import { getMembers } from '@/lib/api';
import { MembersGrid } from '@/components/members/MembersGrid';

export default async function MembersPage() {
  const members = await getMembers({ cache: 'no-store' });

  return (
    <main>
      <SiteHeader active="Members" />
      <section className="page-hero">
        <span className="eyebrow">members</span>
        <h1>
          the <em>members.</em>
        </h1>
        <p className="page-copy">Browse, search, follow, and message the people in the circle.</p>
      </section>
      <section className="section" style={{ paddingTop: 0 }}>
        <MembersGrid members={members} />
      </section>
      <SiteFooter />
    </main>
  );
}
