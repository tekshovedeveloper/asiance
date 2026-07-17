import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';

const faqGroups = [
  {
    title: 'Account',
    items: [
      {
        question: 'How do I create an account?',
        answer:
          'Use the Join or Register link, add your name, email, country, and password, then verify your email with the code sent to your inbox.',
      },
      {
        question: 'Why do I need email verification?',
        answer:
          'Verification helps keep member profiles, messages, orders, and community activity tied to a real account.',
      },
      {
        question: 'Can I change my profile photo and cover image?',
        answer:
          'Yes. Open your dashboard profile settings to upload a new profile photo or cover image. New accounts start with default images until you change them.',
      },
    ],
  },
  {
    title: 'Community',
    items: [
      {
        question: 'What can I post in Activity?',
        answer:
          'Activity is for community updates, media, reactions, comments, and everyday posts around considerate living, design, culture, and member interests.',
      },
      {
        question: 'How do groups work?',
        answer:
          'Groups are shared spaces for members with similar interests. You can browse groups, open a group page, and follow the activity inside that circle.',
      },
      {
        question: 'Can other members message me?',
        answer:
          'Members can start conversations from member profiles. Your messages page keeps the conversation list, chat history, media attachments, and unread state in one place.',
      },
    ],
  },
  {
    title: 'Shop',
    items: [
      {
        question: 'Where can I see products?',
        answer:
          'Open the Shop link in the main navigation to browse products, view product details, add items to your bag, and continue to checkout.',
      },
      {
        question: 'How do orders work?',
        answer:
          'After checkout, orders are saved with your profile. You can review recent orders from the dashboard.',
      },
      {
        question: 'Can I cancel an order?',
        answer:
          'If an order is still eligible, the account order view can show cancellation actions. Once fulfillment starts, cancellation may no longer be available.',
      },
    ],
  },
  {
    title: 'Content',
    items: [
      {
        question: 'What is Community News?',
        answer:
          'Community News is the editorial area for stories, updates, and curated posts from the Asiance community.',
      },
      {
        question: 'Can members submit articles?',
        answer:
          'Admins and approved members can prepare articles through the dashboard workflow. Submitted articles can be reviewed before publishing.',
      },
      {
        question: 'Where are shared files stored?',
        answer:
          'The Library page collects shared documents, media, and files used across community and editorial work.',
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <main>
      <SiteHeader />

      <section className="page-hero">
        <span className="eyebrow">faq</span>
        <h1>
          answers for <em>asiance.</em>
        </h1>
        <p className="page-copy">
          Quick help for accounts, profiles, community features, messages, shopping, and publishing.
        </p>
      </section>

      <section className="faq-shell" aria-label="Frequently asked questions">
        <div className="faq-grid">
          {faqGroups.map((group) => (
            <section className="faq-section" key={group.title}>
              <h2>{group.title}</h2>
              <div className="faq-list">
                {group.items.map((item) => (
                  <details className="faq-card" key={item.question}>
                    <summary>{item.question}</summary>
                    <p>{item.answer}</p>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
