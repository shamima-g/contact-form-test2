'use client';

/**
 * Authenticated route group shell — the client-side route guard for every
 * protected page (/, /contact, /inbox).
 *
 * - Unauthenticated access to any route in this group (including the app root)
 *   redirects to /sign-in (BR4).
 * - A signed-in role opening a route its active role cannot access sees a
 *   plain-language permission-denied banner in place of the restricted content
 *   (R4 / BR5) — never a 404/500 error page.
 * - While the client session is still rehydrating from storage, a neutral shell is
 *   rendered so protected content never flashes and a signed-in user with a
 *   persisted session is not redirected by mistake (NFR-1).
 *
 * Story 3 adds the shared header (sign-out, role switcher) into this shell.
 */

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from '@/contexts/SessionContext';
import { routeAccess } from '@/lib/rbac/permissions';
import { PermissionDeniedBanner } from '@/components/rbac/PermissionDeniedBanner';
import { AppHeader } from '@/components/layout/AppHeader';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, activeRole, hydrated } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  const signedIn = Boolean(user);

  // Redirect unauthenticated visitors to sign-in — but only once the persisted
  // session has been rehydrated, so a signed-in user is never bounced on first paint.
  useEffect(() => {
    if (hydrated && !signedIn) {
      router.replace('/sign-in');
    }
  }, [hydrated, signedIn, router]);

  // Neutral placeholder until the session is known (or while the redirect is in
  // flight): renders no protected content, no heading, and no role-gated controls.
  if (!hydrated || !signedIn) {
    return <div className="min-h-screen" aria-hidden />;
  }

  const access = activeRole
    ? routeAccess(activeRole, pathname)
    : { allowed: false, requiredRoles: [] };

  if (!access.allowed) {
    return (
      <div className="min-h-screen">
        <AppHeader />
        <PermissionDeniedBanner requiredRoles={access.requiredRoles} />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AppHeader />
      {children}
    </div>
  );
}
