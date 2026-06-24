import { Suspense } from 'react';
import { SiteHeader } from '@/components/SiteHeader';
import { ForgotPasswordPanel } from '@/components/ForgotPasswordPanel';

export default function ForgotPasswordPage() {
  return (
    <main>
      <SiteHeader />
      <section className="auth-page">
        <div>
          <Suspense>
            <ForgotPasswordPanel />
          </Suspense>
        </div>
      </section>
    </main>
  );
}
