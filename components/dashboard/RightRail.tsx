// components/dashboard/RightRail.tsx
import styles from "./dashboard.module.css";
import { FeaturedMemberCard } from "./FeaturedMemberCard";

export function RightRail() {
  return (
    <aside className={styles.rail}>
      <FeaturedMemberCard />
    </aside>
  );
}