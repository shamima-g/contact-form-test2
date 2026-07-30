# Epic Plan — Contact & Enquiry Management

Every epic in this project, what it delivers, and what it builds on. Live status
(not started / in flight / done) is shown by `/status` and the dashboard.

> Plan only — edited during planning on `main`, never on an epic branch.

## Epics

| # | Epic | Delivers | Builds on |
|---|---|---|---|
| 1 | Sign-in and role-based app shell (`auth-and-role-shell`) | Sign in as one of three seeded roles, land on the right screen for your role, see only the actions your role allows — with a role switcher and a permission-denied banner. | — |
| 2 | Visitor contact form and my submissions (`visitor-contact-enquiry`) | As a Visitor, send a contact enquiry, get an immediate confirmation, and review your own past submissions (own-only). | Sign-in and role-based app shell (`auth-and-role-shell`) |
| 3 | Agent and Admin inbox triage (`agent-inbox-triage`) | As a Support Agent or Admin, work all enquiries from a sortable, filterable inbox — advance New → In Progress → Resolved (with a reply note), and, as Admin, delete. | Sign-in and role-based app shell (`auth-and-role-shell`) |

## Coverage

Everything in the spec is assigned to an epic:

| What you asked for | Epic |
|---|---|
| Sign in as a seeded user (R1) | Sign-in and role-based app shell (`auth-and-role-shell`) |
| Role-based landing (R2) | Sign-in and role-based app shell (`auth-and-role-shell`) |
| Action-hiding by role (R3) | Sign-in and role-based app shell (`auth-and-role-shell`) |
| Permission-denied banner on blocked routes (R4) | Sign-in and role-based app shell (`auth-and-role-shell`) |
| Role switcher for QA/demo (R5) | Sign-in and role-based app shell (`auth-and-role-shell`) |
| Sign out (R6) | Sign-in and role-based app shell (`auth-and-role-shell`) |
| Seeded enquiries and users (R7) | Sign-in and role-based app shell (`auth-and-role-shell`) |
| Submit a contact enquiry (R8) | Visitor contact form and my submissions (`visitor-contact-enquiry`) |
| Confirmation after submit (R9) | Visitor contact form and my submissions (`visitor-contact-enquiry`) |
| Visitor reviews own submissions (R10) | Visitor contact form and my submissions (`visitor-contact-enquiry`) |
| Enquiry data is role-scoped (R11) | Visitor contact form and my submissions (`visitor-contact-enquiry`) |
| Inbox of all enquiries (R12) | Agent and Admin inbox triage (`agent-inbox-triage`) |
| Sort, filter, and paginate the inbox (R13) | Agent and Admin inbox triage (`agent-inbox-triage`) |
| Advance enquiry status (R14) | Agent and Admin inbox triage (`agent-inbox-triage`) |
| Resolve with a reply note (R15) | Agent and Admin inbox triage (`agent-inbox-triage`) |
| Admin deletes an enquiry (R16) | Agent and Admin inbox triage (`agent-inbox-triage`) |

_16 requirements, all assigned._
