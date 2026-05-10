import { redirect } from 'next/navigation';

export default function RootPage() {
  redirect('/');
}

// This file exists to prevent the old app/page.tsx from being used
// All routes are in app/(app)/ now