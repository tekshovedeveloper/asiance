// import Link from "next/link";
// import styles from "./dashboard.module.css";
// import type { DashboardUser } from "./types";

// const nav = [
//   { label: "Dashboard", href: "/dashboard" },
//   { label: "Projects", href: "/projects" },
//   { label: "Activity", href: "/activity" },
//   { label: "Documents", href: "/documents" },
//   { label: "Files", href: "/library" },
// ];

// export function SidebarNav({ user }: { user: DashboardUser }) {
//   return (
//     <aside className={styles.sidebar}>
//       <div className={styles.sidebarUser}>
//         <div className={styles.avatar} />
//         <div>
//           <div className={styles.userName}>{user.name}</div>
//           <div className={styles.userEmail}>{user.email}</div>
//           <Link className={styles.signout} href="/logout">
//             Sign Out
//           </Link>
//         </div>
//       </div>

//       <nav className={styles.nav}>
//         {nav.map((item) => (
//           <Link key={item.href} href={item.href} className={styles.navItem}>
//             {item.label}
//           </Link>
//         ))}
//       </nav>
//     </aside>
//   );
// }


// components/dashboard/SidebarNav.tsx
import Link from "next/link";
import Image from "next/image";
import styles from "./dashboard.module.css";
import type { DashboardUser } from "./types";

const FALLBACK_COVER = "/assets/profile/dummy-cover.jpg";
const FALLBACK_AVATAR = "/assets/profile/dymmy-profile.jpeg";





function Icon({
  children,
  title,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <span className={styles.icon} aria-hidden="true" title={title}>
      {children}
    </span>
  );
}

const Icons = {
  dashboard: (
    <svg viewBox="0 0 24 24" className={styles.svg} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 11l9-8 9 8" />
      <path d="M5 10v11h14V10" />
    </svg>
  ),
  projects: (
    <svg viewBox="0 0 24 24" className={styles.svg} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
      <path d="M7 7v10" />
      <path d="M17 7v10" />
    </svg>
  ),
  activity: (
    <svg viewBox="0 0 24 24" className={styles.svg} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 19V5" />
      <path d="M8 19v-6" />
      <path d="M12 19v-10" />
      <path d="M16 19v-3" />
      <path d="M20 19V8" />
    </svg>
  ),
  documents: (
    <svg viewBox="0 0 24 24" className={styles.svg} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7z" />
      <path d="M14 2v5h5" />
      <path d="M8 13h8" />
      <path d="M8 17h8" />
    </svg>
  ),
  files: (
    <svg viewBox="0 0 24 24" className={styles.svg} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 16.5a4.5 4.5 0 0 0-1.3-8.8A6 6 0 0 0 6.2 9.6 4 4 0 0 0 7 17.5" />
      <path d="M8 17h10" />
    </svg>
  ),
  dropdown: (
    <svg viewBox="0 0 24 24" className={styles.svg} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 6h16" />
      <path d="M4 12h10" />
      <path d="M4 18h16" />
    </svg>
  ),
};

type NavItem = {
  label: string;
  href?: string;
  icon: React.ReactNode;
  children?: { label: string; href: string }[];
};

const nav: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <Icon title="Dashboard">{Icons.dashboard}</Icon>,
  },
  {
    label: "Projects",
    href: "/projects",
    icon: <Icon title="Projects">{Icons.projects}</Icon>,
  },
  {
    label: "Dropdown",
    icon: <Icon title="Dropdown">{Icons.dropdown}</Icon>,
    children: [
      { label: "Item 1", href: "/dropdown/item-1" },
      { label: "Item 2", href: "/dropdown/item-2" },
    ],
  },
  {
    label: "Activity",
    href: "/activity",
    icon: <Icon title="Activity">{Icons.activity}</Icon>,
  },
  {
    label: "Documents",
    href: "/documents",
    icon: <Icon title="Documents">{Icons.documents}</Icon>,
  },
  {
    label: "Files",
    href: "/library",
    icon: <Icon title="Files">{Icons.files}</Icon>,
  },
];

export function SidebarNav({ user }: { user: DashboardUser }) {

    const coverUrl = user.coverImageUrl?.trim() ? user.coverImageUrl : FALLBACK_COVER;
    const avatarUrl = user.avatarUrl?.trim() ? user.avatarUrl : FALLBACK_AVATAR;


  return (
     <aside className={styles.sidebar}>
    <div className={styles.sidebarTopCard}>
  <div
    className={styles.sidebarTopBg}
    style={
      {
        ["--sidebar-cover" as any]: `url(${coverUrl})`,
      } as React.CSSProperties
    }
  />

  <div className={styles.sidebarTopInner}>
    <div className={styles.sidebarAvatar}>
    <img
  src={avatarUrl}
  alt=""
  width={44}
  height={44}
  className={styles.sidebarAvatarImg}
/>
    </div>

    <div className={styles.sidebarUserMeta}>
      <div>
        <div className={styles.sidebarName}>{user.name}</div>
        <Link className={styles.sidebarSignout} href="/logout">
          Sign Out
        </Link>
      </div>
      <div className={styles.sidebarEmail}>{user.email}</div>
    </div>
  </div>
</div>

      <nav className={styles.sideNav}>
        {nav.map((item) => {
          if (item.children?.length) {
            return (
              <details key={item.label} className={styles.navGroup}>
                <summary className={styles.navItem}>
                  <span className={styles.navLeft}>
                    {item.icon}
                    <span className={styles.navLabel}>{item.label}</span>
                  </span>
                  <span className={styles.chev}>▾</span>
                </summary>

                <div className={styles.navChildren}>
                  {item.children.map((c) => (
                    <Link key={c.href} href={c.href} className={styles.navChildItem}>
                      {c.label}
                    </Link>
                  ))}
                </div>
              </details>
            );
          }

          return (
            <Link key={item.href} href={item.href!} className={styles.navItem}>
              <span className={styles.navLeft}>
                {item.icon}
                <span className={styles.navLabel}>{item.label}</span>
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}