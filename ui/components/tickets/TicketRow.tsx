// components/tickets/TicketRow.tsx
"use client";

import Link from "next/link";
import TicketStatusBadge from "./TicketStatusBadge";

export default function TicketRow({ ticket }: { ticket: any }) {
  return (
    <tr className="border-b hover:bg-gray-50 transition">
      <td className="p-3">{ticket.id}</td>

      <td className="p-3">
        <Link href={`/tickets/${ticket.id}`} className="text-blue-600 hover:underline">
          {ticket.title}
        </Link>
      </td>

      <td className="p-3">
        <TicketStatusBadge status={ticket.status} />
      </td>

      <td className="p-3 capitalize">{ticket.priority}</td>
      <td className="p-3">{ticket.assignee}</td>
      <td className="p-3 text-sm text-gray-500">{ticket.created_at}</td>
    </tr>
  );
}
