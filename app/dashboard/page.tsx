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

export default async function DashboardPage() {
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
          initialTab="activity"
          data={{ activity, friends, groups, threads, files }}
        />
      </RequireAuth>
    </>
  );
}