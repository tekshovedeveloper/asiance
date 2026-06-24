'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type CartItem = {
  cartKey: string;
  slug: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  size?: string;
  sku?: string;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  addItem: (item: Omit<CartItem, 'cartKey' | 'quantity'>) => void;
  removeItem: (cartKey: string) => void;
  changeQty: (cartKey: string, delta: number) => void;
};

const CART_KEY = 'asiance_cart';

function readCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  return JSON.parse(localStorage.getItem(CART_KEY) ?? '[]');
}

function writeCart(items: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event('asiance-cart'));
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isDrawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    setItems(readCart());
    const sync = () => setItems(readCart());
    window.addEventListener('asiance-cart', sync);
    return () => window.removeEventListener('asiance-cart', sync);
  }, []);

  const count = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  );

  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const addItem = useCallback((incoming: Omit<CartItem, 'cartKey' | 'quantity'>) => {
    const cartKey = `${incoming.slug}::${incoming.size ?? ''}`;
    const current = readCart();
    const existing = current.find((i) => i.cartKey === cartKey);
    const next = existing
      ? current.map((i) =>
          i.cartKey === cartKey ? { ...i, quantity: i.quantity + 1 } : i,
        )
      : [...current, { ...incoming, cartKey, quantity: 1 }];
    writeCart(next);
    setItems(next);
  }, []);

  const removeItem = useCallback((cartKey: string) => {
    const next = readCart().filter((i) => i.cartKey !== cartKey);
    writeCart(next);
    setItems(next);
  }, []);

  const changeQty = useCallback((cartKey: string, delta: number) => {
    const next = readCart()
      .map((i) => i.cartKey === cartKey ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i);
    writeCart(next);
    setItems(next);
  }, []);

  return (
    <CartContext.Provider value={{ items, count, isDrawerOpen, openDrawer, closeDrawer, addItem, removeItem, changeQty }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
