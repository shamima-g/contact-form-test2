/**
 * RBAC permission model — the single source of "who may do what" for the app.
 *
 * Auth is simulated client-side (project.md §Authentication); these rules mirror
 * project.md §Roles & Permissions. Both the `<Can>` action gate and the protected
 * route guard read from here so action-hiding and route-guarding never drift apart.
 */

import type { Role } from '@/lib/fixtures/users';

/** Role-gated actions surfaced in the UI (e.g. inbox triage / delete controls). */
export type Action = 'triage' | 'delete';

/** Roles permitted to perform each action. Visitor is permitted neither. */
const ACTION_ROLES: Record<Action, readonly Role[]> = {
  // Working an enquiry through its statuses (New → In Progress → Resolved).
  triage: ['Support Agent', 'Admin'],
  // Deleting an enquiry is Admin-only (project.md §Roles & Permissions).
  delete: ['Admin'],
};

/** Whether the given active role may perform the given action. */
export function roleCan(role: Role | null, action: Action): boolean {
  if (!role) return false;
  return ACTION_ROLES[action].includes(role);
}

export interface RouteAccess {
  allowed: boolean;
  /** Roles that CAN access the route — used to name the access needed in the banner. */
  requiredRoles: readonly Role[];
}

/**
 * Whether the active role may view a protected route. Only the inbox is
 * role-restricted in this epic; every other authenticated route is open to any
 * signed-in role. Returns the roles that would grant access so a permission-denied
 * banner can name them in plain language (BR5).
 */
export function routeAccess(role: Role, pathname: string): RouteAccess {
  if (pathname.startsWith('/inbox')) {
    const requiredRoles: readonly Role[] = ['Support Agent', 'Admin'];
    return { allowed: requiredRoles.includes(role), requiredRoles };
  }
  return { allowed: true, requiredRoles: [] };
}

/** "Support Agent or Admin" — plain-language join for the permission-denied banner. */
export function formatRequiredRoles(roles: readonly Role[]): string {
  if (roles.length === 0) return '';
  if (roles.length === 1) return roles[0];
  return `${roles.slice(0, -1).join(', ')} or ${roles[roles.length - 1]}`;
}
