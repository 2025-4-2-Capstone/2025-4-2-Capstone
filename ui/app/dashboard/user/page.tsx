"use client";

import { useEffect, useState } from "react";

export default function UserDashboard() {
  const [username, setUsername] = useState("");
  useEffect(() => {
    const user = localStorage.getItem("username");
    if (user) setUsername(user);
  }, []);

  return (
    <div className="flex flex-col gap-8">
      <h2 className="text-2xl font-semibold text-slate-800">내 티켓 대시보드</h2>
      <p className="text-slate-500">{username}님, 진행 중인 요청을 확인하세요.</p>

      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow">
        <h3 className="text-lg font-semibold mb-4 text-slate-800">진행중인 티켓 (예시)</h3>
        <ul className="list-disc ml-5 text-sm text-slate-600 space-y-1">
          <li>네트워크 오류 해결 요청 - 대기중</li>
          <li>VPN 접속 요청 - 승인중</li>
        </ul>
      </div>
    </div>
  );
}
