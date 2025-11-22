"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Plus } from "lucide-react";
import TicketCard from "@/components/ticket/TicketCard";
import { api } from "@/lib/api";

export default function TicketsPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState("전체");
  const [priorityFilter, setPriorityFilter] = useState("전체");
  const [search, setSearch] = useState("");

  // 🔥 실제 API에서 티켓 불러오기
  useEffect(() => {
  async function fetchTickets() {
    try {
      const res = await api.get("/tickets");
      const data = res.data;

      // 🚀 응답 구조를 안전하게 배열로 변환
      if (Array.isArray(data)) {
        setTickets(data);
      } else if (Array.isArray(data.tickets)) {
        setTickets(data.tickets);
      } else if (Array.isArray(data.data)) {
        setTickets(data.data);
      } else {
        console.error("알 수 없는 티켓 데이터 구조:", data);
        setTickets([]);
      }

    } catch (err) {
      console.error("티켓 불러오기 실패:", err);
    } finally {
      setLoading(false);
    }
  }
  fetchTickets();
}, []);


  if (loading) {
    return (
      <div className="p-6 text-center text-slate-600">불러오는 중...</div>
    );
  }

  // 🔍 필터링
  const filteredTickets = tickets.filter((t) => {
    const matchStatus = statusFilter === "전체" || t.status === statusFilter;
    const matchPriority =
      priorityFilter === "전체" || t.priority === priorityFilter;
    const matchSearch =
      t.title.includes(search) || (t.assigned_to || "").includes(search);

    return matchStatus && matchPriority && matchSearch;
  });

  return (
    <div className="flex flex-col gap-6 min-h-screen bg-gray-50">
      {/* 상단 헤더 */}
      <header className="flex justify-between items-center bg-white rounded-xl shadow-sm p-4 border border-gray-100">
        <h1 className="text-xl font-semibold text-slate-800">티켓 관리</h1>

        <div className="flex items-center gap-3">
          {/* 🔍 검색 */}
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

          {/* ➕ 새 티켓 */}
          <Link
            href="/tickets/create"
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
          >
            <Plus className="w-4 h-4" />
            새 티켓
          </Link>
        </div>
      </header>

      {/* 필터 */}
      <div className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded-md px-3 py-1 text-sm focus:ring-indigo-400 focus:outline-none"
        >
          <option>전체</option>
          <option>열림</option>
          <option>진행중</option>
          <option>해결됨</option>
          <option>종료</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="border rounded-md px-3 py-1 text-sm focus:ring-indigo-400 focus:outline-none"
        >
          <option>전체</option>
          <option>긴급</option>
          <option>높음</option>
          <option>보통</option>
          <option>낮음</option>
        </select>
      </div>

      {/* 카드 리스트 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-2">
        {filteredTickets.map((ticket) => (
          <TicketCard
            key={ticket.id}
            id={ticket.id}
            title={ticket.title}
            status={ticket.status}
            priority={ticket.priority}
            assignee={ticket.assigned_to}
            created={new Date(ticket.created_at).toLocaleDateString()}
          />
        ))}
      </div>
    </div>
  );
}
