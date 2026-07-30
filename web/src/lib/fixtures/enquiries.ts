/**
 * Seeded enquiry fixtures — simulated, client-side data (no backend).
 *
 * This is the shared enquiry entity for the whole project: the contact-form
 * epic writes new enquiries and the inbox epic reads/triages them. Seeding a
 * realistic spread here (every category, every status, a mix of submitters)
 * means those downstream epics have data to build and demo against from day one.
 *
 * `submittedBy` references a seeded user id from `./users` so the later
 * "my submissions" (own-only) view can scope enquiries to their author.
 */

export type Category = 'Feedback' | 'Question' | 'General Enquiry';

export type EnquiryStatus = 'New' | 'In Progress' | 'Resolved';

export interface Enquiry {
  id: string;
  name: string;
  email: string;
  address?: string;
  category: Category;
  comment: string;
  status: EnquiryStatus;
  replyNote?: string;
  submittedBy: string;
  createdAt: string; // ISO string — fixed literals so fixtures are stable across runs
}

export const SEEDED_ENQUIRIES: Enquiry[] = [
  {
    id: 'e-1001',
    name: 'Val Visitor',
    email: 'visitor@example.com',
    address: '14 Oak Street, Springfield',
    category: 'Feedback',
    comment:
      'The new booking flow is much easier to use than before — thank you!',
    status: 'Resolved',
    replyNote:
      'Glad to hear it! Passed your kind words on to the product team.',
    submittedBy: 'u-visitor',
    createdAt: '2026-06-01T09:15:00.000Z',
  },
  {
    id: 'e-1002',
    name: 'Val Visitor',
    email: 'visitor@example.com',
    category: 'Question',
    comment: 'How do I update the email address on my account?',
    status: 'In Progress',
    submittedBy: 'u-visitor',
    createdAt: '2026-06-05T14:40:00.000Z',
  },
  {
    id: 'e-1003',
    name: 'Priya Nair',
    email: 'priya.nair@example.com',
    address: '221B Baker Street, London',
    category: 'General Enquiry',
    comment:
      'Do you offer group discounts for bookings of more than ten people?',
    status: 'New',
    submittedBy: 'u-agent',
    createdAt: '2026-06-10T11:05:00.000Z',
  },
  {
    id: 'e-1004',
    name: 'Marcus Lee',
    email: 'marcus.lee@example.com',
    category: 'Feedback',
    comment:
      'The confirmation email took a while to arrive, but everything else was smooth.',
    status: 'New',
    submittedBy: 'u-admin',
    createdAt: '2026-06-12T16:20:00.000Z',
  },
  {
    id: 'e-1005',
    name: 'Priya Nair',
    email: 'priya.nair@example.com',
    category: 'Question',
    comment: 'Is there a mobile app, or is the service web-only for now?',
    status: 'Resolved',
    replyNote:
      'It is web-only today; a mobile app is on the roadmap for later this year.',
    submittedBy: 'u-agent',
    createdAt: '2026-06-15T08:50:00.000Z',
  },
  {
    id: 'e-1006',
    name: 'Val Visitor',
    email: 'visitor@example.com',
    address: '14 Oak Street, Springfield',
    category: 'General Enquiry',
    comment: 'Could you clarify your cancellation policy for weekend bookings?',
    status: 'In Progress',
    submittedBy: 'u-visitor',
    createdAt: '2026-06-18T13:30:00.000Z',
  },
];
