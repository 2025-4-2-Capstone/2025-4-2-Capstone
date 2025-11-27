"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  getTicketById,
  updateTicketStatus,
  assignTicket,
  addComment,
  getTicketHistory,
} from "@/lib/api/tickets";

export default function TicketDetailPage() {
  const params = useParams();
  const id = String(params.ticket_id); // ← ticket_id 타입 안전하게 변환

  const [ticket, setTicket] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");

  // 티켓 불러오기
  const loadTicket = async () => {
    try {
      setLoading(true);
      const data = await getTicketById(id);
      setTicket(data);

      const h = await getTicketHistory(Number(id));
      setHistory([]);
 // ← 배열 보장
    } catch (err) {
      console.error("티켓 로드 실패:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadTicket();
  }, [id]);

  if (loading) {
    return <div className="p-6">로딩 중...</div>;
  }

  if (!ticket) {
    return <div className="p-6 text-red-500">티켓을 찾을 수 없습니다.</div>;
  }

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
    <div className="p-6 space-y-6">
      {/* 제목 */}
      <h1 className="text-2xl font-semibold">{ticket.title}</h1>

      {/* 상세 정보 */}
      <div className="bg-white p-4 rounded-xl shadow border border-gray-100 space-y-2">
        <p><b>상태:</b> {ticket.status}</p>
        <p><b>우선순위:</b> {ticket.priority}</p>
        <p><b>담당자:</b> {ticket.assignee_name ?? "-"}</p>
        <p><b>부서:</b> {ticket.department_name ?? "-"}</p>
        <p><b>작성일:</b> {new Date(ticket.created_at).toLocaleString("ko-KR")}</p>
      </div>

      {/* 상태 변경 */}
      <div className="bg-white p-4 rounded-xl shadow border border-gray-100">
        <h2 className="font-semibold mb-2">상태 변경</h2>
        <select
          className="border rounded p-2"
          value={ticket.status}
          onChange={(e) => handleStatusChange(e.target.value)}
        >
          <option value="OPEN">열림</option>
          <option value="IN_PROGRESS">진행중</option>
          <option value="RESOLVED">해결됨</option>
          <option value="CLOSED">종료</option>
        </select>
      </div>

      {/* 담당자 변경 */}
      <div className="bg-white p-4 rounded-xl shadow border border-gray-100">
        <h2 className="font-semibold mb-2">담당자 지정</h2>
        <input
          type="text"
          className="border rounded p-2"
          placeholder="담당자 이름"
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAssign(e.currentTarget.value);
          }}
        />
      </div>

      {/* 댓글 작성 */}
      <div className="bg-white p-4 rounded-xl shadow border border-gray-100 space-y-2">
        <h2 className="font-semibold">댓글</h2>

        <textarea
          className="w-full border rounded p-2"
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="댓글 입력..."
        />

        <button
          className="px-4 py-2 bg-indigo-600 text-white rounded"
          onClick={handleAddComment}
        >
          댓글 추가
        </button>

        {/* 댓글 목록 */}
        <div className="pt-4 space-y-2">
          {ticket.comments?.map((c: any) => (
            <div key={c.id} className="p-3 bg-gray-50 rounded border">
              <p className="text-sm text-gray-800">{c.message}</p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(c.created_at).toLocaleString("ko-KR")}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 히스토리 */}
      <div className="bg-white p-4 rounded-xl shadow border border-gray-100">
        <h2 className="font-semibold mb-3">변경 히스토리</h2>

        <ul className="space-y-2">
          {history.map((h: any) => (
            <li key={h.id} className="border rounded p-3 bg-gray-50">
              <p className="text-sm">{h.message}</p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(h.created_at).toLocaleString("ko-KR")}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
