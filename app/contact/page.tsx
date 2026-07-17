import Link from 'next/link';
import { Clock, Mail, MapPin, MessageCircle, Phone, UserCircle } from 'lucide-react';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import { ContactForm } from './ContactForm';

const contactDetails = [
  {
    icon: Mail,
    label: 'Email',
    value: 'support@asiance.co',
    href: 'mailto:support@asiance.co',
  },
  {
    icon: Phone,
    label: 'Phone',
    value: '+1 (555) 012-8842',
    href: 'tel:+15550128842',
  },
  {
    icon: MapPin,
    label: 'Office',
    value: 'Asiance Studio, 214 Mercer Street, New York, NY 10012',
  },
  {
    icon: Clock,
    label: 'Support hours',
    value: 'Monday to Friday, 9:00 AM - 6:00 PM EST',
  },
];

const quickLinks = [
  {
    icon: UserCircle,
    label: 'Account dashboard',
    copy: 'Update profile, photos, interests, and settings.',
    href: '/dashboard',
  },
  {
    icon: MessageCircle,
    label: 'Messages',
    copy: 'Open your member conversations and unread messages.',
    href: '/messages',
  },
];

export default function ContactPage() {
  return (
    <main>
      <SiteHeader />

      <section className="page-hero">
        <span className="eyebrow">contact</span>
        <h1>
          talk with <em>asiance.</em>
        </h1>
        <p className="page-copy">
          Send questions about your account, profile, groups, messages, article submissions, orders, or partnerships.
        </p>
      </section>

      <section className="contact-shell">
        <div className="contact-layout">
          <aside className="contact-info">
            <div>
              <span className="eyebrow">details</span>
              <h2>Reach the team</h2>
              <p>
                Use the form for the fastest response. Include your account email, order number, or page link when it helps us find the right context.
              </p>
            </div>

            <div className="contact-detail-list">
              {contactDetails.map((item) => {
                const Icon = item.icon;
                const content = (
                  <>
                    <span className="contact-detail-icon"><Icon size={17} /></span>
                    <span>
                      <strong>{item.label}</strong>
                      <small>{item.value}</small>
                    </span>
                  </>
                );

                return item.href ? (
                  <a className="contact-detail" href={item.href} key={item.label}>
                    {content}
                  </a>
                ) : (
                  <div className="contact-detail" key={item.label}>
                    {content}
                  </div>
                );
              })}
            </div>

            <div className="contact-quick-links">
              <h3>Helpful links</h3>
              {quickLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <Link className="contact-quick-link" href={item.href} key={item.label}>
                    <Icon size={17} />
                    <span>
                      <strong>{item.label}</strong>
                      <small>{item.copy}</small>
                    </span>
                  </Link>
                );
              })}
            </div>
          </aside>

          <section className="contact-card">
            <div className="contact-card-head">
              <span className="eyebrow">send a query</span>
              <h2>Message admin</h2>
              <p>Your message is sent to the Asiance admin inbox.</p>
            </div>
            <ContactForm />
          </section>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
