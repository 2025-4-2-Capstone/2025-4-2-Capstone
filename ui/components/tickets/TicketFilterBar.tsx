"use client";

import { useTicketFilterStore } from "@/store/ticketFilterStore";
import type { TicketStatus, TicketPriority } from "@/components/tickets/TicketTypes";

export default function TicketFilterBar() {
  const { q, status, priority, setQ, setStatus, setPriority } =
    useTicketFilterStore();

  return (
    <div className="bg-white px-4 py-4 rounded-xl shadow border border-gray-100 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
      {/* 검색창 */}
      <input
        type="text"
        placeholder="제목, 내용, 담당자 등으로 검색..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="w-full md:w-1/3 rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />

      {/* 상태 & 우선순위 필터 */}
      <div className="flex gap-3">
        {/* 상태 선택 */}
        <select
          className="rounded-xl border border-gray-200 px-2 py-2 text-sm bg-white"
          value={status}
          onChange={(e) =>
            setStatus(e.target.value as TicketStatus | "ALL")
          }
        >
          <option value="ALL">상태: 전체</option>
          <option value="OPEN">상태: 열림</option>
          <option value="IN_PROGRESS">상태: 진행중</option>
          <option value="RESOLVED">상태: 해결됨</option>
          <option value="CLOSED">상태: 종료</option>
        </select>

        {/* 우선순위 선택 */}
        <select
          className="rounded-xl border border-gray-200 px-2 py-2 text-sm bg-white"
          value={priority}
          onChange={(e) =>
            setPriority(e.target.value as TicketPriority | "ALL")
          }
        >
          <option value="ALL">우선순위: 전체</option>
          <option value="LOW">우선순위: 낮음</option>
          <option value="MEDIUM">우선순위: 보통</option>
          <option value="HIGH">우선순위: 높음</option>
          <option value="CRITICAL">우선순위: 긴급</option>
        </select>
      </div>
    </div>
  );
}
