/**
 * Story Metadata:
 * - Route: null (infrastructure-only — no user-facing surface in this epic)
 * - Target File: web/src/lib/fixtures/enquiries.ts
 * - Page Action: create_new
 *
 * Tests for the seeded enquiry fixture set (R7). The contact-form and inbox
 * epics build against this shared data, so it must cover every category, every
 * status, and link each enquiry to a seeded user for own-submissions scoping.
 *
 * Imports point at the not-yet-created production fixtures — RED until implemented.
 */
import { describe, it, expect } from 'vitest';
import {
  SEEDED_ENQUIRIES,
  type Category,
  type EnquiryStatus,
} from '@/lib/fixtures/enquiries';
import { SEEDED_USERS } from '@/lib/fixtures/users';

const ALL_CATEGORIES: Category[] = ['Feedback', 'Question', 'General Enquiry'];
const ALL_STATUSES: EnquiryStatus[] = ['New', 'In Progress', 'Resolved'];

describe('SEEDED_ENQUIRIES fixture set', () => {
  // AC-1
  it('includes enquiries in all three categories', () => {
    const categories = new Set(SEEDED_ENQUIRIES.map((e) => e.category));
    for (const category of ALL_CATEGORIES) {
      expect(categories).toContain(category);
    }
  });

  // AC-2
  it('includes enquiries in all three statuses', () => {
    const statuses = new Set(SEEDED_ENQUIRIES.map((e) => e.status));
    for (const status of ALL_STATUSES) {
      expect(statuses).toContain(status);
    }
  });

  // AC-3
  it('links every enquiry to a seeded user via submittedBy', () => {
    const userIds = new Set(SEEDED_USERS.map((u) => u.id));
    expect(SEEDED_ENQUIRIES.length).toBeGreaterThan(0);
    for (const enquiry of SEEDED_ENQUIRIES) {
      expect(userIds).toContain(enquiry.submittedBy);
    }
  });
});
