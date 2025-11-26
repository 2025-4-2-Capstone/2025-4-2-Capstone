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
   3) 내 티켓
=========================== */
export const getMyTickets = async () => {
  const res = await api.get("/tickets/my");
  return res.data;
};

/* ===========================
   4) 나에게 할당된 티켓
=========================== */
export const getAssignedTickets = async () => {
  const res = await api.get("/tickets/assigned");
  return res.data;
};

/* ===========================
   5) 미할당 티켓
=========================== */
export const getUnassignedTickets = async () => {
  const res = await api.get("/tickets/unassigned");
  return res.data;
};

/* ===========================
   6) 티켓 생성
=========================== */
export const createTicket = async (form: any) => {
  const res = await api.post("/tickets", form);
  return res.data;
};

/* ===========================
   7) 티켓 상태 변경
=========================== */
export const updateTicketStatus = async (ticketId: number, status: string) => {
  const res = await api.post(`/tickets/${ticketId}/status`, { status });
  return res.data;
};

/* ===========================
   8) 티켓 담당자 할당
=========================== */
export const assignTicket = async (ticketId: number, assignee: string) => {
  const res = await api.post(`/tickets/${ticketId}/assign`, { assignee });
  return res.data;
};

/* ===========================
   9) 댓글 추가
=========================== */
export const addComment = async (ticketId: number, message: string) => {
  const res = await api.post(`/tickets/${ticketId}/comment`, { message });
  return res.data;
};

/* ===========================
   10) 히스토리 가져오기
=========================== */
export const getTicketHistory = async (ticketId: number) => {
  const res = await api.get(`/tickets/${ticketId}/history`);
  return res.data;
};
