'use client';

import { useState } from 'react';
import styles from './ProductDetail.module.css';

type Detail = {
  title: string;
  description: string;
};

type Props = {
  details?: Detail[];
};

export function ProductDetailsAccordion({ details = [] }: Props) {
  const cleanDetails = details.filter(
    (detail) => detail.title?.trim() || detail.description?.trim(),
  );

  // use '' if you want all closed by default
  // use 0 if you want first one open by default
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  if (!cleanDetails.length) {
    return null;
  }

  return (
    <section className={styles.detailsSection}>
      <div className={styles.detailsList}>
        {cleanDetails.map((detail, index) => {
          const isOpen = openIndex === index;

          return (
            <article
              className={styles.detailsItem}
              key={`${detail.title}-${index}`}
            >
              <button
                className={styles.detailsHeader}
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : index)}
              >
                <span className={styles.detailsTitleWrap}>
                  <span className={styles.detailsSquare} />
                  <span className={styles.detailsTitle}>
                    {detail.title}
                  </span>
                </span>

                <span className={styles.detailsIcon}>
                  {isOpen ? '-' : '+'}
                </span>
              </button>

              <div
                className={`${styles.detailsBody} ${
                  isOpen ? styles.detailsBodyOpen : ''
                }`}
              >
                <div className={styles.detailsBodyInner}>
                  <div className={styles.detailsText}>
                    {detail.description.split('\n').map((line, lineIndex) => (
                      <p key={`${line}-${lineIndex}`}>{line}</p>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}