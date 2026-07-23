'use client';

import { useState } from 'react';
import { API_URL } from '@/lib/api';
import { showAppToast } from '@/lib/app-toast';
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
  const [minimumOrderAmount, setMinimumOrderAmount] = useState('0');
  const [saving, setSaving] = useState(false);

  function selectType(value: 'free_shipping' | 'flat_rate' | 'local_pickup') {
    setType(value);

    if (value === 'free_shipping') {
      setTitle('Free shipping');
    }
    if (value === 'flat_rate') setTitle('Flat rate');
    if (value === 'local_pickup') setTitle('Local pickup');
  }

  async function saveMethod() {
    if (!type) return;

    const methodTitle = title.trim();
    const methodCost = Number(cost || 0);
    const freeShippingMinimum = Number(minimumOrderAmount || 0);

    if (!methodTitle) {
      showAppToast('Please enter shipping method name', 'info');
      return;
    }

    if (type === 'free_shipping' && (!Number.isFinite(freeShippingMinimum) || freeShippingMinimum < 0)) {
      showAppToast('Please enter a valid minimum order amount', 'info');
      return;
    }

    if (type !== 'free_shipping' && (!Number.isFinite(methodCost) || methodCost < 0)) {
      showAppToast('Please enter a valid shipping cost', 'info');
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`${API_URL}/shop/shipping/zones/${zoneId}/methods`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          title: methodTitle,
          type,
          enabled: true,
          cost: type === 'free_shipping' ? 0 : methodCost,
          freeShippingRequirement: type === 'free_shipping' ? 'minimum_order' : 'no_requirement',
          minimumOrderAmount: type === 'free_shipping' ? freeShippingMinimum : 0,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || 'Shipping method save failed');
      }

      showAppToast('Shipping method saved', 'success');
      onSaved();
    } catch (error) {
      showAppToast(error instanceof Error ? error.message : 'Something went wrong', 'error');
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
                  Minimum order amount
                  <input
                    type="number"
                    value={minimumOrderAmount}
                    onChange={(event) => setMinimumOrderAmount(event.target.value)}
                  />
                  <small>Free shipping will apply when the order reaches this amount.</small>
                </label>
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
