'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Minus, Plus, Trash2, X } from 'lucide-react';
import { useCart } from './CartContext';

export function CartDrawer() {
  const { items, isDrawerOpen, closeDrawer, removeItem, changeQty } = useCart();

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isDrawerOpen]);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closeDrawer();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [closeDrawer]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`cart-drawer-backdrop${isDrawerOpen ? ' cart-drawer-backdrop--open' : ''}`}
        onClick={closeDrawer}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        className={`cart-drawer${isDrawerOpen ? ' cart-drawer--open' : ''}`}
        role="dialog"
        aria-label="Your cart"
        aria-modal="true"
      >
        {/* Header */}
        <div className="cart-drawer-header">
          <span className="cart-drawer-title">Your cart</span>
          <button
            type="button"
            className="cart-drawer-close"
            onClick={closeDrawer}
            aria-label="Close cart"
          >
            <X size={18} />
          </button>
        </div>

        <div className="cart-drawer-divider" />

        {/* Items */}
        <div className="cart-drawer-items">
          {items.length === 0 ? (
            <div className="cart-drawer-empty">
              <p>Your bag is empty.</p>
              <Link href="/shop" className="btn btn-dark" onClick={closeDrawer}>
                Browse shop
              </Link>
            </div>
          ) : (
            items.map((item) => (
              <article className="cart-drawer-item" key={item.cartKey}>
                <img
                  src={item.image}
                  alt={item.name}
                  className="cart-drawer-item-img"
                />
                <div className="cart-drawer-item-info">
                  <p className="cart-drawer-item-name">{item.name}</p>
                  {item.size && (
                    <p className="cart-drawer-item-meta">Size: {item.size}</p>
                  )}
                  <p className="cart-drawer-item-price">
                    PKR.{item.price.toLocaleString()}
                  </p>
                  {item.sku && (
                    <p className="cart-drawer-item-meta">Product ID: {item.sku}</p>
                  )}

                  <div className="cart-drawer-item-actions">
                    <div className="cart-drawer-qty">
                      <button
                        type="button"
                        onClick={() => changeQty(item.cartKey, -1)}
                        aria-label="Decrease quantity"
                      >
                        <Minus size={12} />
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => changeQty(item.cartKey, 1)}
                        aria-label="Increase quantity"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    <button
                      type="button"
                      className="cart-drawer-remove"
                      onClick={() => removeItem(item.cartKey)}
                      aria-label="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="cart-drawer-footer">
            <div className="cart-drawer-divider" />
            <div className="cart-drawer-subtotal">
              <span>Subtotal</span>
              <strong>PKR.{subtotal.toLocaleString()}</strong>
            </div>
            <p className="cart-drawer-shipping">
              Taxes included and shipping calculated at checkout
            </p>
            <Link
              href="/cart"
              className="btn btn-dark full cart-drawer-btn"
              onClick={closeDrawer}
            >
              View cart
            </Link>
            <Link
              href="/checkout"
              className="btn btn-dark full cart-drawer-btn"
              onClick={closeDrawer}
            >
              Checkout
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
