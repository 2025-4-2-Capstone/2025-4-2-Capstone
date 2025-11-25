"use client";

import { useEffect, useState } from "react";

import SupersetEmbed from "@/components/charts/SupersetEmbed";

export default function RoleBasedDashboard() {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    setRole(storedRole);
  }, []);

  if (!role) {
    return (
      <div className="flex justify-center items-center min-h-screen text-slate-500">
        사용자 정보를 불러오는 중...
      </div>
    );
  }

  // ✅ 역할별 차트 목록
  const chartMap: Record<string, number[]> = {
    super_admin: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    admin: [1, 2, 3, 5, 7, 8, 9, 10],
    manager: [1, 2, 5, 7, 8, 10],
    engineer: [1, 7, 8],
    auditor: [6, 9],
    user: [1, 7],
    staff: [1, 7],
  };

  const chartIds = chartMap[role] || [1];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-slate-800 mb-4">
        {role} Dashboard
      </h1>
      <SupersetEmbed chartIds={chartIds.map((id) => id.toString())} />
    </div>
  );
}
