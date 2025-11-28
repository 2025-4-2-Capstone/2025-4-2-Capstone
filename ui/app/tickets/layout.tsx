"use client";

import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

export default function TicketsLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* 사이드바 */}
      <Sidebar />

      {/* 우측 영역 */}
      <div className="flex-1 flex flex-col">
        {/* 헤더 */}
        <Header />

        {/* 페이지 내용 */}
        <main className="p-8 text-gray-800">
          {children}
        </main>
      </div>
    </div>
  );
}
