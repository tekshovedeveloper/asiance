'use client';

import { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, Package, X } from 'lucide-react';
import { LoadingIndicator } from '@/components/LoadingIndicator';
import { getMyOrders, cancelMyOrder } from '@/lib/api';

type OrderStatus = 'processing' | 'shipped' | 'completed' | 'cancelled' | 'refunded' | 'failed' | 'pending' | 'trash';

type OrderItem = {
  productId?: string;
  slug?: string;
  name: string;
  image?: string;
  quantity: number;
  price: number;
  total: number;
  selectedVariationName?: string;
  selectedAttributes?: Record<string, string>;
};

type Order = {
  _id: string;
  orderNumber: number;
  status: OrderStatus;
  customerName: string;
  email: string;
  phone?: string;
  billingAddress: string;
  shippingAddress: string;
  orderNotes?: string;
  paymentMethod?: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  createdAt: string;
};

const STATUS_FILTER: { key: 'all' | OrderStatus; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'processing', label: 'Processing' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
  { key: 'refunded', label: 'Refunded' },
  { key: 'failed', label: 'Failed' },
];

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  processing: { bg: '#fef3c7', color: '#92400e', label: 'Processing' },
  shipped:    { bg: '#dbeafe', color: '#1e40af', label: 'Shipped' },
  completed:  { bg: '#d1fae5', color: '#065f46', label: 'Completed' },
  cancelled:  { bg: '#f3f4f6', color: '#374151', label: 'Cancelled' },
  refunded:   { bg: '#e0e7ff', color: '#3730a3', label: 'Refunded' },
  failed:     { bg: '#fee2e2', color: '#991b1b', label: 'Failed' },
  pending:    { bg: '#fef3c7', color: '#92400e', label: 'Pending' },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: '2-digit',
  });
}

function within24h(createdAt: string) {
  return Date.now() - new Date(createdAt).getTime() < 24 * 60 * 60 * 1000;
}

type ToastMsg = { id: number; text: string };

export function OrdersPanel() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | OrderStatus>('all');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMsg[]>([]);

  useEffect(() => {
    getMyOrders()
      .then((data) => { setOrders(data ?? []); setFetchError(null); })
      .catch((err) => { setOrders([]); setFetchError(err?.message ?? 'Failed to load orders.'); })
      .finally(() => setLoading(false));
  }, []);

  function showToast(text: string) {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, text }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 5000);
  }

  async function handleCancel(order: Order) {
    if (!within24h(order.createdAt)) {
      showToast("You can't cancel this order because your order is under preparation.");
      return;
    }
    setCancelling(order._id);
    try {
      await cancelMyOrder(order._id);
      setOrders((prev) =>
        prev.map((o) => o._id === order._id ? { ...o, status: 'cancelled' } : o),
      );
    } catch (err: any) {
      const msg = err?.message ?? '';
      if (msg.includes('PAST_24H') || msg.includes('24')) {
        showToast("You can't cancel this order because your order is under preparation.");
      } else {
        showToast(msg || 'Could not cancel the order. Please try again.');
      }
    } finally {
      setCancelling(null);
    }
  }

  const visible = filter === 'all' ? orders : orders.filter((o) => o.status === filter);

  if (loading) {
    return <LoadingIndicator compact label="Loading orders..." />;
  }

  if (fetchError) {
    return (
      <div style={{ padding: '40px 0', textAlign: 'center', color: '#ef4444' }}>
        {fetchError}
      </div>
    );
  }

  return (
    <div className="orders-panel">
      {/* Status filter tabs */}
      <div className="orders-filter-bar">
        {STATUS_FILTER.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            className={`orders-filter-btn${filter === key ? ' orders-filter-btn--active' : ''}`}
            onClick={() => setFilter(key)}
          >
            {label}
            {key !== 'all' && (
              <span className="orders-filter-count">
                {orders.filter((o) => o.status === key).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Empty state */}
      {visible.length === 0 && (
        <div className="orders-empty">
          <Package size={40} style={{ opacity: 0.3 }} />
          <p>No orders found.</p>
        </div>
      )}

      {/* Order cards */}
      <div className="orders-list">
        {visible.map((order) => {
          const isExpanded = expanded === order._id;
          const st = STATUS_STYLE[order.status] ?? STATUS_STYLE.processing;
          const canCancel = order.status === 'processing' || order.status === 'pending';
          const isWithin24h = within24h(order.createdAt);

          return (
            <div className="order-card" key={order._id}>
              {/* Card header */}
              <div className="order-card-header">
                <div className="order-card-meta">
                  <span className="order-number">Order #{order.orderNumber}</span>
                  <span className="order-date">{formatDate(order.createdAt)}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span
                    className="order-status-badge"
                    style={{ background: st.bg, color: st.color }}
                  >
                    {st.label}
                  </span>
                  <button
                    type="button"
                    className="order-expand-btn"
                    onClick={() => setExpanded(isExpanded ? null : order._id)}
                    aria-label={isExpanded ? 'Collapse' : 'Expand'}
                  >
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>
              </div>

              {/* Items preview (always visible) */}
              <div className="order-items-preview">
                {order.items.map((item, i) => (
                  <div className="order-item-row" key={i}>
                    {item.image && (
                      <img src={item.image} alt={item.name} className="order-item-img" />
                    )}
                    <div className="order-item-info">
                      <p className="order-item-name">{item.name}</p>
                      {item.selectedVariationName && (
                        <p className="order-item-variant">{item.selectedVariationName}</p>
                      )}
                      {item.selectedAttributes && Object.keys(item.selectedAttributes).length > 0 && (
                        <p className="order-item-variant">
                          {Object.entries(item.selectedAttributes)
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(' · ')}
                        </p>
                      )}
                    </div>
                    <div className="order-item-pricing">
                      <span className="order-item-qty">×{item.quantity}</span>
                      <span className="order-item-price">PKR.{item.price.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals row */}
              <div className="order-totals-row">
                <span className="order-totals-label">Total</span>
                <strong className="order-totals-value">PKR.{order.total.toLocaleString()}</strong>
              </div>

              {/* Expanded details */}
              {isExpanded && (
                <div className="order-details">
                  <div className="order-detail-grid">
                    <div>
                      <p className="order-detail-heading">Billing address</p>
                      <p className="order-detail-text">{order.customerName}</p>
                      <p className="order-detail-text">{order.billingAddress}</p>
                      {order.phone && <p className="order-detail-text">{order.phone}</p>}
                      <p className="order-detail-text">{order.email}</p>
                    </div>
                    <div>
                      <p className="order-detail-heading">Shipping address</p>
                      <p className="order-detail-text">{order.shippingAddress || order.billingAddress}</p>
                    </div>
                    <div>
                      <p className="order-detail-heading">Payment</p>
                      <p className="order-detail-text">{order.paymentMethod || 'Cash on delivery'}</p>
                    </div>
                  </div>

                  {order.orderNotes && (
                    <div style={{ marginTop: 12 }}>
                      <p className="order-detail-heading">Order notes</p>
                      <p className="order-detail-text">{order.orderNotes}</p>
                    </div>
                  )}

                  <div className="order-price-breakdown">
                    <div className="order-price-line">
                      <span>Subtotal</span>
                      <span>PKR.{order.subtotal.toLocaleString()}</span>
                    </div>
                    <div className="order-price-line">
                      <span>Shipping</span>
                      <span>PKR.{order.shipping.toLocaleString()}</span>
                    </div>
                    <div className="order-price-line order-price-line--total">
                      <span>Total</span>
                      <strong>PKR.{order.total.toLocaleString()}</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Cancel button */}
              {canCancel && (
                <div className="order-card-actions">
                  <button
                    type="button"
                    className="order-cancel-btn"
                    disabled={cancelling === order._id}
                    onClick={() => void handleCancel(order)}
                  >
                    {cancelling === order._id
                      ? 'Cancelling…'
                      : isWithin24h
                      ? 'Cancel order'
                      : 'Cancel order'}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom-left toasts */}
      {toasts.length > 0 && (
        <div className="orders-toast-stack">
          {toasts.map((t) => (
            <div key={t.id} className="orders-toast">
              <span className="orders-toast-msg">{t.text}</span>
              <button
                type="button"
                className="orders-toast-close"
                onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
                aria-label="Dismiss"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
