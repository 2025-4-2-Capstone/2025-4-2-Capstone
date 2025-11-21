"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Edit3, X } from "lucide-react";
import StatusBadge from "@/components/ticket/StatusBadge";
import PriorityBadge from "@/components/ticket/PriorityBadge";
import { api } from "@/lib/api";

export default function TicketDetailPage() {
  const router = useRouter();
  const params = useParams();
  const ticketId = Number(params.id);

  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // 🔥 실제 API 호출로 데이터 가져오기
  useEffect(() => {
    async function fetchTicket() {
      try {
        const res = await api.get(`/tickets/${ticketId}`);
        setTicket(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchTicket();
  }, [ticketId]);

  if (loading) {
    return (
      <div className="p-6 text-center text-slate-600">불러오는 중...</div>
    );
  }

  if (!ticket) {
    return (
      <div className="p-6 text-center text-slate-600">
        존재하지 않는 티켓입니다.
        <button
          onClick={() => router.push("/tickets")}
          className="block mx-auto mt-4 text-indigo-600 hover:underline"
        >
          목록으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow p-8 border border-gray-100 relative">
      {/* 상단: 제목 + 뒤로가기 + 수정 */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="text-slate-600 hover:text-indigo-600 flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">뒤로</span>
          </button>
          <h1 className="text-2xl font-bold text-slate-800">{ticket.title}</h1>
        </div>
        <button
          onClick={() => setIsEditOpen(true)}
          className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 text-sm"
        >
          <Edit3 className="w-4 h-4" />
          수정
        </button>
      </div>

      {/* 기본 정보 */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div>
          <p className="text-sm text-slate-500">상태</p>
          <StatusBadge status={ticket.status} />
        </div>
        <div>
          <p className="text-sm text-slate-500">우선순위</p>
          <PriorityBadge priority={ticket.priority} />
        </div>
        <div>
          <p className="text-sm text-slate-500">담당자</p>
          <p className="text-slate-700 font-medium">{ticket.assigned_to}</p>
        </div>
        <div>
          <p className="text-sm text-slate-500">생성일</p>
          <p className="text-slate-700 font-medium">
            {new Date(ticket.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* 내용 */}
      <div>
        <p className="text-sm text-slate-500 mb-2">내용</p>
        <div className="bg-gray-50 rounded-md p-4 text-slate-700 leading-relaxed">
          {ticket.description}
        </div>
      </div>

      {/* ✏️ 수정 모달 */}
      {isEditOpen && (
        <EditModal
          ticket={ticket}
          onClose={() => setIsEditOpen(false)}
          onSave={(updated) => {
            setTicket(updated);
            setIsEditOpen(false);
          }}
        />
      )}
    </div>
  );
}

/* ----------------- 수정 모달 ----------------- */
function EditModal({
  ticket,
  onClose,
  onSave,
}: {
  ticket: any;
  onClose: () => void;
  onSave: (updated: any) => void;
}) {
  const [form, setForm] = useState(ticket);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setForm((prev: any) => ({ ...prev, [name]: value }));
  };

  // 🔥 PUT API 호출
  const handleSave = async () => {
    try {
      const res = await api.put(`/tickets/${ticket.id}`, form);
      onSave(res.data);
    } catch (err) {
      console.error(err);
      alert("수정 중 오류 발생");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-[500px] p-6 relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-lg font-semibold text-slate-800 mb-4">티켓 수정</h2>

        <div className="flex flex-col gap-3">
          <label className="text-sm text-slate-600">제목</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />

          <label className="text-sm text-slate-600">상태</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <option>열림</option>
            <option>진행중</option>
            <option>해결됨</option>
            <option>종료</option>
          </select>

          <label className="text-sm text-slate-600">우선순위</label>
          <select
            name="priority"
            value={form.priority}
            onChange={handleChange}
            className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <option>긴급</option>
            <option>높음</option>
            <option>보통</option>
            <option>낮음</option>
          </select>

          <label className="text-sm text-slate-600">담당자</label>
          <input
            name="assigned_to"
            value={form.assigned_to || ""}
            onChange={handleChange}
            className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />

          <label className="text-sm text-slate-600">내용</label>
          <textarea
            name="description"
            value={form.description}
            rows={4}
            onChange={handleChange}
            className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
          />
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-md border text-slate-600 hover:bg-gray-50">
            취소
          </button>
          <button onClick={handleSave} className="px-4 py-2 text-sm rounded-md bg-indigo-600 text-white hover:bg-indigo-700">
            저장
          </button>
        </div>
      </div>
    </div>
  );
}
