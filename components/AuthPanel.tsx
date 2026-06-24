'use client';

import { FormEvent, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { API_URL } from '@/lib/api';
import { PasswordInput } from '@/components/PasswordInput';

const COUNTRIES = [
  'Afghanistan','Albania','Algeria','Argentina','Armenia','Australia','Austria','Azerbaijan',
  'Bahrain','Bangladesh','Belarus','Belgium','Bolivia','Bosnia and Herzegovina','Brazil',
  'Bulgaria','Cambodia','Cameroon','Canada','Chile','China','Colombia','Costa Rica','Croatia',
  'Cuba','Cyprus','Czech Republic','Denmark','Dominican Republic','Ecuador','Egypt','Estonia',
  'Ethiopia','Finland','France','Georgia','Germany','Ghana','Greece','Guatemala','Honduras',
  'Hong Kong','Hungary','India','Indonesia','Iran','Iraq','Ireland','Israel','Italy',
  'Jamaica','Japan','Jordan','Kazakhstan','Kenya','Kuwait','Kyrgyzstan','Latvia','Lebanon',
  'Libya','Lithuania','Luxembourg','Malaysia','Malta','Mexico','Moldova','Mongolia','Morocco',
  'Mozambique','Myanmar','Nepal','Netherlands','New Zealand','Nicaragua','Nigeria','Norway',
  'Oman','Pakistan','Palestine','Panama','Paraguay','Peru','Philippines','Poland','Portugal',
  'Qatar','Romania','Russia','Saudi Arabia','Senegal','Serbia','Singapore','Slovakia',
  'Slovenia','South Africa','South Korea','Spain','Sri Lanka','Sudan','Sweden','Switzerland',
  'Syria','Taiwan','Tajikistan','Tanzania','Thailand','Tunisia','Turkey','Turkmenistan',
  'Uganda','Ukraine','United Arab Emirates','United Kingdom','United States','Uruguay',
  'Uzbekistan','Venezuela','Vietnam','Yemen','Zimbabwe',
];

export function AuthPanel({ mode }: { mode: 'login' | 'register' }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  // Register-specific state
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  function validatePasswords(pw: string, cpw: string) {
    if (cpw && pw !== cpw) {
      setPasswordError('Passwords do not match.');
    } else {
      setPasswordError('');
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('');

    if (mode === 'register') {
      if (password !== confirmPassword) {
        setPasswordError('Passwords do not match.');
        return;
      }
    }

    const form = new FormData(event.currentTarget);

    const payload =
      mode === 'register'
        ? {
            firstName: String(form.get('firstName')).trim(),
            lastName: String(form.get('lastName')).trim(),
            email: String(form.get('email')).trim(),
            phone: String(form.get('phone')).trim(),
            country: String(form.get('country')),
            password,
          }
        : {
            email: String(form.get('email')),
            password: String(form.get('password')),
          };

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/${mode === 'register' ? 'register' : 'login'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setStatus(data?.message ?? 'Something went wrong. Please try again.');
        return;
      }

      if (mode === 'register') {
        // Redirect to OTP verification
        router.push(`/verify-otp?email=${encodeURIComponent((payload as any).email)}`);
      } else {
        localStorage.setItem('asiance_token', data.accessToken);
        localStorage.setItem('asiance_user', JSON.stringify(data.user));
        const redirect = searchParams.get('redirect');
        router.push(redirect ?? (data.user.role === 'admin' ? '/admin' : '/dashboard'));
      }
    } catch {
      setStatus('Could not connect to the server. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (mode === 'login') {
    return (
      <form className="auth-panel" onSubmit={submit}>
        <h1>welcome back.</h1>
        <label>
          Email
          <input name="email" type="email" required autoComplete="email" />
        </label>
        <label>
          Password
          <PasswordInput name="password" required minLength={8} autoComplete="current-password" />
        </label>
        <button className="btn btn-dark full" type="submit" disabled={loading}>
          {loading ? 'Logging in…' : 'Login'}
        </button>
        {status ? <p className="form-status">{status}</p> : null}
        <p style={{ textAlign: 'center', marginTop: 12, fontSize: 13 }}>
          <Link href="/forgot-password" className="text-link">
            Forgot password?
          </Link>
        </p>
      </form>
    );
  }

  return (
    <form className="auth-panel" onSubmit={submit}>
      <h1>join the circle.</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <label>
          First Name
          <input name="firstName" required minLength={2} autoComplete="given-name" />
        </label>
        <label>
          Last Name
          <input name="lastName" required minLength={2} autoComplete="family-name" />
        </label>
      </div>

      <label>
        Email
        <input name="email" type="email" required autoComplete="email" />
      </label>

      <label>
        Telephone
        <input
          name="phone"
          type="tel"
          placeholder="+1 555 000 0000"
          autoComplete="tel"
        />
      </label>

      <label>
        Country
        <select name="country" required defaultValue="">
          <option value="" disabled>Select your country</option>
          {COUNTRIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </label>

      <label>
        Password
        <PasswordInput
          name="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            validatePasswords(e.target.value, confirmPassword);
          }}
          autoComplete="new-password"
        />
      </label>

      <label>
        Confirm Password
        <PasswordInput
          name="confirmPassword"
          required
          minLength={8}
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            validatePasswords(password, e.target.value);
          }}
          autoComplete="new-password"
        />
      </label>
      {passwordError ? (
        <p className="form-status" style={{ color: '#dc2626' }}>{passwordError}</p>
      ) : null}

      <button className="btn btn-dark full" type="submit" disabled={loading || !!passwordError}>
        {loading ? 'Creating account…' : 'Create account'}
      </button>

      {status ? <p className="form-status">{status}</p> : null}
    </form>
  );
}
