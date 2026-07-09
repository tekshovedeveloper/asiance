import { Suspense } from 'react';
import { SiteHeader } from '@/components/SiteHeader';
import { OtpVerifyPanel } from '@/components/OtpVerifyPanel';
import { LoadingIndicator } from '@/components/LoadingIndicator';

export default function VerifyOtpPage() {
  return (
    <main>
      <SiteHeader />
      <section className="auth-page">
        <div>
          <Suspense fallback={<LoadingIndicator compact />}>
            <OtpVerifyPanel />
          </Suspense>
        </div>
      </section>
    </main>
  );
}
