'use client';

/**
 * SessionContext — the single source of session + active-role truth for the app.
 *
 * Auth is simulated entirely client-side (project.md §Authentication): there is no
 * backend, no token server, and no persistence. `signIn` compares the entered
 * credentials against the in-memory seeded-users fixture and, on a match, holds the
 * signed-in user and the active role in React state. Stories 2–4 (access control,
 * sign-out, role switcher) all consume this context rather than re-deriving session.
 */

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { SEEDED_USERS, type Role, type User } from '@/lib/fixtures/users';

export interface SessionValue {
  user: User | null;
  activeRole: Role | null;
  signIn(email: string, password: string): { ok: boolean; error?: string };
  signOut(): void;
  setActiveRole(role: Role): void;
}

const SessionContext = createContext<SessionValue | undefined>(undefined);

const INVALID_CREDENTIALS_MESSAGE =
  'That email and password don’t match a demo account. Try one of the seeded accounts.';

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [activeRole, setActiveRoleState] = useState<Role | null>(null);

  const signIn = useCallback(
    (email: string, password: string): { ok: boolean; error?: string } => {
      const match = SEEDED_USERS.find(
        (candidate) =>
          candidate.email.toLowerCase() === email.trim().toLowerCase() &&
          candidate.password === password,
      );

      if (!match) {
        // Leave the session untouched on a failed attempt.
        return { ok: false, error: INVALID_CREDENTIALS_MESSAGE };
      }

      setUser(match);
      setActiveRoleState(match.role);
      return { ok: true };
    },
    [],
  );

  const signOut = useCallback(() => {
    setUser(null);
    setActiveRoleState(null);
  }, []);

  const setActiveRole = useCallback((role: Role) => {
    // QA/demo override: change the active role without touching who is signed in
    // and without re-authenticating.
    setActiveRoleState(role);
  }, []);

  const value = useMemo<SessionValue>(
    () => ({ user, activeRole, signIn, signOut, setActiveRole }),
    [user, activeRole, signIn, signOut, setActiveRole],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession(): SessionValue {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}
