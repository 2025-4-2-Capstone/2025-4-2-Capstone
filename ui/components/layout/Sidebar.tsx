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

  // ✅ 로그인 시 저장된 role 불러오기
  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    if (storedRole) setRole(storedRole);
  }, []);

  // ✅ 직급별 메뉴 분류
  const menuByRole: Record<
    string,
    { icon: React.ElementType; path: string; tooltip: string }[]
  > = {
    super_admin: [
      { icon: BarChart3, path: "/dashboard/admin", tooltip: "대시보드" },
      { icon: Ticket, path: "/tickets", tooltip: "티켓 관리" },
      { icon: Users, path: "/users", tooltip: "사용자 관리" },
      { icon: Shield, path: "/audit", tooltip: "감사 로그" },
      { icon: Settings, path: "/settings", tooltip: "시스템 설정" },
    ],
    admin: [
      { icon: BarChart3, path: "/dashboard/admin", tooltip: "대시보드" },
      { icon: Ticket, path: "/tickets", tooltip: "티켓 관리" },
      { icon: Bell, path: "/sla", tooltip: "SLA 정책" },
      { icon: Users, path: "/users", tooltip: "사용자 관리" },
      { icon: Shield, path: "/audit", tooltip: "감사 로그" },
    ],
    manager: [
      { icon: BarChart3, path: "/dashboard/manager", tooltip: "부서 대시보드" },
      { icon: Ticket, path: "/tickets/department", tooltip: "부서 티켓" },
      { icon: Bell, path: "/sla/department", tooltip: "SLA 상태" },
      { icon: Users, path: "/users/team", tooltip: "팀원 관리" },
    ],
    engineer: [
      { icon: BarChart3, path: "/dashboard/engineer", tooltip: "내 대시보드" },
      { icon: Ticket, path: "/tickets/my", tooltip: "내 티켓" },
      { icon: Bell, path: "/sla/alerts", tooltip: "SLA 경고" },
    ],
    support: [
      { icon: BarChart3, path: "/dashboard/support", tooltip: "지원 대시보드" },
      { icon: Ticket, path: "/tickets/my", tooltip: "내 티켓" },
    ],
    staff: [
      { icon: BarChart3, path: "/dashboard/staff", tooltip: "내 업무" },
      { icon: Ticket, path: "/tickets/my", tooltip: "내 티켓" },
    ],
    user: [
      { icon: Ticket, path: "/tickets/my", tooltip: "내 티켓" },
      { icon: FileText, path: "/tickets/new", tooltip: "문의하기" },
    ],
    auditor: [
      { icon: BarChart3, path: "/dashboard/auditor", tooltip: "감사 대시보드" },
      { icon: Shield, path: "/audit", tooltip: "감사 로그" },
      { icon: Bell, path: "/sla/audit", tooltip: "SLA 이력" },
    ],
  };

  // 기본값: user로 처리
  const menus = menuByRole[role] || menuByRole["user"];

  return (
    <aside className="w-20 bg-indigo-100 text-slate-700 flex flex-col items-center py-6 space-y-6 shadow-md">
      {/* 로고 영역 */}
      <div className="text-lg font-bold mb-4 text-slate-800">KDN</div>

      {/* 네비게이션 메뉴 */}
      <nav className="flex flex-col items-center space-y-8">
        {menus.map((menu, idx) => {
          const Icon = menu.icon;
          return (
            <Link
              key={idx}
              href={menu.path}
              className="group relative hover:text-indigo-500 transition-colors"
            >
              <Icon className="w-6 h-6" />
              <span className="absolute left-12 top-1/2 -translate-y-1/2 bg-indigo-600 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {menu.tooltip}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* 로그아웃 */}
      <div className="mt-auto mb-4">
        <Link href="/login" className="hover:text-indigo-500 transition-colors">
          <LogOut className="w-5 h-5" />
        </Link>
      </div>
    </aside>
  );
}
