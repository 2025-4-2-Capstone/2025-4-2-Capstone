"use client";

import { useEffect, useState } from "react";
import { getTicketById } from "@/lib/api/tickets";
import TicketStatusBadge from "./TicketStatusBadge";

export default function TicketDetailHeader({ ticketId }: { ticketId: string }) {
  const [ticket, setTicket] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getTicketById(ticketId);
      setTicket(data);
    };
    fetchData();
  }, [ticketId]);

  if (!ticket)
    return (
      <div className="bg-white p-6 rounded-xl shadow">로딩 중...</div>
    );

  return (
    <div className="bg-white p-6 rounded-xl shadow space-y-3">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{ticket.title}</h1>
        <TicketStatusBadge status={ticket.status} />
      </div>

      <div className="text-sm text-gray-600 space-y-1">
        <p>우선순위: {ticket.priority}</p>
        <p>담당자: {ticket.assignee || "미할당"}</p>
        <p>생성일: {ticket.created_at}</p>
      </div>
    </div>
  );
}
