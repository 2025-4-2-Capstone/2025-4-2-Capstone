"use client";
import SupersetEmbed from "@/components/charts/SupersetEmbed";

export default function TicketsPage() {
  return (
    <div className="flex flex-col gap-8">
      <h2 className="text-2xl font-semibold text-slate-800">티켓 관리</h2>
      <p className="text-slate-500">전체 조직의 티켓 현황 및 처리 상태를 조회합니다.</p>
      <SupersetEmbed dashboardId="ticket_overview" />
    </div>
  );
}
