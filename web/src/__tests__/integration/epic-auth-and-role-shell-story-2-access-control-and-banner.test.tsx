/**
 * Story Metadata:
 * - Route: /inbox
 * - Target File: web/src/app/(protected)/layout.tsx
 * - Page Action: modify_existing
 *
 * Tests for Epic "auth-and-role-shell", Story 2: role-based access control.
 *
 * Scope (AC-4, vitest): the RBAC action-hiding primitive the protected shell
 * introduces — controls a role may not use are absent from the DOM (not merely
 * hidden), per role. AC-1/AC-2/AC-3 (unauthenticated redirect + permission-denied
 * banner) are browser/redirect behaviours and are covered in the Playwright spec.
 *
 * The `<Can>` gate reads the active role from the simulated SessionProvider
 * (Story 1's single source of session truth) and renders its children only when
 * that role is permitted the action. Downstream epics wrap their triage/delete
 * controls in this gate; here we exercise the gate directly against each role.
 *
 * These tests WILL FAIL until implemented (TDD red).
 */
import { useEffect } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
// Real production code — imports fail until Story 1/Story 2 implement them (TDD red).
import { Can } from '@/components/rbac/Can';
import { SessionProvider, useSession } from '@/contexts/SessionContext';
import type { Role } from '@/lib/fixtures/users';

// SessionProvider touches the Next.js router (redirect-on-sign-in); mock the
// navigation surface so the provider mounts in jsdom. Never mock the code under test.
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
  usePathname: () => '/inbox',
  useSearchParams: () => new URLSearchParams(),
}));

// Test helper: seed the active role on the simulated session (the sanctioned way
// to place the shell in a given role without driving the full sign-in UI).
function SeedRole({ role }: { role: Role }) {
  const { setActiveRole } = useSession();
  useEffect(() => {
    setActiveRole(role);
  }, [role, setActiveRole]);
  return null;
}

function renderAsRole(role: Role) {
  return render(
    <SessionProvider>
      <SeedRole role={role} />
      <Can action="triage">
        <button type="button">Triage enquiry</button>
      </Can>
      <Can action="delete">
        <button type="button">Delete enquiry</button>
      </Can>
    </SessionProvider>,
  );
}

describe('RBAC action-hiding (protected shell)', () => {
  beforeEach(() => vi.clearAllMocks());

  // AC-4
  // Runtime-only note: "no flash during client render" (NFR-1) is verified in the
  // browser; the jsdom-observable contract asserted here is that forbidden controls
  // are absent from the DOM entirely (queryBy* → not in document), never merely hidden.
  it('renders only the controls the active role is permitted to use', async () => {
    // Visitor: cannot triage, cannot delete.
    const visitor = renderAsRole('Visitor');
    await waitFor(() => {
      expect(
        screen.queryByRole('button', { name: /triage enquiry/i }),
      ).not.toBeInTheDocument();
    });
    expect(
      screen.queryByRole('button', { name: /delete enquiry/i }),
    ).not.toBeInTheDocument();
    visitor.unmount();

    // Support Agent: may triage, but delete is Admin-only.
    const agent = renderAsRole('Support Agent');
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /triage enquiry/i }),
      ).toBeInTheDocument();
    });
    expect(
      screen.queryByRole('button', { name: /delete enquiry/i }),
    ).not.toBeInTheDocument();
    agent.unmount();

    // Admin: may triage and delete.
    const admin = renderAsRole('Admin');
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /delete enquiry/i }),
      ).toBeInTheDocument();
    });
    expect(
      screen.getByRole('button', { name: /triage enquiry/i }),
    ).toBeInTheDocument();
    admin.unmount();
  });
});
