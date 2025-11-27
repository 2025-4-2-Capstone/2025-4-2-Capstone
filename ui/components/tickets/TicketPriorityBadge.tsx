// components/tickets/TicketPriorityBadge.tsx

import type { TicketPriority } from "./TicketTypes";

export default function TicketPriorityBadge({ priority }: { priority: TicketPriority }) {
  const colors: Record<TicketPriority, string> = {
    low: "bg-green-100 text-green-700",
    medium: "bg-yellow-100 text-yellow-700",
    high: "bg-orange-100 text-orange-700",
    critical: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium ${
        colors[priority] || "bg-gray-200 text-gray-600"
      }`}
    >
      {priority.toUpperCase()}
    </span>
  );
}
