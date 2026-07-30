# Story 1 — Inbox list with sort, filter, and pagination

- **slug:** story-1-inbox-list-sort-filter
- **requirementIds:** R1, R2, BR1, BR6, NFR-1, NFR-2, NFR-base-5
- **roles:** Support Agent, Admin
- **route:** /inbox
- **targetFile:** web/src/app/inbox/page.tsx
- **pageAction:** modify_existing
- **isInfrastructureOnly:** false

## Plain summary

As a Support Agent or Admin you open the Inbox and see every enquiry — newest first — with columns for name, email, category, status, and date. You can sort by column, filter by status and/or category, and page through the results. A Visitor who opens the inbox address is shown a "you don't have permission" message instead.

## Summary

Builds the /inbox screen: fetches all enquiries from the seeded fixture layer and renders a sortable, filterable, paginated table (default sort createdAt descending) with loading, empty, and error states, plus a responsive stacked/card layout below the tablet breakpoint. Inbox access is Agent/Admin-only — a Visitor hits the shell's permission-denied banner (BR1). Sort/filter/pagination operate over the full enquiry set so every enquiry stays reachable via some filter/page combination (BR6).

## Acceptance criteria

| id | text | coverage |
|---|---|---|
| AC-1 | On load, an Agent/Admin sees a table of all enquiries with name, email, category, status, and created-date columns, ordered newest first by default. | vitest |
| AC-2 | Clicking a sortable column header reorders the rows by that column. | playwright |
| AC-3 | Filtering by status and/or category narrows the visible rows; clearing the filters restores the full set. | playwright |
| AC-4 | Paging through the inbox reveals subsequent pages, and every enquiry is reachable via some filter/page combination. | playwright |
| AC-5 | The inbox renders distinct loading, empty, and error states, with a retry affordance on error. | vitest |
| AC-6 | A Visitor opening the inbox route sees the permission-denied banner instead of the inbox contents. | playwright |

## Manual test checklist

- Sign in as Support Agent → you land on the inbox and see all enquiries, newest first
- Click a column header (e.g. Date or Status) → the list reorders by that column
- Filter by status 'New' and category 'Question' → only matching enquiries show; clear the filters → all return
- Page through the inbox → you can reach every enquiry across the pages
- Sign in as a Visitor and open the inbox address directly → you see a 'you don't have permission' message, not the inbox
- Shrink the window to phone width → the table becomes a stacked/card layout you can still read

## Infrastructure reuse notes

- Reuse the auth-and-role-shell session/RBAC context and route guard — do NOT build a new auth or permission mechanism. Visitor-blocking and the permission-denied banner come from that shell (this epic depends on it).
- Read enquiries through the in-memory fixture layer seeded by auth-and-role-shell — do NOT create a new Enquiry entity or a second seed set.
- All reads route through the API client at web/src/lib/api/client.ts (get/post/put/del) — never call fetch() directly in components (CLAUDE.md §2).
- Add Shadcn `table`, `select`/`dropdown` primitives via `(cd web && npx shadcn add <component> --yes)` rather than hand-rolling.
- `auth-and-role-shell` stands up /inbox as its Agent/Admin landing target; this story replaces that stub with real content. If in BUILD the route doesn't pre-exist, treat as create_new — no other change needed.
