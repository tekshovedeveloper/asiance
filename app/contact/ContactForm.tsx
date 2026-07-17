'use client';

import { FormEvent, useState } from 'react';
import { Send } from 'lucide-react';
import { submitContactInquiry } from '@/lib/api';

const initialForm = {
  name: '',
  email: '',
  phone: '',
  topic: 'General question',
  subject: '',
  message: '',
};

export function ContactForm() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState<null | { type: 'success' | 'error'; message: string }>(null);
  const [sending, setSending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);
    setSending(true);

    try {
      const response = await submitContactInquiry(form);
      setStatus({ type: 'success', message: response.message || 'Your message has been sent.' });
      setForm(initialForm);
    } catch (error) {
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Unable to send your message. Please try again.',
      });
    } finally {
      setSending(false);
    }
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <div className="contact-form-grid">
        <label>
          <span>Name</span>
          <input
            required
            minLength={2}
            maxLength={80}
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            placeholder="Your name"
          />
        </label>

        <label>
          <span>Email</span>
          <input
            required
            type="email"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            placeholder="you@example.com"
          />
        </label>

        <label>
          <span>Phone</span>
          <input
            maxLength={40}
            value={form.phone}
            onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
            placeholder="+1 555 0100"
          />
        </label>

        <label>
          <span>Topic</span>
          <select
            value={form.topic}
            onChange={(event) => setForm((current) => ({ ...current, topic: event.target.value }))}
          >
            <option>General question</option>
            <option>Account help</option>
            <option>Order support</option>
            <option>Community or groups</option>
            <option>Article submission</option>
            <option>Partnership</option>
          </select>
        </label>
      </div>

      <label>
        <span>Subject</span>
        <input
          required
          minLength={2}
          maxLength={120}
          value={form.subject}
          onChange={(event) => setForm((current) => ({ ...current, subject: event.target.value }))}
          placeholder="How can we help?"
        />
      </label>

      <label>
        <span>Message</span>
        <textarea
          required
          minLength={10}
          maxLength={2000}
          rows={7}
          value={form.message}
          onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
          placeholder="Share the details, order number, member profile, or page link if useful."
        />
      </label>

      {status && (
        <p className={`contact-form-status contact-form-status--${status.type}`}>
          {status.message}
        </p>
      )}

      <button className="btn btn-dark contact-submit" type="submit" disabled={sending}>
        <Send size={15} />
        {sending ? 'Sending...' : 'Send message'}
      </button>
    </form>
  );
}
