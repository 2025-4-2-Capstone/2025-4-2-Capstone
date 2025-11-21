"use client";

import { useEffect, useState } from "react";

export default function AuditorDashboard() {
  const [username, setUsername] = useState("");
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const user = localStorage.getItem("username");
    const role = localStorage.getItem("role");
    if (user) setUsername(user);

    // ✅ Superset JWT 토큰 요청
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/superset/token?role=${role}`)
      .then((res) => res.json())
      .then((data) => setToken(data.token))
      .catch((err) => console.error("Superset JWT 요청 실패:", err));
  }, []);

  const dashboardId = process.env.NEXT_PUBLIC_SUPERSET_DASHBOARD_AUDITOR!; // ✅ .env로 분리
  const supersetUrl = token
    ? `http://localhost:8088/superset/dashboard/p/${dashboardId}/?token=${token}`
    : null;

  return (
    <div className="flex flex-col gap-8 min-h-screen bg-gray-50 px-8 py-6">
      {/* 헤더 */}
      <header className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-slate-800">감사 대시보드</h2>
        <p className="text-slate-500">
          {username ? `${username}님, 감사 로그 및 SLA 위반 내역을 검토하세요.` : "Loading..."}
        </p>
      </header>

      {/* ✅ Superset 임베드 영역 */}
      <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow">
        <h3 className="text-lg font-semibold mb-4 text-slate-800">
          Superset 감사 로그 대시보드
        </h3>

        {!token ? (
          <div className="flex justify-center items-center h-[600px] text-slate-500">
            대시보드를 불러오는 중...
          </div>
        ) : (
          <iframe
            src={supersetUrl!}
            width="100%"
            height="800"
            className="rounded-lg border border-gray-200 shadow"
          />
        )}
      </section>

      {/* ✅ 예시 테이블 (Superset 외 보조용) */}
      <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow">
        <h3 className="text-lg font-semibold mb-3 text-slate-800">최근 감사 이벤트 (예시)</h3>
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
      </section>
    </div>
  );
}
