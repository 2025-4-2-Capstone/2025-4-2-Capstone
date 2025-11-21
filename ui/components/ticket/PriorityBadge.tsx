"use client";

interface PriorityBadgeProps {
  priority: string;
}

export default function PriorityBadge({ priority }: PriorityBadgeProps) {
  const colorMap: Record<string, string> = {
    긴급: "bg-red-100 text-red-700",
    높음: "bg-orange-100 text-orange-700",
    보통: "bg-green-100 text-green-700",
    낮음: "bg-gray-200 text-gray-700",
  };

  const colorClass = colorMap[priority] || "bg-gray-100 text-gray-600";

  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-md text-xs font-medium ${colorClass}`}
    >
      {priority}
    </span>
  );
}
