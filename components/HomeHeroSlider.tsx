'use client';

import Link from 'next/link';
import { ArrowLeft, ArrowRight, Pause, Play } from 'lucide-react';
import { useEffect, useState, type KeyboardEvent } from 'react';
import { CommunityHeroAccount } from '@/components/CommunityHeroAccount';
import type { HomeSlide } from '@/lib/types';
import styles from './HomeHeroSlider.module.css';

const ORIGINAL_IMAGE = 'https://res.cloudinary.com/ux81wsbq/image/upload/v1786640148/asiance/site-assets/home/asiance-community-hero-png.png';
const SLIDE_DURATION = 6000;

export function HomeHeroSlider({ slides }: { slides: HomeSlide[] }) {
  const availableSlides = slides.filter((slide) => slide.article && slide.active && slide.image);
  const total = availableSlides.length + 1;
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const currentIndex = index % total;
  const rotating = total > 1 && !hovered && !focused && !paused && visible && !reducedMotion;

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncPreference = () => setReducedMotion(preference.matches);
    const syncVisibility = () => setVisible(document.visibilityState === 'visible');
    syncPreference();
    syncVisibility();
    preference.addEventListener('change', syncPreference);
    document.addEventListener('visibilitychange', syncVisibility);
    return () => {
      preference.removeEventListener('change', syncPreference);
      document.removeEventListener('visibilitychange', syncVisibility);
    };
  }, []);

  useEffect(() => {
    if (!rotating) return;
    const timer = window.setTimeout(() => setIndex((value) => (value + 1) % total), SLIDE_DURATION);
    return () => window.clearTimeout(timer);
  }, [currentIndex, rotating, total]);

  function move(direction: number) {
    setIndex((value) => (value + direction + total) % total);
  }

  function handleKeys(event: KeyboardEvent<HTMLElement>) {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      if ((event.target as HTMLElement).matches('input, textarea, select')) return;
      event.preventDefault();
      move(event.key === 'ArrowLeft' ? -1 : 1);
    }
  }

  return (
    <section
      className={`community-hero ${styles.hero} ${total > 1 ? styles.hasSlides : ''}`}
      aria-label="Homepage highlights"
      aria-roledescription="carousel"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
      }}
      onKeyDown={handleKeys}
      onTouchStart={(event) => setTouchStart(event.touches[0]?.clientX ?? null)}
      onTouchEnd={(event) => {
        const end = event.changedTouches[0]?.clientX;
        if (touchStart !== null && end !== undefined && Math.abs(touchStart - end) > 60) move(touchStart > end ? 1 : -1);
        setTouchStart(null);
      }}
    >
      <div className={styles.frames} aria-live={rotating ? 'off' : 'polite'}>
        <div className={`${styles.slide} ${currentIndex === 0 ? styles.active : ''}`} aria-hidden={currentIndex !== 0} inert={currentIndex !== 0} role="group" aria-roledescription="slide" aria-label={`1 of ${total}`}>
          <img className="community-hero__image" src={ORIGINAL_IMAGE} alt="A mother embracing her young child in a softly lit room" fetchPriority="high" />
          <div className="community-hero__scrim" aria-hidden="true" />
          <div className="community-hero__content">
            <h1 id="community-hero-title" className="community-hero__title">
              A community<br />for <em>every chapter</em><br />of your life.
            </h1>
            <p className="community-hero__copy">Beauty. Love. Family. Lifestyle.<br />All connected. All for you.</p>
            <div className="community-hero__actions">
              <Link href="/circles" className="community-hero__button community-hero__button--primary">Explore Circle</Link>
              <Link href="/shop" className="community-hero__button">Shop now</Link>
            </div>
          </div>
        </div>

        {availableSlides.map((slide, slideIndex) => (
          <div key={slide._id} className={`${styles.slide} ${currentIndex === slideIndex + 1 ? styles.active : ''}`} aria-hidden={currentIndex !== slideIndex + 1} inert={currentIndex !== slideIndex + 1} role="group" aria-roledescription="slide" aria-label={`${slideIndex + 2} of ${total}`}>
            <img className="community-hero__image" src={slide.image} alt={slide.imageAlt || slide.article!.title} loading="lazy" />
            <div className="community-hero__scrim" aria-hidden="true" />
            <div className="community-hero__content">
              <h2 className={`community-hero__title ${styles.blogTitle}`}>{slide.article!.title}</h2>
              <p className={`community-hero__copy ${styles.excerpt}`}>{slide.article!.excerpt}</p>
              <div className="community-hero__actions">
                <Link href={`/blog/${slide.article!.slug}`} className="community-hero__button community-hero__button--primary">Read more</Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      <CommunityHeroAccount />

      {total > 1 ? (
        <>
          <span className={styles.counter} aria-hidden="true">{String(currentIndex + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}</span>
          <p className={styles.hint}>Hover to pause · Use arrows to explore</p>
          <div className={styles.controls} role="group" aria-label="Slideshow controls">
            <button type="button" className={styles.arrow} aria-label="Previous slide" onClick={() => move(-1)}><ArrowLeft size={20} /></button>
            <div className={styles.indicators}>
              {Array.from({ length: total }, (_, slideIndex) => (
                <button key={slideIndex} type="button" className={`${styles.indicator} ${currentIndex === slideIndex ? styles.selected : ''}`} aria-label={`Go to slide ${slideIndex + 1}`} aria-current={currentIndex === slideIndex ? 'true' : undefined} onClick={() => setIndex(slideIndex)} />
              ))}
            </div>
            <button type="button" className={styles.arrow} aria-label="Next slide" onClick={() => move(1)}><ArrowRight size={20} /></button>
            <button type="button" className={styles.arrow} aria-label={paused ? 'Play slideshow' : 'Pause slideshow'} onClick={() => setPaused((value) => !value)}>{paused ? <Play size={16} /> : <Pause size={16} />}</button>
          </div>
        </>
      ) : null}
    </section>
  );
}
