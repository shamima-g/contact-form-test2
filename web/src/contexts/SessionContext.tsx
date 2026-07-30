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
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import { SEEDED_USERS, type Role, type User } from '@/lib/fixtures/users';

export interface SessionValue {
  user: User | null;
  activeRole: Role | null;
  /**
   * Whether the client-side session has been rehydrated from storage yet. It is
   * `false` during server render and the very first client render, then `true`
   * once the effect below has restored (or confirmed the absence of) a session.
   * Route guards wait for this so they neither flash protected content nor redirect
   * a signed-in user before their persisted session has loaded.
   */
  hydrated: boolean;
  signIn(email: string, password: string): { ok: boolean; error?: string };
  signOut(): void;
  setActiveRole(role: Role): void;
}

const SessionContext = createContext<SessionValue | undefined>(undefined);

const INVALID_CREDENTIALS_MESSAGE =
  'That email and password don’t match a demo account. Try one of the seeded accounts.';

/**
 * Session persistence key. Auth remains simulated and client-side (no backend); we
 * persist only which seeded user is signed in plus the active role, scoped to the
 * tab via sessionStorage — enough to survive a full-page navigation (e.g. pasting a
 * protected URL) without persisting across a browser restart (out of scope by
 * design; see brief §Out of Scope). Signing out clears it entirely.
 */
const SESSION_STORAGE_KEY = 'contact-enquiry:session:v1';

interface PersistedSession {
  userId: string | null;
  activeRole: Role | null;
}

/**
 * The persisted session is an external, client-only mutable store (tab-scoped
 * sessionStorage). We expose it to React via `useSyncExternalStore` rather than a
 * post-mount effect: that renders the server snapshot (signed-out) during SSR and
 * the hydration pass, then swaps to the client snapshot on a follow-up render —
 * restoring the session with no hydration mismatch, no flash of protected content,
 * and without ever calling setState inside an effect (react-hooks/set-state-in-effect).
 */
const sessionListeners = new Set<() => void>();

function emitSessionChange(): void {
  for (const listener of sessionListeners) listener();
}

// Cache the parsed snapshot so `getSessionSnapshot` returns a referentially stable
// object while the underlying storage string is unchanged — `useSyncExternalStore`
// re-invokes the getter every render and loops forever if the reference churns.
let cachedRaw: string | null = null;
let cachedSnapshot: PersistedSession | null = null;

function getSessionSnapshot(): PersistedSession | null {
  if (typeof window === 'undefined') return null;
  let raw: string | null = null;
  try {
    raw = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
  } catch {
    // Storage blocked (private mode) — treat as signed out.
    raw = null;
  }
  if (raw === cachedRaw) return cachedSnapshot;
  cachedRaw = raw;
  try {
    cachedSnapshot = raw ? (JSON.parse(raw) as PersistedSession) : null;
  } catch {
    // Corrupt storage — treat as signed out rather than crashing.
    cachedSnapshot = null;
  }
  return cachedSnapshot;
}

// Server (and first hydration) snapshot: no session, matching the storage-free
// server render.
function getServerSessionSnapshot(): PersistedSession | null {
  return null;
}

function subscribeSession(listener: () => void): () => void {
  sessionListeners.add(listener);
  // Cross-tab writes fire a `storage` event; same-tab writes are broadcast via
  // `emitSessionChange`. (Signing out in a second tab is out of scope, but keeping
  // the listeners in sync is cheap and correct.)
  const onStorage = (event: StorageEvent) => {
    if (event.key === SESSION_STORAGE_KEY || event.key === null) listener();
  };
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', onStorage);
  }
  return () => {
    sessionListeners.delete(listener);
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', onStorage);
    }
  };
}

function writePersistedSession(session: PersistedSession | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (session === null) {
      window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
    } else {
      window.sessionStorage.setItem(
        SESSION_STORAGE_KEY,
        JSON.stringify(session),
      );
    }
  } catch {
    // Storage unavailable (private mode, quota) — session simply won't persist.
  }
  emitSessionChange();
}

// Client-only "has the client taken over from SSR yet" signal, expressed as an
// external store so it produces no hydration mismatch: server/first-render `false`,
// client `true`. Route guards wait on this before redirecting a signed-out visitor.
const noopSubscribe = (): (() => void) => () => {};
const getHydratedSnapshot = (): boolean => true;
const getHydratedServerSnapshot = (): boolean => false;

export function SessionProvider({ children }: { children: ReactNode }) {
  // Session is derived from the external store: the server snapshot is signed-out,
  // so the first (hydration) render matches the storage-free server output; the
  // client snapshot then restores the persisted session on the following render.
  const persisted = useSyncExternalStore(
    subscribeSession,
    getSessionSnapshot,
    getServerSessionSnapshot,
  );
  const hydrated = useSyncExternalStore(
    noopSubscribe,
    getHydratedSnapshot,
    getHydratedServerSnapshot,
  );

  const user = persisted?.userId
    ? (SEEDED_USERS.find((candidate) => candidate.id === persisted.userId) ??
      null)
    : null;
  const activeRole = persisted?.activeRole ?? user?.role ?? null;

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

      writePersistedSession({ userId: match.id, activeRole: match.role });
      return { ok: true };
    },
    [],
  );

  const signOut = useCallback(() => {
    writePersistedSession(null);
  }, []);

  const setActiveRole = useCallback((role: Role) => {
    // QA/demo override: change the active role without touching who is signed in
    // and without re-authenticating. Read the current signed-in user straight from
    // the store so this stays a stable, dependency-free callback.
    const current = getSessionSnapshot();
    writePersistedSession({
      userId: current?.userId ?? null,
      activeRole: role,
    });
  }, []);

  const value = useMemo<SessionValue>(
    () => ({ user, activeRole, hydrated, signIn, signOut, setActiveRole }),
    [user, activeRole, hydrated, signIn, signOut, setActiveRole],
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
