"use client";

import { useEffect, useState } from "react";
import axios from "axios";

interface AuditLog {
  id: number;
  user_id: number | null;
  action: string;
  target_table: string;
  target_id: number | null;
  details: string | null;
  changed_fields: any | null;
  ip_address: string | null;
  user_agent: string | null;
  target_department_id: number | null;
  timestamp: string;
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filtered, setFiltered] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  // 검색/필터 상태
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");
  const [tableFilter, setTableFilter] = useState("ALL");

  const fetchLogs = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/audit-logs`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setLogs(res.data);
      setFiltered(res.data);
    } catch (err) {
      console.error("불러오기 실패:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // ⭐ 필터 + 검색 적용
  useEffect(() => {
    let data = [...logs];

    if (actionFilter !== "ALL") {
      data = data.filter(
        (l) => l.action.toLowerCase() === actionFilter.toLowerCase()
      );
    }

    if (tableFilter !== "ALL") {
      data = data.filter(
        (l) => l.target_table.toLowerCase() === tableFilter.toLowerCase()
      );
    }

    if (search.trim() !== "") {
      const q = search.toLowerCase();
      data = data.filter(
        (l) =>
          l.details?.toLowerCase().includes(q) ||
          l.action.toLowerCase().includes(q) ||
          l.target_table.toLowerCase().includes(q) ||
          String(l.target_id).includes(q)
      );
    }

    setFiltered(data);
  }, [search, actionFilter, tableFilter, logs]);

  // ⭐ 액션 색상
  const actionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case "login":
        return "text-blue-600";
      case "create":
      case "insert":
        return "text-green-600";
      case "update":
        return "text-yellow-600";
      default:
        return "text-gray-800";
    }
  };

  return (
    <div className="p-8">

      <h1 className="text-3xl font-bold text-gray-800 mb-6">감사 로그</h1>

      {/* 검색 및 필터 영역 */}
      <div className="flex flex-wrap items-center gap-3 mb-6">

        {/* 검색 */}
        <input
          type="text"
          placeholder="검색 (액션 / 테이블 / 내용 / ID)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-4 py-2 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-300 text-gray-800 w-72"
        />

        {/* 액션 필터 */}
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="border px-3 py-2 rounded-md text-gray-800"
        >
          <option value="ALL">전체 액션</option>
          <option value="login">login</option>
          <option value="create">create</option>
          <option value="update">update</option>
          <option value="insert">insert</option>
        </select>

        {/* 테이블 필터 */}
        <select
          value={tableFilter}
          onChange={(e) => setTableFilter(e.target.value)}
          className="border px-3 py-2 rounded-md text-gray-800"
        >
          <option value="ALL">전체 테이블</option>
          <option value="users">users</option>
          <option value="tickets">tickets</option>
        </select>
      </div>

      {/* 로딩 */}
      {loading && <p className="text-gray-600">불러오는 중...</p>}

      {/* 결과 없음 */}
      {!loading && filtered.length === 0 && (
        <p className="text-gray-600">검색 결과가 없습니다.</p>
      )}

      {/* 로그 목록 */}
      <div className="space-y-4">
        {filtered.map((log) => (
          <div
            key={log.id}
            className="p-5 bg-white rounded-lg border shadow hover:shadow-md hover:-translate-y-[2px] transition"
          >
            {/* 헤더 */}
            <div className="flex justify-between mb-2">

              <h2 className={`text-lg font-semibold ${actionColor(log.action)}`}>
                {log.action.toUpperCase()} — {log.target_table} #{log.target_id}
              </h2>

              <span className="text-sm text-gray-500">
                {new Date(log.timestamp).toLocaleString()}
              </span>
            </div>

            {/* 디테일 */}
            <p className="text-gray-700 mb-2">
              <strong>Details:</strong> {log.details || "—"}
            </p>

            {/* IP / User Agent */}
            <div className="text-gray-600 text-sm space-y-1">
              <p><strong>IP:</strong> {log.ip_address || "N/A"}</p>
              <p>
                <strong>User Agent:</strong>{" "}
                {log.user_agent
                  ? log.user_agent.length > 80
                    ? log.user_agent.slice(0, 80) + "..."
                    : log.user_agent
                  : "N/A"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
