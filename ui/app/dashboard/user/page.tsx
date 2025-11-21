"use client";

import { useEffect, useState } from "react";

export default function UserDashboard() {
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

  // ✅ .env에서 사용자용 대시보드 ID 불러오기
  const dashboardId = process.env.NEXT_PUBLIC_SUPERSET_DASHBOARD_USER!;
  const supersetUrl = token
    ? `http://localhost:8088/superset/dashboard/p/${dashboardId}/?token=${token}`
    : null;

  return (
    <div className="flex flex-col gap-8 min-h-screen bg-gray-50 px-8 py-6">
      {/* Header */}
      <header className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-slate-800">내 티켓 대시보드</h2>
        <p className="text-slate-500">
          {username ? `${username}님, 진행 중인 요청을 확인하세요.` : "Loading..."}
        </p>
      </header>

      {/* ✅ 예시: 진행중인 티켓 목록 */}
      <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow">
        <h3 className="text-lg font-semibold mb-4 text-slate-800">진행중인 티켓 (예시)</h3>
        <ul className="list-disc ml-5 text-sm text-slate-600 space-y-1">
          <li>네트워크 오류 해결 요청 - 대기중</li>
          <li>VPN 접속 요청 - 승인중</li>
        </ul>
      </section>

      {/* ✅ Superset 임베드 섹션 */}
      <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow">
        <h3 className="text-lg font-semibold mb-4 text-slate-800">내 요청 현황 (Superset)</h3>

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
    </div>
  );
}
