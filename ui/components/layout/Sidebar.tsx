"use client";

import { BarChart3, Ticket, Bell, Settings, LogOut } from "lucide-react";
import Link from "next/link";

export default function Sidebar() {
  return (
    <aside className="w-20 bg-indigo-100 text-slate-700 flex flex-col items-center py-6 space-y-6 shadow-md">
      <div className="text-lg font-bold mb-4 text-slate-800">KDN</div>

      <nav className="flex flex-col items-center space-y-8">
        <Link href="/dashboard" className="hover:text-indigo-500 transition-colors">
          <BarChart3 className="w-6 h-6" />
        </Link>
        <Link href="/tickets" className="hover:text-indigo-500 transition-colors">
          <Ticket className="w-6 h-6" />
        </Link>
        <Link href="/logs" className="hover:text-indigo-500 transition-colors">
          <Bell className="w-6 h-6" />
        </Link>
        <Link href="/profile" className="hover:text-indigo-500 transition-colors">
          <Settings className="w-6 h-6" />
        </Link>
      </nav>

      <div className="mt-auto mb-4">
        <Link href="/login" className="hover:text-indigo-500 transition-colors">
          <LogOut className="w-5 h-5" />
        </Link>
      </div>
    </aside>
  );
}
