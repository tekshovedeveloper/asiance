"use client";

import styles from "./dashboard.module.css";

export type LibraryAsset = {
  id: string;
  url: string;
  title?: string;
};

const mockAssets: LibraryAsset[] = [
  { id: "1", url: "/assets/profile/dummy-profile.png", title: "Avatar 1" },
  { id: "2", url: "/assets/profile/dummy-cover.png", title: "Cover 1" },
];

export function LibraryPickerModal({
  open,
  title,
  onClose,
  onPick,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  onPick: (asset: LibraryAsset) => void;
}) {
  if (!open) return null;

  return (
    <div className={styles.modalBackdrop} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        <div className={styles.modalHead}>
          <div className={styles.modalTitle}>{title}</div>
          <button className={styles.modalClose} onClick={onClose} type="button">
            ✕
          </button>
        </div>

        <div className={styles.modalGrid}>
          {mockAssets.map((a) => (
            <button
              key={a.id}
              type="button"
              className={styles.assetCard}
              onClick={() => onPick(a)}
            >
              <div
                className={styles.assetThumb}
                style={{ backgroundImage: `url(${a.url})` }}
              />
              <div className={styles.assetTitle}>{a.title ?? "Asset"}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}