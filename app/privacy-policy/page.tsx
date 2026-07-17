import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';

const sections = [
  {
    title: 'Information we collect',
    body: [
      'When you create an Asiance account, we collect details such as your name, email address, country, phone number when provided, username, password credentials, profile photo, cover image, bio, interests, and social profile links.',
      'When you use community features, we may store posts, comments, reactions, group activity, uploaded media, files, messages, notifications, and timestamps related to your activity.',
      'When you shop, we may collect cart, checkout, order, shipping, billing, and product information needed to process and support your purchase.',
    ],
  },
  {
    title: 'How we use information',
    body: [
      'We use account information to create your profile, verify your email, log you in, personalize your dashboard, and keep your profile and settings available across the website.',
      'We use community activity to power feeds, groups, member pages, messages, notifications, article workflows, and moderation tools.',
      'We use order and checkout information to process purchases, show order history, support cancellations where available, and improve shopping features.',
    ],
  },
  {
    title: 'Messages and community content',
    body: [
      'Messages, posts, comments, group activity, and uploaded files may be visible to other members depending on the feature and privacy setting used.',
      'Private messages are intended for the conversation participants and site administrators only when needed for support, safety, or technical maintenance.',
    ],
  },
  {
    title: 'Uploads and profile images',
    body: [
      'Uploaded profile photos, cover images, product images, article media, chat attachments, and library files are stored so the website can display and deliver them.',
      'If you do not upload a profile photo or cover image, Asiance may use default placeholder images for your account.',
    ],
  },
  {
    title: 'Cookies and local storage',
    body: [
      'The website may use browser storage, authentication tokens, session data, and similar technologies to keep you signed in, remember cart activity, and make core features work.',
      'You can clear browser storage from your browser settings, but doing so may sign you out or reset local preferences.',
    ],
  },
  {
    title: 'Data access and changes',
    body: [
      'You can update many profile details from your dashboard. Some account, order, or verification records may need to remain for security, support, fraud prevention, or legal reasons.',
      'To ask about account data, privacy questions, or deletion requests, use the Contact link in the footer.',
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <main>
      <SiteHeader />

      <section className="page-hero">
        <span className="eyebrow">privacy policy</span>
        <h1>
          how we handle <em>your data.</em>
        </h1>
        <p className="page-copy">
          A plain-language overview of how Asiance uses account, community, message, upload, and shop information.
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
