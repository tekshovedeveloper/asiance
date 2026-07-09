import { Suspense } from 'react';
import { SiteHeader } from '@/components/SiteHeader';
import { ForgotPasswordPanel } from '@/components/ForgotPasswordPanel';
import { LoadingIndicator } from '@/components/LoadingIndicator';

export default function ForgotPasswordPage() {
  return (
    <main>
      <SiteHeader />
      <section className="auth-page">
        <div>
          <Suspense fallback={<LoadingIndicator compact />}>
            <ForgotPasswordPanel />
          </Suspense>
        </div>
      </section>
    </main>
  );
}
