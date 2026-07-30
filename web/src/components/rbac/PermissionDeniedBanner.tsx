/**
 * Permission-denied banner — shown in place of restricted content when a signed-in
 * role opens a route it cannot access (R4 / BR5). It is a plain-language notice, not
 * a 404/500 error page, and names the access the page needs (e.g. "Support Agent or
 * Admin"). Composed from the Shadcn `alert` primitive; the alert root carries
 * role="alert" so it is queryable and announced to assistive tech.
 */

import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { formatRequiredRoles } from '@/lib/rbac/permissions';
import type { Role } from '@/lib/fixtures/users';

export function PermissionDeniedBanner({
  requiredRoles,
}: {
  requiredRoles: readonly Role[];
}) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Alert>
        <AlertTitle>You don’t have access to this page</AlertTitle>
        <AlertDescription>
          You need {formatRequiredRoles(requiredRoles)} access to view this
          page. Switch to a role with permission, or head back to your own
          screen.
        </AlertDescription>
      </Alert>
    </div>
  );
}
