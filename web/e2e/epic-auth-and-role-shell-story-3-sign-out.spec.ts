/**
 * Story Metadata:
 * - Route: /inbox
 * - Target File: web/src/components/layout/AppHeader.tsx
 * - Page Action: create_new
 *
 * Mocking strategy:
 * - Backend calls: NONE. This project is mock-only and fully client-side (project.md
 *   §Data Source & Backend Integration): there is no backend, no API client for auth,
 *   and no MSW. Auth is simulated client-side — the sign-in form validates against the
 *   in-memory seeded-users fixture (web/src/lib/fixtures/) and the session lives in the
 *   client-side SessionProvider (Story 1). There is therefore nothing to intercept with
 *   page.route() or MSW; the spec drives the real UI and asserts observable navigation.
 * - Implementation pattern this assumes:
 *   - Signing in as the seeded Support Agent lands on the protected /inbox route.
 *   - The AppHeader renders a "Sign Out" control only while a session exists; clicking it
 *     clears the client-side session entirely and returns the user to /sign-in (R6).
 *   - Every protected route re-checks the client session on entry — so a restore from
 *     history/bfcache (browser Back) or a fresh navigation to a previously-visited
 *     protected URL after sign-out redirects to /sign-in and shows NO stale protected
 *     content (BR6). An in-app redirect alone is not enough; the guard must run on the
 *     restored page, not just on the first render.
 * - If the implementation diverges from these assumptions, this spec will not pass.
 *
 * E2E spec for Epic "Sign-in and role-based app shell", Story 3: Sign out.
 * playwright.config.ts's webServer block boots the FRONTEND dev server only; the app is
 * entirely client-side, so no backend is contacted and no real credentials are used.
 * These tests WILL FAIL until implemented (TDD red).
 */
import { test, expect } from '@playwright/test';

import type { Page } from '@playwright/test';

// Seeded demo identity for form-fill only. Auth is simulated client-side against an
// in-memory fixture — this is NOT a real account and NOT a real credential store
// (project.md §Authentication). The Support Agent lands on the protected /inbox.
const agentUser = { email: 'agent@example.com', password: 'Test123' } as const;

/** Sign in through the real /sign-in form and wait until the protected landing renders. */
async function signInAsAgent(page: Page): Promise<void> {
  await page.goto('/sign-in');
  await page.getByLabel('Email').fill(agentUser.email);
  await page.getByLabel('Password').fill(agentUser.password);
  await page.getByRole('button', { name: /sign in/i }).click();
  await expect(page).toHaveURL(/\/inbox$/);
  // The authenticated shell header (with its Sign Out control) is present once signed in.
  await expect(page.getByRole('button', { name: /sign out/i })).toBeVisible();
}

test.describe('Epic auth-and-role-shell, Story 3: Sign out', () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
  });

  // AC-1
  test('clicking Sign Out returns the user to the sign-in screen', async ({
    page,
  }) => {
    await signInAsAgent(page);

    await page.getByRole('button', { name: /sign out/i }).click();

    await expect(page).toHaveURL(/\/sign-in$/);
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
    // The authenticated shell is gone — no Sign Out control remains.
    await expect(page.getByRole('button', { name: /sign out/i })).toBeHidden();
  });

  // AC-2
  test('after sign out, browser Back does not reveal the previously-viewed protected page', async ({
    page,
  }) => {
    await signInAsAgent(page); // now on /inbox, in browser history
    await page.getByRole('button', { name: /sign out/i }).click();
    await expect(page).toHaveURL(/\/sign-in$/);

    // Browser Back would restore /inbox from history/bfcache; the route guard must
    // re-check the cleared session and send the user to sign-in instead.
    await page.goBack();

    await expect(page).toHaveURL(/\/sign-in$/);
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
    // No stale protected content leaked back in: the shell's Sign Out control is absent.
    await expect(page.getByRole('button', { name: /sign out/i })).toBeHidden();
  });

  // AC-3
  test('after sign out, re-opening a previously visited protected URL redirects to sign-in with no stale content', async ({
    page,
  }) => {
    await signInAsAgent(page); // establishes /inbox as a previously visited protected URL
    await page.getByRole('button', { name: /sign out/i }).click();
    await expect(page).toHaveURL(/\/sign-in$/);

    // Directly re-request the protected URL after sign-out.
    await page.goto('/inbox');

    await expect(page).toHaveURL(/\/sign-in$/);
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /sign out/i })).toBeHidden();
  });
});
