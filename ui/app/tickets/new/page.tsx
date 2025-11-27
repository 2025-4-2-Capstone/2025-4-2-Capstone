"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createTicket } from "@/lib/api/tickets";

export default function NewTicketPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!title.trim() || !description.trim()) {
      alert("제목과 내용을 입력해주세요.");
      return;
    }

    try {
      setLoading(true);

      const form = {
        title,
        description,
        priority,
      };

      await createTicket(form);

      alert("티켓이 성공적으로 생성되었습니다.");
      router.push("/tickets");
    } catch (err) {
      console.error("티켓 생성 실패:", err);
      alert("티켓 생성 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-8 min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">새 티켓 생성</h1>
        <button
          onClick={() => router.back()}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ← 돌아가기
        </button>
      </header>

      {/* 입력 카드 */}
      <section className="bg-white p-6 rounded-xl shadow border border-gray-100 space-y-5">
        {/* 제목 */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            제목 *
          </label>
          <input
            type="text"
            placeholder="티켓 제목을 입력하세요"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* 우선순위 */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            우선순위
          </label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full px-3 py-2 border rounded-xl text-sm bg-white"
          >
            <option value="LOW">낮음</option>
            <option value="MEDIUM">보통</option>
            <option value="HIGH">높음</option>
            <option value="CRITICAL">긴급</option>
          </select>
        </div>

        {/* 내용 */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            내용 *
          </label>
          <textarea
            placeholder="티켓 내용을 입력하세요..."
            rows={6}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* 버튼 */}
        <button
          onClick={handleCreate}
          disabled={loading}
          className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium text-sm hover:bg-indigo-700 transition disabled:bg-indigo-300"
        >
          {loading ? "생성 중..." : "티켓 생성"}
        </button>
      </section>
    </div>
  );
}
