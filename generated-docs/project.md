# Contact & Enquiry Management

A contact-and-triage application: a Visitor submits a contact enquiry (name, email, optional address, category, comment) and gets an immediate confirmation; a Support Agent works incoming enquiries from an inbox through New / In Progress / Resolved; an Admin can additionally delete enquiries. All enquiry data is role-scoped — a Visitor sees only their own submissions.

| Field | Value |
|---|---|
| Project slug | `contact-enquiry-management` |
| Created | 2026-07-30T06:51:48Z |
| Intake source | docs |
| Backend connectivity | mock-only |

---

## Roles & Permissions

**Template:** `custom`

| Permission | Visitor | Support Agent | Admin |
|---|---|---|---|
| Sign in | ✓ | ✓ | ✓ |
| Submit an enquiry (public form) | ✓ | | |
| View own submissions | ✓ | | |
| View all enquiries (inbox) | | ✓ | ✓ |
| Search / filter enquiries | | ✓ | ✓ |
| Change enquiry status (New → In Progress) | | ✓ | ✓ |
| Resolve an enquiry (requires reply note) | | ✓ | ✓ |
| Delete an enquiry | | | ✓ |

> Permissions extend during BUILD as new stories surface new actions — see [agent-autonomy.md](.claude/shared/agent-autonomy.md). Additions land here via a project-change PR (§6.1 of the epic-branch plan). Permission removals or role-set changes halt for user review.

---

## Authentication

| Field | Value |
|---|---|
| Method | `bff` |
| BFF login endpoint (if BFF) | N/A — simulated client-side; no real auth server |
| BFF userinfo endpoint (if BFF) | N/A — simulated client-side; no real auth server |
| BFF logout endpoint (if BFF) | N/A — simulated client-side; no real auth server |
| Custom auth notes (if custom) | BFF-shaped, role-gated auth, simulated entirely client-side (no real backend auth server). Seeded users: `visitor@example.com` (Visitor), `agent@example.com` (Support Agent), `admin@example.com` (Admin) — all password `Test123`. Behaviour to build: role-based landing (Visitor → contact form, Agent/Admin → inbox), RBAC action-hiding (hide actions the signed-in role cannot perform), a permission-denied banner when a role navigates directly to a route it cannot access, and a role switcher for QA/demo purposes. |

> Auth method is never inferred — the user must confirm explicitly per [authentication-intake.md](.claude/policies/authentication-intake.md).

---

## Data Source & Backend Integration

| Field | Value |
|---|---|
| Data source | `mock-only` |
| Backend status | `N/A` |
| Mock layer required | yes |

<!-- Backend connectivity subsection omitted: data source is mock-only, no real backend exists. -->

### API specs

No OpenAPI spec provided — this project has no backend service. All enquiry and user data is served from in-memory fixtures seeded from the requirements below.

**Seed data to build:**
- A handful of seeded enquiries spanning all three categories (Feedback / Question / General Enquiry) and all three statuses (New / In Progress / Resolved)
- Seeded users: `visitor@example.com`, `agent@example.com`, `admin@example.com` (password `Test123` for all), one per role

---

## Compliance

**Applicable domains:** None (confirmed at intake — not payment/card data, not health/medical data, not multi-tenant SaaS data subject to SOC 2)
**Region (if Personal data applies):** N/A

### Compliance Requirements

- No regulated compliance domains (PCI-DSS / HIPAA / SOC 2) were identified during intake screening.
- `[INFERRED]` Personal data is collected (name, email, optional address). Apply standard data-minimisation practice — collect only the fields needed for triage.
- `[INFERRED]` Enquiry records are role-scoped: a Visitor may view only their own submissions; full enquiry data (including other visitors' personal data) is visible only to authenticated Support Agent and Admin roles — never to other Visitors. Enforce this via the RBAC rules in §Roles & Permissions above, not just UI hiding.

---

## Styling & Branding

| Field | Value |
|---|---|
| Primary brand color | `#2563eb` (Tailwind blue-600 — Shadcn default) |
| Accent / secondary | `#64748b` (Tailwind slate-500 — Shadcn default) |
| Background (light) | `#ffffff` |
| Background (dark, if applicable) | `#0a0a0a` |
| Font family (headings) | system UI stack |
| Font family (body) | system UI stack |
| Theme | light only |
| Source | defaulted |

> Component-specific styling (button radii, card shadows, etc.) emerges during BUILD. This section captures only palette intent and typography per [styling-centralisation.md](.claude/policies/styling-centralisation.md).

`[DEFAULT]` No bespoke design system was supplied. Use the template's Shadcn defaults with a clean, neutral palette and centralised styling tokens (no dark mode requested).

---

## Baseline NFRs

- **NFR-base-1:** Accessibility — WCAG 2.1 Level AA baseline
- **NFR-base-2:** Performance — First Contentful Paint < 2.5s on a mid-tier mobile network
- **NFR-base-3:** Responsive design — mobile (≥360px) / tablet (≥768px) / desktop (≥1280px) breakpoints
- **NFR-base-4:** Browser support — latest two versions of Chrome / Edge / Firefox / Safari
- **NFR-base-5:** Error UX — user-visible error states with retry affordance for all async operations

---
