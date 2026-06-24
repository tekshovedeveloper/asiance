import Link from 'next/link';
import type { Product } from '@/lib/types';
import { AddToCartButton } from './cart/AddToCartButton';

export function ProductCard({ product }: { product: Product }) {
  const price = product.salePrice ?? product.price;

  return (
    <article className="product-card">
      <Link href={`/shop/${product.slug}`} className="product-image">
        {product.badge ? <span className="pill over-image">{product.badge}</span> : null}
        <img src={product.image} alt={product.name} />
      </Link>
      <div className="product-meta">
        <span>{product.category}</span>
        <strong>{product.name}</strong>
        <div className="product-row">
          <span className="price">${price}</span>
          <AddToCartButton product={product} />
        </div>
      </div>
    </article>
  );
}
