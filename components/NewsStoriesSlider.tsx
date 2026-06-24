'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import type { NewsItem } from '@/lib/types';

function visibleCount() {
  if (typeof window === 'undefined') return 3;
  if (window.innerWidth <= 760) return 1;
  if (window.innerWidth <= 1080) return 2;
  return 3;
}

export function NewsStoriesSlider({ items }: { items: NewsItem[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(3);

  const maxIndex = Math.max(0, items.length - visible);

  useEffect(() => {
    function syncVisible() {
      setVisible(visibleCount());
      setCurrent((value) => Math.min(value, Math.max(0, items.length - visibleCount())));
    }

    syncVisible();
    window.addEventListener('resize', syncVisible);
    return () => window.removeEventListener('resize', syncVisible);
  }, [items.length]);

  useEffect(() => {
    const track = trackRef.current;
    const firstSlide = track?.querySelector<HTMLElement>('.news-story-slide');
    if (!track || !firstSlide) return;

    const gap = window.innerWidth <= 760 ? 14 : 18;
    const offset = current * (firstSlide.getBoundingClientRect().width + gap);
    track.style.transform = `translate3d(${-offset}px,0,0)`;
  }, [current, visible, items.length]);

  useEffect(() => {
    if (items.length <= visible) return undefined;
    const timer = window.setInterval(() => {
      setCurrent((value) => (value >= maxIndex ? 0 : value + 1));
    }, 4200);

    return () => window.clearInterval(timer);
  }, [items.length, maxIndex, visible]);

  if (!items.length) return null;

  return (
    <section className="news-stories-slider" aria-label="Sliding news stories">
      <div className="news-stories-header">
        <h3>
          the <em>must-read</em> stories of the week
        </h3>
        <div className="news-stories-actions">
          <Link href="/community-news">read all</Link>
          <button
            disabled={current <= 0}
            onClick={() => setCurrent((value) => Math.max(0, value - 1))}
            type="button"
            aria-label="Previous news"
          >
            <ArrowLeft size={17} />
          </button>
          <button
            disabled={current >= maxIndex}
            onClick={() => setCurrent((value) => Math.min(maxIndex, value + 1))}
            type="button"
            aria-label="Next news"
          >
            <ArrowRight size={17} />
          </button>
        </div>
      </div>
      <div className="news-stories-window">
        <div
          className="news-stories-track"
          ref={trackRef}
          // expose visible as a CSS variable so slide width can adapt
          style={{ ['--visible' as any]: visible }}
        >
          {items.map((item, index) => (
            <article className={`news-story-slide ${index % 3 === 0 ? 'large' : 'portrait'}`} key={item.slug}>
              <Link href={`/community-news/${item.slug}`} className="news-story-media">
                {item.image ? <img src={item.image} alt={item.title} /> : null}
              </Link>
              <div className="news-story-content">
                <div>
                  <span>{item.categoryName}</span>
                  <Link href={`/community-news/${item.slug}`}>read now</Link>
                </div>
                <h4>
                  <Link href={`/community-news/${item.slug}`}>{item.title.toLowerCase()}</Link>
                </h4>
              </div>
            </article>
          ))}
        </div>
      </div>
      <div className="news-stories-dots">
        {Array.from({ length: maxIndex + 1 }).map((_, index) => (
          <button
            className={index === current ? 'active' : ''}
            key={index}
            onClick={() => setCurrent(index)}
            type="button"
            aria-label={`Go to news slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
