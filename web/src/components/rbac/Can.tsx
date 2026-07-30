'use client';

/**
 * `<Can>` — the RBAC action gate. Renders its children only when the current
 * active role (from the simulated SessionProvider) may perform `action`; otherwise
 * renders nothing at all, so a forbidden control is ABSENT from the DOM rather than
 * merely hidden (R3 / NFR-1). Downstream inbox controls wrap their triage/delete
 * buttons in this gate.
 */

import type { ReactNode } from 'react';
import { useSession } from '@/contexts/SessionContext';
import { roleCan, type Action } from '@/lib/rbac/permissions';

export function Can({
  action,
  children,
}: {
  action: Action;
  children: ReactNode;
}) {
  const { activeRole } = useSession();
  if (!roleCan(activeRole, action)) return null;
  return <>{children}</>;
}
