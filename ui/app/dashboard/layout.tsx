"use client";

import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useUserStore } from "@/stores/userStore";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useUserStore();

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* 롤 전달 */}
      <Sidebar role={user?.role} />

      <div className="flex-1 flex flex-col">
        <Header role={user?.role} />
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
