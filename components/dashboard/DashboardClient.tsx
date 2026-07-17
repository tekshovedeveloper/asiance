"use client";

import { useEffect, useState } from "react";
import { DashboardShell } from "./DashboardShell";
import type { ArticleDashboardView, DashboardData, DashboardSidebarView, DashboardUser, DashboardTab, OrderStatusFilter } from "./types";
import { getMe } from "@/lib/api";

export function DashboardClient({
  user: initialUser,
  data,
  initialTab = "activity",
  initialOrderStatus = "all",
}: {
  user: DashboardUser;
  data: DashboardData;
  initialTab?: DashboardTab;
  initialOrderStatus?: OrderStatusFilter;
}) {
  const [user, setUser] = useState<DashboardUser>(initialUser);
  const [articleView, setArticleView] = useState<ArticleDashboardView | null>(null);
  const [dashboardView, setDashboardView] = useState<DashboardSidebarView | null>(null);

  useEffect(() => {
    getMe()
      .then(setUser)
      .catch(() => {
        // user not logged in -> you can redirect or show login modal
      });
  }, []);

  function handleArticleNavigate(view: ArticleDashboardView | null) {
    setArticleView(view);
    if (view) setDashboardView(null);
  }

  function handleDashboardNavigate(view: DashboardSidebarView | null) {
    setDashboardView(view);
    if (view) setArticleView(null);
  }

  return (
    <DashboardShell
      user={user}
      data={data}
      initialTab={initialTab}
      initialOrderStatus={initialOrderStatus}
      articleView={articleView}
      dashboardView={dashboardView}
      onArticleNavigate={handleArticleNavigate}
      onDashboardNavigate={handleDashboardNavigate}
      onUserChange={setUser}
    />
  );
}
