"use client";

import { useEffect, useState } from "react";

interface SupersetEmbedProps {
  dashboardId: string;
}

export default function SupersetEmbed({ dashboardId }: SupersetEmbedProps) {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const role = localStorage.getItem("role");

    // ✅ FastAPI에서 Superset용 JWT 요청
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/superset/token?role=${role}`)
      .then((res) => res.json())
      .then((data) => setToken(data.token))
      .catch((err) => console.error("JWT 요청 실패:", err));
  }, []);

  if (!token) {
    return (
      <div className="flex justify-center items-center h-[700px] text-slate-500">
        Superset 대시보드를 불러오는 중...
      </div>
    );
  }

  const embedUrl = `http://localhost:8088/superset/dashboard/p/${dashboardId}/?token=${token}`;

  return (
    <iframe
      src={embedUrl}
      width="100%"
      height="800"
      className="rounded-xl border border-gray-200 shadow-sm"
    />
  );
}
