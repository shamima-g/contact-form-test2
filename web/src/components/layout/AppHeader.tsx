'use client';

/**
 * AppHeader — the authenticated shell header rendered by the (protected) layout on
 * every protected screen, above the page content.
 *
 * It shows who is signed in (name + active role) and a Sign Out control (R6).
 * Activating Sign Out clears the simulated session via `useSession().signOut()`.
 * Navigation back to /sign-in is intentionally NOT performed here: clearing the
 * session makes the (protected) layout guard re-evaluate and `router.replace(
 * '/sign-in')` (see app/(protected)/layout.tsx), which keeps sign-out off the
 * browser back-stack so a Back press or a re-opened protected URL cannot reveal
 * stale content (BR6). Because the guard owns the redirect, this component depends
 * only on the session — not the router.
 *
 * When no user is signed in the header renders nothing, so the Sign Out control
 * belongs exclusively to the signed-in shell.
 */

import { useSession } from '@/contexts/SessionContext';
import { Button } from '@/components/ui/button';

export function AppHeader() {
  const { user, activeRole, signOut } = useSession();

  if (!user) {
    return null;
  }

  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex flex-col">
          <span className="text-sm font-semibold leading-tight text-foreground">
            {user.name}
          </span>
          <span className="text-xs text-muted-foreground">
            {activeRole ?? user.role}
          </span>
        </div>

        <Button type="button" variant="outline" size="sm" onClick={signOut}>
          Sign Out
        </Button>
      </div>
    </header>
  );
}
