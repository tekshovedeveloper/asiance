

'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import styles from './Checkout.module.css';

type LastOrder = {
  id?: string;
  subtotal?: number;
  shipping?: number;
  total?: number;
  name?: string;
  email?: string;
  address?: string;
  items?: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
};

function money(value?: number) {
  return `$${Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function ThankYouClient() {
  const [order, setOrder] = useState<LastOrder | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('asiance_last_order');
    if (saved) setOrder(JSON.parse(saved));
  }, []);

  const computedSubtotal = useMemo(() => {
    if (!order?.items?.length) return Number(order?.subtotal || 0);

    return order.items.reduce((sum, item) => {
      return sum + Number(item.price || 0) * Number(item.quantity || 1);
    }, 0);
  }, [order?.items, order?.subtotal]);

  const computedShipping = useMemo(() => {
    // prefer explicit shipping if saved
    if (typeof order?.shipping === 'number') return Number(order.shipping || 0);

    // otherwise derive from total - subtotal (if possible)
    if (typeof order?.total === 'number') {
      const diff = Number(order.total || 0) - Number(computedSubtotal || 0);
      return diff > 0 ? diff : 0;
    }

    return 0;
  }, [order?.shipping, order?.total, computedSubtotal]);

  const computedTotal = useMemo(() => {
    if (typeof order?.total === 'number') return Number(order.total || 0);
    return Number(computedSubtotal || 0) + Number(computedShipping || 0);
  }, [order?.total, computedSubtotal, computedShipping]);

  return (
    <section className={styles.thankYouWrap}>
      <div className={styles.thankYouCard}>
        <p className={styles.thankYouEyebrow}>order received</p>

        <h1>Thank you. Your order has been received.</h1>

        <p className={styles.thankYouText}>We have saved your order successfully.</p>

        <div className={styles.thankYouSummary}>
          {order?.id ? (
            <div>
              <span>Order ID</span>
              <strong>{order.id}</strong>
            </div>
          ) : null}

          <div>
            <span>Total</span>
            <strong>{money(computedTotal)}</strong>
          </div>

          {order?.email ? (
            <div>
              <span>Email</span>
              <strong>{order.email}</strong>
            </div>
          ) : null}

          {order?.address ? (
            <div className={styles.thankYouSummaryFull}>
              <span>Address</span>
              <strong>{order.address}</strong>
            </div>
          ) : null}
        </div>

        {order?.items?.length ? (
          <div className={styles.thankYouItems}>
            <h2>Order details</h2>

            {order.items.map((item, index) => (
              <div className={styles.thankYouItem} key={`${item.name}-${index}`}>
                <span>
                  {item.name} × {item.quantity || 1}
                </span>
                <strong>
                  {money(Number(item.price || 0) * Number(item.quantity || 1))}
                </strong>
              </div>
            ))}

            {/* Totals */}
            <div className={styles.thankYouTotals}>
              <div className={styles.thankYouItem}>
                <span>Subtotal</span>
                <strong>{money(computedSubtotal)}</strong>
              </div>

              <div className={styles.thankYouItem}>
                <span>Shipping</span>
                <strong>{money(computedShipping)}</strong>
              </div>

              <div className={`${styles.thankYouItem} ${styles.thankYouGrandTotal}`}>
                <span>Total</span>
                <strong>{money(computedTotal)}</strong>
              </div>
            </div>
          </div>
        ) : null}

        <div className={styles.thankYouActions}>
          <Link href="/shop">Continue shopping</Link>
        </div>
      </div>
    </section>
  );
}