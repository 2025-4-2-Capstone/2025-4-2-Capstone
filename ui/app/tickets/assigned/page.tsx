// app/tickets/assigned/page.tsx
"use client";

import TicketList from "@/components/tickets/TicketList";

export default function AssignedTicketsPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">나에게 할당된 티켓</h1>
      <TicketList filterType="assigned" />
    </div>
  );
}
