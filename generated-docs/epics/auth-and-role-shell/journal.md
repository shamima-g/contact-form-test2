# Journal — Sign-in and role-based app shell

## Story 1 — Sign-in and simulated session

- The epic brief's Data Model listed the role values as `Visitor / SupportAgent / Admin`, but project.md's Roles table (and the build contract) use `'Support Agent'` with a space. Went with the project.md spelling everywhere — it's the authoritative source and the seeded-account labels users actually see.
- `SessionProvider` is kept router-free (redirect-on-sign-in is done reactively in the sign-in page via `useEffect` on `user`), so it mounts in jsdom without a navigation mock.

## Story 5 — Seed enquiry fixtures

- Seeded 6 enquiries (3 by the Visitor so the later "my submissions" view has data), covering all three categories and statuses; both Resolved rows carry a reply note. Fixed literal ISO `createdAt` strings for run-stability.

## Story 2 — Role-based access control and permission-denied banner

- Sessions now survive a full page reload via tab-scoped `sessionStorage`, so a signed-in person who types a URL straight into the address bar keeps their session (e.g. a Visitor opening the inbox address sees the "no access" banner instead of being kicked to sign-in). Sign-out clears it; it deliberately does not survive closing the browser.
- The app root `/` was moved into the `(protected)` group (old `src/app/page.tsx` deleted) so an unauthenticated root hit is guarded to `/sign-in` and a signed-in root hit forwards to the role landing.
- Session hydration uses `useSyncExternalStore` (not a setState-in-effect) — SSR-safe, no hydration mismatch, no flash of protected content, no lint suppression.

## Story 3 — Sign out

- The Sign Out button doesn't navigate on its own — it ends the session, and the app's existing route guard then notices there's no session and sends you to the sign-in screen. Doing it this way (rather than the button pushing to sign-in) is what guarantees the browser Back button can't slip you back into a page you were just on after signing out.

## Story 4 — Role switcher (QA/demo)

- Added the QA/demo role switcher to the app header: three role buttons (Visitor / Support Agent / Admin) marked clearly as a demo tool. Clicking one instantly switches the active role and drops you on that role's landing screen, with visible actions updating right away and no re-sign-in.
- Wiring the switcher into the shared header introduced a router dependency into the header's render subtree, so Story 3's sign-out test gained the same standard `next/navigation` mock Story 4's test uses (behavioural assertions unchanged).
