import { Suspense } from 'react';
import MessagesClient from './MessagesClient';

export default function Page() {
  return (
    <Suspense fallback={<div style={{ padding: 40 }}>Loading…</div>}>
      <MessagesClient />
    </Suspense>
  );
}