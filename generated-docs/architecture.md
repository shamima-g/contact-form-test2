# Architecture & Reuse Registry

The index of reusable surfaces, conventions, and cross-epic debt. Reuse what is
listed here before building new. One row per durable thing; delete a row when its
export is removed or renamed.

## Reusable surfaces

| Surface | Where | Capability |
|---|---|---|
| `SessionProvider` / `useSession` | `web/src/contexts/SessionContext.tsx` | Single source of session + active-role truth (simulated client-side auth). `signIn(email,password) → {ok,error?}`, `signOut()`, `setActiveRole(role)`, `user`, `activeRole`. No persistence, no backend. |
| `SEEDED_USERS`, `User`, `Role`, `landingRouteForRole` | `web/src/lib/fixtures/users.ts` | The three seeded demo accounts and the `Role` union (`'Visitor' \| 'Support Agent' \| 'Admin'`); `landingRouteForRole` maps a role to its landing path (Visitor → `/contact`, others → `/inbox`). |
| `signInSchema` / `SignInInput` | `web/src/lib/validation/schemas.ts` | Zod shape-check for the sign-in form (well-formed email + non-empty password). Credential match is decided by `SessionProvider`, not the schema. |
| `(protected)` route group | `web/src/app/(protected)/` | Authenticated landing pages (`/contact`, `/inbox`) live here. Its `layout.tsx` is currently a passthrough; route-guarding + permission-denied banner land in the access-control story. |

## Conventions

| Convention | Detail |
|---|---|
| Role string values | `Role` uses the space-separated `'Support Agent'` (matches project.md §Roles), not `SupportAgent`. |
| Provider nesting | Root layout order: `SessionProvider` → `ToastProvider` → app. Compose, don't nest a second shell. |

## Cross-epic debt

_None yet._
