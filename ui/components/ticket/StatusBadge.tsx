"use client";

interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const colorMap: Record<string, string> = {
    열림: "bg-blue-100 text-blue-700",
    진행중: "bg-yellow-100 text-yellow-700",
    해결됨: "bg-green-100 text-green-700",
    종료: "bg-gray-200 text-gray-700",
  };

  const colorClass = colorMap[status] || "bg-gray-100 text-gray-600";

  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-md text-xs font-medium ${colorClass}`}
    >
      {status}
    </span>
  );
}
