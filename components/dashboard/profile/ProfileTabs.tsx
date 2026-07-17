
"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "../dashboard.module.css";
import type { DashboardData, DashboardTab, DashboardUser, OrderStatusFilter } from "../types";
import { TabPanel } from "../TabPanel";
import { ActivityPanel } from "../activity/ActivityPanel";
import { FriendsPanel } from "../friends/FriendsPanel";
import { ProfilePanel } from "./ProfilePanel";
import { OrdersPanel } from "../orders/OrdersPanel";
import { GroupsPanel } from "../groups/GroupsPanel";

const tabs: { key: DashboardTab; label: string }[] = [
  { key: "activity", label: "Activity" },
  { key: "profile", label: "Profile" },
  { key: "friends", label: "Friends" },
  { key: "groups", label: "Groups" },
  // { key: "forums", label: "Forum" },
  // { key: "files", label: "Files" },
  { key: "orders", label: "Orders" },
];

export function ProfileTabs({
  initialTab,
  initialOrderStatus = "all",
  data,
  user,
  onUserChange,
}: {
  initialTab: DashboardTab;
  initialOrderStatus?: OrderStatusFilter;
  data: DashboardData;
  user: DashboardUser;
  onUserChange: (u: DashboardUser) => void;
}) {
  const [active, setActive] = useState<DashboardTab>(initialTab);

  useEffect(() => {
    setActive(initialTab);
  }, [initialTab]);

  const activeLabel = useMemo(
    () => tabs.find((t) => t.key === active)?.label ?? "Activity",
    [active]
  );

  return (
    <div className={styles.tabsCard}>
      <div className={styles.tabsBar}>
        {tabs.map((t) => (
          <button
            key={t.key}
            className={`${styles.tab} ${active === t.key ? styles.tabActive : ""}`}
            onClick={() => setActive(t.key)}
            type="button"
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className={styles.tabsBody}>
        <div className={styles.subhead}>
          <div>{activeLabel}</div>
          <div>
          <label style={{ fontSize: '14px' }}>
  Show:{' '}
  <select style={{ fontSize: '13px', padding: '3px 6px', marginLeft: '5px' }} defaultValue="everything">
    <option value="everything" style={{ fontSize: '13px' }}>Everything</option>
    <option value="mentions" style={{ fontSize: '13px' }}>Mentions</option>
    <option value="favorites" style={{ fontSize: '13px' }}>Favorites</option>
  </select>
</label>
          </div>
        </div>

        <TabPanel when={active === "activity"}>
          <ActivityPanel />
        </TabPanel>

        <TabPanel when={active === "friends"}>
          <FriendsPanel />
        </TabPanel>

        <TabPanel when={active === "profile"}>
  <ProfilePanel user={user} onUserChange={onUserChange} />
</TabPanel>

        <TabPanel when={active === "groups"}>
          <GroupsPanel />
        </TabPanel>

        {/* <TabPanel when={active === "forums"}>
          <div className={styles.panel}>Threads ({data.threads.length})</div>
        </TabPanel>

        <TabPanel when={active === "files"}>
          <div className={styles.panel}>Files ({data.files.length})</div>
        </TabPanel> */}

        <TabPanel when={active === "orders"}>
          <OrdersPanel initialStatus={initialOrderStatus} />
        </TabPanel>
      </div>
    </div>
  );
}
