/**
 * Inbox landing (Support Agent / Admin) — placeholder for this epic.
 *
 * The "Agent and Admin inbox triage" epic fleshes out the enquiry list, search,
 * status changes, resolve, and delete. Here it is a minimal page that confirms the
 * role-based landing redirect resolves correctly.
 */
export default function InboxPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-semibold">Inbox</h1>
      <p className="mt-2 text-muted-foreground">
        Incoming enquiries for triage. The full inbox arrives in a later epic.
      </p>
    </main>
  );
}
