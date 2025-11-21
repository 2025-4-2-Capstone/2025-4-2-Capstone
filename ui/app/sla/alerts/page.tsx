"use client";
import SupersetEmbed from "@/components/charts/SupersetEmbed";

export default function SLAAlertsPage() {
  return (
    <div className="flex flex-col gap-8">
      <h2 className="text-2xl font-semibold text-slate-800">SLA 알림 현황</h2>
      <p className="text-slate-500">내 담당 티켓의 SLA 위반 및 지연 건수를 확인합니다.</p>
      <SupersetEmbed dashboardId="eng_alerts" />
    </div>
  );
}
