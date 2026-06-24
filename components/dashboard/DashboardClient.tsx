"use client";

import { useEffect, useState } from "react";
import { DashboardShell } from "./DashboardShell";
import type { DashboardData, DashboardUser, DashboardTab } from "./types";
import { getMe } from "@/lib/api";

export function DashboardClient({
  user: initialUser,
  data,
  initialTab = "activity",
}: {
  user: DashboardUser;
  data: DashboardData;
  initialTab?: DashboardTab;
}) {
  const [user, setUser] = useState<DashboardUser>(initialUser);

  useEffect(() => {
    getMe()
      .then(setUser)
      .catch(() => {
        // user not logged in -> you can redirect or show login modal
      });
  }, []);

  return (
    <DashboardShell
      user={user}
      data={data}
      initialTab={initialTab}
      onUserChange={setUser}
    />
  );
}