import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { CartClient } from '@/components/cart/CartClient';

export default function CartPage() {
  return (
    <main>
      <SiteHeader active="Shop" />
      <section className="page-hero">
        <span className="eyebrow">shop</span>
        <h1>
          your <em>bag.</em>
        </h1>
      </section>
      <CartClient />
      <SiteFooter />
    </main>
  );
}
