import Link from 'next/link';
import { Suspense } from 'react';
import { AuthPanel } from '@/components/AuthPanel';
import { LoadingIndicator } from '@/components/LoadingIndicator';
import { SiteHeader } from '@/components/SiteHeader';

export default function RegisterPage() {
  return (
    <main>
      <SiteHeader />
      <section className="auth-page">
        <div>
          <Suspense fallback={<LoadingIndicator compact />}>
            <AuthPanel mode="register" />
          </Suspense>

          <p style={{ textAlign: 'center' }}>
            <Link href="/login" className="text-link">
              Already a member
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
