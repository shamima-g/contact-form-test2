'use client';

/**
 * App root (/) — a guarded entry point, not a public landing page.
 *
 * Living inside the (protected) group means an unauthenticated hit on '/' is
 * redirected to /sign-in by the group's layout guard (BR4 / AC-1). A signed-in user
 * who reaches '/' is forwarded to their active role's landing screen (Visitor →
 * /contact, Support Agent / Admin → /inbox).
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/contexts/SessionContext';
import { landingRouteForRole } from '@/lib/fixtures/users';

export default function AppRootPage() {
  const { activeRole, hydrated } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (hydrated && activeRole) {
      router.replace(landingRouteForRole(activeRole));
    }
  }, [hydrated, activeRole, router]);

  return null;
}
