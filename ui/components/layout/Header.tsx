"use client";

interface HeaderProps {
  role?: string;
  username?: string;
}

export default function Header({ role, username }: HeaderProps) {
  
  const titleByRole: Record<string, string> = {
    admin: "관리자 시스템 대시보드",
    engineer: "엔지니어 작업 현황",
    support: "고객지원 처리 센터",
    user: "내 업무 대시보드",
  };

  const title = titleByRole[role || "user"];

  return (
    <header className="flex justify-between items-center bg-white shadow-sm px-6 py-4 border-b border-gray-100">
      <h1 className="text-xl font-semibold text-slate-800">{title}</h1>

      <div className="flex items-center gap-3">
        <span className="text-sm text-slate-600">
          Welcome, {username || "Guest"}
        </span>
        <img
          src="/logo.png"
          alt="User Avatar"
          className="w-8 h-8 rounded-full border border-gray-300"
        />
      </div>
    </header>
  );
}
