import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { CheckoutClient } from '@/components/cart/CheckoutClient';

export default function CheckoutPage() {
  return (
    <main>
      <SiteHeader active="Shop" />

      <CheckoutClient />

      <SiteFooter />
    </main>
  );
}