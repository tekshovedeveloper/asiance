import type { Metadata } from 'next';
import { ClientRoot } from '@/components/ClientRoot';
import './globals.css';

export const metadata: Metadata = {
  title: 'Asiance',
  description: 'Editorial community, circles, articles, members, and shop.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <ClientRoot>{children}</ClientRoot>
      </body>
    </html>
  );
}
