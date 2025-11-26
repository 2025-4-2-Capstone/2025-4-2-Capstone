"use client";

import { useEffect, useState } from "react";
import { getTicketById } from "@/lib/api/tickets";

export default function TicketDetailInfo({ ticketId }: { ticketId: string }) {
  const [ticket, setTicket] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getTicketById(ticketId);
      setTicket(data);
    };
    fetchData();
  }, [ticketId]);

  if (!ticket)
    return <div className="bg-white p-6 rounded-xl shadow">로딩 중...</div>;

  return (
    <div className="bg-white p-6 rounded-xl shadow space-y-4">
      <h2 className="text-lg font-semibold text-gray-800">기본 정보</h2>

      <div className="space-y-1 text-sm text-gray-700">
        <p><strong>티켓 ID:</strong> {ticket.id}</p>
        <p><strong>요청자:</strong> {ticket.requester}</p>
        <p><strong>부서:</strong> {ticket.department}</p>
        <p><strong>우선순위:</strong> {ticket.priority}</p>
        <p><strong>생성일:</strong> {ticket.created_at}</p>

        <div className="pt-2">
          <strong>설명:</strong>
          <p className="mt-1 bg-gray-50 p-3 rounded-lg border text-gray-600">
            {ticket.description}
          </p>
        </div>
      </div>
    </div>
  );
}
