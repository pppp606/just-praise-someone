'use client';

import { SessionProvider } from 'next-auth/react';
import HomePageContent from './HomePageContent';

export default function Page() {
  return (
    <SessionProvider>
      <HomePageContent />
    </SessionProvider>
  );
}
