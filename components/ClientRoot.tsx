'use client';

import { SocketProvider } from './SocketProvider';
import { NotificationToast } from './NotificationToast';
import { CartProvider } from './cart/CartContext';
import { CartDrawer } from './cart/CartDrawer';

export function ClientRoot({ children }: { children: React.ReactNode }) {
  return (
    <SocketProvider>
      <CartProvider>
        {children}
        <CartDrawer />
        <NotificationToast />
      </CartProvider>
    </SocketProvider>
  );
}
