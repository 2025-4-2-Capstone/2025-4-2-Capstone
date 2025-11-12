"use client";

export default function Header() {
  return (
    <header className="flex justify-between items-center bg-white shadow-sm px-6 py-4 border-b border-gray-100">
      <h1 className="text-xl font-semibold text-slate-800">Dashboard</h1> {/* ✅ 글자색 변경 */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-slate-600">Welcome, Admin</span> {/* ✅ 기존 gray → slate */}
        <img
          src="/logo.png"
          alt="User Avatar"
          className="w-8 h-8 rounded-full border border-gray-300"
        />
      </div>
    </header>
  );
}
