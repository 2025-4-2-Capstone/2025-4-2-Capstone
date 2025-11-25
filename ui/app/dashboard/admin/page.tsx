"use client";

import { useEffect, useState } from "react";
import {
  LineChart, Line, BarChart, Bar,
  CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { GaugeChart } from "@/components/charts/GaugeChart";
import SupersetEmbed from "@/components/charts/SupersetEmbed";

export default function AdminDashboard() {
  const [username, setUsername] = useState("");

  useEffect(() => {
    const user = localStorage.getItem("username");
    if (user) setUsername(user);
  }, []);

  const slaData = [
    { name: "1월", 응답지연: 4, 해결지연: 2 },
    { name: "2월", 응답지연: 6, 해결지연: 4 },
    { name: "3월", 응답지연: 3, 해결지연: 5 },
    { name: "4월", 응답지연: 7, 해결지연: 6 },
  ];

  const statusData = [
    { name: "열림", value: 42 },
    { name: "진행중", value: 28 },
    { name: "해결됨", value: 15 },
    { name: "종료", value: 9 },
  ];

  return (
    <div className="flex flex-col gap-8 min-h-screen bg-gray-50 px-8 py-6">

      {/* Header */}
      <header className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-indigo-700">관리자 대시보드</h1>
        <p className="text-gray-600">
          {username ? `${username}님, 환영합니다 👋` : "Loading..."}
        </p>
      </header>

      {/* KPI Cards */}
      <section className="grid grid-cols-4 gap-6">
        <KpiCard title="전체 티켓 수" value="124" />
        <KpiCard title="응답 지연 건수" value="6" />
        <KpiCard title="해결 지연 건수" value="4" />
        <KpiCard title="SLA 위반 비율" value="12%" />
      </section>

      {/* 기존 Recharts 그래프 */}
      <section className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow p-6 border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 text-slate-800">
            SLA 응답·해결 지연 추이
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={slaData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="응답지연" stroke="#4F46E5" strokeWidth={2} />
              <Line type="monotone" dataKey="해결지연" stroke="#10B981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl shadow p-6 border border-gray-100 flex flex-col justify-between">
          <h3 className="text-lg font-semibold mb-4 text-slate-800">
            상태별 티켓 비율
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={statusData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#4F46E5" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* SLA 평균 시간 */}
      <section className="bg-white rounded-2xl shadow p-6 border border-gray-100 flex flex-col items-center">
        <h3 className="text-lg font-semibold mb-4 text-slate-800">평균 응답/해결 시간</h3>
        <div className="flex gap-10">
          <div className="flex flex-col items-center">
            <GaugeChart value={78} max={100} />
            <p className="mt-2 text-sm text-slate-600">응답 시간 달성률</p>
            <span className="text-slate-800 font-bold text-lg">78%</span>
          </div>
          <div className="flex flex-col items-center">
            <GaugeChart value={65} max={100} />
            <p className="mt-2 text-sm text-slate-600">해결 시간 달성률</p>
            <span className="text-slate-800 font-bold text-lg">65%</span>
          </div>
        </div>
      </section>

      {/* 🟦 Superset 대시보드 전체 임베드 */}
      <section className="bg-white rounded-2xl shadow p-6 border border-gray-100">
        <h3 className="text-lg font-semibold mb-4 text-slate-800">
          관리자용 Superset 대시보드
        </h3>
        
        {/* ⬇⬇ 여기 role 전달이 핵심! */}
        <SupersetEmbed role="admin" />
      </section>

    </div>
  );
}

function KpiCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow hover:shadow-md transition flex flex-col justify-center items-center">
      <p className="text-sm text-slate-600">{title}</p>
      <h2 className="text-2xl font-bold text-slate-800 mt-1">{value}</h2>
    </div>
  );
}
