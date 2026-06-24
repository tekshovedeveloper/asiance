import { ActivityWall } from '@/components/ActivityWall';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import { getActivity, getGroups, getMembers } from '@/lib/api';

export const dynamic = 'force-dynamic';

export default async function ActivityPage() {
  const [activity, groups, members] = await Promise.all([getActivity(), getGroups(), getMembers()]);

  return (
    <main>
      <SiteHeader active="Activity" />
      <section className="page-hero">
        <span className="eyebrow">activity wall</span>
        <h1>
          everything <em>happening</em> now.
        </h1>
        <p className="page-copy">A social community feed with post creation, reactions, comments, favorites, and media highlights.</p>
      </section>
      <ActivityWall items={activity} members={members} groups={groups} />
      <SiteFooter />
    </main>
  );
}
