"use client";

import { useEffect, useState } from "react";
import { getTicketHistory } from "@/lib/api/tickets";

export default function TicketDetailHistory({ ticketId }: { ticketId: string }) {
  const [history, setHistory] = useState<any[] | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getTicketHistory(Number(ticketId));
      setHistory(data);
    };
    fetchData();
  }, [ticketId]);

  if (!history)
    return <div className="bg-white p-6 rounded-xl shadow">로딩 중...</div>;

  return (
    <div className="bg-white p-6 rounded-xl shadow space-y-4">
      <h2 className="text-lg font-semibold text-gray-800">히스토리</h2>

      <div className="space-y-3 text-sm">
        {history.map((h) => (
          <div key={h.id} className="border-b pb-2 last:border-none">
            <p className="font-medium">{h.action}</p>
            <p className="text-gray-500">{h.user} • {h.time}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
