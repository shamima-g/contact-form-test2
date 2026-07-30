# Story 5 — Seed enquiry fixtures for downstream epics

- **slug:** story-5-seed-enquiry-fixtures
- **requirementIds:** R7
- **roles:** N/A
- **route:** null
- **targetFile:** web/src/lib/fixtures/enquiries.ts
- **pageAction:** create_new
- **isInfrastructureOnly:** true

## Summary

Creates the in-memory enquiry fixture set (R7): a handful of enquiries spanning all three categories (Feedback / Question / General Enquiry) and all three statuses (New / In Progress / Resolved), each with a submittedBy user id linking to a seeded user for later own-submissions scoping. No user-facing surface in this epic — the contact-form and inbox epics own reading/writing this entity.

## Plain summary

Under the hood: a set of demo enquiries is seeded so the contact-form and inbox epics have realistic data to build against from day one — covering every category and every status.

## Acceptance criteria

- **AC-1** (vitest): The enquiry fixture set includes enquiries in all three categories (Feedback / Question / General Enquiry)
- **AC-2** (vitest): The enquiry fixture set includes enquiries in all three statuses (New / In Progress / Resolved)
- **AC-3** (vitest): Each seeded enquiry carries a submittedBy id referencing a seeded user, for later own-submissions scoping

## Manual test checklist

(none — infrastructure-only)

## Infrastructure reuse notes

- Link each enquiry's submittedBy to the seeded user ids from Story 1's users fixture.
- This entity is shared project-wide; the contact-form and inbox epics read/write it.
