'use client';

import { useState } from 'react';
import { useCart } from './CartContext';
import type { Product } from '@/lib/types';

type Props = {
  product: Product;
  selectedValues?: Record<string, string>;
  selectedVariationId?: string;
  selectedVariationName?: string;
  disabled?: boolean;
  disabledLabel?: string;
};

function cleanSelectedValues(values?: Record<string, string>) {
  if (!values) return undefined;

  const selected = Object.fromEntries(
    Object.entries(values).filter(([, value]) => String(value ?? '').trim()),
  );

  return Object.keys(selected).length ? selected : undefined;
}

export function AddToCartButton({
  product,
  selectedValues,
  selectedVariationId,
  selectedVariationName,
  disabled = false,
  disabledLabel = 'unavailable',
}: Props) {
  const { addItem, openDrawer } = useCart();
  const [loading, setLoading] = useState(false);

  async function add() {
    if (disabled) return;

    setLoading(true);
    // Brief delay so the loader is visible
    await new Promise((r) => setTimeout(r, 450));

    const size = selectedValues
      ? Object.values(selectedValues).filter(Boolean).join(' / ')
      : undefined;
    const selectedAttributes = cleanSelectedValues(selectedValues);

    addItem({
      slug: product.slug,
      productId: product._id ?? product.id ?? product.slug,
      name: product.name,
      price: product.salePrice ?? product.price,
      image: product.image,
      size: size || undefined,
      sku: product.sku || undefined,
      variationId: selectedVariationId,
      selectedVariationName,
      selectedAttributes,
    });

    setLoading(false);
    openDrawer();
  }

  return (
    <button
      className="icon-text-btn"
      type="button"
      onClick={() => void add()}
      disabled={loading || disabled}
      style={{ opacity: loading || disabled ? 0.7 : 1, cursor: loading || disabled ? 'not-allowed' : 'pointer' }}
    >
      {disabled ? (
        <span>{disabledLabel}</span>
      ) : loading ? (
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
