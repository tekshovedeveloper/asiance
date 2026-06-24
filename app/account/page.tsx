import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';

export default function AccountPage() {
  return (
    <main>
      <SiteHeader />
      <section className="page-hero">
        <span className="eyebrow">my account</span>
        <h1>
          profile, orders, <em>settings.</em>
        </h1>
      </section>
      <section className="checkout-layout">
        <form className="panel-form">
          <h2>Profile</h2>
          <input placeholder="Display name" defaultValue="Mira Tanaka" />
          <input placeholder="Location" defaultValue="Kyoto, Japan" />
          <textarea rows={5} defaultValue="Ceramics, morning walks, quiet hotels, and long-form beauty writing." />
          <button className="btn btn-dark" type="button">
            Save changes
          </button>
        </form>
        <aside className="cart-summary">
          <h2>Recent orders</h2>
          <div className="summary-line">
            <span>Ceramic carafe</span>
            <strong>pending</strong>
          </div>
          <div className="summary-line">
            <span>Slow ritual candle</span>
            <strong>fulfilled</strong>
          </div>
        </aside>
      </section>
      <SiteFooter />
    </main>
  );
}
