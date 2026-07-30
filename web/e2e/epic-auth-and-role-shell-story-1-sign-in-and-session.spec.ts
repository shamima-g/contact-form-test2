/**
 * Story Metadata:
 * - Route: /sign-in
 * - Target File: web/src/app/sign-in/page.tsx
 * - Page Action: create_new
 *
 * Mocking strategy:
 * - This project is mock-only and FULLY CLIENT-SIDE — there is no backend, no API
 *   client call, and no MSW. Auth is simulated in the browser: the sign-in form
 *   validates the entered credentials against in-memory seeded-user fixtures
 *   (web/src/lib/fixtures/) and establishes a client-side SessionProvider. There is
 *   therefore nothing to intercept with page.route() — the spec drives the REAL UI
 *   end to end (fill the form, submit, assert the resulting landing route).
 * - Implementation pattern this assumes:
 *   - Signing in with a seeded email/password pair establishes the client-side
 *     session and redirects to the role's landing route (Visitor -> /contact,
 *     Support Agent / Admin -> /inbox).
 *   - Session is client-side only; a fresh browser context starts signed out, so
 *     each seeded account is exercised in its own isolated context below.
 * - If the implementation diverges from these assumptions, this spec will not pass.
 *
 * E2E spec for Epic "auth-and-role-shell", Story 1: Sign-in and role-based landing.
 * playwright.config.ts's webServer block boots the FRONTEND dev server only; this
 * app has no backend, so no live backend is contacted. The seeded credentials below
 * are the app's built-in DEMO fixtures (plain values baked into the source for
 * simulated auth) — they are not real accounts or real secrets.
 * These tests WILL FAIL until implemented (TDD red).
 */
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// The three seeded demo accounts the client-side auth validates against, mirroring
// the fixtures the app ships (project.md §Data Source, brief §R1). Not real secrets.
const seededAccounts = [
  {
    role: 'Visitor',
    email: 'visitor@example.com',
    password: 'Test123',
    landing: /\/contact$/,
  },
  {
    role: 'Support Agent',
    email: 'agent@example.com',
    password: 'Test123',
    landing: /\/inbox$/,
  },
  {
    role: 'Admin',
    email: 'admin@example.com',
    password: 'Test123',
    landing: /\/inbox$/,
  },
] as const;

test.describe('Epic auth-and-role-shell, Story 1: Sign-in and role-based landing', () => {
  // AC-1: Signing in as the seeded Visitor lands on the contact screen; as Support
  // Agent or Admin lands on the inbox. Each account runs in its own fresh browser
  // context so the client-side session never leaks between roles.
  test('each seeded account lands on its role-appropriate screen after sign-in', async ({
    browser,
  }) => {
    for (const account of seededAccounts) {
      const context = await browser.newContext();
      const page = await context.newPage();

      await page.goto('/sign-in');
      await expect(
        page.getByRole('heading', { name: /sign in/i }),
      ).toBeVisible();

      await page.getByLabel(/email/i).fill(account.email);
      await page.getByLabel(/password/i).fill(account.password);
      await page.getByRole('button', { name: /sign in/i }).click();

      await expect(
        page,
        `${account.role} should land on its role screen`,
      ).toHaveURL(account.landing);

      await context.close();
    }
  });

  // Accessibility — real-browser axe scan of the sign-in surface this epic introduces,
  // scoped to the WCAG 2.1 AA tags that match NFR-base-1. Scanned after the form has
  // settled. (Axe's defaults also run best-practice rules that fail outside the agreed
  // bar — scope them out.) Covers the contrast / layout / focus-order jsdom can't see.
  test('the sign-in page has no accessibility violations', async ({ page }) => {
    await page.goto('/sign-in');
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();

    const { violations } = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(violations).toEqual([]);
  });
});
