'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { API_URL } from '@/lib/api';

const OTP_LENGTH = 6;
const OTP_TTL = 5 * 60; // 5 minutes in seconds

export function OtpVerifyPanel() {
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get('email') ?? '';

  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(OTP_TTL);
  const [verified, setVerified] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timerLabel = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const expired = secondsLeft <= 0;

  const code = digits.join('');

  const handleDigitChange = useCallback(
    (index: number, value: string) => {
      const cleaned = value.replace(/\D/g, '').slice(-1);
      setDigits((prev) => {
        const next = [...prev];
        next[index] = cleaned;
        return next;
      });
      if (cleaned && index < OTP_LENGTH - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    },
    [],
  );

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!text) return;
    const next = Array(OTP_LENGTH).fill('');
    text.split('').forEach((ch, i) => { next[i] = ch; });
    setDigits(next);
    const lastFilled = Math.min(text.length, OTP_LENGTH - 1);
    inputRefs.current[lastFilled]?.focus();
  }

  async function verify() {
    if (code.length < OTP_LENGTH) {
      setError('Enter all 6 digits.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.message ?? 'Verification failed.');
        return;
      }
      setVerified(true);
      setStatus(data.message ?? 'Email verified! Redirecting to login…');
      setTimeout(() => router.replace('/login'), 2000);
    } catch {
      setError('Could not connect to the server. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function resend() {
    setResending(true);
    setError('');
    setStatus('');
    try {
      const res = await fetch(`${API_URL}/auth/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.message ?? 'Could not resend OTP.');
        return;
      }
      setDigits(Array(OTP_LENGTH).fill(''));
      setSecondsLeft(OTP_TTL);
      setStatus('New code sent! Check your inbox.');
      inputRefs.current[0]?.focus();
    } catch {
      setError('Could not connect to the server.');
    } finally {
      setResending(false);
    }
  }

  if (!email) {
    return (
      <div className="auth-panel" style={{ textAlign: 'center' }}>
        <p>No email address found.</p>
        <Link href="/register" className="text-link">Go back to register</Link>
      </div>
    );
  }

  return (
    <div className="auth-panel">
      <h1 style={{ marginBottom: 8 }}>verify your email.</h1>
      <p style={{ color: '#666', fontSize: 14, marginBottom: 28 }}>
        We sent a 6-digit code to <strong>{email}</strong>. Enter it below.
      </p>

      {/* OTP digit inputs */}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 24 }}>
        {digits.map((digit, i) => (
          <input
            key={i}
            ref={(el) => { inputRefs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleDigitChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            disabled={verified || loading}
            style={{
              width: 48,
              height: 56,
              textAlign: 'center',
              fontSize: 24,
              fontWeight: 700,
              border: `2px solid ${error && !digit ? '#dc2626' : digit ? '#1d4ed8' : '#d1d5db'}`,
              borderRadius: 8,
              outline: 'none',
              background: verified ? '#f0fdf4' : '#fff',
              transition: 'border-color 0.15s',
            }}
          />
        ))}
      </div>

      {/* Timer */}
      <p style={{
        textAlign: 'center',
        fontSize: 13,
        color: expired ? '#dc2626' : '#6b7280',
        marginBottom: 16,
      }}>
        {expired ? 'Code expired.' : `Code expires in ${timerLabel}`}
      </p>

      {error ? <p style={{ color: '#dc2626', fontSize: 13, textAlign: 'center', marginBottom: 12 }}>{error}</p> : null}
      {status ? <p style={{ color: '#16a34a', fontSize: 13, textAlign: 'center', marginBottom: 12 }}>{status}</p> : null}

      {/* Verify button */}
      {!verified && (
        <button
          className="btn btn-dark full"
          type="button"
          onClick={() => void verify()}
          disabled={loading || code.length < OTP_LENGTH || expired}
        >
          {loading ? 'Verifying…' : 'Verify email'}
        </button>
      )}

      {/* Resend */}
      <div style={{ textAlign: 'center', marginTop: 16 }}>
        {expired || !verified ? (
          <button
            type="button"
            onClick={() => void resend()}
            disabled={resending || (!expired && secondsLeft > 0)}
            style={{
              background: 'none',
              border: 'none',
              cursor: expired ? 'pointer' : 'not-allowed',
              color: expired ? '#1d4ed8' : '#9ca3af',
              fontSize: 14,
              textDecoration: expired ? 'underline' : 'none',
            }}
          >
            {resending ? 'Sending…' : expired ? 'Resend code' : `Resend available in ${timerLabel}`}
          </button>
        ) : null}
      </div>

      <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#9ca3af' }}>
        Wrong email?{' '}
        <Link href="/register" className="text-link">Go back</Link>
      </p>
    </div>
  );
}
