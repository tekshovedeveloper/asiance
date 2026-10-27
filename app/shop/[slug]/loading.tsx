import { SiteHeader } from '@/components/SiteHeader';
import styles from '@/components/product-detail/ProductDetail.module.css';

export default function ProductLoading() {
  return (
    <main className={styles.page}>
      <SiteHeader active="Shop" />
      <section className={styles.loadingWrapper} aria-label="Loading product">
        <div className={styles.loadingInfo}>
          <span />
          <span />
          <span />
          <span />
        </div>
        <div className={styles.loadingImage} />
        <div className={styles.loadingActions}>
          <span />
          <span />
        </div>
      </section>
    </main>
  );
}
