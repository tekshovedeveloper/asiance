import { Suspense } from 'react';
import Link from 'next/link';
import { AuthPanel } from '@/components/AuthPanel';
import { LoadingIndicator } from '@/components/LoadingIndicator';
import { SiteHeader } from '@/components/SiteHeader';

export default function LoginPage() {
  return (
    <main>
      <SiteHeader />
      <section className="auth-page">
        <div>
          <Suspense fallback={<LoadingIndicator compact />}>
            <AuthPanel mode="login" />
          </Suspense>
          <p style={{ textAlign: 'center' }}>
            <Link href="/register" className="text-link">
              Create account
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
