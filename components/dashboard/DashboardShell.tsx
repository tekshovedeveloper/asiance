// components/dashboard/DashboardShell.tsx
import styles from "./dashboard.module.css";
import { SidebarNav } from "./SidebarNav";
import { ArticlesPanel } from "./articles/ArticlesPanel";
import { AccountPrivacyPanel } from "./privacy/AccountPrivacyPanel";
import { ProfileCustomizeModal } from "./profile/ProfileCustomizeModal";
import { ProfileHero } from "./profile/ProfileHero";
import { ProfileTabs } from "./profile/ProfileTabs";
import { RightRail } from "./RightRail";
import type { ArticleDashboardView, DashboardData, DashboardSidebarView, DashboardTab, DashboardUser, OrderStatusFilter } from "./types";


type Props = {
  user: DashboardUser;
  initialTab?: DashboardTab;
  data: DashboardData;
};

export function DashboardShell({
  user,
  initialTab = "activity",
  initialOrderStatus = "all",
  initialOrderId,
  data,
  articleView,
  dashboardView,
  customizeProfileOpen,
  onArticleNavigate,
  onDashboardNavigate,
  onCustomizeProfileOpen,
  onCustomizeProfileClose,
  onUserChange,
}: {
  user: DashboardUser;
  initialTab?: DashboardTab;
  initialOrderStatus?: OrderStatusFilter;
  initialOrderId?: string;
  data: DashboardData;
  articleView?: ArticleDashboardView | null;
  dashboardView?: DashboardSidebarView | null;
  customizeProfileOpen: boolean;
  onArticleNavigate: (view: ArticleDashboardView | null) => void;
  onDashboardNavigate: (view: DashboardSidebarView | null) => void;
  onCustomizeProfileOpen: () => void;
  onCustomizeProfileClose: () => void;
  onUserChange: (u: DashboardUser) => void;
}) {
  return (
    <div className={styles.shell}>
      <SidebarNav
        user={user}
        activeArticleView={articleView ?? null}
        activeDashboardView={dashboardView ?? null}
        onArticleNavigate={onArticleNavigate}
        onDashboardNavigate={onDashboardNavigate}
        onCustomizeProfile={onCustomizeProfileOpen}
      />

      <div className={styles.main}>
        <ProfileHero user={user} />

        <div className={`${styles.content} ${articleView || dashboardView ? styles.contentWide : ""}`}>
          <div className={styles.center}>
            {articleView ? (
              <ArticlesPanel view={articleView} user={user} onNavigate={onArticleNavigate} />
            ) : dashboardView === "privacy" ? (
              <AccountPrivacyPanel user={user} onUserChange={onUserChange} />
            ) : (
              <ProfileTabs
                initialTab={initialTab}
                initialOrderStatus={initialOrderStatus}
                initialOrderId={initialOrderId}
                data={data}
                user={user}
                onUserChange={onUserChange}
              />
            )}
          </div>

          {!articleView && !dashboardView ? (
            <div className={styles.right}>
              <RightRail />
            </div>
          ) : null}
        </div>
      </div>

      <ProfileCustomizeModal
        open={customizeProfileOpen}
        user={user}
        onClose={onCustomizeProfileClose}
        onUserChange={onUserChange}
      />
    </div>
  );
}
