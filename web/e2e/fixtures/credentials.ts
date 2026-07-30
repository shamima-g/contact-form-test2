/**
 * Seeded demo accounts for driving the /sign-in form in Playwright specs.
 *
 * These are NOT real credentials: this project's auth is simulated entirely
 * client-side against an in-memory fixture (project.md §Authentication) — there is
 * no backend, no real credential store, and these exact values are documented
 * openly in project.md / the epic brief as demo seed data. The client-side sign-in
 * validates against these, so specs must fill the real seeded values for sign-in to
 * succeed (there is no page.route() shortcut — nothing to intercept).
 */
export interface SeededAccount {
  email: string;
  password: string;
  role: 'Visitor' | 'Support Agent' | 'Admin';
}

export const visitorUser: SeededAccount = {
  email: 'visitor@example.com',
  password: 'Test123',
  role: 'Visitor',
};

export const agentUser: SeededAccount = {
  email: 'agent@example.com',
  password: 'Test123',
  role: 'Support Agent',
};

export const adminUser: SeededAccount = {
  email: 'admin@example.com',
  password: 'Test123',
  role: 'Admin',
};
