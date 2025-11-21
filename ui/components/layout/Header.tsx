"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export default function Header() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");

  // ✅ 로그인 정보 가져오기
  useEffect(() => {
    const storedName = localStorage.getItem("username");
    const storedRole = localStorage.getItem("role");
    if (storedName) setUsername(storedName);
    if (storedRole) setRole(storedRole);
  }, []);

  // ✅ 역할 이름 매핑
  const roleLabel: Record<string, string> = {
    super_admin: "시스템 관리자",
    admin: "관리자",
    manager: "부서장",
    engineer: "엔지니어",
    support: "고객지원",
    staff: "사무직",
    user: "사용자",
    auditor: "감사자",
  };

  // ✅ 로그아웃 처리
  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  return (
    <header className="flex justify-between items-center bg-white shadow-sm px-6 py-4 border-b border-gray-100">
      {/* 왼쪽 타이틀 */}
      <h1 className="text-xl font-semibold text-slate-800">
        Operation Log Dashboard
      </h1>

      {/* 오른쪽 사용자 영역 */}
      <div className="flex items-center gap-4">
        <div className="flex flex-col text-right leading-tight">
          <span className="text-sm text-slate-700 font-medium">
            {username ? `${username}` : "Loading..."}
          </span>
          <span className="text-xs text-slate-500">
            {roleLabel[role] || ""}
          </span>
        </div>

        {/* 아바타 */}
        <img
          src="/logo.png"
          alt="User Avatar"
          className="w-8 h-8 rounded-full border border-gray-300"
        />

        {/* 로그아웃 버튼 */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-1 text-slate-500 hover:text-indigo-600 text-sm transition"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}
