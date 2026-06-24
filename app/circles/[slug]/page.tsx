import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import { GroupPage } from '@/components/GroupPage';
import { getGroup } from '@/lib/api';

export default async function CirclePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const group = await getGroup(slug);

  return (
    <main>
      <SiteHeader active="Circles" />
      <GroupPage group={group} />
      <SiteFooter />
    </main>
  );
}
