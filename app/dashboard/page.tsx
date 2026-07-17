// import { SiteHeader } from "@/components/SiteHeader";
// import { DashboardShell } from "@/components/dashboard/DashboardShell";
// import { getActivity, getFriends, getGroups, getFiles, getThreads } from "@/lib/api";

// export default async function DashboardPage() {
//   const [activity, friends, groups, threads, files] = await Promise.all([
//     getActivity(),
//     getFriends(),
//     getGroups(),
//     getThreads(),
//     getFiles(),
//   ]);

//   return (
//     <main>
//       <SiteHeader />
//       <DashboardShell
//       user={{
//         name: "Dan Cortese",
//         username: "@dan",
//         email: "bp_def.data+21@gmail.com",
//         lastActiveText: "active 3 minutes ago",
//         bio: "Nulla facilisi. Aenean ultrices lectus tincidunt enim sodales sagittis Nulla facilisi. Aenean ultrices lectus tincidunt enim sodales sagittis Nulla facilisi. Aenean ultrices lectus tincidunt enim sodales sagittis Nulla facilisi. Aenean ultrices lectus tincidunt enim sodales sagittis Nulla facilisi. Aenean ultrices lectus tincidunt enim sodales sagittis Nulla facilisi. Aenean ultrices lectus tincidunt enim sodales sagittis...",
//         coverImageUrl: "", // empty -> fallback
//         avatarUrl: "",     // empty -> fallback
//       }}
//         initialTab="activity"
//         data={{ activity, friends, groups, threads, files }}
//       />
//     </main>
//   );
// }

import { SiteHeader } from "@/components/SiteHeader";
import { DashboardClient } from "@/components/dashboard/DashboardClient";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { getActivity, getGroups, getFiles, getThreads } from "@/lib/api";
import type { DashboardTab, OrderStatusFilter } from "@/components/dashboard/types";

const dashboardTabs = ["activity", "profile", "friends", "groups", "orders"] as const;
const orderStatuses = ["all", "processing", "shipped", "completed", "cancelled", "refunded", "failed"] as const;

type DashboardSearchParams = {
  tab?: string | string[];
  status?: string | string[];
};

function firstParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function parseDashboardTab(value?: string | string[]): DashboardTab {
  const tab = firstParam(value);
  return tab && (dashboardTabs as readonly string[]).includes(tab) ? (tab as DashboardTab) : "activity";
}

function parseOrderStatus(value?: string | string[]): OrderStatusFilter {
  const status = firstParam(value);
  return status && (orderStatuses as readonly string[]).includes(status) ? (status as OrderStatusFilter) : "all";
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: Promise<DashboardSearchParams>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const initialTab = parseDashboardTab(resolvedSearchParams.tab);
  const initialOrderStatus = parseOrderStatus(resolvedSearchParams.status);

  const [activity, groups, threads, files] = await Promise.all([
    getActivity(),
    getGroups(),
    getThreads(),
    getFiles(),
  ]);
  const friends: [] = [];

  const initialUser = {
    name: "Member",
    username: "@member",
    email: "",
    lastActiveText: "active now",
    bio: "",
    avatarUrl: "",
    coverImageUrl: "",
  };

  return (
    <>
      <SiteHeader />

      <RequireAuth>
        <DashboardClient
          user={initialUser}
          initialTab={initialTab}
          initialOrderStatus={initialOrderStatus}
          data={{ activity, friends, groups, threads, files }}
        />
      </RequireAuth>
    </>
  );
}
