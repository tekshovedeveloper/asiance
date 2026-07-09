import { Suspense } from 'react';
import { LoadingIndicator } from '@/components/LoadingIndicator';
import MessagesClient from './MessagesClient';

export default function Page() {
  return (
    <Suspense fallback={<LoadingIndicator label="Loading messages..." />}>
      <MessagesClient />
    </Suspense>
  );
}
