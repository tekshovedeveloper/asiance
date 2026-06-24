'use client';

import { useEffect, useMemo, useState } from 'react';
import { API_URL } from '@/lib/api';
import styles from './Orders.module.css';
import type { AdminOrder, AdminOrderStatus } from './types';

type Props = {
    token: string;
    onChanged: () => void;
  };

function getToken() {
  if (typeof window === 'undefined') return '';

  return (
    localStorage.getItem('token') ||
    localStorage.getItem('access_token') ||
    localStorage.getItem('asiance_token') ||
    ''
  );
}

function authHeaders() {
  const token = getToken();

  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function money(value: number) {
  return `$${Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(value: string) {
  if (!value) return '-';

  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });
}

function statusClass(status: AdminOrderStatus) {
  if (status === 'completed') return styles.completed;
  if (status === 'processing') return styles.processing;
  if (status === 'shipped') return styles.shipped;
  if (status === 'failed') return styles.failed;
  if (status === 'cancelled') return styles.cancelled;
  if (status === 'refunded') return styles.refunded;
  return styles.pending;
}

export function OrderAdminPanel({ token, onChanged }: Props) {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [activeStatus, setActiveStatus] = useState<'all' | AdminOrderStatus>('all');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [orderAction, setOrderAction] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bulkAction, setBulkAction] = useState('');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [allOrders, setAllOrders] = useState<AdminOrder[]>([]);


  async function loadOrders(status = activeStatus, q = search) {
    setLoading(true);

    try {
      const query = new URLSearchParams();

      if (status !== 'all') query.set('status', status);
      if (q.trim()) query.set('q', q.trim());

      const response = await fetch(`${API_URL}/shop/orders?${query.toString()}`, {
        headers: authHeaders(),
      });

      const data = await response.json();

      setOrders(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
      await loadAllOrdersForCounts();
    }
  }

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStatus]);

  const counts = useMemo(() => {
    const getStatus = (status: AdminOrderStatus) =>
      String(status).toLowerCase().trim();
  
    return {
      all: allOrders.filter((order) => getStatus(order.status) !== 'trash').length,
      processing: allOrders.filter((order) => getStatus(order.status) === 'processing').length,
      shipped: allOrders.filter((order) => getStatus(order.status) === 'shipped').length,
      completed: allOrders.filter((order) => getStatus(order.status) === 'completed').length,
      cancelled: allOrders.filter((order) => getStatus(order.status) === 'cancelled').length,
      refunded: allOrders.filter((order) => getStatus(order.status) === 'refunded').length,
      failed: allOrders.filter((order) => getStatus(order.status) === 'failed').length,
      trash: allOrders.filter((order) => getStatus(order.status) === 'trash').length,
    };
  }, [allOrders]);

  async function openOrder(order: AdminOrder) {
    const response = await fetch(`${API_URL}/shop/orders/${order._id}`, {
      headers: authHeaders(),
    });

    const data = await response.json();
    setSelectedOrder(data);
  }

  async function updateStatus(id: string, status: AdminOrderStatus) {
    const response = await fetch(`${API_URL}/shop/orders/${id}`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ status }),
    });

    const data = await response.json();
    setSelectedOrder(data);
    await loadOrders();
  }

  async function moveToTrash(id: string) {
    await fetch(`${API_URL}/shop/orders/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });

    setSelectedOrder(null);
    await loadOrders();
  }

  async function restoreOrder(id: string) {
    await fetch(`${API_URL}/shop/orders/${id}/restore`, {
      method: 'PATCH',
      headers: authHeaders(),
    });

    await loadOrders();
  }

  async function deleteForever(id: string) {
    await fetch(`${API_URL}/shop/orders/${id}/forever`, {
      method: 'DELETE',
      headers: authHeaders(),
    });

    await loadOrders();
  }

  async function runOrderAction() {
    if (!selectedOrder) return;
  
    setActionLoading(true);
  
    try {
      if (orderAction === 'send_invoice') {
        const response = await fetch(`${API_URL}/shop/orders/${selectedOrder._id}/send-invoice`, {
          method: 'POST',
          headers: authHeaders(),
        });
  
        if (!response.ok) {
          const error = await response.json().catch(() => null);
          throw new Error(error?.message || 'Invoice email failed');
        }
  
        alert('Invoice email sent to customer');
        return;
      }
  
      if (orderAction === 'resend_order_notification') {
        const response = await fetch(`${API_URL}/shop/orders/${selectedOrder._id}/resend-notification`, {
          method: 'POST',
          headers: authHeaders(),
        });
  
        if (!response.ok) {
          const error = await response.json().catch(() => null);
          throw new Error(error?.message || 'Order notification failed');
        }
  
        alert('Order notification resent');
        return;
      }
  
      await loadOrders();
      alert('Order updated');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Something went wrong');
    } finally {
      setActionLoading(false);
    }
  }


  async function applyBulkAction() {
    if (!bulkAction) {
      alert('Please select bulk action');
      return;
    }
  
    if (selectedOrders.length === 0) {
      alert('Please select orders');
      return;
    }
  
    if (bulkAction === 'trash') {
      await Promise.all(
        selectedOrders.map((id) =>
          fetch(`${API_URL}/shop/orders/${id}`, {
            method: 'DELETE',
            headers: authHeaders(),
          })
        )
      );
  
      setSelectedOrders([]);
      setBulkAction('');
      await loadOrders();
  
      alert('Selected orders moved to trash');
    }
  }


  async function loadAllOrdersForCounts() {
    const response = await fetch(`${API_URL}/shop/orders?includeTrash=true`, {
      headers: authHeaders(),
    });
  
    const data = await response.json();
    setAllOrders(Array.isArray(data) ? data : []);
  }




  if (selectedOrder) {
    return (
      <section className={styles.screen}>
        <div className={styles.pageHeader}>
          <div>
            <p className={styles.breadcrumb}>Orders</p>
            <h1>Edit order</h1>
          </div>

          <button
            className={styles.addButton}
            type="button"
            onClick={() => setSelectedOrder(null)}
          >
            Back to orders
          </button>
        </div>

       

        <div className={styles.editGrid}>
          <main className={styles.editMain}>
            <div className={styles.orderDetailsBox}>
              <h2>
                Order #{selectedOrder.orderNumber} details
              </h2>

              <p className={styles.orderMeta}>
                Payment via {selectedOrder.paymentMethod || 'Cash on delivery'}.
                Created on {formatDate(selectedOrder.createdAt)}.
              </p>

              <div className={styles.detailColumns}>
                <div>
                  <h3>General</h3>

                  <label>
                    Status:
                    <select
                      value={selectedOrder.status}
                      onChange={(event) =>
                        updateStatus(selectedOrder._id, event.target.value as AdminOrderStatus)
                      }
                    >
                      <option value="pending">Pending payment</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="refunded">Refunded</option>
                      <option value="failed">Failed</option>
                    </select>
                  </label>

                  <div>
                    <span style={{ fontWeight: 500 }}>Customer:</span>
                    <div style={{ marginTop: 4 }}>
                      {selectedOrder.userId ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          <span style={{
                            display: 'inline-block', width: 8, height: 8,
                            borderRadius: '50%', background: '#16a34a',
                          }} />
                          <strong>{selectedOrder.customerName || selectedOrder.email}</strong>
                          <span style={{ color: '#6b7280', fontSize: 12 }}>({selectedOrder.email})</span>
                        </span>
                      ) : (
                        <span style={{ color: '#6b7280' }}>Guest</span>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <h3>Billing</h3>
                  <p>{selectedOrder.billingName || selectedOrder.customerName || 'Guest'}</p>
                  <p>{selectedOrder.billingAddress}</p>
                  <p>
                    Email address:
                    <br />
                    <a href={`mailto:${selectedOrder.billingEmail || selectedOrder.email}`}>
                      {selectedOrder.billingEmail || selectedOrder.email}
                    </a>
                  </p>
                  {selectedOrder.phone ? (
                    <p>
                      Phone:
                      <br />
                      <a href={`tel:${selectedOrder.phone}`}>{selectedOrder.phone}</a>
                    </p>
                  ) : null}
                </div>

                <div>
                  <h3>Shipping</h3>
                  <p>{selectedOrder.billingName || selectedOrder.customerName || 'Guest'}</p>
                  <p>{selectedOrder.shippingAddress || selectedOrder.billingAddress}</p>
                </div>
              </div>
            </div>

            <div className={styles.itemsBox}>
              <div className={styles.itemsHead}>
                <span>Item</span>
                <span>Price</span>
                <span>Qty</span>
                <span>Total</span>
              </div>

              {selectedOrder.items.map((item, index) => (
                <div className={styles.itemRow} key={`${item.name}-${index}`}>
                  <div className={styles.itemInfo}>
                    {item.image ? <img src={item.image} alt={item.name} /> : <span />}
                    <div>
                      <a>{item.name}</a>

                      {item.selectedVariationName ? (
                        <small>Variation: {item.selectedVariationName}</small>
                      ) : null}

                      {item.selectedAttributes ? (
                        Object.entries(item.selectedAttributes).map(([key, value]) => (
                          <small key={key}>
                            {key}: {value}
                          </small>
                        ))
                      ) : null}
                    </div>
                  </div>

                  <strong>{money(item.price)}</strong>
                  <strong>× {item.quantity}</strong>
                  <strong>{money(item.total)}</strong>
                </div>
              ))}

              <div className={styles.totalLines}>
                <p>
                  <span>Items Subtotal:</span>
                  <strong>{money(selectedOrder.subtotal)}</strong>
                </p>
                <p>
                  <span>Shipping:</span>
                  <strong>{money(selectedOrder.shipping)}</strong>
                </p>
                <p>
                  <span>Order Total:</span>
                  <strong>{money(selectedOrder.total)}</strong>
                </p>
              </div>
{/* 
              <button className={styles.refundButton} type="button">
                Refund
              </button> */}
            </div>

            {/* <div className={styles.permissionsBox}>
              <h2>Downloadable product permissions</h2>
              <div>
                <input placeholder="Search for a downloadable product..." />
                <button type="button">Grant access</button>
              </div>
            </div>

            <div className={styles.customFieldsBox}>
              <h2>Custom Fields</h2>

              <div className={styles.customFieldRow}>
                <input defaultValue="is_vat_exempt" />
                <textarea defaultValue="no" />
              </div>

              <button type="button">Add Custom Field</button>
            </div> */}
          </main>

          <aside className={styles.editSide}>
          <div className={styles.sideBox}>
  <h3>Order actions</h3>

  <select
    value={orderAction}
    onChange={(event) => setOrderAction(event.target.value)}
  >
    <option value="">Choose an action...</option>
    <option value="send_invoice">Email invoice / order details to customer</option>
    {/* <option value="resend_order_notification">Resend new order notification</option> */}
  </select>

  <button
    className={styles.updateButton}
    type="button"
    onClick={runOrderAction}
    disabled={actionLoading}
  >
    {actionLoading ? 'Updating...' : 'Update'}
  </button>

  <button
    className={styles.trashLink}
    type="button"
    onClick={() => moveToTrash(selectedOrder._id)}
  >
    Move to Trash
  </button>
</div>

            <div className={styles.sideBox}>
              <h3>Order attribution</h3>
              <p>
                <strong>Origin</strong>
                <br />
                {selectedOrder.origin || 'Unknown'}
              </p>
            </div>

            <div className={styles.sideBox}>
              <h3>Customer history</h3>
              <p>
                <strong>Total orders</strong>
                <br />1
              </p>
              <p>
                <strong>Total revenue</strong>
                <br />
                {money(selectedOrder.total)}
              </p>
              <p>
                <strong>Average order value</strong>
                <br />
                {money(selectedOrder.total)}
              </p>
            </div>

            <div className={styles.sideBox}>
              <h3>Order notes</h3>

              <textarea placeholder="Add note" />
              <div className={styles.noteActions}>
                <select defaultValue="private">
                  <option value="private">Private note</option>
                  <option value="customer">Note to customer</option>
                </select>
                <button type="button">Add</button>
              </div>

              <div className={styles.notesList}>
                {(selectedOrder.notes ?? []).map((note, index) => (
                  <div className={styles.note} key={`${note.message}-${index}`}>
                    <p>{note.message}</p>
                    <small>{formatDate(note.createdAt)}</small>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.screen}>
      <div className={styles.pageHeader}>
        <div>
          <p className={styles.breadcrumb}>Orders</p>
          <h1>Orders</h1>
        </div>

        <button className={styles.addButton} type="button">
          Add order
        </button>
      </div>

      {/* <div className={styles.noticeGreen}>
        <strong>You have been using Asiance Admin for some time now. Thank you! 💕</strong>
        <p>This area lists all checkout orders saved in MongoDB.</p>
      </div> */}

      {/* <div className={styles.noticeWhite}>
        <strong>Elementor Data Updater</strong>
        <p>Database update process is running in the background. Taking a while?</p>
      </div> */}

      <div className={styles.statusLinks}>
        <button type="button" onClick={() => setActiveStatus('all')}>
          All ({counts.all})
        </button>
        <button type="button" onClick={() => setActiveStatus('processing')}>
          Processing ({counts.processing})
        </button>
        <button type="button" onClick={() => setActiveStatus('shipped')}>
          Shipped ({counts.shipped})
        </button>
        <button type="button" onClick={() => setActiveStatus('completed')}>
          Completed ({counts.completed})
        </button>
        <button type="button" onClick={() => setActiveStatus('cancelled')}>
          Cancelled ({counts.cancelled})
        </button>
        <button type="button" onClick={() => setActiveStatus('refunded')}>
          Refunded ({counts.refunded})
        </button>
        <button type="button" onClick={() => setActiveStatus('failed')}>
          Failed ({counts.failed})
        </button>
        <button type="button" onClick={() => setActiveStatus('trash')}>
          Trash ({counts.trash})
        </button>
      </div>

      <div className={styles.filters}>
       <select value={bulkAction} onChange={(event) => setBulkAction(event.target.value)}>
  <option value="">Bulk actions</option>
  <option value="trash">Move to trash</option>
</select>

<button type="button" onClick={applyBulkAction}>
  Apply
</button>

        {/* <select defaultValue="">
          <option value="">All dates</option>
        </select>

        <select defaultValue="">
          <option value="">All sales channels</option>
        </select> */}

        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search orders"
        />

        <button type="button" onClick={() => loadOrders(activeStatus, search)}>
          Search orders
        </button>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.ordersTable}>
          <thead>
            <tr>
              <th>
              <input
  type="checkbox"
  checked={
    orders.length > 0 &&
    selectedOrders.length === orders.length
  }
  onChange={(event) => {
    if (event.target.checked) {
      setSelectedOrders(orders.map((order) => order._id));
    } else {
      setSelectedOrders([]);
    }
  }}
/>
              </th>
              <th>Order ID</th>
<th>Customer</th>
<th>Date</th>
<th>Status</th>
<th>Total</th>
<th>Origin</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6}>Loading orders...</td>
              </tr>
            ) : null}

            {!loading && orders.length === 0 ? (
              <tr>
                <td colSpan={6}>No orders found.</td>
              </tr>
            ) : null}

            {!loading &&
              orders.map((order) => (
                <tr key={order._id}>
                  <td>
                  <input
  type="checkbox"
  checked={selectedOrders.includes(order._id)}
  onChange={(event) => {
    if (event.target.checked) {
      setSelectedOrders((prev) => [...prev, order._id]);
    } else {
      setSelectedOrders((prev) =>
        prev.filter((id) => id !== order._id)
      );
    }
  }}
/>
                  </td>

                  <td>
  <button
    className={styles.orderLink}
    type="button"
    onClick={() => openOrder(order)}
  >
    #{order.orderNumber}
  </button>
</td>

<td>
  <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
    {order.userId && (
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#16a34a', display: 'inline-block', flexShrink: 0 }} />
    )}
    {order.customerName || order.email || 'Guest'}
  </span>

  {order.status === 'trash' ? (
    <div className={styles.rowActions}>
      <button type="button" onClick={() => restoreOrder(order._id)}>
        Restore
      </button>
      <span>|</span>
      <button type="button" onClick={() => deleteForever(order._id)}>
        Delete permanently
      </button>
    </div>
  ) : null}
</td>
                  <td>{formatDate(order.createdAt)}</td>

                  <td>
                    <span className={`${styles.statusBadge} ${statusClass(order.status)}`}>
                      {order.status}
                    </span>
                  </td>

                  <td>{money(order.total)}</td>

                  <td>{order.origin || 'Unknown'}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}