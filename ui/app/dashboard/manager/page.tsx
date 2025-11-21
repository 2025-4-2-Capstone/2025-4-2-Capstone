"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function ManagerDashboard() {
  const [username, setUsername] = useState("");
  useEffect(() => {
    const user = localStorage.getItem("username");
    if (user) setUsername(user);
  }, []);

  const teamData = [
    { name: "IT운영팀", 티켓수: 20, SLA지연: 3 },
    { name: "보안팀", 티켓수: 15, SLA지연: 1 },
    { name: "개발팀", 티켓수: 25, SLA지연: 4 },
  ];

  return (
    <div className="flex flex-col gap-8">
      <h2 className="text-2xl font-semibold text-slate-800">부서 대시보드</h2>
      <p className="text-slate-500">
        {username}님, 부서별 티켓 현황을 확인하세요.
      </p>

      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow">
        <h3 className="text-lg font-semibold mb-4">부서별 티켓 현황</h3>
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
      </div>
    </div>
  );
}
