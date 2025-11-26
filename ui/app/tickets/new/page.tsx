// app/tickets/new/page.tsx
"use client";

import TicketCreateForm from "@/components/tickets/TicketCreateForm";

export default function NewTicketPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">새 티켓 생성</h1>

      <div className="bg-white p-6 rounded-xl shadow">
        <TicketCreateForm />
      </div>
    </div>
  );
}
