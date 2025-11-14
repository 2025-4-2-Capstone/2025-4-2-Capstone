"use client";

import { useRouter, useParams } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Edit3, X } from "lucide-react";

// ✅ 임시 티켓 데이터
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

// ✅ 처리 로그 (임시 목업)
const MOCK_LOGS = [
  {
    action: "티켓 생성",
    details: "홍길동이 티켓을 생성했습니다.",
    timestamp: "2025-11-10 13:32",
  },
  {
    action: "담당자 배정",
    details: "김철수가 담당자로 지정되었습니다.",
    timestamp: "2025-11-10 14:02",
  },
  {
    action: "상태 변경",
    details: "열림 → 진행중 으로 상태가 변경되었습니다.",
    timestamp: "2025-11-10 15:45",
  },
  {
    action: "코멘트 추가",
    details: "홍길동: 원인 파악 중입니다.",
    timestamp: "2025-11-10 16:12",
  },
  {
    action: "해결 완료",
    details: "문제가 해결되었습니다. 티켓 종료 처리.",
    timestamp: "2025-11-10 17:30",
  },
];

export default function TicketDetailPage() {
  const router = useRouter();
  const params = useParams();
  const ticketId = Number(params.id);
  const ticket = MOCK_TICKETS.find((t) => t.id === ticketId);
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

      {/* ✅ 처리 이력(Log Timeline) */}
      <div className="mt-10">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">처리 이력</h3>
        <div className="relative border-l border-slate-200 pl-4">
          {MOCK_LOGS.map((log, index) => (
            <div key={index} className="mb-6 relative">
              {/* 점 */}
              <div className="absolute -left-[9px] top-1.5 w-2 h-2 rounded-full bg-indigo-500" />
              {/* 로그 내용 */}
              <div className="bg-white rounded-md shadow-sm border border-gray-100 p-3">
                <p className="text-sm text-slate-800 font-medium">{log.action}</p>
                <p className="text-xs text-slate-500 mt-1">{log.details}</p>
                <p className="text-xs text-slate-400 mt-1">{log.timestamp}</p>
              </div>
            </div>
          ))}
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
