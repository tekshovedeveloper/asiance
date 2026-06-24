'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { API_URL } from '@/lib/api';
import { PasswordInput } from '@/components/PasswordInput';

const OTP_LENGTH = 6;
const OTP_TTL = 5 * 60;

type Step = 'email' | 'otp' | 'password';

export function ForgotPasswordPanel() {
  const router = useRouter();

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // OTP step
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [secondsLeft, setSecondsLeft] = useState(OTP_TTL);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Password step
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    if (step !== 'otp' || secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [step, secondsLeft]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timerLabel = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const expired = secondsLeft <= 0;
  const code = digits.join('');

  const handleDigitChange = useCallback((index: number, value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(-1);
    setDigits((prev) => {
      const next = [...prev];
      next[index] = cleaned;
      return next;
    });
    if (cleaned && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }, []);

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

  function validatePasswords(pw: string, cpw: string) {
    if (cpw && pw !== cpw) {
      setPasswordError('Passwords do not match.');
    } else {
      setPasswordError('');
    }
  }

  async function submitEmail(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setStatus('');
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.message ?? 'Something went wrong.');
        return;
      }
      setStatus(data.message ?? 'Check your email for the reset code.');
      setSecondsLeft(OTP_TTL);
      setDigits(Array(OTP_LENGTH).fill(''));
      setStep('otp');
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
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.message ?? 'Could not resend code.');
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

  async function submitOtp() {
    if (code.length < OTP_LENGTH) {
      setError('Enter all 6 digits.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      // We verify the OTP exists by trying to move forward.
      // We'll do the actual reset on the final step with the code stored.
      setStep('password');
      setStatus('');
    } catch {
      setError('Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  async function submitPassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }
    setError('');
    setStatus('');
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        // If the code was wrong/expired, go back to OTP step
        setError(data?.message ?? 'Reset failed. Please try again.');
        setStep('otp');
        setDigits(Array(OTP_LENGTH).fill(''));
        return;
      }
      setStatus(data.message ?? 'Password reset! Redirecting to login…');
      setTimeout(() => router.replace('/login'), 2000);
    } catch {
      setError('Could not connect to the server. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (step === 'email') {
    return (
      <form className="auth-panel" onSubmit={submitEmail}>
        <h1>forgot password.</h1>
        <p style={{ color: '#666', fontSize: 14, marginBottom: 24 }}>
          Enter your email and we'll send you a 6-digit reset code.
        </p>
        <label>
          Email
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <button className="btn btn-dark full" type="submit" disabled={loading}>
          {loading ? 'Sending…' : 'Send reset code'}
        </button>
        {error ? <p className="form-status" style={{ color: '#dc2626' }}>{error}</p> : null}
        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: '#9ca3af' }}>
          Remember your password?{' '}
          <Link href="/login" className="text-link">Log in</Link>
        </p>
      </form>
    );
  }

  if (step === 'otp') {
    return (
      <div className="auth-panel">
        <h1 style={{ marginBottom: 8 }}>check your email.</h1>
        <p style={{ color: '#666', fontSize: 14, marginBottom: 28 }}>
          We sent a 6-digit code to <strong>{email}</strong>. Enter it below.
        </p>

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
              disabled={loading}
              style={{
                width: 48,
                height: 56,
                textAlign: 'center',
                fontSize: 24,
                fontWeight: 700,
                border: `2px solid ${error && !digit ? '#dc2626' : digit ? '#1d4ed8' : '#d1d5db'}`,
                borderRadius: 8,
                outline: 'none',
                background: '#fff',
                transition: 'border-color 0.15s',
              }}
            />
          ))}
        </div>

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

        <button
          className="btn btn-dark full"
          type="button"
          onClick={() => void submitOtp()}
          disabled={loading || code.length < OTP_LENGTH || expired}
        >
          {loading ? 'Verifying…' : 'Verify code'}
        </button>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
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
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#9ca3af' }}>
          Wrong email?{' '}
          <button
            type="button"
            onClick={() => { setStep('email'); setError(''); setStatus(''); }}
            style={{ background: 'none', border: 'none', color: '#1d4ed8', cursor: 'pointer', fontSize: 13, textDecoration: 'underline' }}
          >
            Go back
          </button>
        </p>
      </div>
    );
  }

  // step === 'password'
  return (
    <form className="auth-panel" onSubmit={submitPassword}>
      <h1 style={{ marginBottom: 8 }}>new password.</h1>
      <p style={{ color: '#666', fontSize: 14, marginBottom: 24 }}>
        Choose a strong password for your account.
      </p>

      <label>
        New Password
        <PasswordInput
          required
          minLength={8}
          autoComplete="new-password"
          value={newPassword}
          onChange={(e) => {
            setNewPassword(e.target.value);
            validatePasswords(e.target.value, confirmPassword);
          }}
        />
      </label>

      <label>
        Confirm Password
        <PasswordInput
          required
          minLength={8}
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            validatePasswords(newPassword, e.target.value);
          }}
        />
      </label>

      {passwordError ? (
        <p className="form-status" style={{ color: '#dc2626' }}>{passwordError}</p>
      ) : null}

      <button
        className="btn btn-dark full"
        type="submit"
        disabled={loading || !!passwordError}
      >
        {loading ? 'Resetting…' : 'Reset password'}
      </button>

      {error ? <p className="form-status" style={{ color: '#dc2626' }}>{error}</p> : null}
      {status ? <p className="form-status" style={{ color: '#16a34a' }}>{status}</p> : null}
    </form>
  );
}
