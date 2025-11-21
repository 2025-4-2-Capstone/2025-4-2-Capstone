"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");

  // ✅ 로그인된 사용자 정보 불러오기
  useEffect(() => {
    const storedName = localStorage.getItem("username");
    const storedRole = localStorage.getItem("role");
    if (storedName) setUsername(storedName);
    if (storedRole) setRole(storedRole);
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* 왼쪽 사이드바 */}
      <Sidebar />

      {/* 오른쪽 메인 영역 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 상단 헤더 */}
        <Header username={username} role={role} />

        {/* 콘텐츠 영역 */}
        <main className="flex-1 p-8 bg-gray-50 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
