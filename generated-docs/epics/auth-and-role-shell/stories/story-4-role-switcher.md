# Story 4 — Role switcher (QA/demo)

- **slug:** story-4-role-switcher
- **requirementIds:** R5, BR3, NFR-2
- **roles:** Visitor, Support Agent, Admin
- **route:** /inbox
- **targetFile:** web/src/components/qa/RoleSwitcher.tsx
- **pageAction:** create_new
- **isInfrastructureOnly:** false

## Summary

Adds a role switcher to the shell that overrides Session.activeRole without a fresh sign-in (R5/BR3). Switching re-evaluates the landing screen and action visibility immediately (no reload required; a route change is acceptable). The switcher is visually marked as a QA/demo affordance so it isn't mistaken for a production setting (NFR-2).

## Plain summary

A clearly-marked demo tool lets you switch the active role on the fly — Visitor, Support Agent, or Admin — without signing in again. The landing screen and the controls you can see update immediately to match the new role.

## Acceptance criteria

- **AC-1** (playwright): Switching the active role re-evaluates the landing screen and visible actions immediately, without a fresh sign-in
- **AC-2** (vitest): The role switcher is visibly labelled as a QA/demo tool, distinct from a normal user setting

## Manual test checklist

- Open the role switcher and switch to Support Agent -> you see the inbox and Agent actions without signing in again
- Switch to Admin -> delete controls now appear
- Switch to Visitor -> triage and delete controls disappear and you see the contact form
- Confirm the role switcher looks like a demo/QA tool, not a normal user setting

## Infrastructure reuse notes

- Consumes and mutates the SessionProvider's activeRole from Story 1.
- Lives in the shared shell (AppHeader) alongside Story 3's sign-out.
