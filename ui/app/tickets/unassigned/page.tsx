// app/tickets/unassigned/page.tsx
"use client";

import TicketList from "@/components/tickets/TicketList";

export default function UnassignedTicketsPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">미할당 티켓</h1>
      <TicketList mode="unassigned" />
    </div>
  );
}
