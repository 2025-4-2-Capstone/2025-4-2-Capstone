// components/tickets/TicketTypes.ts

export type TicketStatus =
  | "open"
  | "in_progress"
  | "pending"
  | "resolved"
  | "closed";

export type TicketPriority =
  | "low"
  | "medium"
  | "high"
  | "critical";

export interface TicketSummary {
  id: number;
  title: string;
  status: TicketStatus;
  priority: TicketPriority;
  assignee_name?: string;
  department_name?: string;
  created_at: string;
}
