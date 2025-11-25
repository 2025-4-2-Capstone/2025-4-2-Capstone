"use client";

import { useEffect, useState } from "react";
import SupersetEmbed from "@/components/charts/SupersetEmbed";

export default function AdminDashboard() {
  const [username, setUsername] = useState("");

  useEffect(() => {
    const user = localStorage.getItem("username");
    if (user) setUsername(user);
  }, []);

  return (
    <div className="flex flex-col gap-8 min-h-screen bg-gray-50 px-8 py-6">

      {/* 🔥 Header 전체 제거됨 */}

      {/* 🟦 Superset 대시보드 임베드 */}
      <section className="bg-white rounded-2xl shadow p-6 border border-gray-100">
        {/* 🔥 이 부분도 제거됨: <h3>관리자용 Superset 대시보드</h3> */}
        
        <SupersetEmbed role="admin" />
      </section>

    </div>
  );
}
