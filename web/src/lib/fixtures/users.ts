/**
 * Seeded users fixture — simulated, client-side auth.
 *
 * This project has no backend: the three demo accounts below are the only users
 * that exist, and the "password" is a plain fixture value compared in-memory by
 * the SessionProvider. This is intentionally NOT production-grade security
 * (see project.md §Authentication) — it exists so the app can be demoed and
 * tested against real-shaped role behaviour without an auth server.
 */

export type Role = 'Visitor' | 'Support Agent' | 'Admin';

export interface User {
  id: string;
  email: string;
  password: string;
  role: Role;
  name: string;
}

export const SEEDED_USERS: User[] = [
  {
    id: 'u-visitor',
    email: 'visitor@example.com',
    password: 'Test123',
    role: 'Visitor',
    name: 'Val Visitor',
  },
  {
    id: 'u-agent',
    email: 'agent@example.com',
    password: 'Test123',
    role: 'Support Agent',
    name: 'Sam Agent',
  },
  {
    id: 'u-admin',
    email: 'admin@example.com',
    password: 'Test123',
    role: 'Admin',
    name: 'Andy Admin',
  },
];

/**
 * The route a signed-in user lands on for a given role: Visitors go to the
 * public contact form; Support Agents and Admins go to the triage inbox.
 */
export function landingRouteForRole(role: Role): string {
  return role === 'Visitor' ? '/contact' : '/inbox';
}
