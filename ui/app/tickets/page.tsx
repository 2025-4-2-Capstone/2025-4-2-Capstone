"use client";

import { useState } from "react";
import { Search } from "lucide-react";

// 목업 데이터 (나중에 API 연결 예정)
const MOCK_TICKETS = [
  { id: 1, title: "DB 연결 오류", status: "진행중", priority: "높음", assignee: "홍길동", created: "2025-11-10" },
  { id: 2, title: "API 응답 지연", status: "해결됨", priority: "보통", assignee: "김철수", created: "2025-11-09" },
  { id: 3, title: "로그인 실패", status: "열림", priority: "긴급", assignee: "박영희", created: "2025-11-08" },
  { id: 4, title: "SLA 알림 안뜸", status: "종료", priority: "낮음", assignee: "이민수", created: "2025-11-07" },
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
      {/* 헤더 */}
      <header className="flex justify-between items-center bg-white rounded-xl shadow-sm p-4 border border-gray-100">
        <h1 className="text-xl font-semibold text-slate-800">티켓 관리</h1>
        <div className="flex items-center gap-3">
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
        </div>
      </header>

      {/* 필터 */}
      <div className="flex gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div>
          <label className="text-sm font-medium text-slate-700">상태</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="ml-2 border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <option>전체</option>
            <option>열림</option>
            <option>진행중</option>
            <option>해결됨</option>
            <option>종료</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">우선순위</label>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="ml-2 border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <option>전체</option>
            <option>긴급</option>
            <option>높음</option>
            <option>보통</option>
            <option>낮음</option>
          </select>
        </div>
      </div>

      {/* 티켓 테이블 */}
      <div className="bg-white rounded-xl shadow border border-gray-100 p-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b text-slate-600">
              <th className="pb-2">번호</th>
              <th className="pb-2">제목</th>
              <th className="pb-2">상태</th>
              <th className="pb-2">우선순위</th>
              <th className="pb-2">담당자</th>
              <th className="pb-2">생성일</th>
            </tr>
          </thead>
          <tbody>
            {filteredTickets.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-4 text-slate-500">
                  결과가 없습니다.
                </td>
              </tr>
            ) : (
              filteredTickets.map((t) => (
                <tr key={t.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="py-2">{t.id}</td>
                  <td className="py-2 font-medium text-slate-800">{t.title}</td>
                  <td className="py-2">
                    <StatusBadge status={t.status} />
                  </td>
                  <td className="py-2">
                    <PriorityBadge priority={t.priority} />
                  </td>
                  <td className="py-2 text-slate-700">{t.assignee}</td>
                  <td className="py-2 text-slate-600">{t.created}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// 상태 뱃지
function StatusBadge({ status }: { status: string }) {
  const colorMap: Record<string, string> = {
    열림: "bg-blue-100 text-blue-700",
    진행중: "bg-yellow-100 text-yellow-700",
    해결됨: "bg-green-100 text-green-700",
    종료: "bg-gray-200 text-gray-700",
  };
  return (
    <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${colorMap[status] || ""}`}>
      {status}
    </span>
  );
}

// 우선순위 뱃지
function PriorityBadge({ priority }: { priority: string }) {
  const colorMap: Record<string, string> = {
    긴급: "bg-red-100 text-red-700",
    높음: "bg-orange-100 text-orange-700",
    보통: "bg-green-100 text-green-700",
    낮음: "bg-gray-200 text-gray-700",
  };
  return (
    <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${colorMap[priority] || ""}`}>
      {priority}
    </span>
  );
}
