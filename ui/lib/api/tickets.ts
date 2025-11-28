// lib/api/tickets.ts
import api from "@/lib/utils/api";

/* ===========================
   1) 전체 티켓 조회
=========================== */
export const getTickets = async (filters?: any) => {
  const res = await api.get("/tickets", { params: filters });
  return res.data;
};

/* ===========================
   2) 티켓 상세 조회
=========================== */
export const getTicketById = async (ticketId: string | number) => {
  const res = await api.get(`/tickets/${ticketId}`);
  return res.data;
};

/* ===========================
   3) 티켓 생성
=========================== */
export const createTicket = async (form: any) => {
  const res = await api.post("/tickets", form);
  return res.data;
};

/* ===========================
   4) 티켓 상태 변경 (백엔드와 맞춘 버전)
=========================== */
export const updateTicketStatus = async (ticketId: number, status: string) => {
  const res = await api.put(`/tickets/${ticketId}`, { status });
  return res.data;
};

/* ===========================
   5) 담당자 변경 (백엔드에는 없음 → UI에서 막기)
=========================== */
// ❌ 백엔드에 /assign API 없음 → 호출 불가
// 필요한 경우 백엔드에 기능 추가해야 함
export const assignTicket = async () => {
  alert("담당자 지정 기능은 아직 백엔드에 구현되어 있지 않습니다.");
};

/* ===========================
   6) 댓글 추가 (백엔드에는 없음 → UI에서 막기)
=========================== */
export const addComment = async () => {
  alert("댓글 기능은 아직 백엔드에 구현되어 있지 않습니다.");
};

/* ===========================
   7) 히스토리 조회 (백엔드 없음)
=========================== */
export const getTicketHistory = async () => {
  return []; // UI에서 오류 방지용
};
