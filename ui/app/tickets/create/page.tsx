"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function CreateTicketPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "보통",
    assignee: "",
  });

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setForm((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      await api.post("/tickets", form);
      alert("티켓이 성공적으로 생성되었습니다!");
      router.push("/tickets");
    } catch (err: any) {
      console.error(err);
      alert("티켓 생성 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white rounded-2xl shadow p-8 border border-gray-100">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">새 티켓 생성</h1>

      <div className="flex flex-col gap-4">
        {/* 제목 */}
        <div>
          <label className="text-sm text-slate-600">제목</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="티켓 제목을 입력하세요"
            className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none"
          />
        </div>

        {/* 우선순위 */}
        <div>
          <label className="text-sm text-slate-600">우선순위</label>
          <select
            name="priority"
            value={form.priority}
            onChange={handleChange}
            className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none"
          >
            <option>긴급</option>
            <option>높음</option>
            <option>보통</option>
            <option>낮음</option>
          </select>
        </div>

        {/* 담당자 */}
        <div>
          <label className="text-sm text-slate-600">담당자</label>
          <input
            name="assignee"
            value={form.assignee}
            onChange={handleChange}
            placeholder="담당자 이름"
            className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none"
          />
        </div>

        {/* 내용 */}
        <div>
          <label className="text-sm text-slate-600">내용</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            placeholder="티켓 내용을 입력하세요"
            className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none resize-none"
          />
        </div>
      </div>

      {/* 버튼 */}
      <div className="flex justify-end gap-3 mt-6">
        <button
          onClick={() => router.push("/tickets")}
          className="px-4 py-2 text-sm rounded-md border text-slate-600 hover:bg-gray-50"
        >
          취소
        </button>
        <button
          onClick={handleSubmit}
          className="px-4 py-2 text-sm rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
        >
          생성하기
        </button>
      </div>
    </div>
  );
}
