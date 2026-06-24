// components/dashboard/ProfileHero.tsx
import styles from "../dashboard.module.css";
import type { DashboardUser } from "../types";

const FALLBACK_COVER = "/assets/profile/dummy-cover.jpg";
const FALLBACK_AVATAR = "/assets/profile/dymmy-profile.jpeg";

const isValid = (v?: string | null) => typeof v === "string" && v.trim().length > 0;

export function ProfileHero({ user }: { user: DashboardUser }) {
  const coverUrl = isValid(user.coverImageUrl) ? user.coverImageUrl!.trim() : FALLBACK_COVER;
  const avatarUrl = isValid(user.avatarUrl) ? user.avatarUrl!.trim() : FALLBACK_AVATAR;

  return (
    <section className={styles.hero}>
      <div className={styles.cover} style={{ backgroundImage: `url(${coverUrl})` }} />

      {/* overlay content on cover */}
      <div className={styles.heroOverlay}>
        <div className={styles.heroGrid}>
          {/* LEFT */}
          <div className={styles.heroLeft}>
            <div className={styles.heroAvatar} style={{ backgroundImage: `url(${avatarUrl})` }} />
            <div className={styles.heroLeftMeta}>
              <div className={styles.heroUsername}>{user.username}</div>
              <div className={styles.heroLastActive}>{user.lastActiveText}</div>
            </div>
          </div>

          {/* RIGHT */}
          <div className={styles.heroRight}>
            <h1 className={styles.heroName}>{user.name}</h1>

            {user.bio ? <p className={styles.heroBio}>{user.bio}</p> : null}

            
          </div>
        </div>
      </div>
    </section>
  );
}