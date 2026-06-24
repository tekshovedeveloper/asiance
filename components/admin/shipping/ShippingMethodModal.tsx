'use client';

import { useState } from 'react';
import { API_URL } from '@/lib/api';
import styles from './Shipping.module.css';

type Props = {
  zoneId: string;
  onClose: () => void;
  onSaved: () => void;
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

export function ShippingMethodModal({ zoneId, onClose, onSaved }: Props) {
  const [step, setStep] = useState(1);
  const [type, setType] = useState<'free_shipping' | 'flat_rate' | 'local_pickup' | ''>('');
  const [title, setTitle] = useState('');
  const [cost, setCost] = useState('0');
  const [freeShippingRequirement, setFreeShippingRequirement] = useState('no_requirement');
  const [minimumOrderAmount, setMinimumOrderAmount] = useState('0');
  const [saving, setSaving] = useState(false);

  function selectType(value: 'free_shipping' | 'flat_rate' | 'local_pickup') {
    setType(value);

    if (value === 'free_shipping') setTitle('Free shipping');
    if (value === 'flat_rate') setTitle('Flat rate');
    if (value === 'local_pickup') setTitle('Local pickup');
  }

  async function saveMethod() {
    if (!type) return;

    setSaving(true);

    try {
      const response = await fetch(`${API_URL}/shop/shipping/zones/${zoneId}/methods`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          title,
          type,
          enabled: true,
          cost: Number(cost || 0),
          freeShippingRequirement,
          minimumOrderAmount: Number(minimumOrderAmount || 0),
        }),
      });

      if (!response.ok) {
        throw new Error('Shipping method save failed');
      }

      onSaved();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Something went wrong');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <button className={styles.closeButton} type="button" onClick={onClose}>
          ×
        </button>

        {step === 1 ? (
          <>
            <h2>Create shipping method</h2>

            <button
              className={`${styles.methodChoice} ${type === 'free_shipping' ? styles.selected : ''}`}
              type="button"
              onClick={() => selectType('free_shipping')}
            >
              Free shipping
            </button>

            <button
              className={`${styles.methodChoice} ${type === 'flat_rate' ? styles.selected : ''}`}
              type="button"
              onClick={() => selectType('flat_rate')}
            >
              Flat rate
            </button>

            <button
              className={`${styles.methodChoice} ${type === 'local_pickup' ? styles.selected : ''}`}
              type="button"
              onClick={() => selectType('local_pickup')}
            >
              Local pickup
            </button>

            <div className={styles.modalFooter}>
              <span>STEP 1 OF 2</span>

              <button
                className={styles.primaryButton}
                type="button"
                disabled={!type}
                onClick={() => setStep(2)}
              >
                Continue
              </button>
            </div>
          </>
        ) : (
          <>
            <h2>
              {type === 'free_shipping'
                ? 'Set up free shipping'
                : type === 'flat_rate'
                  ? 'Set up flat rate'
                  : 'Set up local pickup'}
            </h2>

            <label className={styles.field}>
              Name
              <input value={title} onChange={(event) => setTitle(event.target.value)} />
              <small>Your customers will see this name during checkout.</small>
            </label>

            {type === 'free_shipping' ? (
              <>
                <label className={styles.field}>
                  Free shipping requires
                  <select
                    value={freeShippingRequirement}
                    onChange={(event) => setFreeShippingRequirement(event.target.value)}
                  >
                    <option value="no_requirement">No requirement</option>
                    <option value="valid_coupon">A valid free shipping coupon</option>
                    <option value="minimum_order">A minimum order amount</option>
                    <option value="minimum_order_or_coupon">
                      A minimum order amount OR coupon
                    </option>
                    <option value="minimum_order_and_coupon">
                      A minimum order amount AND coupon
                    </option>
                  </select>
                </label>

                {freeShippingRequirement.includes('minimum_order') ? (
                  <label className={styles.field}>
                    Minimum order amount
                    <input
                      type="number"
                      value={minimumOrderAmount}
                      onChange={(event) => setMinimumOrderAmount(event.target.value)}
                    />
                  </label>
                ) : null}
              </>
            ) : null}

            {type === 'flat_rate' || type === 'local_pickup' ? (
              <label className={styles.field}>
                Cost
                <input
                  type="number"
                  value={cost}
                  onChange={(event) => setCost(event.target.value)}
                />
              </label>
            ) : null}

            <div className={styles.modalFooter}>
              <span>STEP 2 OF 2</span>

              <div>
                <button type="button" onClick={() => setStep(1)}>
                  Back
                </button>

                <button
                  className={styles.primaryButton}
                  type="button"
                  disabled={saving}
                  onClick={saveMethod}
                >
                  {saving ? 'Saving...' : 'Create and save'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}