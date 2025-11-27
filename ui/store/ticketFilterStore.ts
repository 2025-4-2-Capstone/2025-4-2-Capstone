import { create } from "zustand";
import type { TicketStatus, TicketPriority } from "@/components/tickets/TicketTypes";

/* ============================
   Zustand store 타입 정의
============================ */
interface TicketFilterState {
  q: string;
  status: TicketStatus | "ALL";
  priority: TicketPriority | "ALL";

  setQ: (value: string) => void;
  setStatus: (value: TicketStatus | "ALL") => void;
  setPriority: (value: TicketPriority | "ALL") => void;
}

/* ============================
   Zustand Store
============================ */
export const useTicketFilterStore = create<TicketFilterState>((set) => ({
  q: "",
  status: "ALL",
  priority: "ALL",

  setQ: (value) => set({ q: value }),
  setStatus: (value) => set({ status: value }),
  setPriority: (value) => set({ priority: value }),
}));
