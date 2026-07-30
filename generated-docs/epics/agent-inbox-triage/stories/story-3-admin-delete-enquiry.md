# Story 3 — Admin delete with confirmation

- **slug:** story-3-admin-delete-enquiry
- **requirementIds:** R5, BR5, NFR-3, NFR-base-5
- **roles:** Admin
- **route:** /inbox
- **targetFile:** web/src/app/inbox/page.tsx
- **pageAction:** modify_existing
- **isInfrastructureOnly:** false

## Plain summary

As an Admin you can delete any enquiry after confirming in a dialog; the enquiry is then removed from the inbox. A Support Agent never sees a Delete action.

## Summary

Adds an Admin-only Delete action to the inbox/detail surface, gated by role so a Support Agent never sees it (BR5, R5). Delete opens a confirmation dialog; cancel is a no-op, confirm permanently removes the record from the fixture layer and the inbox list. The delete action shows a pending state and success/error outcome (NFR-3).

## Acceptance criteria

| id | text | coverage |
|---|---|---|
| AC-1 | An Admin sees a Delete action on enquiries; a Support Agent sees no Delete action anywhere in the inbox. | vitest |
| AC-2 | Clicking Delete opens a confirmation dialog; cancelling closes it and leaves the enquiry in place. | vitest |
| AC-3 | Confirming the deletion permanently removes the enquiry from the inbox. | playwright |
| AC-4 | The delete action shows a pending state and then a clear success or error outcome. | vitest |

## Manual test checklist

- Sign in as Admin → each enquiry has a Delete action
- Sign in as Support Agent → there is no Delete action anywhere in the inbox
- As Admin, click Delete → a confirmation dialog appears; cancel it → the enquiry is still there
- Confirm the delete → the enquiry disappears from the inbox
- During the delete → you see a pending state, then a success (or error) message

## Infrastructure reuse notes

- Gate the Delete action on the Admin role using the auth-and-role-shell session/RBAC context — a Support Agent must never render it.
- Delete through the in-memory fixture layer via the API client (del) at web/src/lib/api/client.ts — never call fetch() directly (CLAUDE.md §2).
- Add Shadcn `alert-dialog` for the confirmation step via the Shadcn CLI rather than hand-rolling a confirm; reuse existing toast infrastructure for NFR-3 outcomes.
