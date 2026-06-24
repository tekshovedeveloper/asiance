// components/dashboard/DashboardShell.tsx
import styles from "./dashboard.module.css";
import { SidebarNav } from "./SidebarNav";
import { ProfileHero } from "./profile/ProfileHero";
import { ProfileTabs } from "./profile/ProfileTabs";
import { RightRail } from "./RightRail";
import type { DashboardData, DashboardTab, DashboardUser } from "./types";


type Props = {
  user: DashboardUser;
  initialTab?: DashboardTab;
  data: DashboardData;
};

export function DashboardShell({
  user,
  initialTab = "activity",
  data,
  onUserChange,
}: {
  user: DashboardUser;
  initialTab?: DashboardTab;
  data: DashboardData;
  onUserChange: (u: DashboardUser) => void;
}) {
  return (
    <div className={styles.shell}>
      <SidebarNav user={user} />

      <div className={styles.main}>
        <ProfileHero user={user} />

        <div className={styles.content}>
          <div className={styles.center}>
            <ProfileTabs
              initialTab={initialTab}
              data={data}
              user={user}
              onUserChange={onUserChange}
            />
          </div>

          <div className={styles.right}>
            <RightRail />
          </div>
        </div>
      </div>
    </div>
  );
}
