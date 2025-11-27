// components/tickets/TicketList.tsx
"use client";

import { useEffect, useState } from "react";
import TicketStatusBadge from "./TicketStatusBadge";
import TicketPriorityBadge from "./TicketPriorityBadge";
import { useTicketFilterStore } from "@/store/ticketFilterStore";
import api from "@/lib/utils/api";

interface TicketSummary {
  id: number;
  title: string;
  status: string;
  priority: string;
  assignee_name: string | null;
  department_name: string | null;
  created_at: string;
}

// 🔥 axios 응답 타입 지정
interface TicketListResponse {
  items?: TicketSummary[];
  length?: number;
}

interface TicketListProps {
  mode?: "all" | "my" | "assigned" | "unassigned";
}

export default function TicketList({ mode = "all" }: TicketListProps) {
  const { q, status, priority } = useTicketFilterStore();
  const [tickets, setTickets] = useState<TicketSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTickets = async () => {
    try {
      setLoading(true);

      const params: Record<string, any> = {};

      // 🔥 mode 적용
      if (mode === "my") params.my = true;
      if (mode === "assigned") params.assigned = true;
      if (mode === "unassigned") params.unassigned = true;

      // 🔍 공통 필터
      if (q) params.q = q;
      if (status !== "ALL") params.status = status;
      if (priority !== "ALL") params.priority = priority;

      // 🔥 axios + 타입 강제 지정 (여기서 오류 해결됨)
      const res = await api.get<TicketListResponse>("/tickets", { params });

      const data = res.data;

      // 백엔드가 items 또는 배열로 반환하는데 둘 다 대응
      setTickets(data.items ?? (data as any));
    } catch (err) {
      console.error("티켓 목록 불러오기 실패:", err);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [q, status, priority, mode]);

  /* 렌더링 */
  if (loading) {
    return (
      <div className="py-10 text-center text-sm text-slate-500">
        티켓을 불러오는 중입니다...
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="py-10 text-center text-sm text-slate-500">
        조건에 해당하는 티켓이 없습니다.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 text-left text-xs text-slate-500">
            <th className="py-2 pr-4">번호</th>
            <th className="py-2 pr-4">제목</th>
            <th className="py-2 pr-4">상태</th>
            <th className="py-2 pr-4">우선순위</th>
            <th className="py-2 pr-4">담당자</th>
            <th className="py-2 pr-4">부서</th>
            <th className="py-2 pr-4">생성일</th>
          </tr>
        </thead>

        <tbody>
          {tickets.map((t) => (
            <tr
              key={t.id}
              className="border-b border-gray-50 hover:bg-gray-50 transition cursor-pointer"
              onClick={() => (window.location.href = `/tickets/${t.id}`)}
            >
              <td className="py-2 pr-4 text-slate-500">#{t.id}</td>

              <td className="py-2 pr-4 text-slate-800 max-w-[260px] truncate">
                {t.title}
              </td>

              <td className="py-2 pr-4">
                <TicketStatusBadge status={t.status.toLowerCase()} />
              </td>

              <td className="py-2 pr-4">
                <TicketPriorityBadge
                  priority={t.priority.toLowerCase() as any}
                />
              </td>

              <td className="py-2 pr-4 text-slate-700">
                {t.assignee_name ?? "-"}
              </td>

              <td className="py-2 pr-4 text-slate-700">
                {t.department_name ?? "-"}
              </td>

              <td className="py-2 pr-4 text-slate-500 text-xs">
                {new Date(t.created_at).toLocaleString("ko-KR")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
