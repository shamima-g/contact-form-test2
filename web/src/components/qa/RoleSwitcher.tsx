'use client';

/**
 * RoleSwitcher — a QA/demo affordance in the shared shell header that overrides
 * the session's active role in place, without a fresh sign-in (R5 / BR3).
 *
 * It is deliberately styled to read as a demo/QA tool, not a normal end-user
 * setting (NFR-2): a dashed, muted panel with an explicit "QA / Demo" label, so
 * it is not mistaken for a production feature during a demo or manual test.
 *
 * The three roles are exposed as always-visible buttons (not a Select/combobox) —
 * the whole point of a demo switch is to see and reach every role at a glance.
 * Clicking a role calls `setActiveRole` and then routes to that role's landing
 * screen, so the landing screen AND role-gated actions (triage/delete) re-evaluate
 * immediately for the new active role — no page reload and no re-authentication.
 */

import { useRouter } from 'next/navigation';
import { useSession } from '@/contexts/SessionContext';
import { landingRouteForRole, type Role } from '@/lib/fixtures/users';
import { Button } from '@/components/ui/button';

// Ordered, exhaustive list of the demo roles the switcher exposes.
const SWITCHABLE_ROLES: readonly Role[] = ['Visitor', 'Support Agent', 'Admin'];

const LABEL_ID = 'qa-role-switcher-label';

export function RoleSwitcher() {
  const router = useRouter();
  const { activeRole, setActiveRole } = useSession();

  const handleSwitch = (role: Role) => {
    // Override the active role in place (no re-sign-in) …
    setActiveRole(role);
    // … then land on that role's screen so the landing view and role-gated
    // actions re-evaluate immediately for the new active role (BR3).
    router.push(landingRouteForRole(role));
  };

  return (
    <section
      aria-labelledby={LABEL_ID}
      className="flex flex-wrap items-center gap-2 rounded-md border border-dashed border-muted-foreground/50 bg-muted/40 px-3 py-2"
    >
      <span
        id={LABEL_ID}
        className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
      >
        QA / Demo · Switch role
      </span>

      <div className="flex flex-wrap items-center gap-1.5">
        {SWITCHABLE_ROLES.map((role) => {
          const isActive = activeRole === role;
          return (
            <Button
              key={role}
              type="button"
              size="sm"
              variant={isActive ? 'default' : 'outline'}
              aria-pressed={isActive}
              onClick={() => handleSwitch(role)}
            >
              {role}
            </Button>
          );
        })}
      </div>
    </section>
  );
}
