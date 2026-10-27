'use client';

import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './ProductDetail.module.css';
import type { ProductDetailProduct } from './types';

type ProductGalleryProps = {
  product: ProductDetailProduct;
  activeImage?: string;
};

function uniqueImages(images: string[]) {
  return Array.from(
    new Set(
      images
        .map((image) => image.trim())
        .filter(Boolean),
    ),
  );
}

export function ProductGallery({ product, activeImage }: ProductGalleryProps) {
  const images = useMemo(
    () => uniqueImages([activeImage || product.image, product.image, ...(product.images ?? [])]),
    [activeImage, product.image, product.images],
  );
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    setSelectedIndex(0);
  }, [activeImage]);

  const selectedImage = images[selectedIndex] ?? images[0];
  const hasMultipleImages = images.length > 1;

  function move(direction: number) {
    setSelectedIndex((current) => (current + direction + images.length) % images.length);
  }

  return (
    <section className={styles.gallery} aria-label={`${product.name} image gallery`}>
      <div className={styles.imageCard}>
        <img
          src={selectedImage}
          alt={`${product.name} image ${selectedIndex + 1}`}
          className={styles.productImage}
        />
        {hasMultipleImages ? (
          <>
            <button className={`${styles.galleryArrow} ${styles.galleryArrowLeft}`} type="button" onClick={() => move(-1)} aria-label="Previous product image">
              <ChevronLeft aria-hidden="true" />
            </button>
            <button className={`${styles.galleryArrow} ${styles.galleryArrowRight}`} type="button" onClick={() => move(1)} aria-label="Next product image">
              <ChevronRight aria-hidden="true" />
            </button>
            <span className={styles.galleryCount}>{selectedIndex + 1} / {images.length}</span>
          </>
        ) : null}
      </div>

      {hasMultipleImages ? (
        <div className={styles.thumbnailRail} aria-label="Choose a product image">
          {images.map((image, index) => (
            <button
              className={`${styles.thumbnailButton} ${selectedIndex === index ? styles.thumbnailButtonActive : ''}`}
              type="button"
              onClick={() => setSelectedIndex(index)}
              aria-label={`Show product image ${index + 1}`}
              aria-pressed={selectedIndex === index}
              key={image}
            >
              <img src={image} alt="" />
            </button>
          ))}
        </div>
      ) : null}
    </section>
  );
}
