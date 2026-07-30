# Journal — Sign-in and role-based app shell

## Story 1 — Sign-in and simulated session

- The epic brief's Data Model listed the role values as `Visitor / SupportAgent / Admin`, but project.md's Roles table (and the build contract) use `'Support Agent'` with a space. Went with the project.md spelling everywhere — it's the authoritative source and the seeded-account labels users actually see.
- `SessionProvider` is kept router-free (redirect-on-sign-in is done reactively in the sign-in page via `useEffect` on `user`), so it mounts in jsdom without a navigation mock.
