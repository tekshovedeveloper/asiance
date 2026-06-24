import { SiteHeader } from '@/components/SiteHeader';
import { OtpVerifyPanel } from '@/components/OtpVerifyPanel';

export default function VerifyOtpPage() {
  return (
    <main>
      <SiteHeader />
      <section className="auth-page">
        <div>
          <OtpVerifyPanel />
        </div>
      </section>
    </main>
  );
}
