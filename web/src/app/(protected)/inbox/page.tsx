'use client';

/**
 * Inbox landing (Support Agent / Admin).
 *
 * A deliberately minimal enquiry list for this epic — the "Agent and Admin inbox
 * triage" epic replaces it with the full search / status / resolve behaviour
 * (Critical Rule 6). Its job here is to make role-based action-hiding real and
 * testable (R3 / NFR-1): each row carries a triage control (Support Agent + Admin)
 * and a delete control (Admin only), each wrapped in `<Can>` so a forbidden control
 * is absent from the DOM for the wrong role rather than merely hidden.
 */

import { useState } from 'react';
import { SEEDED_ENQUIRIES, type Enquiry } from '@/lib/fixtures/enquiries';
import { Can } from '@/components/rbac/Can';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function InboxPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>(() => [
    ...SEEDED_ENQUIRIES,
  ]);

  function deleteEnquiry(id: string) {
    setEnquiries((current) => current.filter((enquiry) => enquiry.id !== id));
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-semibold">Inbox</h1>
      <p className="mt-2 text-muted-foreground">
        Incoming enquiries for triage.
      </p>

      <Card className="mt-6">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {enquiries.map((enquiry) => (
                <TableRow key={enquiry.id}>
                  <TableCell className="font-medium">{enquiry.name}</TableCell>
                  <TableCell>{enquiry.category}</TableCell>
                  <TableCell>{enquiry.status}</TableCell>
                  <TableCell className="space-x-2 text-right">
                    <Can action="triage">
                      <Button type="button" variant="outline" size="sm">
                        Triage
                      </Button>
                    </Can>
                    <Can action="delete">
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteEnquiry(enquiry.id)}
                      >
                        Delete enquiry from {enquiry.name}
                      </Button>
                    </Can>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </main>
  );
}
