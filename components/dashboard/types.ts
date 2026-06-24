// components/dashboard/types.ts
export type DashboardTab = "activity" | "profile" | "friends" | "groups" | "forums" | "files" | "orders";

export type DashboardUser = {
  id?: string;
  name: string;
  username: string;        // maps from handle
  email: string;
  lastActiveText: string;  // maps from status
  bio?: string | null;
  avatarUrl?: string | null;     // maps from avatar
  coverImageUrl?: string | null; // maps from cover
};

  
export type DashboardData = {
  activity: any[];
  friends: { id: string; name: string; avatarUrl?: string; status?: string }[];
  groups: any[];
  threads: any[];
  files: any[];
};