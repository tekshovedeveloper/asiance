'use client';

import { useState } from 'react';
import { useCart } from './CartContext';
import type { Product } from '@/lib/types';

type Props = {
  product: Product;
  selectedValues?: Record<string, string>;
};

export function AddToCartButton({ product, selectedValues }: Props) {
  const { addItem, openDrawer } = useCart();
  const [loading, setLoading] = useState(false);

  async function add() {
    setLoading(true);
    // Brief delay so the loader is visible
    await new Promise((r) => setTimeout(r, 450));

    const size = selectedValues
      ? Object.values(selectedValues).filter(Boolean).join(' / ')
      : undefined;

    addItem({
      slug: product.slug,
      productId: product._id ?? product.id ?? product.slug,
      name: product.name,
      price: product.salePrice ?? product.price,
      image: product.image,
      size: size || undefined,
      sku: product.sku || undefined,
    });

    setLoading(false);
    openDrawer();
  }

  return (
    <button
      className="icon-text-btn"
      type="button"
      onClick={() => void add()}
      disabled={loading}
      style={{ opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
    >
      {loading ? (
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="cart-btn-spinner" />
          Adding…
        </span>
      ) : (
        <span>Add to bag</span>
      )}
    </button>
  );
}
