'use client';

import { useEffect, useRef, useState } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? '';
const SHOW_DELAY_MS = 250;
const MIN_VISIBLE_MS = 350;

function toUrl(input: RequestInfo | URL) {
  try {
    if (typeof input === 'string') return new URL(input, window.location.origin);
    if (input instanceof URL) return input;
    return new URL(input.url, window.location.origin);
  } catch {
    return null;
  }
}

function shouldTrack(input: RequestInfo | URL) {
  const url = toUrl(input);
  if (!url) return false;

  const pathname = url.pathname;
  if (pathname.startsWith('/_next/') || pathname.startsWith('/assets/') || pathname.startsWith('/fonts/')) {
    return false;
  }

  if (API_BASE) {
    try {
      const apiUrl = new URL(API_BASE, window.location.origin);
      const apiPath = apiUrl.pathname.replace(/\/$/, '');
      if (url.origin === apiUrl.origin && pathname.startsWith(apiPath || '/api')) {
        return true;
      }
    } catch {
      // Fall back to local API path matching below.
    }
  }

  return pathname.startsWith('/api/');
}

export function ApiActivityIndicator() {
  const [visible, setVisible] = useState(false);
  const pendingRef = useRef(0);
  const showTimerRef = useRef<number | null>(null);
  const hideTimerRef = useRef<number | null>(null);
  const shownAtRef = useRef(0);
  const mountedRef = useRef(false);
  const visibleRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    const originalFetch = window.fetch.bind(window) as typeof window.fetch;

    function clearTimer(ref: { current: number | null }) {
      if (ref.current !== null) {
        window.clearTimeout(ref.current);
        ref.current = null;
      }
    }

    function setLoaderVisible(nextVisible: boolean) {
      visibleRef.current = nextVisible;
      if (mountedRef.current) setVisible(nextVisible);
    }

    function showLoaderSoon() {
      clearTimer(hideTimerRef);
      if (showTimerRef.current !== null || visibleRef.current) return;
      showTimerRef.current = window.setTimeout(() => {
        showTimerRef.current = null;
        shownAtRef.current = Date.now();
        if (pendingRef.current > 0) {
          setLoaderVisible(true);
        }
      }, SHOW_DELAY_MS);
    }

    function hideLoader() {
      clearTimer(showTimerRef);
      const elapsed = Date.now() - shownAtRef.current;
      const wait = shownAtRef.current > 0 ? Math.max(0, MIN_VISIBLE_MS - elapsed) : 0;
      hideTimerRef.current = window.setTimeout(() => {
        hideTimerRef.current = null;
        shownAtRef.current = 0;
        if (pendingRef.current === 0) {
          setLoaderVisible(false);
        }
      }, wait);
    }

    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const tracked = shouldTrack(input);
      if (!tracked) return originalFetch(input, init);

      pendingRef.current += 1;
      showLoaderSoon();

      try {
        return await originalFetch(input, init);
      } finally {
        pendingRef.current = Math.max(0, pendingRef.current - 1);
        if (pendingRef.current === 0) hideLoader();
      }
    };

    return () => {
      mountedRef.current = false;
      window.fetch = originalFetch;
      clearTimer(showTimerRef);
      clearTimer(hideTimerRef);
    };
  }, []);

  if (!visible) return null;

  return (
    <div className="api-loader" role="status" aria-live="polite">
      <span className="loader-spinner" aria-hidden="true" />
      <span>Loading...</span>
    </div>
  );
}
