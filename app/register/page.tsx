import Link from 'next/link';
import { AuthPanel } from '@/components/AuthPanel';
import { SiteHeader } from '@/components/SiteHeader';

export default function RegisterPage() {
  return (
    <main>
      <SiteHeader />
      <section className="auth-page">
        <div>
          <AuthPanel mode="register" />
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
