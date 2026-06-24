'use client';

import { useState } from 'react';
import { MediaLightbox } from './MediaLightbox';

type MediaItem = { type: string; url: string; caption?: string };

function gridThumb(item: MediaItem) {
  if (item.type === 'video') return <video src={item.url} className="media-grid-img" muted />;
  if (item.type === 'image') return <img src={item.url} alt={item.caption || ''} className="media-grid-img" />;
  const icon = item.type === 'audio' ? '🎵' : '📄';
  const filename = item.url.split('/').pop()?.split('?')[0] ?? item.type;
  return (
    <div className="media-file-placeholder media-grid-img">
      <span className="media-file-icon">{icon}</span>
      <span className="media-file-label">{filename}</span>
    </div>
  );
}

export function MediaGrid({ items }: { items: MediaItem[] }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (!items || items.length === 0) return null;

  const visible = items.slice(0, 4);
  const overflow = items.length - 4;
  const gridClass = `media-grid media-grid-${Math.min(items.length, 4)}`;

  return (
    <>
      <div className={gridClass}>
        {visible.map((item, i) => {
          const isLast = i === 3 && overflow > 0;
          return (
            <button
              key={i}
              type="button"
              className="media-grid-cell"
              onClick={() => setLightboxIndex(i)}
              aria-label={item.caption || `Open media ${i + 1}`}
            >
              {gridThumb(item)}
              {isLast && (
                <div className="media-grid-more">+{overflow + 1}</div>
              )}
            </button>
          );
        })}
      </div>

      {lightboxIndex !== null && (
        <MediaLightbox
          items={items}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNav={(i) => setLightboxIndex(i)}
        />
      )}
    </>
  );
}
