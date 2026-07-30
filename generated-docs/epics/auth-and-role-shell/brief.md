# Epic: Sign-in and role-based app shell

Inherits roles, auth, data source, compliance, and styling from project.md.

## Goal

Sign in as one of three seeded roles, land on the right screen for your role, and only see the actions your role is allowed — with a role switcher for demos and a friendly banner when you open a page you can't access.

This epic is the foundation the other two epics build on (no dependencies of its own): it stands up the sign-in screen, the RBAC shell (route guarding, action-hiding, permission-denied banner), the role switcher, and the in-memory fixture layer (seeded users + seeded enquiries) that the contact-form and inbox epics will read from and write to.

---

## Data Model

Entities this epic introduces (in-memory fixtures — no backend; see project.md §Data Source & Backend Integration):

### User

| Field | Type | Notes |
|---|---|---|
| `id` | string | unique identifier |
| `name` | string | display name |
| `email` | string | seeded: `visitor@example.com`, `agent@example.com`, `admin@example.com` |
| `password` | string | seeded: `Test123` for all three — plain value in the fixture (simulated auth, not a real credential store) |
| `role` | enum | `Visitor` \| `SupportAgent` \| `Admin` |

### Session (client-side, simulated)

| Field | Type | Notes |
|---|---|---|
| `userId` | string | the currently signed-in user, or absent when signed out |
| `activeRole` | enum | normally equals the signed-in user's `role`; the role switcher (QA/demo only) can override this without a fresh sign-in |

### Enquiry (fixture shape — seeded here for downstream epics)

The contact-form epic and the inbox epic own reading/writing this entity's full behaviour; this epic is only responsible for seeding the initial fixture set so both can build against real-shaped data from day one.

| Field | Type | Notes |
|---|---|---|
| `id` | string | unique identifier |
| `name` | string | submitter name |
| `email` | string | submitter email |
| `address` | string \| null | optional |
| `category` | enum | `Feedback` \| `Question` \| `General Enquiry` |
| `comment` | string | |
| `status` | enum | `New` \| `In Progress` \| `Resolved` |
| `submittedBy` | string | user id of the submitting Visitor, for own-submissions scoping in a later epic |

**Seed set for this epic:** a handful of enquiries covering all three categories and all three statuses, plus the three seeded users above (see project.md §Data Source & Backend Integration → "Seed data to build").

---

## Functional Requirements

- **R1:** Seeded users `visitor@example.com` (Visitor), `agent@example.com` (Support Agent), `admin@example.com` (Admin) — all password `Test123` — can sign in. Auth is BFF-shaped but simulated client-side (no real auth server).
- **R2:** After sign-in, a Visitor lands on the contact form; a Support Agent and Admin land on the inbox.
- **R3:** Actions the signed-in role cannot perform are hidden (e.g. no triage/delete controls for a Visitor; no delete for an Agent).
- **R4:** When a role navigates directly to a route it cannot access, the page shows a permission-denied banner — not an error page.
- **R5:** A role switcher lets a demo/QA user change the active role.
- **R6:** A signed-in user can sign out and is returned to the sign-in screen; the session ends and protected pages become inaccessible.
- **R7:** In-memory fixtures seed a handful of enquiries spanning all three categories (Feedback / Question / General Enquiry) and all three statuses (New / In Progress / Resolved), plus one seeded user per role.

---

## Business Rules

- **BR1:** Only the three seeded accounts exist; there is no sign-up, password-reset, or account-management flow in this epic (or the project — see project.md, auth is fixed/simulated).
- **BR2:** Sign-in fails (with an inline error, not a banner) for any email/password combination other than the three seeded pairs.
- **BR3:** The role switcher changes `activeRole` without requiring a fresh sign-in; switching role re-evaluates the landing screen and visible actions immediately (no page reload required to see the change, though a route change is fine).
- **BR4:** An unauthenticated user who requests any protected route is redirected to the sign-in screen (this is distinct from the permission-denied banner, which is for an *authenticated* user whose current role lacks access).
- **BR5:** The permission-denied banner names what's missing in plain language (e.g. "This page needs Support Agent or Admin access") rather than a generic 403/error message.
- **BR6:** Signing out clears the session entirely — returning to any previously visited protected URL after sign-out redirects to sign-in, it does not show stale content.

---

## Key Workflows

1. **Sign in:** User opens the sign-in screen → enters one of the three seeded email/password pairs → on success is routed to their role's landing screen (Visitor → contact form; Support Agent / Admin → inbox). An invalid combination shows an inline error and keeps the user on the sign-in screen.
2. **Blocked direct navigation:** A signed-in user pastes/opens a URL for a screen their role can't use → the shell renders that screen's page shell with a permission-denied banner in place of the restricted content (not a 404/500-style error page).
3. **Role switch (QA/demo):** A signed-in user opens the role switcher → picks a different role → the app re-evaluates landing screen and action visibility for the new active role, without a fresh sign-in.
4. **Sign out:** A signed-in user triggers sign-out from anywhere in the shell → session is cleared → user lands on the sign-in screen → any attempt to revisit a protected URL redirects back to sign-in.

---

## Feature NFRs

- **NFR-1:** Route guarding and action-hiding must be enforced consistently across every screen this epic exposes (sign-in, landing redirect, permission-denied banner, role switcher) — a role must never see a control it cannot use, even momentarily during a client-side render.
- **NFR-2:** The role switcher must be visually distinguishable as a QA/demo affordance (not styled as a normal end-user setting), so it isn't mistaken for a production feature during manual testing or a demo.

---

## Out of Scope

- Real backend authentication, password hashing, or a token/session server — this project's auth is intentionally simulated client-side (see project.md §Authentication).
- Sign-up, password reset, and account management flows.
- Multi-factor authentication.
- Persisting a session across a full browser restart — session lifetime (e.g. tab/reload persistence) is a BUILD-time implementation decision within the simulated-auth constraint; if ambiguity surfaces, resolve to the simplest option (session-scoped) rather than blocking.
- Full CRUD behaviour on the Enquiry entity (submit form, inbox triage, resolve, delete) — that belongs to the two epics that build on this one ("Visitor contact form and my submissions" and "Agent and Admin inbox triage"). This epic only seeds the fixture data.

---

## Notes & Caveats

- The simulated, client-side auth (plain-text password comparison against a fixture, no server) is an intentional project-level decision (project.md §Authentication), not a shortcut to flag for removal — but it must never be described or documented as production-grade security. Keep the sign-in screen and any copy honest about this being a demo/prototype auth layer if the project is ever shown externally.
- No prototype source, wireframes, or OpenAPI spec exist for this project (mock-only data source, no backend) — this brief is built from `assignedRequirements` and `generated-docs/project.md` only; there was nothing else in `documentation/` to reconcile against.
