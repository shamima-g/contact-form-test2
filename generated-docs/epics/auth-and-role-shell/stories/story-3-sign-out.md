# Story 3 — Sign out

- **slug:** story-3-sign-out
- **requirementIds:** R6, BR6
- **roles:** Visitor, Support Agent, Admin
- **route:** /inbox
- **targetFile:** web/src/components/layout/AppHeader.tsx
- **pageAction:** create_new
- **isInfrastructureOnly:** false

## Summary

Adds a sign-out control to the authenticated shell header that clears the simulated session entirely (R6) and returns the user to /sign-in. Ensures no stale protected content survives sign-out: pressing browser Back or re-requesting a previously visited protected URL redirects to sign-in (BR6), covering the bfcache/cached-page leak. Owns the back-button-after-sign-out gating AC.

## Plain summary

Sign out from anywhere in the app and you're returned to the sign-in page. Once you've signed out, the browser Back button — or re-opening a page you were just on — won't slip you back into the app; you're sent to sign-in.

## Acceptance criteria

- **AC-1** (playwright): Clicking Sign Out returns the user to the sign-in screen
- **AC-2** (playwright): After signing out, pressing the browser Back button does not reveal the previously-viewed protected page — the user is returned to sign-in
- **AC-3** (playwright): After sign out, re-opening a previously visited protected URL redirects to sign-in with no stale content

## Manual test checklist

- Click Sign Out -> you return to the sign-in page
- Sign in, sign out, then press the browser Back button -> you're sent to sign-in, not back into the app
- After signing out, paste a protected URL you visited earlier -> you're sent to sign-in, not shown the old page

## Infrastructure reuse notes

- Consumes the SessionProvider from Story 1 (session clear).
- The AppHeader is part of the shared shell — Story 4's role switcher also lives here.
