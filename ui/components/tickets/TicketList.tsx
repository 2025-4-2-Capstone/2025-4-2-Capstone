"use client";

import { useEffect, useState } from "react";
import {
  getTickets,
  getMyTickets,
  getAssignedTickets,
  getUnassignedTickets,
} from "@/lib/api/tickets";
import TicketRow from "./TicketRow";

export default function TicketList({ filterType }: { filterType?: string }) {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 필터와 검색
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");

  // 페이지네이션(선택사항)
  const [page, setPage] = useState(1);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      let data;

      const params = {
        search,
        status: statusFilter,
        priority: priorityFilter,
        page,
      };

      if (filterType === "my") data = await getMyTickets();
      else if (filterType === "assigned") data = await getAssignedTickets();
      else if (filterType === "unassigned") data = await getUnassignedTickets();
      else data = await getTickets(params);

      setTickets(data);
    } catch (err) {
      console.error(err);
      setError("⚠️ 티켓을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterType, search, statusFilter, priorityFilter, page]);

  /* ------------------------------
     UI 상태 처리
  ------------------------------- */
  if (loading)
    return (
      <p className="text-center py-6 text-gray-600">불러오는 중...</p>
    );

  if (error)
    return (
      <p className="text-center py-6 text-red-500 font-medium">
        {error}
      </p>
    );

  if (tickets.length === 0)
    return (
      <p className="text-center py-6 text-gray-400">티켓이 없습니다.</p>
    );

  /* ------------------------------ */

  return (
    <>
      <div className="border rounded-xl overflow-hidden bg-white shadow">
        <table className="w-full border-collapse">
          <thead className="bg-gray-100">
            <tr className="text-left text-sm text-gray-600">
              <th className="p-3">ID</th>
              <th className="p-3">제목</th>
              <th className="p-3">상태</th>
              <th className="p-3">우선순위</th>
              <th className="p-3">담당자</th>
              <th className="p-3">생성일</th>
            </tr>
          </thead>

          <tbody>
            {tickets.map((ticket) => (
              <TicketRow key={ticket.id} ticket={ticket} />
            ))}
          </tbody>
        </table>
      </div>

      {/* 페이지네이션 */}
      <div className="flex justify-center gap-4 py-4">
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-30"
        >
          이전
        </button>

        <span className="text-gray-600">페이지 {page}</span>

        <button
          onClick={() => setPage((p) => p + 1)}
          className="px-3 py-1 bg-gray-200 rounded"
        >
          다음
        </button>
      </div>
    </>
  );
}
