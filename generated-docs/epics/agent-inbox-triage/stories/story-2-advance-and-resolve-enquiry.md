# Story 2 — Open an enquiry, advance it, and resolve it with a reply note

- **slug:** story-2-advance-and-resolve-enquiry
- **requirementIds:** R3, R4, BR2, BR3, BR4, NFR-1, NFR-3, NFR-base-5
- **roles:** Support Agent, Admin
- **route:** /inbox
- **targetFile:** web/src/app/inbox/page.tsx
- **pageAction:** modify_existing
- **isInfrastructureOnly:** false

## Plain summary

As a Support Agent or Admin you open an enquiry to read its full details and comment, move a New enquiry to In Progress, and resolve an In Progress enquiry by entering a reply note. Resolving needs a reply note — resolve is blocked with a message if it's empty. Once an enquiry is Resolved, the advance and resolve actions disappear for good.

## Summary

Adds the enquiry detail surface (dialog/panel on /inbox) showing full read-only enquiry content plus status actions. Advance moves New → In Progress; Resolve requires a non-empty replyNote and moves In Progress → Resolved (setting resolvedAt). Transitions are strictly forward with no New→Resolved skip (BR2); empty reply note is blocked with a validation error and status stays In Progress (BR3); Resolved is terminal and hides all status controls for every role (BR4). Actions show pending and success/error states (NFR-3).

## Acceptance criteria

| id | text | coverage |
|---|---|---|
| AC-1 | Opening an enquiry shows its full read-only details including the submitter's comment and current status. | vitest |
| AC-2 | A New enquiry offers only an advance-to-In-Progress action (no jump straight to Resolved); advancing sets its status to In Progress. | vitest |
| AC-3 | Attempting to resolve with an empty reply note shows a validation error and the enquiry stays In Progress. | vitest |
| AC-4 | Entering a reply note and resolving sets the enquiry to Resolved and records the reply. | playwright |
| AC-5 | Once an enquiry is Resolved, no advance or resolve actions remain available for any role. | vitest |
| AC-6 | Each status action shows a pending state and then a clear success or error outcome. | vitest |

## Manual test checklist

- Open a New enquiry → you see the submitter's full details and comment
- Advance it to In Progress → its status updates; there's no way to jump straight to Resolved
- Try to resolve without typing a reply note → you're stopped with a validation message and it stays In Progress
- Type a reply note and resolve → the enquiry becomes Resolved
- Open a Resolved enquiry → the advance and resolve actions are gone
- During each action → you see a brief pending state, then a success (or error) message

## Infrastructure reuse notes

- Update enquiries through the in-memory fixture layer seeded by auth-and-role-shell — this story only changes `status` and adds `replyNote`; no content-field edits.
- All writes route through the API client at web/src/lib/api/client.ts (put/patch) — never call fetch() directly in components (CLAUDE.md §2).
- Add the reply-note validation rule to web/src/lib/validation/schemas.ts (Zod) rather than inline.
- Add Shadcn `dialog` (detail + status actions) via the Shadcn CLI; reuse existing toast infrastructure (web/src/contexts/ToastContext.tsx) for NFR-3 success/error outcomes.
- Enforce forward-only transitions and terminal Resolved in one place so advance/resolve controls disappear consistently for every role.
