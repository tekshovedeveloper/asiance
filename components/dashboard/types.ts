// components/dashboard/types.ts
export type DashboardTab = "activity" | "profile" | "friends" | "groups" | "forums" | "files" | "orders";
export type OrderStatusFilter = "all" | "processing" | "shipped" | "completed" | "cancelled" | "refunded" | "failed";
export type ArticleDashboardView = "add" | "published" | "pending";
export type DashboardSidebarView = "privacy";

export type DashboardUser = {
  id?: string;
  name: string;
  username: string;        // maps from handle
  email: string;
  lastActiveText: string;  // maps from status
  bio?: string | null;
  interests?: string[] | null;
  avatarUrl?: string | null;     // maps from avatar
  coverImageUrl?: string | null; // maps from cover
  facebookUrl?: string | null;
  instagramUrl?: string | null;
  tiktokUrl?: string | null;
  snapchatUrl?: string | null;
  emailLink?: string | null;
  showFriends?: boolean | null;
  showProducts?: boolean | null;
};

  
export type DashboardData = {
  activity: any[];
  friends: { id: string; name: string; avatarUrl?: string; status?: string }[];
  groups: any[];
  threads: any[];
  files: any[];
};
