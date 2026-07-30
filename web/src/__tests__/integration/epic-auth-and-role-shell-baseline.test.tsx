/**
 * Per-epic baseline — auth-and-role-shell.
 *
 * Holds the cross-story invariants of the shared shell surface this epic
 * introduces: the client-side SessionProvider is the single source of session +
 * active-role truth that Stories 2–4 (contact form, inbox, role switcher) all
 * consume. The invariants proven here — a signed-in user carries an active role,
 * the role switcher overrides that active role WITHOUT a fresh sign-in, and
 * signing out clears the session entirely — are what every downstream page's
 * landing redirect and action-gating depend on, so they are asserted once here
 * rather than duplicated in each story's file. Later stories extend this file
 * with genuinely new shared invariants (e.g. shared-nav chrome) rather than
 * re-asserting these.
 *
 * Accessibility is intentionally NOT scanned here: per testing-policy.md the
 * epic's a11y baseline is a real-browser @axe-core/playwright scan in the
 * shared-surface story's Playwright spec, never vitest-axe in jsdom.
 *
 * Auth is mock-only and fully client-side (no API client, no MSW): the tests
 * drive the REAL SessionProvider and read its seeded credentials from the users
 * fixture. RED until SessionContext + the users fixture are implemented.
 */
import { useState } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
// Production imports — will fail to resolve until implemented (TDD red).
import { SessionProvider, useSession } from '@/contexts/SessionContext';
import { SEEDED_USERS } from '@/lib/fixtures/users';
import type { User } from '@/lib/fixtures/users';

// Seeded accounts, read from the fixture (never hand-authored inline).
const agent = SEEDED_USERS.find((u: User) => u.role === 'Support Agent')!;

/**
 * A thin consumer of the REAL useSession hook — not a placeholder for the code
 * under test, but the standard way to exercise a context provider's public
 * contract through user-observable output. Every value it renders is state the
 * shell surfaces to the user (who you are signed in as, which role is active).
 */
function SessionProbe() {
  const { user, activeRole, signIn, signOut, setActiveRole } = useSession();
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      <p>Signed in as: {user ? user.email : 'nobody'}</p>
      <p>Active role: {activeRole ?? 'nobody'}</p>
      {error && <p role="alert">{error}</p>}

      <button
        type="button"
        onClick={() => {
          const result = signIn(agent.email, agent.password);
          if (!result.ok) setError(result.error ?? 'Sign-in failed');
        }}
      >
        sign in as agent
      </button>
      <button type="button" onClick={() => setActiveRole('Admin')}>
        switch active role to admin
      </button>
      <button type="button" onClick={signOut}>
        sign out
      </button>
    </div>
  );
}

function renderProbe() {
  return render(
    <SessionProvider>
      <SessionProbe />
    </SessionProvider>,
  );
}

describe('auth-and-role-shell baseline: shared session + active-role contract', () => {
  // R1, R2 — a valid sign-in establishes the session and the active role that
  // downstream landing/redirect logic keys off.
  it('a valid seeded sign-in establishes the session with a matching active role', async () => {
    const user = userEvent.setup();
    renderProbe();

    // Starts signed out.
    expect(screen.getByText(/signed in as: nobody/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /sign in as agent/i }));

    await waitFor(() => {
      expect(
        screen.getByText(new RegExp(`signed in as: ${agent.email}`, 'i')),
      ).toBeInTheDocument();
    });
    // Active role defaults to the signed-in user's role.
    expect(screen.getByText(/active role: support agent/i)).toBeInTheDocument();
  });

  // BR3 — the role switcher changes the active role WITHOUT a fresh sign-in and
  // WITHOUT changing who is signed in (a QA/demo override, not a re-authentication).
  it('the role switcher overrides the active role without re-authenticating', async () => {
    const user = userEvent.setup();
    renderProbe();

    await user.click(screen.getByRole('button', { name: /sign in as agent/i }));
    await waitFor(() => {
      expect(
        screen.getByText(/active role: support agent/i),
      ).toBeInTheDocument();
    });

    await user.click(
      screen.getByRole('button', { name: /switch active role to admin/i }),
    );

    await waitFor(() => {
      expect(screen.getByText(/active role: admin/i)).toBeInTheDocument();
    });
    // Same user is still signed in — only the active role changed.
    expect(
      screen.getByText(new RegExp(`signed in as: ${agent.email}`, 'i')),
    ).toBeInTheDocument();
  });

  // BR6 — signing out clears the session entirely (both the user and the active
  // role), so protected surfaces have no lingering identity to render against.
  it('signing out clears both the signed-in user and the active role', async () => {
    const user = userEvent.setup();
    renderProbe();

    await user.click(screen.getByRole('button', { name: /sign in as agent/i }));
    await waitFor(() => {
      expect(
        screen.getByText(new RegExp(`signed in as: ${agent.email}`, 'i')),
      ).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /sign out/i }));

    await waitFor(() => {
      expect(screen.getByText(/signed in as: nobody/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/active role: nobody/i)).toBeInTheDocument();
  });
});
