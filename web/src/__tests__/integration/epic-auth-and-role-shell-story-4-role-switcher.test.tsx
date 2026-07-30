/**
 * Story Metadata:
 * - Route: /inbox
 * - Target File: web/src/components/qa/RoleSwitcher.tsx
 * - Page Action: create_new
 *
 * Tests for the QA/demo role switcher (Epic "auth-and-role-shell", Story 4).
 *
 * Scope: this project is mock-only and fully client-side — the session and the
 * role switcher are simulated in-memory (no API client, no MSW). So nothing is
 * mocked here except Next.js navigation (the switcher/session may call the
 * router when the active role changes; mocking it keeps render from crashing in
 * jsdom without touching the behaviour under test).
 *
 * Coverage: only AC-2 is vitest-tagged. AC-1 (switching re-evaluates the landing
 * screen and visible actions immediately) is a browser navigation flow and is
 * covered by the Playwright spec — it is intentionally NOT duplicated here.
 *
 * These tests WILL FAIL until RoleSwitcher / SessionProvider are implemented (TDD red).
 */
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
// Import REAL production code — these will fail to resolve until implemented (TDD red).
import { SessionProvider } from '@/contexts/SessionContext';
import { RoleSwitcher } from '@/components/qa/RoleSwitcher';

// Switching the active role may trigger a client-side route change; mock the
// navigation hooks so the component renders in jsdom without a router-mounted error.
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
  usePathname: () => '/inbox',
  useSearchParams: () => new URLSearchParams(),
}));

describe('RoleSwitcher (QA/demo)', () => {
  // AC-2
  it('is visibly marked as a QA/demo tool and offers all three roles', () => {
    render(
      <SessionProvider>
        <RoleSwitcher />
      </SessionProvider>,
    );

    // Distinct QA/demo marking so it isn't mistaken for a normal end-user setting.
    expect(screen.getByText(/\bqa\b|\bdemo\b/i)).toBeVisible();

    // Exposes all three roles to switch between (the demo affordance's whole point).
    expect(screen.getByRole('button', { name: /visitor/i })).toBeVisible();
    expect(
      screen.getByRole('button', { name: /support agent/i }),
    ).toBeVisible();
    expect(screen.getByRole('button', { name: /admin/i })).toBeVisible();
  });
});
