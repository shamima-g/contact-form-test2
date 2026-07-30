# Story 1 — Sign-in and simulated session

- **slug:** story-1-sign-in-and-session
- **requirementIds:** R1, R2, R7, BR1, BR2
- **roles:** Visitor, Support Agent, Admin
- **route:** /sign-in
- **targetFile:** web/src/app/sign-in/page.tsx
- **pageAction:** create_new
- **isInfrastructureOnly:** false

## Summary

Builds the sign-in screen at /sign-in, the seeded users fixture (visitor/agent/admin, all password Test123), and the client-side SessionProvider that holds the signed-in user and active role. Validates credentials against the fixture, establishes the simulated session, and redirects to the role's landing route (Visitor -> contact, Agent/Admin -> inbox). Creates the authenticated route group and placeholder landing routes the downstream epics flesh out. This is the epic's shared shell surface.

## Plain summary

Sign in with one of the three demo accounts and land on the right screen for your role — a Visitor on the contact form, a Support Agent or Admin in the inbox. A wrong email or password shows an inline error and keeps you on the sign-in page.

## Acceptance criteria

- **AC-1** (playwright): Signing in as the seeded Visitor lands on the contact screen; as Support Agent or Admin lands on the inbox
- **AC-2** (vitest): An email/password other than the three seeded pairs shows an inline error and keeps the user on the sign-in screen
- **AC-3** (vitest): The sign-in screen offers only sign-in — no sign-up or password-reset link — and is honest that this is demo/prototype auth

## Manual test checklist

- Sign in as visitor@example.com / Test123 -> you land on the contact form
- Sign in as agent@example.com / Test123 -> you land on the inbox
- Sign in as admin@example.com / Test123 -> you land on the inbox
- Enter a wrong password -> you see an inline error and stay on the sign-in page
- Confirm there is no sign-up or forgot-password link on the sign-in page

## Infrastructure reuse notes

- ToastProvider / ToastContext already exist — reuse for transient notifications.
- Root layout already wraps ToastProvider — add SessionProvider by composing/replacing this layout per Critical Rule 6, not by nesting a second shell.
- Shadcn primitives present: button, card, input, label. Add missing (form) via the Shadcn CLI — don't hand-roll.
- Zod schemas live in web/src/lib/validation/schemas.ts — extend for the sign-in form.
- Mock-only: seed users as in-memory fixtures (web/src/lib/fixtures/); do NOT call the API client for auth.
- The SessionProvider created here is the single source of session + active-role truth; Stories 2–4 consume it.
