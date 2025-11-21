"use client";

import Link from "next/link";
import StatusBadge from "./StatusBadge";
import PriorityBadge from "./PriorityBadge";

interface TicketCardProps {
  id: number;
  title: string;
  status: string;
  priority: string;
  assignee: string;
  created: string;
}

export default function TicketCard({
  id,
  title,
  status,
  priority,
  assignee,
  created,
}: TicketCardProps) {
  return (
    <Link href={`/tickets/${id}`}>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition cursor-pointer">
        {/* Title */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
          <PriorityBadge priority={priority} />
        </div>

        {/* Status + Assignee */}
        <div className="flex items-center justify-between mb-2">
          <StatusBadge status={status} />
          <span className="text-sm text-slate-600">{assignee}</span>
        </div>

        {/* Created */}
        <p className="text-xs text-slate-400 mt-2">생성일: {created}</p>
      </div>
    </Link>
  );
}
