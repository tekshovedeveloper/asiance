'use client';

import { SocketProvider } from './SocketProvider';
import { NotificationToast } from './NotificationToast';
import { AppToast } from './AppToast';
import { ApiActivityIndicator } from './ApiActivityIndicator';
import { CartProvider } from './cart/CartContext';
import { CartDrawer } from './cart/CartDrawer';

export function ClientRoot({ children }: { children: React.ReactNode }) {
  return (
    <SocketProvider>
      <CartProvider>
        {children}
        <CartDrawer />
        <NotificationToast />
        <AppToast />
        <ApiActivityIndicator />
      </CartProvider>
    </SocketProvider>
  );
}
