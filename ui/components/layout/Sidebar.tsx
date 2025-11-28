"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  Ticket,
  Bell,
  Settings,
  Shield,
  Users,
  FileText,
  LogOut,
} from "lucide-react";

export default function Sidebar() {
  const [role, setRole] = useState<string>("");

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    if (storedRole) setRole(storedRole);
  }, []);

  // 역할별 대시보드 경로
  const dashboardPath: Record<string, string> = {
    super_admin: "/dashboard/admin",
    admin: "/dashboard/admin",
    manager: "/dashboard/manager",
    engineer: "/dashboard/engineer",
    support: "/dashboard/support",
    staff: "/dashboard/staff",
    user: "/dashboard/user",
    auditor: "/dashboard/auditor",
  };

  const getDashboardPath = () => dashboardPath[role] || "/dashboard/user";

  // =========================================================
  // 역할별 메뉴 구성 (사용자 관리 → SLA 알림 바로 아래로 배치)
  // =========================================================
  const menuByRole: Record<
    string,
    { icon: any; path: string; tooltip: string }[]
  > = {
    super_admin: [
      { icon: BarChart3, path: getDashboardPath(), tooltip: "대시보드" },
      { icon: Ticket, path: "/tickets", tooltip: "티켓 관리" },
      { icon: Bell, path: "/sla/alerts", tooltip: "SLA 알림" },

      // 🔽 요청한 대로 SLA 바로 아래에 사용자 관리 배치
      { icon: Users, path: "/users/pending", tooltip: "사용자 관리" },

      { icon: Shield, path: "/audit", tooltip: "감사 로그" },
      { icon: Settings, path: "/settings", tooltip: "시스템 설정" },
    ],

    admin: [
      { icon: BarChart3, path: getDashboardPath(), tooltip: "대시보드" },
      { icon: Ticket, path: "/tickets", tooltip: "티켓 관리" },
      { icon: Bell, path: "/sla/alerts", tooltip: "SLA 알림" },

      { icon: Users, path: "/users/pending", tooltip: "사용자 관리" },

      { icon: Shield, path: "/audit", tooltip: "감사 로그" },
    ],

    manager: [
      { icon: BarChart3, path: getDashboardPath(), tooltip: "부서 대시보드" },
      { icon: Ticket, path: "/tickets/department", tooltip: "부서 티켓" },
      { icon: Bell, path: "/sla/department", tooltip: "SLA 상태" },
      { icon: Users, path: "/users/team", tooltip: "팀원 관리" },
    ],

    engineer: [
      { icon: BarChart3, path: getDashboardPath(), tooltip: "내 대시보드" },
      { icon: Ticket, path: "/tickets/my", tooltip: "내 티켓" },
      { icon: Bell, path: "/sla/alerts", tooltip: "SLA 알림" },
    ],

    support: [
      { icon: BarChart3, path: getDashboardPath(), tooltip: "지원 대시보드" },
      { icon: Ticket, path: "/tickets/my", tooltip: "내 티켓" },
    ],

    staff: [
      { icon: BarChart3, path: getDashboardPath(), tooltip: "내 업무" },
      { icon: Ticket, path: "/tickets/my", tooltip: "내 티켓" },
    ],

    user: [
      { icon: BarChart3, path: getDashboardPath(), tooltip: "내 대시보드" },
      { icon: Ticket, path: "/tickets/my", tooltip: "내 티켓" },
      { icon: FileText, path: "/tickets/new", tooltip: "문의하기" },
    ],

    auditor: [
      { icon: BarChart3, path: getDashboardPath(), tooltip: "감사 대시보드" },
      { icon: Shield, path: "/audit", tooltip: "감사 로그" },
      { icon: Bell, path: "/sla/audit", tooltip: "SLA 이력" },
    ],
  };

  const menus = menuByRole[role] || menuByRole["user"];

  return (
    <aside className="w-20 bg-indigo-100 text-slate-700 flex flex-col items-center py-6 space-y-6 shadow-md">
      {/* 로고 */}
      <div className="text-lg font-bold mb-4 text-indigo-700">KDN</div>

      {/* 메뉴 */}
      <nav className="flex flex-col items-center space-y-8">
        {menus.map((menu, idx) => {
          const Icon = menu.icon;
          return (
            <Link
              key={idx}
              href={menu.path}
              className="group relative hover:text-indigo-600 transition"
            >
              <Icon className="w-6 h-6" />

              {/* Tooltip */}
              <span className="absolute left-12 top-1/2 -translate-y-1/2 bg-indigo-600 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                {menu.tooltip}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* 로그아웃 */}
      <div className="mt-auto mb-4">
        <Link
          href="/auth/login"
          className="hover:text-indigo-600 transition-colors"
        >
          <LogOut className="w-5 h-5" />
        </Link>
      </div>
    </aside>
  );
}
