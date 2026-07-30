/**
 * Story Metadata:
 * - Route: /inbox
 * - Target File: web/src/components/qa/RoleSwitcher.tsx
 * - Page Action: create_new
 *
 * Mocking strategy:
 * - There is NO backend and NO API client for auth or data — this project is
 *   mock-only, fully client-side (see project.md §Authentication / §Data Source).
 *   Auth is BFF-shaped but simulated: sign-in validates against an in-memory user
 *   fixture, and enquiries come from an in-memory seed. So there is nothing to
 *   intercept — no page.route(), no MSW, no live backend. The spec drives the real
 *   UI end to end against the app's own client-side fixtures.
 * - Implementation pattern this assumes:
 *   - The role switcher is a QA/demo control in the shared shell header, exposed as
 *     three always-visible role buttons ("Visitor", "Support Agent", "Admin") beside
 *     a visible QA/demo marker. Clicking a role button overrides Session.activeRole
 *     in place — no page reload and no fresh sign-in (a route change to the new
 *     role's landing screen is acceptable, per BR3).
 *   - Sign-in lives at /sign-in and routes by active role: Visitor -> /contact,
 *     Support Agent / Admin -> /inbox.
 *   - The delete control is an Admin-only action rendered on the inbox (R3: no
 *     delete for a Visitor or Support Agent); it is the role-distinct action this
 *     spec uses to prove action visibility is re-evaluated on a role switch.
 * - If the implementation diverges from these assumptions, this spec will not pass.
 *
 * E2E spec for Epic "Sign-in and role-based app shell", Story 4: Role switcher (QA/demo).
 * playwright.config.ts's webServer block boots the FRONTEND dev server only; all auth
 * and data are client-side fixtures, so no live backend is contacted and no real
 * credentials are needed.
 * These tests WILL FAIL until implemented (TDD red).
 */
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
// Mock demo identities for form-fill — client-side simulated auth, never real accounts.
import { adminUser, type SeededAccount } from './fixtures/credentials';

import type { Page } from '@playwright/test';

/** Drive the real sign-in UI with a seeded demo account and land on the role's screen. */
async function signIn(page: Page, user: SeededAccount): Promise<void> {
  await page.goto('/sign-in');
  await page.getByLabel(/email/i).fill(user.email);
  await page.getByLabel(/password/i).fill(user.password);
  await page.getByRole('button', { name: /sign in/i }).click();
  await expect(page).not.toHaveURL(/\/sign-in/);
}

/** Change the active role via the shell's QA/demo role switcher (no re-sign-in). */
async function switchRole(
  page: Page,
  roleName: SeededAccount['role'],
): Promise<void> {
  // The switcher exposes one always-visible button per role in the shell header,
  // scoped to the QA/demo region so a role button never collides with a same-named
  // control elsewhere (e.g. the signed-in user's name).
  const switcher = page.getByRole('region', { name: /demo|qa/i });
  await switcher
    .getByRole('button', { name: new RegExp(roleName, 'i') })
    .click();
}

const deleteControls = (page: Page) =>
  page.getByRole('button', { name: /delete/i });

test.describe('Epic auth-and-role-shell, Story 4: Role switcher (QA/demo)', () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
  });

  // AC-1: switching the active role re-evaluates landing screen + visible actions
  // immediately, without a fresh sign-in.
  test('role switch re-evaluates landing screen and actions live, with no re-sign-in', async ({
    page,
  }) => {
    // Sign in once as Admin -> lands on the inbox with the Admin-only delete action.
    await signIn(page, adminUser);
    await expect(page).toHaveURL(/\/inbox/);
    await expect(deleteControls(page).first()).toBeVisible();

    // Switch to Visitor -> landing re-evaluates to the contact screen; triage/delete gone.
    await switchRole(page, 'Visitor');
    await expect(page).toHaveURL(/\/contact/);
    await expect(deleteControls(page)).toHaveCount(0);

    // Switch to Support Agent -> back to the inbox, but still no delete (agents can't delete).
    await switchRole(page, 'Support Agent');
    await expect(page).toHaveURL(/\/inbox/);
    await expect(deleteControls(page)).toHaveCount(0);

    // Switch to Admin -> delete controls reappear immediately.
    await switchRole(page, 'Admin');
    await expect(page).toHaveURL(/\/inbox/);
    await expect(deleteControls(page).first()).toBeVisible();

    // The whole flow never returned to the sign-in screen: no fresh sign-in was needed.
    await expect(page).not.toHaveURL(/\/sign-in/);
  });

  // Accessibility — real-browser axe scan of the signed-in shell with the QA/demo role
  // switcher present, scoped to the WCAG 2.1 AA tags that match NFR-base-1. Catches the
  // contrast / focus-order / labelling issues jsdom can't see for this new control.
  test('the signed-in shell with the role switcher has no accessibility violations', async ({
    page,
  }) => {
    await signIn(page, adminUser);
    await expect(page).toHaveURL(/\/inbox/);
    await expect(page.getByRole('region', { name: /demo|qa/i })).toBeVisible();

    const { violations } = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(violations).toEqual([]);
  });
});
