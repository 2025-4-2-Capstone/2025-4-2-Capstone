"use client";

import { useState, useEffect } from "react";
import { addComment, getTicketById } from "@/lib/api/tickets";

export default function TicketDetailComments({ ticketId }: { ticketId: string }) {
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<any[] | null>(null);

  const fetchData = async () => {
    const data = await getTicketById(ticketId);
    setComments(data.comments || []);
  };

  useEffect(() => {
    fetchData();
  }, [ticketId]);

  if (!comments)
    return <div className="bg-white p-6 rounded-xl shadow">로딩 중...</div>;

  const handleSubmit = async () => {
    if (!comment) return;
    await addComment(Number(ticketId), comment);
    setComment("");
    fetchData();
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow space-y-4">
      <h2 className="text-lg font-semibold text-gray-800">댓글 / 메모</h2>

      <div className="space-y-3">
        {comments.map((c) => (
          <div key={c.id} className="border-b pb-2">
            <p className="font-medium">{c.user}</p>
            <p className="text-gray-700 text-sm">{c.message}</p>
            <p className="text-gray-400 text-xs">{c.time}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-3 pt-2">
        <input
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="댓글을 입력하세요..."
          className="flex-1 px-4 py-2 border rounded-lg"
        />
        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          등록
        </button>
      </div>
    </div>
  );
}
