import Link from "next/link";
import styles from "./dashboard.module.css";

export function Topbar() {
  return (
    <header className={styles.topbar}>
      <div className={styles.search}>
        <input placeholder="To search, type and hit enter" />
      </div>

      <nav className={styles.toplinks}>
        <Link href="/community">Community</Link>
        <Link href="/features">Features</Link>
        <Link href="/projects">Projects</Link>
        <Link href="/news">News</Link>
        <Link href="/hr">HR</Link>
      </nav>

      <div className={styles.icons}>
        <button className={styles.iconBtn} aria-label="Notifications">🔔</button>
        <button className={styles.iconBtn} aria-label="Messages">✉️</button>
        <button className={styles.iconBtn} aria-label="Menu">☰</button>
      </div>
    </header>
  );
}