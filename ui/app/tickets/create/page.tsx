"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";

export default function NewTicketPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    priority: "보통",
    assignee: "",
    description: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("✅ 새 티켓이 등록되었습니다!");
    router.push("/tickets"); // 목록으로 이동 (나중에 API POST로 교체)
  };

  return (
    <div className="bg-white rounded-2xl shadow p-8 border border-gray-100">
      {/* 상단: 뒤로가기 + 제목 */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => router.back()}
          className="text-slate-600 hover:text-indigo-600 flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">뒤로</span>
        </button>
        <h1 className="text-2xl font-bold text-slate-800">새 티켓 등록</h1>
        <div className="w-8" /> {/* 정렬용 빈공간 */}
      </div>

      {/* 입력 폼 */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="text-sm text-slate-600">제목</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="예: 서버 응답 지연 발생"
            required
            className="w-full border rounded-md px-3 py-2 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-slate-600">우선순위</label>
            <select
              name="priority"
              value={form.priority}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <option>긴급</option>
              <option>높음</option>
              <option>보통</option>
              <option>낮음</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-slate-600">담당자</label>
            <input
              name="assignee"
              value={form.assignee}
              onChange={handleChange}
              placeholder="예: 홍길동"
              className="w-full border rounded-md px-3 py-2 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
        </div>

        <div>
          <label className="text-sm text-slate-600">내용</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={5}
            placeholder="티켓 내용을 작성하세요."
            className="w-full border rounded-md px-3 py-2 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
          />
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <button
            type="button"
            onClick={() => router.push("/tickets")}
            className="px-4 py-2 text-sm rounded-md border text-slate-600 hover:bg-gray-50"
          >
            취소
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
          >
            등록
          </button>
        </div>
      </form>
    </div>
  );
}
