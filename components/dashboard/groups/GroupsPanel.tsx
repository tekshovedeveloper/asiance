'use client';

import { useEffect, useState } from 'react';
import { getMyGroups } from '@/lib/api';
import { GroupCard } from '@/components/GroupCard';
import type { Group } from '@/lib/types';
import styles from '../dashboard.module.css';

export function GroupsPanel() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyGroups()
      .then((data) => setGroups(data ?? []))
      .catch(() => setGroups([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '40px 0', textAlign: 'center', color: '#9ca3af' }}>
        Loading groups…
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div style={{ padding: '40px 0', textAlign: 'center', color: '#9ca3af' }}>
        You have not joined any groups yet.
      </div>
    );
  }

  return (
    <div className={styles.groupsGrid}>
      {groups.map((group) => (
        <GroupCard key={group.slug} group={group} />
      ))}
    </div>
  );
}
