'use client';

import { useState } from 'react';
import { API_URL } from '@/lib/api';
import styles from './Shipping.module.css';
import { ShippingMethodModal } from './ShippingMethodModal';

type Props = {
  onCancel: () => void;
  onSaved: () => void;
};

const regions = [
  'everywhere',
  'Africa',
  'Antarctica',
  'Asia',
  'Europe',
  'North America',
  'Oceania',
  'South America',
  'Pakistan',
  'United States',
  'United Kingdom',
  'Canada',
  'Australia',
];

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

export function ShippingZoneEditor({ onCancel, onSaved }: Props) {
  const [name, setName] = useState('');
  const [selectedRegions, setSelectedRegions] = useState<string[]>(['everywhere']);
  const [createdZoneId, setCreatedZoneId] = useState('');
  const [methodModalOpen, setMethodModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  function toggleRegion(region: string) {
    if (region === 'everywhere') {
      setSelectedRegions(['everywhere']);
      return;
    }

    setSelectedRegions((prev) => {
      const withoutEverywhere = prev.filter((item) => item !== 'everywhere');

      if (withoutEverywhere.includes(region)) {
        return withoutEverywhere.filter((item) => item !== region);
      }

      return [...withoutEverywhere, region];
    });
  }

  async function createZone() {
    if (!name.trim()) {
      alert('Please enter zone name');
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`${API_URL}/shop/shipping/zones`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          name,
          regions: selectedRegions,
        }),
      });

      if (!response.ok) {
        throw new Error('Shipping zone save failed');
      }

      const data = await response.json();
      setCreatedZoneId(data._id);
      setMethodModalOpen(true);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Something went wrong');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className={styles.screen}>
      <button className={styles.backButton} type="button" onClick={onCancel}>
        ‹ Shipping zones
      </button>

      <h2>Add zone</h2>

      <div className={styles.editorGrid}>
        <div>
          <h3>Zone name</h3>
          <p>Give your zone a name. E.g. Local, Worldwide.</p>
        </div>

        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Zone name"
        />

        <div>
          <h3>Zone regions</h3>
          <p>List the regions included in this shipping zone.</p>
        </div>

        <div className={styles.regionsBox}>
          {regions.map((region) => (
            <label key={region}>
              <input
                type="checkbox"
                checked={selectedRegions.includes(region)}
                onChange={() => toggleRegion(region)}
              />
              {region}
            </label>
          ))}
        </div>

        <div>
          <h3>Shipping methods</h3>
          <p>Add the shipping methods available to customers in this zone.</p>
        </div>

        <div className={styles.methodTable}>
          <div className={styles.methodHead}>
            <span>Title</span>
            <span>Enabled</span>
            <span>Description</span>
          </div>

          <div className={styles.emptyMethod}>
            Save zone first, then add shipping method.
          </div>

          <button
            className={styles.primaryButton}
            type="button"
            onClick={createZone}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Add shipping method'}
          </button>
        </div>
      </div>

      <button
        className={styles.primaryButton}
        type="button"
        disabled={saving}
        onClick={createZone}
      >
        {saving ? 'Saving...' : 'Save changes'}
      </button>

      {methodModalOpen && createdZoneId ? (
        <ShippingMethodModal
          zoneId={createdZoneId}
          onClose={() => {
            setMethodModalOpen(false);
            onSaved();
          }}
          onSaved={() => {
            setMethodModalOpen(false);
            onSaved();
          }}
        />
      ) : null}
    </section>
  );
}