"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  getTicketById,
  updateTicketStatus,
  assignTicket,
  addComment,
} from "@/lib/api/tickets";

export default function TicketDetailPage() {
  const params = useParams();
  const id = String(params.ticket_id);

  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");

  // 티켓 로드
  const loadTicket = async () => {
    try {
      setLoading(true);
      const data = await getTicketById(id);
      setTicket(data);
    } catch (err) {
      console.error("티켓 로드 실패:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadTicket();
  }, [id]);

  if (loading) return <div className="p-6">로딩 중...</div>;
  if (!ticket) return <div className="p-6 text-red-500">티켓을 찾을 수 없습니다.</div>;

  // 상태 변경
  const handleStatusChange = async (newStatus: string) => {
    await updateTicketStatus(Number(id), newStatus);
    loadTicket();
  };

  // 담당자 변경
  const handleAssign = async (newAssignee: string) => {
    await assignTicket(Number(id), newAssignee);
    loadTicket();
  };

  // 댓글 추가
  const handleAddComment = async () => {
    if (!comment.trim()) return;
    await addComment(Number(id), comment);
    setComment("");
    loadTicket();
  };

  return (
    <div className="p-8 min-h-screen bg-gray-50 space-y-8">

      {/* 제목 */}
      <h1 className="text-3xl font-semibold text-gray-900">{ticket.title}</h1>

      {/* 상세 정보 카드 */}
      <div className="bg-white p-6 rounded-xl shadow border border-gray-200 space-y-3">
        <p className="text-gray-800"><b className="text-gray-900">상태:</b> {ticket.status}</p>
        <p className="text-gray-800"><b className="text-gray-900">우선순위:</b> {ticket.priority}</p>
        <p className="text-gray-800"><b className="text-gray-900">담당자:</b> {ticket.assignee_name ?? "-"}</p>
        <p className="text-gray-800"><b className="text-gray-900">부서:</b> {ticket.department_name ?? "-"}</p>
        <p className="text-gray-800">
          <b className="text-gray-900">작성일:</b>{" "}
          {new Date(ticket.created_at).toLocaleString("ko-KR")}
        </p>
      </div>

      {/* 상태 변경 */}
      <div className="bg-white p-6 rounded-xl shadow border border-gray-200 space-y-2">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">상태 변경</h2>
        <select
          className="border rounded-lg px-4 py-2 text-gray-800 shadow-sm focus:ring-2 focus:ring-indigo-400"
          value={ticket.status}
          onChange={(e) => handleStatusChange(e.target.value)}
        >
          <option value="open">열림</option>
          <option value="in_progress">진행중</option>
          <option value="resolved">해결됨</option>
          <option value="closed">종료</option>
        </select>
      </div>

      {/* 담당자 지정 */}
      <div className="bg-white p-6 rounded-xl shadow border border-gray-200 space-y-2">
        <h2 className="text-lg font-semibold text-gray-900">담당자 지정</h2>
        <input
          type="text"
          className="border rounded-lg px-4 py-2 text-gray-800 shadow-sm w-full
                     focus:ring-2 focus:ring-indigo-400"
          placeholder="담당자 ID 또는 이름"
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAssign(e.currentTarget.value);
          }}
        />
      </div>

      {/* 댓글 */}
      <div className="bg-white p-6 rounded-xl shadow border border-gray-200 space-y-3">
        <h2 className="text-lg font-semibold text-gray-900">댓글</h2>

        <textarea
          className="w-full border rounded-lg px-4 py-3 text-gray-800 shadow-sm 
                     focus:ring-2 focus:ring-indigo-400"
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="댓글 입력..."
        />

        <button
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium shadow
                     hover:bg-indigo-700 transition"
          onClick={handleAddComment}
        >
          댓글 추가
        </button>

        {/* 댓글 목록 */}
        <div className="pt-4 space-y-3">
          {ticket.comments?.map((c: any) => (
            <div key={c.id} className="p-4 bg-gray-50 rounded-lg border shadow-sm">
              <p className="text-gray-800 text-sm">{c.message}</p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(c.created_at).toLocaleString("ko-KR")}
              </p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
