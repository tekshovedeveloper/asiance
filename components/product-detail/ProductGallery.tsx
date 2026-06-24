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
  const images = uniqueImages([
    activeImage || product.image,
    ...(product.images ?? []),
  ]);

  return (
    <section className={styles.gallery}>
      {images.map((image, index) => (
        <div className={styles.imageCard} key={`${image}-${index}`}>
          <img
            src={image}
            alt={`${product.name} image ${index + 1}`}
            className={styles.productImage}
          />
        </div>
      ))}
    </section>
  );
}