"use client";

import { updateTicketStatus, assignTicket } from "@/lib/api/tickets";
import { useState, useEffect } from "react";

export default function TicketActionBar({ ticketId }: { ticketId: string }) {
  const id = Number(ticketId);
  const [role, setRole] = useState<string>("");

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    if (storedRole) setRole(storedRole);
  }, []);

  return (
    <div className="bg-white p-6 rounded-xl shadow space-y-4">
      <h2 className="text-lg font-semibold">티켓 처리</h2>

      <div className="flex flex-wrap gap-3">

        {/* ============================
            엔지니어 이상 (engineer, manager, admin, super_admin)
        ============================= */}
        {(role === "engineer" ||
          role === "manager" ||
          role === "admin" ||
          role === "super_admin") && (
          <>
            <button
              onClick={() => updateTicketStatus(id, "in_progress")}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
              처리 시작
            </button>

            <button
              onClick={() => updateTicketStatus(id, "pending")}
              className="px-4 py-2 bg-yellow-500 text-white rounded-lg"
            >
              보류
            </button>

            <button
              onClick={() => updateTicketStatus(id, "resolved")}
              className="px-4 py-2 bg-green-600 text-white rounded-lg"
            >
              해결
            </button>
          </>
        )}

        {/* ============================
            관리자 이상 (admin, super_admin)
        ============================= */}
        {(role === "admin" || role === "super_admin") && (
          <button
            onClick={() => updateTicketStatus(id, "closed")}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg"
          >
            닫기
          </button>
        )}

        {/* ============================
            매니저 이상 (manager, admin, super_admin)
        ============================= */}
        {(role === "manager" ||
          role === "admin" ||
          role === "super_admin") && (
          <button
            onClick={() => assignTicket(id, "engineer1")}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg"
          >
            담당자 할당
          </button>
        )}

        {/* ============================
            user (일반 사용자) — 아무 기능 없음
        ============================= */}
        {role === "user" && (
          <p className="text-gray-500 text-sm">댓글만 입력할 수 있습니다.</p>
        )}
      </div>
    </div>
  );
}
