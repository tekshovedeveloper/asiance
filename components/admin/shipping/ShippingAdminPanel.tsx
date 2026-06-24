'use client';

import { useEffect, useState } from 'react';
import { API_URL } from '@/lib/api';
import styles from './Shipping.module.css';
import { ShippingMethodModal } from './ShippingMethodModal';
import { ShippingZoneEditor } from './ShippingZoneEditor';

export type ShippingMethod = {
  _id: string;
  title: string;
  type: 'free_shipping' | 'flat_rate' | 'local_pickup';
  enabled: boolean;
  cost: number;
  freeShippingRequirement: string;
  minimumOrderAmount: number;
};

type Props = {
    token: string;
    onChanged: () => void;
  };

export type ShippingZone = {
  _id: string;
  name: string;
  regions: string[];
  methods: ShippingMethod[];
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

export function ShippingAdminPanel({ token, onChanged }: Props) {
  const [zones, setZones] = useState<ShippingZone[]>([]);
  const [selectedZone, setSelectedZone] = useState<ShippingZone | null>(null);
  const [addingZone, setAddingZone] = useState(false);
  const [methodModalOpen, setMethodModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function loadZones() {
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/shop/shipping/zones`, {
        headers: authHeaders(),
      });

      const data = await response.json();
      setZones(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadZones();
  }, []);

  async function deleteZone(id: string) {
    if (!confirm('Delete this shipping zone?')) return;

    await fetch(`${API_URL}/shop/shipping/zones/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });

    await loadZones();
  }

  async function deleteMethod(zoneId: string, methodId: string) {
    if (!confirm('Delete this shipping method?')) return;

    await fetch(`${API_URL}/shop/shipping/zones/${zoneId}/methods/${methodId}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });

    await loadZones();
  }

  if (addingZone) {
    return (
      <ShippingZoneEditor
        onCancel={() => setAddingZone(false)}
        onSaved={async () => {
          setAddingZone(false);
          await loadZones();
        }}
      />
    );
  }

  if (selectedZone) {
    return (
      <section className={styles.screen}>
        <div className={styles.topLinks}>
          <button type="button" onClick={() => setSelectedZone(null)}>
            ‹ Shipping zones
          </button>
        </div>

        <h2>{selectedZone.name}</h2>

        <div className={styles.methodTable}>
          <div className={styles.methodHead}>
            <span>Title</span>
            <span>Enabled</span>
            <span>Description</span>
            <span>Actions</span>
          </div>

          {selectedZone.methods.length === 0 ? (
            <div className={styles.emptyMethod}>
              You can add multiple shipping methods within this zone.
            </div>
          ) : null}

          {selectedZone.methods.map((method) => (
            <div className={styles.methodRow} key={method._id}>
              <span>{method.title}</span>
              <span>{method.enabled ? 'Yes' : 'No'}</span>
              <span>
                {method.type === 'free_shipping'
                  ? 'Free shipping'
                  : method.type === 'flat_rate'
                    ? `$${method.cost}`
                    : 'Local pickup'}
              </span>
              <span>
                <button
                  type="button"
                  onClick={() => deleteMethod(selectedZone._id, method._id)}
                >
                  Delete
                </button>
              </span>
            </div>
          ))}
        </div>

        <button
          className={styles.primaryButton}
          type="button"
          onClick={() => setMethodModalOpen(true)}
        >
          Add shipping method
        </button>

        {methodModalOpen ? (
          <ShippingMethodModal
            zoneId={selectedZone._id}
            onClose={() => setMethodModalOpen(false)}
            onSaved={async () => {
              setMethodModalOpen(false);
              await loadZones();

              const response = await fetch(`${API_URL}/shop/shipping/zones`, {
                headers: authHeaders(),
              });

              const data = await response.json();
              const updated = data.find((z: ShippingZone) => z._id === selectedZone._id);
              setSelectedZone(updated || null);
            }}
          />
        ) : null}
      </section>
    );
  }

  return (
    <section className={styles.screen}>
      <h1>Settings</h1>

      <div className={styles.tabs}>
        <button type="button">General</button>
        <button type="button">Products</button>
        <button className={styles.activeTab} type="button">
          Shipping
        </button>
        <button type="button">Payments</button>
        <button type="button">Emails</button>
      </div>

      <div className={styles.subLinks}>
        <strong>Shipping zones</strong>
        <span>|</span>
        <button type="button">Shipping settings</button>
        <span>|</span>
        <button type="button">Classes</button>
      </div>

      <div className={styles.headingRow}>
        <h2>Shipping zones</h2>

        <button
          className={styles.outlineButton}
          type="button"
          onClick={() => setAddingZone(true)}
        >
          Add zone
        </button>
      </div>

      <p className={styles.helpText}>
        A shipping zone consists of regions and shipping methods. Customers only see
        methods available for their address.
      </p>

      <div className={styles.zonesTable}>
        <div className={styles.zoneHead}>
          <span>Zone name</span>
          <span>Region(s)</span>
          <span>Shipping method(s)</span>
          <span>Actions</span>
        </div>

        {loading ? <div className={styles.zoneRow}>Loading...</div> : null}

        {!loading &&
          zones.map((zone) => (
            <div className={styles.zoneRow} key={zone._id}>
              <button type="button" onClick={() => setSelectedZone(zone)}>
                {zone.name}
              </button>

              <span>{zone.regions.join(', ')}</span>

              <span>
                {zone.methods.length
                  ? zone.methods.map((method) => method.title).join(', ')
                  : 'No shipping methods'}
              </span>

              <span>
                {zone.name !== 'Rest of the world' ? (
                  <button type="button" onClick={() => deleteZone(zone._id)}>
                    Delete
                  </button>
                ) : null}
              </span>
            </div>
          ))}
      </div>
    </section>
  );
}