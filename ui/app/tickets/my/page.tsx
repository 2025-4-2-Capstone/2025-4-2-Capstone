// app/tickets/my/page.tsx
"use client";

import TicketList from "@/components/tickets/TicketList";

export default function MyTicketsPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">내가 만든 티켓</h1>
      <TicketList filterType="my" />
    </div>
  );
}
