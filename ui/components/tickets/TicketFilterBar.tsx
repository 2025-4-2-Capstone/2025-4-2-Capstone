// components/tickets/TicketFilterBar.tsx
"use client";

export default function TicketFilterBar() {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
      {/* 검색창 */}
      <input
        type="text"
        placeholder="검색 (제목/ID)"
        className="w-full sm:w-1/3 px-4 py-2 border rounded-lg"
      />

      <div className="flex gap-3">
        {/* 상태 필터 */}
        <select className="px-3 py-2 border rounded-lg">
          <option value="">상태 전체</option>
          <option value="open">Open</option>
          <option value="in_progress">진행중</option>
          <option value="pending">보류</option>
          <option value="resolved">해결됨</option>
        </select>

        {/* 우선순위 필터 */}
        <select className="px-3 py-2 border rounded-lg">
          <option value="">우선순위 전체</option>
          <option value="low">낮음</option>
          <option value="normal">보통</option>
          <option value="high">높음</option>
          <option value="urgent">긴급</option>
        </select>
      </div>
    </div>
  );
}
