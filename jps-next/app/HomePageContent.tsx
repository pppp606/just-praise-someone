// app/HomePageContent.tsx
'use client';

import { useSession, signIn, signOut } from 'next-auth/react';

export default function HomePageContent() {
  const { data: session } = useSession();
  if (!session) {
    return (
      <button onClick={() => signIn('github')}>Sign in with GitHub</button>
    );
  }

  return (
    <div>
      <p>Welcome, {session.user?.name}</p>
      <button onClick={() => signOut()}>Sign out</button>;
    </div>
  );
}
