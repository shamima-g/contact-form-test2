/**
 * Story Metadata:
 * - Route: /inbox
 * - Target File: web/src/components/layout/AppHeader.tsx
 * - Page Action: create_new
 *
 * Component-level sign-out wiring for Epic "auth-and-role-shell", Story 3.
 *
 * The story's three ACs (return to /sign-in, browser-Back gating, re-opening a
 * protected URL) are all browser/navigation behaviour and are covered by the
 * Playwright spec — this file does NOT duplicate that flow. It pins only the
 * jsdom-observable unit that underpins sign-out: the AppHeader exposes a Sign Out
 * control while a user is signed in, and activating it clears the simulated
 * session (R6). Session-clearing is asserted through the real SessionProvider /
 * useSession — no API client, no MSW, fully client-side.
 *
 * These tests WILL FAIL until implemented (TDD red).
 */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
// Real production modules — imports fail until implemented (TDD red).
import { SessionProvider, useSession } from '@/contexts/SessionContext';
import { AppHeader } from '@/components/layout/AppHeader';
import { SEEDED_USERS } from '@/lib/fixtures/users';

// Any seeded account can be signed in and then out; sign-out wiring is
// role-agnostic, so use the first seeded user rather than pinning a role.
const seededUser = SEEDED_USERS[0];

// Test harness only (never a placeholder for the code under test): it drives the
// REAL session through useSession so the header can be exercised in a signed-in
// state, and surfaces the current session as observable text so "session cleared"
// is assertable without inspecting internals or mock call counts.
function SessionProbe() {
  const { user } = useSession();
  return <p>{user ? `Session: ${user.email}` : 'Session: none'}</p>;
}

function Harness() {
  const { signIn } = useSession();
  return (
    <>
      <button
        type="button"
        onClick={() => signIn(seededUser.email, seededUser.password)}
      >
        harness sign in
      </button>
      <AppHeader />
      <SessionProbe />
    </>
  );
}

function renderHarness() {
  return render(
    <SessionProvider>
      <Harness />
    </SessionProvider>,
  );
}

describe('AppHeader sign-out wiring', () => {
  // R6 — the Sign Out control belongs to the signed-in shell only.
  it('shows a Sign Out control only once a user is signed in', async () => {
    const user = userEvent.setup();
    renderHarness();

    // Signed out: no session, no Sign Out control.
    expect(screen.getByText('Session: none')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /sign out/i }),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /harness sign in/i }));

    await waitFor(() => {
      expect(
        screen.getByText(`Session: ${seededUser.email}`),
      ).toBeInTheDocument();
    });
    expect(
      screen.getByRole('button', { name: /sign out/i }),
    ).toBeInTheDocument();
  });

  // R6 — activating Sign Out clears the simulated session entirely.
  it('clears the session when Sign Out is activated', async () => {
    const user = userEvent.setup();
    renderHarness();

    await user.click(screen.getByRole('button', { name: /harness sign in/i }));
    const signOut = await screen.findByRole('button', { name: /sign out/i });

    await user.click(signOut);

    await waitFor(() => {
      expect(screen.getByText('Session: none')).toBeInTheDocument();
    });
    expect(
      screen.queryByRole('button', { name: /sign out/i }),
    ).not.toBeInTheDocument();
  });
});
