"use client";

import { useEffect, useState } from "react";

export default function EngineerDashboard() {
  const [username, setUsername] = useState("");
  useEffect(() => {
    const user = localStorage.getItem("username");
    if (user) setUsername(user);
  }, []);

  return (
    <div className="flex flex-col gap-8">
      <h2 className="text-2xl font-semibold text-slate-800">엔지니어 대시보드</h2>
      <p className="text-slate-500">
        {username}님, 담당 티켓 및 SLA 경고를 확인하세요.
      </p>

      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow">
        <h3 className="text-lg font-semibold mb-4 text-slate-800">내 티켓 목록 (예시)</h3>
        <ul className="text-sm text-slate-600 list-disc ml-5 space-y-1">
          <li>[#1024] 서버 점검 요청 - 진행중</li>
          <li>[#1030] 네트워크 오류 수정 - 대기중</li>
          <li>[#1034] DB 백업 - 완료</li>
        </ul>
      </div>
    </div>
  );
}
