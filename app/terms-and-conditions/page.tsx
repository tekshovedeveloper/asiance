import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';

const sections = [
  {
    title: 'Using Asiance',
    body: [
      'By using Asiance, you agree to use the website respectfully and only for lawful personal, community, editorial, and shopping purposes.',
      'You are responsible for keeping your login details secure and for activity that happens through your account.',
    ],
  },
  {
    title: 'Accounts and profiles',
    body: [
      'You must provide accurate registration information and keep your email address available for verification, password recovery, and account notices.',
      'Profile names, photos, cover images, bios, interests, and social links must not impersonate another person or violate someone else’s rights.',
    ],
  },
  {
    title: 'Community conduct',
    body: [
      'Posts, comments, group activity, messages, article submissions, and uploads should be respectful, relevant, and safe for the community.',
      'Do not upload or share unlawful, abusive, misleading, spammy, harmful, private, or rights-infringing content.',
      'We may remove content, limit features, or suspend accounts when activity harms the website, members, or the integrity of the community.',
    ],
  },
  {
    title: 'Member content and uploads',
    body: [
      'You keep ownership of content you create, but you allow Asiance to display, store, process, resize, and share it within the website features where you submit it.',
      'You are responsible for having the rights to images, videos, documents, product media, article media, and other uploads you add to the site.',
    ],
  },
  {
    title: 'Shopping, checkout, and orders',
    body: [
      'Product availability, pricing, shipping, taxes, promotions, and order details may change as the shop is updated.',
      'Orders are subject to confirmation and fulfillment. Cancellation options may depend on order status and whether fulfillment has already started.',
    ],
  },
  {
    title: 'Content review and publishing',
    body: [
      'Articles and editorial submissions may require review before publication. Submitting content does not guarantee that it will appear on the website.',
      'Administrators may edit, reject, unpublish, or reorder content to keep the site clear, accurate, and aligned with the community experience.',
    ],
  },
  {
    title: 'Changes to the website',
    body: [
      'Asiance may change, pause, or remove features, pages, groups, products, or content areas as the website evolves.',
      'These terms may be updated from time to time. Continued use of the website after updates means you accept the updated terms.',
    ],
  },
];

export default function TermsAndConditionsPage() {
  return (
    <main>
      <SiteHeader />

      <section className="page-hero">
        <span className="eyebrow">terms & conditions</span>
        <h1>
          terms for using <em>asiance.</em>
        </h1>
        <p className="page-copy">
          Guidelines for accounts, profiles, community posts, messages, uploads, article submissions, shopping, and orders.
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
