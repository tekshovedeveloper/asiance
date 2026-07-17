'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoadingIndicator } from '@/components/LoadingIndicator';
import { SiteHeader } from '@/components/SiteHeader';

const SHIPPING_DASHBOARD_URL = '/dashboard?tab=orders&status=shipped';

export default function ShippingPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('asiance_token');

    if (token) {
      router.replace(SHIPPING_DASHBOARD_URL);
      return;
    }

    router.replace(`/login?redirect=${encodeURIComponent(SHIPPING_DASHBOARD_URL)}`);
  }, [router]);

  return (
    <main>
      <SiteHeader />
      <section className="auth-page">
        <LoadingIndicator label="Opening your shipped orders..." />
      </section>
    </main>
  );
}
