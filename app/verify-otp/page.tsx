import { Suspense } from 'react';
import { SiteHeader } from '@/components/SiteHeader';
import { OtpVerifyPanel } from '@/components/OtpVerifyPanel';

export default function VerifyOtpPage() {
  return (
    <main>
      <SiteHeader />
   <section className="auth-page">
        <div>
          <Suspense fallback={<div style={{ padding: 20 }}>Loading…</div>}>
            <OtpVerifyPanel />
          </Suspense>
        </div>
      </section>
    </main>
  );
}
