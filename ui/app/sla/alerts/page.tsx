"use client";

import { useEffect, useState } from "react";

interface SlaAlert {
  alert_id: number;
  ticket_id: number;
  title: string;
  priority: string;
  status: string;
  alert_type: string;
  triggered_at: string;
  resolved: boolean;
}

export default function SlaAlertPage() {
  const [alerts, setAlerts] = useState<SlaAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  // ⭐ 우선순위 필터 (all / urgent / high / normal / low)
  const [filter, setFilter] = useState<
    "all" | "urgent" | "high" | "normal" | "low"
  >("all");

  // ⭐ 우선순위별 섹션 열기/닫기
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    urgent: true,
    high: true,
    normal: true,
    low: true,
  });

  const toggleSection = (priority: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [priority]: !prev[priority],
    }));
  };

  const fetchAlerts = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sla-alerts`, {
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch SLA alerts");

      const data = await res.json();
      setAlerts(data);
    } catch (err) {
      setError("SLA 알림을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // ⭐ Resolve
  const resolveAlert = async (alertId: number) => {
    try {
      setActionLoading(alertId);

      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/sla-alerts/${alertId}/resolve`,
        {
          method: "PUT",
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed");

      setAlerts((prev) =>
        prev.map((a) =>
          a.alert_id === alertId ? { ...a, resolved: true } : a
        )
      );
    } catch {
      alert("해결 처리 실패했습니다.");
    } finally {
      setActionLoading(null);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  // ⭐ 필터 적용
  const filteredAlerts =
    filter === "all"
      ? alerts
      : alerts.filter((a) => a.priority.toLowerCase() === filter);

  // ⭐ 우선순위 그룹핑
  const priorityOrder = ["urgent", "high", "normal", "low"];

  const groupedAlerts = priorityOrder.map((p) => ({
    priority: p,
    items: filteredAlerts.filter((a) => a.priority.toLowerCase() === p),
  }));

  // ⭐ 우선순위 표시 스타일 (● + 색상 + 라벨)
  const PRIORITY_LABEL: Record<
    string,
    { text: string; dotColor: string }
  > = {
    urgent: {
      text: "URGENT (30초 SLA)",
      dotColor: "text-red-500",
    },
    high: {
      text: "HIGH (응답 3일 · 해결 14일)",
      dotColor: "text-orange-500",
    },
    normal: {
      text: "NORMAL (응답 5일 · 해결 21일)",
      dotColor: "text-yellow-500",
    },
    low: {
      text: "LOW (응답 7일 · 해결 30일)",
      dotColor: "text-green-600",
    },
  };

  // ⭐ 상태 색상
  const getStatusBadge = (status: string) => {
    const styles: any = {
      open: "bg-red-100 text-red-700",
      in_progress: "bg-yellow-100 text-yellow-700",
      resolved: "bg-green-100 text-green-700",
      closed: "bg-gray-200 text-gray-700",
    };
    return styles[status] || "bg-gray-100 text-gray-700";
  };

  const getAlertTypeBadge = (type: string) => {
    const styles: any = {
      response_delay: "bg-indigo-100 text-indigo-700",
      resolution_delay: "bg-purple-100 text-purple-700",
    };
    return styles[type] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="p-8">

      {/* ⭐ 필터 버튼 */}
      <div className="flex gap-2 mb-6">
        {["all", "urgent", "high", "normal", "low"].map((p) => (
          <button
            key={p}
            onClick={() => setFilter(p as any)}
            className={`px-4 py-2 rounded-md text-sm font-medium border 
              ${
                filter === p
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
          >
            {p.toUpperCase()}
          </button>
        ))}
      </div>

      <h1 className="text-3xl font-bold mb-6 text-gray-800">SLA Alerts</h1>

      {loading && <p>불러오는 중...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* ⭐ 우선순위별 그룹 */}
      {groupedAlerts.map((group) => (
        <div key={group.priority} className="mb-10">

          {/* 제목 + 색상 도트 + 개수 + 토글 */}
          <div
            className="flex items-center justify-between cursor-pointer mb-3"
            onClick={() => toggleSection(group.priority)}
          >
            <h2 className="text-2xl font-semibold text-gray-700 flex items-center gap-2">
              <span className={`${PRIORITY_LABEL[group.priority].dotColor}`}>
                ●
              </span>
              {PRIORITY_LABEL[group.priority].text}
              <span className="text-indigo-600 ml-2 text-lg">
                ({group.items.length}건)
              </span>
            </h2>

            <span className="text-gray-500">
              {openSections[group.priority] ? "▲" : "▼"}
            </span>
          </div>

          {/* 닫혀있으면 skip */}
          {!openSections[group.priority] && <div></div>}

          {/* 열려있으면 카드 표시 */}
          {openSections[group.priority] && (
            <div className="grid grid-cols-1 gap-4">
              {group.items.length === 0 && (
                <p className="text-gray-400 text-sm ml-1">
                  해당 우선순위 경고가 없습니다.
                </p>
              )}

              {group.items.map((alert) => (
                <div
                  key={alert.alert_id}
                  className={`border rounded-lg p-5 shadow-sm bg-white hover:shadow-md transition ${
                    alert.priority.toLowerCase() === "urgent"
                      ? "border-red-400"
                      : ""
                  }`}
                >
                  {/* 헤더 */}
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-800">
                      #{alert.ticket_id} — {alert.title}
                    </h2>

                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(
                        alert.status
                      )}`}
                    >
                      {alert.status}
                    </span>
                  </div>

                  {/* 내용 */}
                  <div className="mt-3 text-sm text-gray-600 space-y-1">
                    <p>
                      <strong>Priority:</strong> {alert.priority}
                    </p>
                    <p>
                      <strong>Alert Type:</strong>{" "}
                      <span
                        className={`px-2 py-1 rounded text-sm font-medium ${getAlertTypeBadge(
                          alert.alert_type
                        )}`}
                      >
                        {alert.alert_type}
                      </span>
                    </p>
                    <p>
                      <strong>Triggered at:</strong>{" "}
                      {new Date(alert.triggered_at).toLocaleString()}
                    </p>
                  </div>

                  {/* 버튼 */}
                  <div className="mt-4 flex items-center justify-between">
                    {alert.resolved ? (
                      <span className="text-green-600 font-semibold">
                        ✔ Resolved
                      </span>
                    ) : (
                      <button
                        onClick={() => resolveAlert(alert.alert_id)}
                        disabled={actionLoading === alert.alert_id}
                        className={`px-4 py-2 rounded-md text-white font-medium transition 
                          ${
                            actionLoading === alert.alert_id
                              ? "bg-gray-400 cursor-not-allowed"
                              : "bg-indigo-600 hover:bg-indigo-700"
                          }`}
                      >
                        {actionLoading === alert.alert_id
                          ? "Processing..."
                          : "Resolve"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
