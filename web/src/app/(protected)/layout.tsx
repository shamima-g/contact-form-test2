/**
 * Authenticated route group shell.
 *
 * Placeholder passthrough for this story — it exists so the role-based landing
 * routes (/contact, /inbox) resolve to real pages. Story 2 replaces this with the
 * route-guarding + permission-denied-banner logic, and Story 3 adds the shared
 * header (sign-out, role switcher).
 */
export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen">{children}</div>;
}
