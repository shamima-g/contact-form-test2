/**
 * Story Metadata:
 * - Route: /sign-in
 * - Target File: web/src/app/sign-in/page.tsx
 * - Page Action: create_new
 *
 * Epic: auth-and-role-shell, Story 1 — Sign-in and simulated session.
 *
 * Covers the two vitest-tagged acceptance criteria for the sign-in screen:
 * - AC-2: wrong credentials show an inline error and keep the user on /sign-in
 * - AC-3: the screen offers ONLY sign-in (no sign-up / password-reset) and is
 *         honest that this is demo / prototype auth
 * (AC-1 — the role-based landing redirect — is playwright-tagged and lives in the
 *  matching e2e spec; it is not re-asserted here.)
 *
 * Auth is mock-only and fully client-side: the real SessionProvider validates the
 * typed credentials against the seeded-users fixture in-memory. There is NO API
 * client and NO MSW in this flow, so nothing is mocked except Next's navigation
 * hooks (which have no App Router context under jsdom). These tests are RED until
 * the sign-in page, SessionContext, and users fixture are implemented.
 */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
// Production imports — will fail to resolve until implemented (TDD red).
import SignInPage from '@/app/sign-in/page';
import { SessionProvider } from '@/contexts/SessionContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { SEEDED_USERS } from '@/lib/fixtures/users';

// Next.js navigation has no App Router context under jsdom — stub the hooks the
// page uses. The push spy is unused by these failure-path assertions (they assert
// user-observable UI, not call counts); it exists only so useRouter() resolves.
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
  usePathname: () => '/sign-in',
  useSearchParams: () => new URLSearchParams(),
}));

function renderSignIn() {
  return render(
    <ToastProvider>
      <SessionProvider>
        <SignInPage />
      </SessionProvider>
    </ToastProvider>,
  );
}

describe('Epic auth-and-role-shell, Story 1: Sign-in screen', () => {
  beforeEach(() => vi.clearAllMocks());

  // AC-2
  it('shows an inline error and stays on the sign-in screen for wrong credentials', async () => {
    const user = userEvent.setup();
    // A real seeded email with the wrong password — must still be rejected.
    const seeded = SEEDED_USERS[0];
    renderSignIn();

    await user.type(screen.getByLabelText(/email/i), seeded.email);
    await user.type(screen.getByLabelText(/password/i), 'wrong-password');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    // Inline error surfaces...
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
    // ...and the user is still on the sign-in screen (no navigation away).
    expect(
      screen.getByRole('heading', { name: /sign in/i }),
    ).toBeInTheDocument();
  });

  // AC-3
  it('offers only sign-in — no sign-up or password-reset — and is honest about demo auth', () => {
    renderSignIn();

    // The one real action is present.
    expect(
      screen.getByRole('button', { name: /sign in/i }),
    ).toBeInTheDocument();

    // No account-management affordances.
    expect(
      screen.queryByRole('link', { name: /sign ?up|create account|register/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: /forgot|reset password/i }),
    ).not.toBeInTheDocument();

    // Honest that this is a demo / prototype auth layer, not production security.
    expect(screen.getByText(/demo|prototype/i)).toBeInTheDocument();
  });
});
