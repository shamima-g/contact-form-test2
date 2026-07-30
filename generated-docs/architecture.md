# Architecture & Reuse Registry

The index of reusable surfaces, conventions, and cross-epic debt. Reuse what is
listed here before building new. One row per durable thing; delete a row when its
export is removed or renamed.

## Reusable surfaces

| Surface | Where | Capability |
|---|---|---|
| `SessionProvider` / `useSession` | `web/src/contexts/SessionContext.tsx` | Single source of session + active-role truth (simulated client-side auth). `signIn(email,password) → {ok,error?}`, `signOut()`, `setActiveRole(role)`, `user`, `activeRole`. No persistence, no backend. |
| `SEEDED_USERS`, `User`, `Role`, `landingRouteForRole` | `web/src/lib/fixtures/users.ts` | The three seeded demo accounts and the `Role` union (`'Visitor' \| 'Support Agent' \| 'Admin'`); `landingRouteForRole` maps a role to its landing path (Visitor → `/contact`, others → `/inbox`). |
| `SEEDED_ENQUIRIES`, `Enquiry`, `Category`, `EnquiryStatus` | `web/src/lib/fixtures/enquiries.ts` | Shared project-wide enquiry entity (mock, no backend). `Category` = `'Feedback' \| 'Question' \| 'General Enquiry'`, `EnquiryStatus` = `'New' \| 'In Progress' \| 'Resolved'`; each row's `submittedBy` is a `SEEDED_USERS[].id` for own-submissions scoping. Contact-form and inbox epics read/write this. |
| `signInSchema` / `SignInInput` | `web/src/lib/validation/schemas.ts` | Zod shape-check for the sign-in form (well-formed email + non-empty password). Credential match is decided by `SessionProvider`, not the schema. |
| `(protected)` route group | `web/src/app/(protected)/` | Authenticated area (`/`, `/contact`, `/inbox`). Its `layout.tsx` is the client route guard: unauthenticated → redirect to `/sign-in`; a role that can't access the route → `PermissionDeniedBanner` in the shell (no error page); waits on `useSession().hydrated` to avoid flash/false-redirect. `/` (`page.tsx`) forwards a signed-in user to their role landing. |
| `Can`, `roleCan`, `routeAccess` | `web/src/components/rbac/Can.tsx`, `web/src/lib/rbac/permissions.ts` | RBAC model. `<Can action="triage"\|"delete">` renders children only when the active role is permitted (else nothing in the DOM). `permissions.ts` is the single source of action→roles (`triage`: Support Agent+Admin; `delete`: Admin) and `routeAccess(role,pathname)` (only `/inbox` restricted). Add new actions/routes here so gating and guarding stay in sync. |
| `PermissionDeniedBanner` | `web/src/components/rbac/PermissionDeniedBanner.tsx` | Plain-language "you need X access" banner (Shadcn `alert`, `role="alert"`) shown in place of restricted content; names the required roles via `formatRequiredRoles`. |
| `useSession().hydrated` | `web/src/contexts/SessionContext.tsx` | Session is persisted to `sessionStorage` (tab-scoped) so it survives a full-page navigation; `hydrated` flips true once rehydrated. Guards/landing wait on it. `signOut` clears storage. |

## Conventions

| Convention | Detail |
|---|---|
| Role string values | `Role` uses the space-separated `'Support Agent'` (matches project.md §Roles), not `SupportAgent`. |
| Provider nesting | Root layout order: `SessionProvider` → `ToastProvider` → app. Compose, don't nest a second shell. |

## Cross-epic debt

_None yet._
