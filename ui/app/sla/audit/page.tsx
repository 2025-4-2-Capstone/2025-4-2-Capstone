"use client";
import SupersetEmbed from "@/components/charts/SupersetEmbed";

export default function AuditPage() {
  return (
    <div className="flex flex-col gap-8">
      <h2 className="text-2xl font-semibold text-slate-800">감사 로그</h2>
      <p className="text-slate-500">시스템의 주요 변경 및 접근 이력을 검토합니다.</p>
      <SupersetEmbed dashboardId="audit_log_table" />
    </div>
  );
}
