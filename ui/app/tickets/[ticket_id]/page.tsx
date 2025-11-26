// app/tickets/[ticket_id]/page.tsx
"use client";

import TicketDetailHeader from "@/components/tickets/TicketDetailHeader";
import TicketDetailInfo from "@/components/tickets/TicketDetailInfo";
import TicketDetailHistory from "@/components/tickets/TicketDetailHistory";
import TicketDetailComments from "@/components/tickets/TicketDetailComments";
import TicketActionBar from "@/components/tickets/TicketActionBar";

export default function TicketDetailPage({ params }: { params: { ticket_id: string } }) {
  return (
    <div className="p-6 space-y-6">
      {/* 상단 헤더 */}
      <TicketDetailHeader ticketId={params.ticket_id} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 왼쪽(기본 정보) */}
        <div className="lg:col-span-2 space-y-6">
          <TicketDetailInfo ticketId={params.ticket_id} />
          <TicketDetailComments ticketId={params.ticket_id} />
        </div>

        {/* 오른쪽(히스토리 + 액션바) */}
        <div className="space-y-6">
          <TicketDetailHistory ticketId={params.ticket_id} />
          <TicketActionBar ticketId={params.ticket_id} />
        </div>
      </div>
    </div>
  );
}
