"use client";

import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useEffect, useState } from "react";

export default function AuditLayout({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* 사이드바 */}
      <Sidebar />

      {/* 오른쪽 메인 영역 */}
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
