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

  /*-----------------------------------------------------
    역할별 메뉴 구성 (티켓 메뉴 전면 재정리 + 기존 메뉴 유지)
  -----------------------------------------------------*/

  const menuByRole: Record<
    string,
    { icon: React.ElementType; path: string; tooltip: string }[]
  > = {
    /* =====================
       SUPER ADMIN
    ====================== */
    super_admin: [
      { icon: BarChart3, path: "/dashboard/admin", tooltip: "대시보드" },

      // 티켓 관련
      { icon: Ticket, path: "/tickets", tooltip: "전체 티켓" },
      { icon: Ticket, path: "/tickets/unassigned", tooltip: "미할당 티켓" },
      { icon: Ticket, path: "/tickets/my", tooltip: "내 티켓" },
      { icon: FileText, path: "/tickets/new", tooltip: "티켓 생성" },

      // 관리 기능
      { icon: Users, path: "/users", tooltip: "사용자 관리" },
      { icon: Shield, path: "/audit", tooltip: "감사 로그" },
      { icon: Settings, path: "/settings", tooltip: "시스템 설정" },
    ],

    /* =====================
       ADMIN
    ====================== */
    admin: [
      { icon: BarChart3, path: "/dashboard/admin", tooltip: "대시보드" },

      // 티켓 관련
      { icon: Ticket, path: "/tickets", tooltip: "전체 티켓" },
      { icon: Ticket, path: "/tickets/unassigned", tooltip: "미할당 티켓" },
      { icon: Ticket, path: "/tickets/my", tooltip: "내 티켓" },
      { icon: FileText, path: "/tickets/new", tooltip: "티켓 생성" },

      // 관리 기능
      { icon: Bell, path: "/sla", tooltip: "SLA 정책" },
      { icon: Users, path: "/users", tooltip: "사용자 관리" },
      { icon: Shield, path: "/audit", tooltip: "감사 로그" },
    ],

    /* =====================
       MANAGER
    ====================== */
    manager: [
      { icon: BarChart3, path: "/dashboard/manager", tooltip: "부서 대시보드" },

      // 티켓 관련
      { icon: Ticket, path: "/tickets/department", tooltip: "부서 티켓" },
      { icon: Ticket, path: "/tickets/unassigned", tooltip: "미할당 티켓" },
      { icon: Ticket, path: "/tickets/my", tooltip: "내 티켓" },

      // 기타
      { icon: Bell, path: "/sla/department", tooltip: "SLA 상태" },
      { icon: Users, path: "/users/team", tooltip: "팀원 관리" },
    ],

    /* =====================
       ENGINEER
    ====================== */
    engineer: [
      { icon: BarChart3, path: "/dashboard/engineer", tooltip: "내 대시보드" },

      // 티켓 관련
      { icon: Ticket, path: "/tickets/my", tooltip: "내 티켓" },
      { icon: Ticket, path: "/tickets/assigned", tooltip: "할당된 티켓" },

      { icon: Bell, path: "/sla/alerts", tooltip: "SLA 경고" },
    ],

    /* =====================
       SUPPORT
    ====================== */
    support: [
      { icon: BarChart3, path: "/dashboard/support", tooltip: "지원 대시보드" },
      { icon: Ticket, path: "/tickets/my", tooltip: "내 티켓" },
    ],

    /* =====================
       STAFF (일반 직원)
    ====================== */
    staff: [
      { icon: BarChart3, path: "/dashboard/staff", tooltip: "내 업무" },
      { icon: Ticket, path: "/tickets/my", tooltip: "내 티켓" },
    ],

    /* =====================
       USER (고객 / 사내 일반 사용자)
    ====================== */
    user: [
      { icon: Ticket, path: "/tickets/my", tooltip: "내 티켓" },
      { icon: FileText, path: "/tickets/new", tooltip: "문의하기" },
    ],

    /* =====================
       AUDITOR (감사)
    ====================== */
    auditor: [
      { icon: BarChart3, path: "/dashboard/auditor", tooltip: "감사 대시보드" },
      { icon: Shield, path: "/audit", tooltip: "감사 로그" },
      { icon: Bell, path: "/sla/audit", tooltip: "SLA 이력" },
    ],
  };

  // 기본 fallback: user
  const menus = menuByRole[role] || menuByRole["user"];

  return (
    <aside className="w-20 bg-indigo-100 text-slate-700 flex flex-col items-center py-6 space-y-6 shadow-md">
      {/* 로고 영역 */}
      <div className="text-lg font-bold mb-4 text-slate-800">KDN</div>

      {/* 네비게이션 */}
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
