'use client';

import { useEffect, useCallback } from 'react';

type MediaItem = { type: string; url: string; caption?: string };

export function MediaLightbox({
  items,
  index,
  onClose,
  onNav,
}: {
  items: MediaItem[];
  index: number;
  onClose: () => void;
  onNav: (next: number) => void;
}) {
  const current = items[index];
  const hasPrev = index > 0;
  const hasNext = index < items.length - 1;

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && hasPrev) onNav(index - 1);
      if (e.key === 'ArrowRight' && hasNext) onNav(index + 1);
    },
    [onClose, onNav, index, hasPrev, hasNext],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [handleKey]);

  if (!current) return null;

  const filename = current.url.split('/').pop()?.split('?')[0] ?? 'file';

  function renderMedia() {
    if (current.type === 'video') {
      return <video src={current.url} controls autoPlay className="lightbox-img" />;
    }
    if (current.type === 'audio') {
      return (
        <div className="lightbox-audio-box">
          <span className="lightbox-file-icon">🎵</span>
          <p className="lightbox-filename">{filename}</p>
          <audio src={current.url} controls autoPlay className="lightbox-audio-player" />
        </div>
      );
    }
    if (current.type === 'file') {
      return (
        <div className="lightbox-audio-box">
          <span className="lightbox-file-icon">📄</span>
          <p className="lightbox-filename">{filename}</p>
          <a
            href={current.url}
            target="_blank"
            rel="noreferrer"
            className="lightbox-open-link"
          >
            Open / Download
          </a>
        </div>
      );
    }
    return <img src={current.url} alt={current.caption || ''} className="lightbox-img" />;
  }

  return (
    <div
      className="lightbox-overlay"
      onClick={onClose}
    >
      <div className="lightbox-box" onClick={(e) => e.stopPropagation()}>
        <button className="lightbox-close" onClick={onClose} type="button" aria-label="Close">×</button>

        {hasPrev && (
          <button className="lightbox-arrow lightbox-prev" onClick={() => onNav(index - 1)} type="button" aria-label="Previous">‹</button>
        )}

        <div className="lightbox-media">
          {renderMedia()}
          {current.caption ? <p className="lightbox-caption">{current.caption}</p> : null}
        </div>

        {hasNext && (
          <button className="lightbox-arrow lightbox-next" onClick={() => onNav(index + 1)} type="button" aria-label="Next">›</button>
        )}

        <div className="lightbox-dots">
          {items.map((_, i) => (
            <button
              key={i}
              className={`lightbox-dot${i === index ? ' active' : ''}`}
              onClick={() => onNav(i)}
              type="button"
              aria-label={`Go to item ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
