// components/tickets/TicketStatusBadge.tsx
export default function TicketStatusBadge({ status }: { status: string }) {
  const colors: any = {
    open: "bg-blue-100 text-blue-600",
    in_progress: "bg-yellow-100 text-yellow-700",
    pending: "bg-orange-100 text-orange-600",
    resolved: "bg-green-100 text-green-700",
    closed: "bg-gray-200 text-gray-600",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${colors[status] || "bg-gray-200"}`}>
      {status}
    </span>
  );
}
