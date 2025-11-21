"use client";

import { useEffect, useState } from "react";

export default function AuditorDashboard() {
  const [username, setUsername] = useState("");
  useEffect(() => {
    const user = localStorage.getItem("username");
    if (user) setUsername(user);
  }, []);

  return (
    <div className="flex flex-col gap-8">
      <h2 className="text-2xl font-semibold text-slate-800">감사 대시보드</h2>
      <p className="text-slate-500">
        {username}님, 감사 로그 및 SLA 위반 내역을 검토하세요.
      </p>

      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow">
        <h3 className="text-lg font-semibold mb-3 text-slate-800">
          감사 로그 요약 (예시)
        </h3>
        <table className="w-full text-sm text-left text-slate-600 border-t border-gray-200">
          <thead>
            <tr className="text-slate-800">
              <th className="py-2">시간</th>
              <th>사용자</th>
              <th>행동</th>
              <th>대상</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-gray-100">
              <td className="py-2">2025-11-21 14:22</td>
              <td>adminA</td>
              <td>티켓 삭제</td>
              <td>#1042</td>
            </tr>
            <tr className="border-t border-gray-100">
              <td className="py-2">2025-11-21 13:45</td>
              <td>engineerA</td>
              <td>로그인</td>
              <td>시스템</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
