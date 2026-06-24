import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { ThankYouClient } from '@/components/cart/ThankYouClient';

export default function ThankYouPage() {
  return (
    <main>
      <SiteHeader active="Shop" />
      <ThankYouClient />
      <SiteFooter />
    </main>
  );
}