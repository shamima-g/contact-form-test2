# Agent and Admin inbox triage — brief

Inherits roles, auth, data source, compliance, and styling from project.md.

## Goal

As a Support Agent or Admin, work all enquiries from a sortable, filterable inbox — advance each from New to In Progress to Resolved (with a reply note), and, as an Admin, delete an enquiry.

## Data Model

**Enquiry** (entity is authored by the visitor-contact-enquiry epic; this epic reads/updates it — no new entity created here):

| Field | Type | Notes |
|---|---|---|
| `id` | string | unique identifier |
| `name` | string | submitter name (read-only in this epic) |
| `email` | string | submitter email (read-only in this epic) |
| `address` | string, optional | submitter address (read-only in this epic) |
| `category` | enum: `Feedback` \| `Question` \| `General Enquiry` | read-only in this epic; used for inbox filtering |
| `comment` | string | submitter comment (read-only in this epic) |
| `status` | enum: `New` \| `In Progress` \| `Resolved` | mutated by this epic's status-advance and resolve actions |
| `replyNote` | string, optional | set only when resolving; required at that point |
| `createdAt` | ISO 8601 timestamp | used for default inbox sort |
| `resolvedAt` | ISO 8601 timestamp, optional | set when status becomes `Resolved` |

Seed data (per project.md): a handful of enquiries spanning all three categories and all three statuses, so New / In Progress / Resolved rows are all visible in the inbox out of the box.

## Functional Requirements

- **R1:** A Support Agent and Admin work incoming enquiries from an inbox listing all enquiries.
- **R2:** The inbox is sortable, filterable, and paginated.
- **R3:** An Agent/Admin moves an enquiry from New to In Progress.
- **R4:** Resolving an enquiry requires a reply note; Resolved is terminal, and status actions hide once resolved.
- **R5:** An Admin can delete an enquiry, behind a confirmation.

## Business Rules

- **BR1:** Only Support Agent and Admin roles can view the inbox and its contents; a Visitor navigating directly to the inbox route is blocked by RBAC (per project.md §Roles & Permissions), not merely hidden in the UI.
- **BR2:** Status transitions are strictly forward: `New → In Progress → Resolved`. No skipping directly from New to Resolved, and no reverting a status once advanced.
- **BR3:** The "Resolve" action requires a non-empty reply note; attempting to resolve without one is blocked with a validation error and the enquiry stays `In Progress`.
- **BR4:** Once an enquiry is `Resolved`, no status-changing actions (advance, resolve) remain available for it, for any role — Resolved is terminal.
- **BR5:** Deleting an enquiry is available only to the Admin role, requires an explicit confirmation step (dialog), and permanently removes the record from the inbox on confirmation.
- **BR6:** Sort, filter, and pagination state operate over the full enquiry set visible to Agent/Admin (all statuses, all categories) — filtering narrows the view but never hides an enquiry from being reachable via some filter/page combination.

## Key Workflows

1. Agent or Admin opens the Inbox and sees all enquiries, newest first by default; can sort by column (e.g. date, status, category) and page through results.
2. Agent or Admin filters the inbox (e.g. by status and/or category) to narrow the working set.
3. Agent or Admin opens a `New` enquiry and advances it to `In Progress`.
4. Agent or Admin opens an `In Progress` enquiry, enters a reply note, and resolves it; the enquiry becomes `Resolved` and its status-changing actions disappear.
5. Admin opens any enquiry (any status) and deletes it after confirming in a confirmation dialog; the enquiry is removed from the inbox.

## Feature NFRs

- **NFR-1:** Inbox list, sort, filter, and pagination interactions complete without a full-page reload (client-side state or fast round-trip against the mock layer).
- **NFR-2:** The inbox table degrades gracefully to a mobile-friendly layout (e.g. stacked/card view) below the tablet breakpoint, consistent with project.md's baseline responsive NFR.
- **NFR-3:** Status-changing actions (advance, resolve, delete) show a loading/pending state and a clear success or error outcome — no silent failures.

## Out of Scope

- The visitor-facing contact form and a Visitor's own-submissions view — delivered by the separate `visitor-contact-enquiry` epic.
- Sign-in, role-based landing, RBAC enforcement mechanics, and seeded users/fixtures — delivered by the separate `auth-and-role-shell` epic; this epic assumes that shell exists and builds against it.
- Bulk actions (multi-select resolve or delete) — not requested at intake.
- Editing enquiry content fields (name, email, address, category, comment) — this epic only changes `status` and adds `replyNote`; content edits are not in scope.

## Notes & Caveats

- **Epic dependency:** this epic depends on the `auth-and-role-shell` epic (sign-in, role-based landing, RBAC enforcement, seeded fixtures) — sequence the build accordingly. It is independent of the `visitor-contact-enquiry` epic; the only thing shared between them is the `Enquiry` data entity.
- **Mock-only backend:** per project.md, there is no real backend — inbox reads/writes (status changes, delete) operate against the in-memory/mock fixture layer built during BUILD. If that layer is not durable across a page reload, flag this to the user as a known mock-layer limitation rather than treating it as a bug.
