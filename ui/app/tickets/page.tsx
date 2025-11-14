"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Plus } from "lucide-react"; // ✅ Plus 아이콘 추가

const MOCK_TICKETS = [
  { id: 1, title: "DB 연결 오류", status: "진행중", priority: "높음", assignee: "홍길동", created: "2025-11-10" },
  { id: 2, title: "API 응답 지연", status: "해결됨", priority: "보통", assignee: "김철수", created: "2025-11-09" },
  { id: 3, title: "로그인 실패", status: "열림", priority: "긴급", assignee: "박영희", created: "2025-11-08" },
];

export default function TicketsPage() {
  const [statusFilter, setStatusFilter] = useState("전체");
  const [priorityFilter, setPriorityFilter] = useState("전체");
  const [search, setSearch] = useState("");

  const filteredTickets = MOCK_TICKETS.filter((t) => {
    const matchStatus = statusFilter === "전체" || t.status === statusFilter;
    const matchPriority = priorityFilter === "전체" || t.priority === priorityFilter;
    const matchSearch = t.title.includes(search) || t.assignee.includes(search);
    return matchStatus && matchPriority && matchSearch;
  });

  return (
    <div className="flex flex-col gap-6 min-h-screen bg-gray-50">
      {/* 상단 헤더 */}
      <header className="flex justify-between items-center bg-white rounded-xl shadow-sm p-4 border border-gray-100">
        <h1 className="text-xl font-semibold text-slate-800">티켓 관리</h1>

        <div className="flex items-center gap-3">
          {/* 🔍 검색창 */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="검색 (제목 / 담당자)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          {/* ➕ 새 티켓 등록 버튼 */}
          <Link
            href="/tickets/new"
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
          >
            <Plus className="w-4 h-4" />
            새 티켓
          </Link>
        </div>
      </header>

      {/* 나머지 (필터 + 테이블 그대로 유지) */}
      {/* ... 기존 코드 그대로 */}
    </div>
  );
}
