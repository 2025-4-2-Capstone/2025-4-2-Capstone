"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useUserStore } from "@/stores/userStore";

export default function LoginPage() {
  const router = useRouter();
  const loginStore = useUserStore();

  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post("/login", form);

      // Zustand에 저장
      loginStore.login(res.data);

      // localStorage에도 token 저장
      localStorage.setItem("token", res.data.access_token);
      localStorage.setItem("username", res.data.username);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("department_id", String(res.data.department_id));

      // 로그인 성공 → 티켓 목록 페이지 이동
      router.push("/tickets");
    } catch (err) {
      console.error("로그인 실패:", err);
      alert("로그인 실패. 아이디/비밀번호를 확인하세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="bg-white shadow-lg rounded-xl p-8 w-[360px] flex flex-col gap-4"
      >
        <h1 className="text-xl font-semibold text-center">로그인</h1>

        <input
          name="username"
          type="text"
          placeholder="아이디"
          value={form.username}
          onChange={handleChange}
          className="border rounded-md px-3 py-2 w-full"
        />

        <input
          name="password"
          type="password"
          placeholder="비밀번호"
          value={form.password}
          onChange={handleChange}
          className="border rounded-md px-3 py-2 w-full"
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-indigo-600 text-white rounded-md py-2 hover:bg-indigo-700"
        >
          {loading ? "로그인 중..." : "로그인"}
        </button>
      </form>
    </div>
  );
}
