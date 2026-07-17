import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';

const sections = [
  {
    title: 'Return window',
    body: [
      'Most eligible shop items can be returned within 14 days of delivery. Items should be unused, in their original condition, and returned with packaging, tags, inserts, or accessories that arrived with the order.',
      'If your order arrives damaged, incorrect, or incomplete, contact us as soon as possible with your order number and clear photos so the admin team can review it quickly.',
    ],
  },
  {
    title: 'Items that cannot be returned',
    body: [
      'Final sale items, gift cards, customized products, opened personal-care items, downloadable content, and community or membership-related services are not eligible for return unless required by law.',
      'Products that show signs of use, damage after delivery, missing parts, or altered packaging may be declined or refunded only partially.',
    ],
  },
  {
    title: 'Starting a return',
    body: [
      'To request a return, use the Contact page and include your account email, order number, product name, reason for return, and photos when relevant.',
      'After review, the admin team will confirm whether the item is eligible and share return instructions. Please do not send items back before receiving approval.',
    ],
  },
  {
    title: 'Refunds',
    body: [
      'Approved refunds are issued to the original payment method where possible. Processing time depends on the payment provider and may take several business days after the returned item is received and inspected.',
      'Original shipping fees and return shipping costs may not be refundable unless the return is due to an Asiance fulfillment error or a damaged item.',
    ],
  },
  {
    title: 'Exchanges',
    body: [
      'If you need a different size, color, or replacement item, contact us first. Exchanges depend on product availability at the time your request is reviewed.',
      'If an exchange is unavailable, we may offer a refund or help you place a new order for an available item.',
    ],
  },
  {
    title: 'Order cancellations',
    body: [
      'Orders can usually be cancelled from your dashboard while they are still pending or processing and within the cancellation window shown on the order.',
      'Once an order has moved into fulfillment, shipped, or completed status, cancellation may no longer be available and the return policy will apply instead.',
    ],
  },
];

export default function ReturnsPage() {
  return (
    <main>
      <SiteHeader />

      <section className="page-hero">
        <span className="eyebrow">return policy</span>
        <h1>
          returns, refunds, <em>exchanges.</em>
        </h1>
        <p className="page-copy">
          A clear guide for returning eligible Asiance shop orders, requesting refunds, and contacting admin for help.
        </p>
      </section>

      <section className="legal-shell">
        <article className="legal-card">
          <div className="legal-updated">Last updated: July 17, 2026</div>
          {sections.map((section) => (
            <section className="legal-section" key={section.title}>
              <h2>{section.title}</h2>
              {section.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </section>
          ))}
        </article>
      </section>

      <SiteFooter />
    </main>
  );
}
