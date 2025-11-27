// app/tickets/page.tsx
"use client";

import TicketList from "@/components/tickets/TicketList";
import TicketFilterBar from "@/components/tickets/TicketFilterBar";

export default function TicketsPage() {
  return (
    <div className="flex flex-col gap-6 min-h-screen bg-gray-50 px-8 py-6">

      {/* 페이지 제목 */}
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">티켓 전체 목록</h1>
      </header>

      {/* 검색 & 필터 카드 */}
      <section className="bg-white rounded-2xl shadow border border-gray-100 p-4">
        <TicketFilterBar />
      </section>

      {/* 티켓 리스트 */}
      <section className="bg-white rounded-2xl shadow border border-gray-100 p-4">
        <TicketList />
      </section>

    </div>
  );
}
