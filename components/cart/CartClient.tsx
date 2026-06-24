'use client';

import Link from 'next/link';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from './CartContext';

export function CartClient() {
  const { items, changeQty, removeItem } = useCart();

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (!items.length) {
    return (
      <div className="empty-state">
        <h2>Your bag is quiet.</h2>
        <p>New arrivals, apothecary objects, and small useful things are waiting in the shop.</p>
        <Link href="/shop" className="btn btn-dark">
          Browse shop
        </Link>
      </div>
    );
  }

  return (
    <div className="cart-layout">
      <div className="cart-items">
        {items.map((item) => (
          <article className="cart-item" key={item.cartKey}>
            <img src={item.image} alt={item.name} />
            <div>
              <h3>{item.name}</h3>
              {item.size && <p style={{ fontSize: 13, color: '#6b7280', margin: '2px 0' }}>Size: {item.size}</p>}
              <span>PKR.{item.price.toLocaleString()}</span>
              <div className="qty-controls">
                <button type="button" onClick={() => changeQty(item.cartKey, -1)} aria-label="Decrease">
                  <Minus size={14} />
                </button>
                <strong>{item.quantity}</strong>
                <button type="button" onClick={() => changeQty(item.cartKey, 1)} aria-label="Increase">
                  <Plus size={14} />
                </button>
                <button type="button" onClick={() => removeItem(item.cartKey)} aria-label="Remove">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
      <aside className="cart-summary">
        <h2>Order summary</h2>
        <div className="summary-line">
          <span>Subtotal</span>
          <strong>PKR.{total.toLocaleString()}</strong>
        </div>
        <div className="summary-line muted">
          <span>Shipping</span>
          <span>Calculated later</span>
        </div>
        <Link className="btn btn-dark full" href="/checkout">
          Checkout
        </Link>
      </aside>
    </div>
  );
}
