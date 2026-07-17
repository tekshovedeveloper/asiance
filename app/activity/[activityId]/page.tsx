import { ActivityFeed } from '@/components/ActivityFeed';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import { getActivityItem } from '@/lib/api';

export const dynamic = 'force-dynamic';

export default async function ActivityDetailPage({
  params,
}: {
  params: Promise<{ activityId: string }>;
}) {
  const { activityId } = await params;
  const item = await getActivityItem(activityId);

  return (
    <main>
      <SiteHeader active="Activity" />
      <section className="page-hero">
        <span className="eyebrow">activity post</span>
        <h1>
          post <em>detail.</em>
        </h1>
      </section>
      <section className="section" style={{ paddingTop: 0 }}>
        <ActivityFeed items={[item]} />
      </section>
      <SiteFooter />
    </main>
  );
}
