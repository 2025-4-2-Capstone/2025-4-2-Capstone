// app/tickets/page.tsx
"use client";

import TicketList from "@/components/tickets/TicketList";
import TicketFilterBar from "@/components/tickets/TicketFilterBar";

export default function TicketsPage() {
  return (
    <div className="p-6 space-y-6">
      {/* 제목 */}
      <h1 className="text-2xl font-semibold">티켓 전체 목록</h1>

      {/* 필터바 */}
      <TicketFilterBar />

      {/* 티켓 리스트 */}
      <TicketList />
    </div>
  );
}
