import styles from './ProductDetail.module.css';
import type { ProductDetailProduct } from './types';

type ProductInfoProps = {
  product: ProductDetailProduct;
  selectedPrice?: number;
};

export function ProductInfo({ product, selectedPrice }: ProductInfoProps) {
  const price = selectedPrice ?? product.salePrice ?? product.price;

  return (
    <aside className={styles.infoPanel}>
      <p className={styles.brand}>{product.category || 'Product'}</p>

      <h1 className={styles.title}>{product.name}</h1>

      {product.description ? (
        <p className={styles.description}>{product.description}</p>
      ) : null}

      <p className={styles.price}>${price}</p>
    </aside>
  );
}