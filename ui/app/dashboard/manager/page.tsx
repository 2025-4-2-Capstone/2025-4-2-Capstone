"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function ManagerDashboard() {
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

  // ✅ .env에서 부서장용 대시보드 ID 불러오기
  const dashboardId = process.env.NEXT_PUBLIC_SUPERSET_DASHBOARD_MANAGER!;
  const supersetUrl = token
    ? `http://localhost:8088/superset/dashboard/p/${dashboardId}/?token=${token}`
    : null;

  // ✅ 로컬 예시 데이터 (부서별 티켓 지표)
  const teamData = [
    { name: "IT운영팀", 티켓수: 20, SLA지연: 3 },
    { name: "보안팀", 티켓수: 15, SLA지연: 1 },
    { name: "개발팀", 티켓수: 25, SLA지연: 4 },
  ];

  return (
    <div className="flex flex-col gap-8 min-h-screen bg-gray-50 px-8 py-6">
      {/* Header */}
      <header className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-slate-800">부서 대시보드</h2>
        <p className="text-slate-500">
          {username ? `${username}님, 부서별 티켓 및 SLA 현황을 확인하세요.` : "Loading..."}
        </p>
      </header>

      {/* ✅ Recharts 예시: 부서별 티켓 현황 */}
      <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow">
        <h3 className="text-lg font-semibold mb-4 text-slate-800">부서별 티켓 현황</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={teamData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="티켓수" fill="#4F46E5" radius={[6, 6, 0, 0]} />
            <Bar dataKey="SLA지연" fill="#10B981" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </section>

      {/* ✅ Superset 임베드 섹션 */}
      <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow">
        <h3 className="text-lg font-semibold mb-4 text-slate-800">SLA / 팀원 성과 대시보드</h3>

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
