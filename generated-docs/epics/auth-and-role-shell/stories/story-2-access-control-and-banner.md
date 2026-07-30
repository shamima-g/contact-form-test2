# Story 2 — Role-based access control and permission-denied banner

- **slug:** story-2-access-control-and-banner
- **requirementIds:** R3, R4, BR4, BR5, NFR-1
- **roles:** Visitor, Support Agent, Admin
- **route:** /inbox
- **targetFile:** web/src/app/(protected)/layout.tsx
- **pageAction:** modify_existing
- **isInfrastructureOnly:** false

## Summary

Adds route guarding to the authenticated route group: unauthenticated requests to the app root or any protected route redirect to /sign-in (BR4); an authenticated user whose active role lacks access to a route sees a plain-language permission-denied banner in the page shell (R4/BR5) instead of a 404/500 page; and role-forbidden controls are not rendered (R3/NFR-1, no flash during client render). Owns the unauthenticated-gating ACs for the protected surface this epic introduces.

## Plain summary

Signed-out visitors are always sent to the sign-in page — including at the app's front door. When a signed-in person opens a page their role can't use, they see a friendly banner explaining what access they'd need, not an error page. Controls a role isn't allowed to use simply don't appear for them.

## Acceptance criteria

- **AC-1** (playwright): While signed out, visiting the app root sends the user to the sign-in screen (not a welcome/landing page)
- **AC-2** (playwright): While signed out, opening a protected route directly by URL sends the user to the sign-in screen
- **AC-3** (playwright): A signed-in role opening a route it can't access sees a plain-language permission-denied banner naming the access it needs (e.g. 'needs Support Agent or Admin access'), not an error page
- **AC-4** (vitest): Controls a role can't use are not rendered for that role (no triage/delete for a Visitor; no delete for an Agent)

## Manual test checklist

- Open the app while signed out -> you land on the sign-in page, not a welcome page
- While signed out, paste an inbox URL into the address bar -> you're sent to sign-in
- Signed in as a Visitor, type /inbox in the address bar -> you see a 'you need Support Agent or Admin access' banner, not an error page
- Signed in as an Agent, view an enquiry -> you don't see a Delete control (Admin-only)
- Signed in as a Visitor -> you see no triage or delete controls anywhere

## Infrastructure reuse notes

- Consumes the SessionProvider from Story 1 — do not reimplement session state.
- Add the Shadcn `alert` primitive for the permission-denied banner via the CLI.
