"use client";

import { useEffect, useState } from "react";
import axios from "axios";

// ==============================
// Type
// ==============================
interface PendingUser {
  id: number;
  username: string;
  email: string;
  created_at: string;
}

// ==============================
// Component
// ==============================
export default function PendingUsersPage() {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedRole, setSelectedRole] = useState<Record<number, number>>({});
  const [selectedDept, setSelectedDept] = useState<Record<number, number>>({});

  const [modalOpen, setModalOpen] = useState(false);
  const [targetUserId, setTargetUserId] = useState<number | null>(null);

  const [processing, setProcessing] = useState(false);
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // ==============================
  // Role / Department Lists
  // ==============================
  const roles = [
    { id: 1, name: "Super Admin" },
    { id: 2, name: "Admin" },
    { id: 3, name: "Manager" },
    { id: 4, name: "Engineer" },
    { id: 5, name: "Support" },
    { id: 6, name: "Staff" },
    { id: 7, name: "User" },
    { id: 8, name: "Auditor" },
  ];

  const departments = [
    { id: 1, name: "IT운영부" },
    { id: 2, name: "보안감사부" },
    { id: 3, name: "고객지원부" },
    { id: 4, name: "관리지원부" },
    { id: 5, name: "인사·교육부" },
    { id: 6, name: "재무·회계부" },
    { id: 7, name: "경영기획부" },
  ];

  // ==============================
  // Fetch Pending Users (GET)
  // ==============================
  const fetchPendingUsers = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/pending-users`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setPendingUsers(res.data);
    } catch (err) {
      console.error("❌ 대기 사용자 조회 실패:", err);
    } finally {
      setLoading(false);
    }
  };

  // ==============================
  // Approve User
  // ==============================
  const approveUser = async () => {
    if (!targetUserId) return;
    const userId = targetUserId;

    try {
      setProcessing(true);

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/approve-user/${userId}`,
        {
          role_id: selectedRole[userId],
          department_id: selectedDept[userId],
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // 승인 완료 → UI에서 제거
      setPendingUsers((prev) => prev.filter((u) => u.id !== userId));
      setModalOpen(false);
    } catch (err) {
      console.error("❌ 승인 실패:", err);
      alert("승인 처리 실패했습니다.");
    } finally {
      setProcessing(false);
    }
  };

  // ==============================
  // Load on Start
  // ==============================
  useEffect(() => {
    fetchPendingUsers();
  }, []);

  // ==============================
  // UI
  // ==============================
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-800 tracking-tight">
        승인 대기 사용자
      </h1>

      {loading && <p className="text-gray-700 font-medium">불러오는 중...</p>}

      {!loading && pendingUsers.length === 0 && (
        <p className="text-gray-700 font-semibold">
          승인 대기 중인 사용자가 없습니다.
        </p>
      )}

      {/* User List */}
      <div className="space-y-4 mt-4">
        {pendingUsers.map((user) => (
          <div
            key={user.id}
            className="border rounded-lg p-5 bg-white shadow transition hover:shadow-lg hover:-translate-y-[2px]"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-lg font-semibold text-gray-800">{user.username}</p>
                <p className="text-gray-700 text-sm">{user.email}</p>
                <p className="text-gray-600 text-xs mt-1">
                  가입일: {new Date(user.created_at).toLocaleString()}
                </p>
              </div>

              {/* Role + Dept + Button */}
              <div className="flex gap-4 items-center">
                {/* Role */}
                <select
                  className="border px-3 py-2 rounded-md text-gray-800 hover:border-indigo-500 focus:ring-2 focus:ring-indigo-300 transition"
                  value={selectedRole[user.id] || ""}
                  onChange={(e) =>
                    setSelectedRole((prev) => ({
                      ...prev,
                      [user.id]: Number(e.target.value),
                    }))
                  }
                >
                  <option value="">역할 선택</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>

                {/* Department */}
                <select
                  className="border px-3 py-2 rounded-md text-gray-800 hover:border-indigo-500 focus:ring-2 focus:ring-indigo-300 transition"
                  value={selectedDept[user.id] || ""}
                  onChange={(e) =>
                    setSelectedDept((prev) => ({
                      ...prev,
                      [user.id]: Number(e.target.value),
                    }))
                  }
                >
                  <option value="">부서 선택</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>

                {/* Approve Button */}
                <button
                  disabled={!selectedRole[user.id] || !selectedDept[user.id]}
                  onClick={() => {
                    setTargetUserId(user.id);
                    setModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-md text-white font-medium bg-indigo-600 hover:bg-indigo-700 transition"
                >
                  승인하기
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ============================== */}
      {/*   Confirm Modal               */}
      {/* ============================== */}
      {modalOpen && targetUserId !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white w-[380px] rounded-lg shadow-xl p-6 animate-fade-in">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              사용자 승인 확인
            </h2>

            <p className="text-gray-700 mb-6">
              이 사용자를 승인하시겠습니까?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition"
              >
                취소
              </button>

              <button
                onClick={approveUser}
                className="px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition"
                disabled={processing}
              >
                {processing ? "승인 중..." : "승인하기"}
              </button>
            </div>
          </div>

          {/* Fade animation */}
          <style>{`
            .animate-fade-in {
              animation: fadeIn 0.25s ease-out;
            }
            @keyframes fadeIn {
              from { opacity: 0; transform: scale(0.95); }
              to { opacity: 1; transform: scale(1); }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
