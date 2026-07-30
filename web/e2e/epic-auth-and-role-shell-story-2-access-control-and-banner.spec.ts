/**
 * Story Metadata:
 * - Route: /inbox
 * - Target File: web/src/app/(protected)/layout.tsx
 * - Page Action: modify_existing
 *
 * Mocking strategy:
 * - There is NO backend to mock. This project's auth is simulated entirely
 *   client-side against an in-memory fixture (project.md §Authentication:
 *   mock-only, fully client-side, no API client, no MSW). No `page.route()` and no
 *   MSW interception is used or needed — there is nothing to intercept.
 * - Sign-in is performed by driving the REAL /sign-in form (fill email + password,
 *   submit) with the seeded demo accounts from ./fixtures/credentials. The
 *   client-side auth validates against those seeded values, so the form must be
 *   filled with the real seeded credentials for sign-in to succeed.
 * - Implementation pattern this spec assumes:
 *   - Route guarding runs on the client: an unauthenticated request to '/' or to
 *     any protected route (e.g. /inbox) redirects to /sign-in — the app root is a
 *     guarded redirect, not a public welcome/landing page.
 *   - An authenticated Visitor opening /inbox stays on a rendered app shell and
 *     sees a plain-language permission-denied banner (Shadcn `alert`, role="alert")
 *     naming the access required ("Support Agent or Admin") — NOT a 404/500 page
 *     and NOT a redirect away from /inbox.
 *   - The client-side session established by the /sign-in form persists within the
 *     browser context across a subsequent page.goto (e.g. localStorage/session).
 * - If the implementation diverges from these assumptions, this spec will not pass.
 *
 * E2E spec for Epic "auth-and-role-shell", Story 2: Role-based access control and
 * the permission-denied banner. Covers the playwright-tagged ACs (AC-1, AC-2, AC-3).
 * playwright.config.ts's webServer boots the FRONTEND only; the whole app is
 * client-side with no backend, so no live backend is contacted and no real
 * credentials exist.
 * These tests WILL FAIL until implemented (TDD red).
 */
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
// Seeded demo accounts for form-fill only — auth is simulated client-side, so these
// are documented demo values, never real accounts (see ./fixtures/credentials).
import { visitorUser, type SeededAccount } from './fixtures/credentials';

import type { Page } from '@playwright/test';

/** Drive the real /sign-in form with a seeded account. */
async function signInAs(page: Page, account: SeededAccount): Promise<void> {
  await page.goto('/sign-in');
  await page.getByLabel(/email/i).fill(account.email);
  await page.getByLabel(/password/i).fill(account.password);
  await page.getByRole('button', { name: /sign in/i }).click();
}

test.describe('Epic auth-and-role-shell, Story 2: Access control and permission-denied banner', () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
  });

  // AC-1
  test('signed out, visiting the app root redirects to the sign-in screen', async ({
    page,
  }) => {
    await page.goto('/');

    await expect(page).toHaveURL(/\/sign-in/);
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
    // Not a welcome/landing page: the sign-in form is what renders at the front door.
    await expect(page.getByLabel(/password/i)).toBeVisible();
  });

  // AC-2
  test('signed out, opening a protected route by URL redirects to the sign-in screen', async ({
    page,
  }) => {
    await page.goto('/inbox');

    await expect(page).toHaveURL(/\/sign-in/);
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
    // The protected inbox content is not exposed to an unauthenticated visitor.
    await expect(page.getByRole('heading', { name: /inbox/i })).toBeHidden();
  });

  // AC-3
  test('a signed-in Visitor opening /inbox sees a plain-language permission-denied banner, not an error page', async ({
    page,
  }) => {
    await signInAs(page, visitorUser);
    // Visitor lands on their own contact screen after sign-in.
    await expect(page).toHaveURL(/\/contact/);

    await page.goto('/inbox');

    // Stays on the requested route with a rendered app shell — not redirected to
    // sign-in and not a 404/500 error page.
    await expect(page).toHaveURL(/\/inbox/);

    const banner = page.getByRole('alert');
    await expect(banner).toBeVisible();
    // Names the access needed in plain language, per BR5.
    await expect(banner).toContainText(/support agent/i);
    await expect(banner).toContainText(/admin/i);
  });

  // Accessibility — real-browser axe scan of the NEW state this story introduces:
  // the Visitor-at-/inbox permission-denied banner. Scoped to WCAG 2.1 AA
  // (NFR-base-1); axe's best-practice defaults would fail on issues outside that bar.
  // Scanned only after the banner has settled.
  test('the permission-denied state has no accessibility violations', async ({
    page,
  }) => {
    await signInAs(page, visitorUser);
    await expect(page).toHaveURL(/\/contact/);
    await page.goto('/inbox');
    await expect(page.getByRole('alert')).toBeVisible();

    const { violations } = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(violations).toEqual([]);
  });
});
