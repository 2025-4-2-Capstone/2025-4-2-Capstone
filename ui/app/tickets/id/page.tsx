"use client";

import { useRouter, useParams } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Edit3, X } from "lucide-react";

// 임시 데이터
const MOCK_TICKETS = [
  {
    id: 1,
    title: "DB 연결 오류",
    description: "PostgreSQL 연결이 간헐적으로 끊기는 현상 발생. 서버 로그 분석 필요.",
    status: "진행중",
    priority: "높음",
    assignee: "홍길동",
    created: "2025-11-10",
  },
  {
    id: 2,
    title: "API 응답 지연",
    description: "FastAPI 응답 속도가 비정상적으로 느림. SLA 기준 초과.",
    status: "해결됨",
    priority: "보통",
    assignee: "김철수",
    created: "2025-11-09",
  },
];

export default function TicketDetailPage() {
  const router = useRouter();
  const params = useParams();
  const ticketId = Number(params.id);
  const originalTicket = MOCK_TICKETS.find((t) => t.id === ticketId);

  // 티켓 정보 상태 관리
  const [ticket, setTicket] = useState(originalTicket);
  const [isEditOpen, setIsEditOpen] = useState(false);

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
          <p className="text-slate-700 font-medium">{ticket.assignee}</p>
        </div>
        <div>
          <p className="text-sm text-slate-500">생성일</p>
          <p className="text-slate-700 font-medium">{ticket.created}</p>
        </div>
      </div>

      {/* 내용 */}
      <div>
        <p className="text-sm text-slate-500 mb-2">내용</p>
        <div className="bg-gray-50 rounded-md p-4 text-slate-700 leading-relaxed">
          {ticket.description}
        </div>
      </div>

      {/* 수정 모달 */}
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

/* ----------------- 모달 컴포넌트 ----------------- */
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
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
            name="assignee"
            value={form.assignee}
            onChange={handleChange}
            className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />

          <label className="text-sm text-slate-600">내용</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
          />
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-md border text-slate-600 hover:bg-gray-50"
          >
            취소
          </button>
          <button
            onClick={() => onSave(form)}
            className="px-4 py-2 text-sm rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
}

/* ----------------- 뱃지 ----------------- */
function StatusBadge({ status }: { status: string }) {
  const colorMap: Record<string, string> = {
    열림: "bg-blue-100 text-blue-700",
    진행중: "bg-yellow-100 text-yellow-700",
    해결됨: "bg-green-100 text-green-700",
    종료: "bg-gray-200 text-gray-700",
  };
  return (
    <span className={`inline-block px-2 py-0.5 rounded-md text-xs font-medium ${colorMap[status] || ""}`}>
      {status}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const colorMap: Record<string, string> = {
    긴급: "bg-red-100 text-red-700",
    높음: "bg-orange-100 text-orange-700",
    보통: "bg-green-100 text-green-700",
    낮음: "bg-gray-200 text-gray-700",
  };
  return (
    <span className={`inline-block px-2 py-0.5 rounded-md text-xs font-medium ${colorMap[priority] || ""}`}>
      {priority}
    </span>
  );
}
