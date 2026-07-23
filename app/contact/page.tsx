import Link from 'next/link';
import { Clock, Instagram, Mail, MapPin, MessageCircle, Phone, UserCircle, Youtube } from 'lucide-react';
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

function TikTokIcon({ size = 18 }: { size?: number }) {
  return (
    <svg className="contact-social-brand-icon" width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M14.3 3.5c.36 2.63 1.83 4.25 4.5 4.54v3.07a7.36 7.36 0 0 1-4.45-1.42v5.59a5.88 5.88 0 1 1-5.88-5.88c.45 0 .88.05 1.29.15v3.15a2.76 2.76 0 1 0 1.37 2.38V3.5h3.17Z" />
    </svg>
  );
}

function PinterestIcon({ size = 18 }: { size?: number }) {
  return (
    <svg className="contact-social-brand-icon" width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12.03 2.25c-5.22 0-7.85 3.74-7.85 6.86 0 1.88.71 3.56 2.24 4.19.25.1.47 0 .54-.28.05-.19.17-.68.22-.88.07-.28.04-.38-.16-.62-.44-.52-.72-1.2-.72-2.16 0-2.76 2.06-5.23 5.37-5.23 2.93 0 4.54 1.79 4.54 4.18 0 3.14-1.39 5.8-3.46 5.8-1.14 0-2-.94-1.72-2.1.33-1.38.97-2.87.97-3.87 0-.89-.48-1.64-1.47-1.64-1.17 0-2.1 1.21-2.1 2.83 0 1.03.35 1.73.35 1.73s-1.2 5.07-1.41 5.96c-.42 1.77-.06 3.94-.03 4.16.02.13.18.16.26.06.11-.15 1.55-1.92 2.04-3.69.14-.5.8-3.12.8-3.12.4.75 1.55 1.41 2.78 1.41 3.66 0 6.14-3.34 6.14-7.81 0-3.38-2.86-6.53-7.22-6.53Z" />
    </svg>
  );
}

const socialLinks = [
  {
    icon: Instagram,
    label: 'Instagram',
    href: 'https://www.instagram.com/',
  },
  {
    icon: TikTokIcon,
    label: 'TikTok',
    href: 'https://www.tiktok.com/',
  },
  {
    icon: Youtube,
    label: 'YouTube',
    href: 'https://www.youtube.com/',
    className: 'contact-social-link--youtube',
  },
  {
    icon: PinterestIcon,
    label: 'Pinterest',
    href: 'https://www.pinterest.com/',
    className: 'contact-social-link--pinterest',
  },
  {
    icon: Mail,
    label: 'Email',
    href: 'mailto:support@asiance.co',
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

            <div className="contact-social-block">
              <h3>Social channels</h3>
              <div className="contact-social-links" aria-label="Social channels">
                {socialLinks.map((item) => {
                  const Icon = item.icon;

                  return (
                    <a
                      className={['contact-social-link', item.className].filter(Boolean).join(' ')}
                      href={item.href}
                      key={item.label}
                      target={item.href.startsWith('mailto:') ? undefined : '_blank'}
                      rel={item.href.startsWith('mailto:') ? undefined : 'noreferrer'}
                      aria-label={item.label}
                      title={item.label}
                    >
                      <Icon size={18} />
                    </a>
                  );
                })}
              </div>
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
