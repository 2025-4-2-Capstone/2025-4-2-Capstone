// components/tickets/TicketStatusBadge.tsx

interface Props {
  status: string;
}

// 영어 → 한국어 라벨링 테이블
const STATUS_LABELS: Record<string, string> = {
  open: "열림",
  in_progress: "진행중",
  pending: "대기중",
  resolved: "해결됨",
  closed: "종료",
};

// 색상 테이블 (우리 UI 스타일 기준)
const STATUS_COLORS: Record<string, string> = {
  open: "bg-blue-100 text-blue-700 border border-blue-200",
  in_progress: "bg-yellow-100 text-yellow-700 border border-yellow-300",
  pending: "bg-orange-100 text-orange-700 border border-orange-300",
  resolved: "bg-emerald-100 text-emerald-700 border border-emerald-300",
  closed: "bg-gray-200 text-gray-700 border border-gray-300",
};

export default function TicketStatusBadge({ status }: Props) {
  // 백엔드 응답이 OPEN / open / Open / In_Progress 등 다양할 수 있어 대비
  const key = status.toLowerCase();

  const label = STATUS_LABELS[key] ?? status;
  const color = STATUS_COLORS[key] ?? "bg-gray-200 text-gray-700";

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium inline-flex items-center ${color}`}
    >
      {label}
    </span>
  );
}
