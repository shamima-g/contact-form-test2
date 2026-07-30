# Visitor contact form and my submissions — brief

Inherits roles, auth, data source, compliance, and styling from project.md.

> Depends on the **auth-and-role-shell** epic (sign-in, role-based landing, RBAC enforcement, seeded fixtures). This epic assumes that scaffolding already exists — the Visitor is signed in before reaching the contact form, and the "own-only" scoping below is enforced through that epic's RBAC layer.

---

## Goal

As a Visitor, send a contact enquiry, see an immediate confirmation of what you sent, and review your own past submissions — and only your own.

---

## Data Model

**Enquiry** (this epic creates and reads this entity; status transitions and triage fields belong to a separate epic and are not built here):

| Field | Type | Notes |
|---|---|---|
| `id` | string | Generated on submit |
| `name` | string | Required |
| `email` | string | Required, email format |
| `address` | string | Optional |
| `category` | enum | One of `Feedback` / `Question` / `General Enquiry` |
| `comment` | string | Required |
| `submittedBy` | string (Visitor identity) | Stamped from the authenticated session at submit time — the join key used to scope "My Submissions" to the current Visitor |
| `status` | enum | `New` / `In Progress` / `Resolved` — set to `New` on creation by this epic; transitions between statuses are owned by the Support Agent triage epic, not this one |
| `createdAt` | timestamp | Set on submit |

Reuses the seeded enquiry fixtures and Visitor user fixtures already defined in `project.md` §Data Source & Backend Integration.

---

## Functional Requirements

- **R1 — Submit a contact enquiry:** A Visitor submits an enquiry with Name, Email, Address (optional), Category (Feedback / Question / General Enquiry), and Comment.
- **R2 — Confirmation after submit:** On save, land on a confirmation page showing what was sent, the form clears, and "Message sent!" appears.
- **R3 — Visitor reviews own submissions:** A Visitor can review their own past submissions, read-only and own-only.
- **R4 — Enquiry data is role-scoped:** A Visitor sees only their own submissions; full enquiry data (including other visitors' personal data) is visible only to Support Agent and Admin.

---

## Business Rules

- **BR1:** Name, Email, Category, and Comment are required; Address is optional.
- **BR2:** Category accepts exactly three values: `Feedback`, `Question`, `General Enquiry` — no free text.
- **BR3:** On successful submission, the enquiry is stamped with the authenticated Visitor's identity (`submittedBy`), which is the sole basis for "own submissions" scoping — never a client-supplied filter.
- **BR4:** The Visitor's "My Submissions" view returns only enquiries where `submittedBy` matches the signed-in Visitor. This is enforced at the data-access layer, not just hidden in the UI — a Visitor must not be able to retrieve another visitor's enquiry by any means available in this epic (e.g., manipulating an ID in a URL).
- **BR5:** The confirmation page (R2) echoes back exactly what was submitted — Name, Email, Address (if given), Category, Comment — and the contact form itself resets to empty once the confirmation is shown.
- **BR6:** Visitors cannot see triage-only fields or actions (status, reply notes, inbox, delete) anywhere in this epic — those belong to Support Agent / Admin per `project.md` §Roles & Permissions.

---

## Key Workflows

1. **Submit an enquiry**
   1. Signed-in Visitor lands on the contact form (their role-based landing page, per the auth epic).
   2. Fills Name, Email, Address (optional), Category, Comment.
   3. Submits.
   4. Client-side validation passes (or surfaces inline errors — see Feature NFRs).
   5. Lands on a confirmation page showing exactly what was sent, with a "Message sent!" message.
   6. Returning to the contact form shows it cleared/empty, ready for a new enquiry.

2. **Review own submissions**
   1. Visitor navigates to "My Submissions".
   2. Sees a read-only list of their own past enquiries only (date, category, comment, status), newest first.
   3. No edit, delete, or status-change affordances are present — this view is strictly read-only.
   4. If the Visitor has no past submissions, an empty-state message is shown instead of a blank list.

---

## Feature NFRs

- **Feature-NFR-1:** The contact form validates required fields and email format client-side, with inline error messages next to the offending field, before submission is attempted.
- **Feature-NFR-2:** "My Submissions" handles the empty state (no submissions yet) with a clear, friendly message rather than a blank screen.

---

## Out of Scope

- Editing or deleting a previously submitted enquiry (no Visitor-facing edit/delete in this epic; Admin delete is a separate epic's concern).
- The Support Agent inbox, status lifecycle (New → In Progress → Resolved), and resolve-with-note workflow — owned by a separate triage epic.
- Search, filter, sort, or pagination across all enquiries (an Agent/Admin capability, out of scope for the Visitor-facing surface built here).

---

## Notes & Caveats

- This epic has a hard dependency on the **auth-and-role-shell** epic: sign-in, role-based landing (Visitor → contact form), and the RBAC layer that makes "own-only" scoping enforceable rather than just a UI filter. Build order should land that epic first.
- No `prototype-src/` or other prototype artifacts were present in `documentation/` at intake, so there is no prototype-shortcut catalogue to carry notes from for this epic.
- `documentation/contact-form.md` references an "authoritative BRD" at `frontend/docs/requirements.md` and a `answers.json` driver file — neither exists in this repository's `documentation/` folder. This brief is derived from `documentation/contact-form.md` and `project.md` alone; if those referenced files exist elsewhere, they were not available at intake.
