// components/dashboard/TabPanel.tsx
import type { ReactNode } from "react";

export function TabPanel({ when, children }: { when: boolean; children: ReactNode }) {
  if (!when) return null;
  return <div>{children}</div>;
}