"use client";

import { useEffect, useState } from "react";
import axios from "axios";

/* ----------------------------
    Axios 인스턴스
----------------------------- */
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* ----------------------------
    API 함수
----------------------------- */

const apiGetTickets = async () => {
  const res = await api.get("/tickets");
  return res.data;
};

const apiCreateTicket = async (data) => {
  const res = await api.post("/tickets", data);
  return res.data;
};

const apiUpdateTicket = async (ticketId, data) => {
  const res = await api.put(`/tickets/${ticketId}`, data);
  return res.data;
};

const apiGetHistory = async () => {
  return [
    { id: 1, message: "상태 변경됨", created_at: "2025-11-28 10:21" },
    { id: 2, message: "우선순위 변경됨", created_at: "2025-11-28 11:10" },
  ];
};

/* ----------------------------
    부서 / SLA / 배지
----------------------------- */

const deptMap = {
  1: "IT운영부",
  2: "보안감사부",
  3: "고객지원부",
  4: "관리지원부",
  5: "인사·교육부",
  6: "재무·회계부",
  7: "경영기획부",
};

const getSLA = (p) =>
  p === "urgent"
    ? { response: "30초", resolve: "30초" }
    : p === "high"
    ? { response: "3일", resolve: "14일" }
    : p === "normal"
    ? { response: "5일", resolve: "21일" }
    : { response: "7일", resolve: "30일" };

const priorityBadge = {
  urgent: "bg-red-500 text-white",
  high: "bg-orange-500 text-white",
  normal: "bg-yellow-400 text-black",
  low: "bg-green-600 text-white",
};

const statusBadge = {
  open: "bg-gray-500 text-white",
  in_progress: "bg-blue-500 text-white",
  resolved: "bg-green-600 text-white",
  closed: "bg-black text-white",
};

/* ----------------------------
    페이지
----------------------------- */

export default function TicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  const [newModal, setNewModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newPriority, setNewPriority] = useState("normal");
  const [newDescription, setNewDescription] = useState("");

  const [creating, setCreating] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});

  const [logModal, setLogModal] = useState(false);
  const [logs, setLogs] = useState([]);

  const [newTicketId, setNewTicketId] = useState(null);
  const [updatedTicketId, setUpdatedTicketId] = useState(null);

  const loadTickets = async () => {
    setLoading(true);
    const data = await apiGetTickets();
    setTickets(data);
    setLoading(false);
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const handleCreate = async () => {
    if (!newTitle.trim() || !newDescription.trim()) return;

    setCreating(true);
    try {
      const created = await apiCreateTicket({
        title: newTitle,
        description: newDescription,
        priority: newPriority,
      });

      setNewTicketId(created.id);
      setTimeout(() => setNewTicketId(null), 30000);

      setNewModal(false);
      setNewTitle("");
      setNewDescription("");
      setNewPriority("normal");

      loadTickets();
    } finally {
      setCreating(false);
    }
  };

  const startEdit = () => {
    setEditMode(true);
    setEditData({
      title: selected.title,
      description: selected.description,
      priority: selected.priority,
      status: selected.status,
    });
  };

  const saveEdit = async () => {
    await apiUpdateTicket(selected.id, editData);

    setUpdatedTicketId(selected.id);
    setTimeout(() => setUpdatedTicketId(null), 30000);

    setSelected({ ...selected, ...editData });
    setEditMode(false);
  };

  if (loading) return <div className="p-8">로딩 중...</div>;

  return (
    <div className="p-10 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-semibold">티켓 목록</h1>
        <button
          onClick={() => setNewModal(true)}
          className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          + 새 티켓
        </button>
      </div>

      {/* LIST */}
      <div className="bg-white p-6 rounded-xl shadow border">
        <table className="w-full">
          <thead className="border-b">
            <tr>
              <th className="py-3 text-center">#</th>
              <th className="text-center">제목</th>
              <th className="text-center">우선순위</th>
              <th className="text-center">상태</th>
              <th className="text-center">작성일</th>
            </tr>
          </thead>

          <tbody>
            {tickets.map((t) => (
              <tr
                key={t.id}
                className={`border-b cursor-pointer hover:bg-gray-100 transition ${
                  newTicketId === t.id ? "border-green-500 bg-green-50" : ""
                } ${updatedTicketId === t.id ? "border-blue-500 bg-blue-50" : ""}`}
                onClick={() => {
                  setSelected(t);
                  setEditMode(false);
                }}
              >
                <td className="py-3 text-center">#{t.id}</td>

                {/* 제목 가운데 정렬 수정 */}
                <td className="font-medium text-center">
                  <div className="inline-flex items-center gap-2">
                    {newTicketId === t.id && (
                      <span className="px-2 py-1 text-xs bg-green-600 text-white rounded-md">
                        NEW
                      </span>
                    )}

                    {updatedTicketId === t.id && (
                      <span className="px-2 py-1 text-xs bg-blue-600 text-white rounded-md">
                        UPDATED
                      </span>
                    )}

                    {t.title}
                  </div>
                </td>

                <td className="text-center">
                  <span
                    className={`${priorityBadge[t.priority]} px-3 py-1 rounded-full text-sm font-semibold`}
                  >
                    {t.priority.toUpperCase()}
                  </span>
                </td>

                <td className="text-center">
                  <span
                    className={`${statusBadge[t.status]} px-3 py-1 rounded-full text-sm font-semibold`}
                  >
                    {t.status}
                  </span>
                </td>

                <td className="text-center">
                  {new Date(t.created_at).toLocaleString("ko-KR")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* NEW MODAL */}
      {newModal && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm z-50"
          onClick={() => setNewModal(false)}
        >
          <div
            className="bg-white w-[550px] p-8 rounded-2xl shadow-xl border"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-5">새 티켓 생성</h2>

            <div className="space-y-1 mb-4">
              <label className="font-semibold text-sm">제목 *</label>
              <input
                className="w-full px-4 py-3 border rounded-xl font-semibold"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
            </div>

            <div className="space-y-1 mb-4">
              <label className="font-semibold text-sm">우선순위</label>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value)}
                className="w-full px-4 py-3 border rounded-xl font-semibold"
              >
                <option value="low">낮음</option>
                <option value="normal">보통</option>
                <option value="high">높음</option>
                <option value="urgent">긴급</option>
              </select>
            </div>

            <div className="space-y-1 mb-6">
              <label className="font-semibold text-sm">내용 *</label>
              <textarea
                rows={5}
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="w-full px-4 py-3 border rounded-xl font-semibold"
              />
            </div>

            <button
              onClick={handleCreate}
              disabled={creating}
              className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700"
            >
              {creating ? "생성 중..." : "티켓 생성"}
            </button>

            <button
              onClick={() => setNewModal(false)}
              className="w-full mt-3 py-3 bg-gray-300 rounded-xl font-semibold"
            >
              취소
            </button>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm z-50"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white w-[600px] p-8 rounded-2xl shadow-xl border"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">
                #{selected.id} — {selected.title}
              </h2>

              {!editMode && (
                <button onClick={startEdit} className="text-indigo-600 font-semibold">
                  ✏ 수정
                </button>
              )}
            </div>

            {editMode ? (
              <div className="space-y-5">
                <div>
                  <label className="font-semibold text-sm">제목</label>
                  <input
                    value={editData.title}
                    onChange={(e) =>
                      setEditData({ ...editData, title: e.target.value })
                    }
                    className="w-full px-4 py-3 border rounded-xl font-semibold"
                  />
                </div>

                <div>
                  <label className="font-semibold text-sm">우선순위</label>
                  <select
                    value={editData.priority}
                    onChange={(e) =>
                      setEditData({ ...editData, priority: e.target.value })
                    }
                    className="w-full px-4 py-3 border rounded-xl font-semibold"
                  >
                    <option value="urgent">긴급</option>
                    <option value="high">높음</option>
                    <option value="normal">보통</option>
                    <option value="low">낮음</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-sm">상태</label>
                  <select
                    value={editData.status}
                    onChange={(e) =>
                      setEditData({ ...editData, status: e.target.value })
                    }
                    className="w-full px-4 py-3 border rounded-xl font-semibold"
                  >
                    <option value="open">열림</option>
                    <option value="in_progress">진행중</option>
                    <option value="resolved">해결됨</option>
                    <option value="closed">종료</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-sm">내용</label>
                  <textarea
                    rows={5}
                    value={editData.description}
                    onChange={(e) =>
                      setEditData({ ...editData, description: e.target.value })
                    }
                    className="w-full px-4 py-3 border rounded-xl font-semibold"
                  />
                </div>

                <button
                  onClick={saveEdit}
                  className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold"
                >
                  저장
                </button>

                <button
                  onClick={() => setEditMode(false)}
                  className="w-full py-3 bg-gray-300 rounded-xl font-semibold"
                >
                  취소
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p>
                  <b>상태:</b>{" "}
                  <span
                    className={`${statusBadge[selected.status]} px-3 py-1 rounded-full text-sm font-semibold`}
                  >
                    {selected.status}
                  </span>
                </p>

                <p>
                  <b>우선순위:</b>{" "}
                  <span
                    className={`${priorityBadge[selected.priority]} px-3 py-1 rounded-full text-sm font-semibold`}
                  >
                    {selected.priority.toUpperCase()}
                  </span>
                </p>

                {(() => {
                  const sla = getSLA(selected.priority);
                  return (
                    <>
                      <p>
                        <b>SLA 응답:</b> {sla.response}
                      </p>
                      <p>
                        <b>SLA 해결:</b> {sla.resolve}
                      </p>
                    </>
                  );
                })()}

                <p>
                  <b>부서:</b> {deptMap[selected.department_id]}
                </p>

                <p>
                  <b>작성일:</b>{" "}
                  {new Date(selected.created_at).toLocaleString("ko-KR")}
                </p>

                <div>
                  <b>내용:</b>
                  <div className="p-4 bg-gray-50 rounded-xl mt-2">
                    {selected.description}
                  </div>
                </div>

                <button
                  onClick={async () => {
                    const data = await apiGetHistory();
                    setLogs(data);
                    setLogModal(true);
                  }}
                  className="mt-4 text-indigo-600 underline font-semibold"
                >
                  변경 이력 보기
                </button>

                <button
                  onClick={() => setSelected(null)}
                  className="w-full mt-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold"
                >
                  닫기
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* LOG MODAL */}
      {logModal && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center"
          onClick={() => setLogModal(false)}
        >
          <div
            className="bg-white w-[400px] p-6 rounded-xl shadow-xl border"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold mb-4">변경 이력</h2>

            <div className="space-y-3">
              {logs.map((log) => (
                <div key={log.id} className="bg-gray-50 p-3 border rounded-lg">
                  <p className="text-sm">{log.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{log.created_at}</p>
                </div>
              ))}
            </div>

            <button
              onClick={() => setLogModal(false)}
              className="w-full mt-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold"
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
