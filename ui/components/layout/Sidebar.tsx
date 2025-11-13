"use client";

import Link from "next/link";
import {
  BarChart3,
  Ticket,
  Bell,
  Settings,
  LogOut,
  Users,
  ClipboardList,
  Wrench
} from "lucide-react";

interface SidebarProps {
  role?: string;
}

export default function Sidebar({ role }: SidebarProps) {
  // 🔥 역할별 메뉴 구성
  const menuByRole: Record<string, any[]> = {
    admin: [
      { href: "/dashboard", icon: BarChart3 },
      { href: "/tickets", icon: Ticket },
      { href: "/logs", icon: Bell },
      { href: "/users", icon: Users },
      { href: "/settings", icon: Settings },
    ],

    engineer: [
      { href: "/dashboard", icon: BarChart3 },
      { href: "/tickets", icon: Wrench },
      { href: "/logs", icon: Bell },
    ],

    support: [
      { href: "/dashboard", icon: BarChart3 },
      { href: "/tickets", icon: ClipboardList },
    ],

    user: [
      { href: "/dashboard", icon: BarChart3 },
      { href: "/my-tickets", icon: Ticket },
    ],
  };

  const menus = menuByRole[role || "user"];

  return (
    <aside className="w-20 bg-indigo-100 text-slate-700 flex flex-col items-center py-6 space-y-6 shadow-md">
      <div className="text-lg font-bold mb-4 text-slate-800">KDN</div>

      <nav className="flex flex-col items-center space-y-8">
        {menus.map((item, index) => {
          const Icon = item.icon;
          return (
            <Link key={index} href={item.href} className="hover:text-indigo-500 transition-colors">
              <Icon className="w-6 h-6" />
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto mb-4">
        <Link href="/login" className="hover:text-indigo-500 transition-colors">
          <LogOut className="w-5 h-5" />
        </Link>
      </div>
    </aside>
  );
}
