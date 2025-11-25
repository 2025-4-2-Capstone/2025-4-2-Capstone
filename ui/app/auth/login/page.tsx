"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaGoogle, FaGithub } from "react-icons/fa";
import BrandLogo from "@/components/Logo/logo";

export default function LoginPage() {
  const router = useRouter();

  // ⭐ state
  const [autoSignIn, setAutoSignIn] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ⭐ 로그인 함수
  const handleLogin = async () => {
    setError("");

    if (!username || !password) {
      setError("아이디와 비밀번호를 입력하세요.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) throw new Error("로그인 실패");
      const data = await res.json();

      // ⭐ 저장
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("username", data.username);
      localStorage.setItem("department_id", data.department_id);

      // ⭐ 역할별 라우팅
      if (data.role === "super_admin" || data.role === "admin") {
        router.push("/dashboard/admin");
      } else if (data.role === "manager") {
        router.push("/dashboard/manager");
      } else if (data.role === "engineer") {
        router.push("/dashboard/engineer");
      } else if (data.role === "support") {
        router.push("/dashboard/support");
      } else if (data.role === "auditor") {
        router.push("/dashboard/auditor");
      } else {
        router.push("/dashboard/user");
      }
    } catch (err) {
      setError("로그인 실패. 아이디 또는 비밀번호를 확인하세요.");
    } finally {
      setLoading(false);
    }
  };

  // ⭐ Enter로 로그인
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div className="flex min-h-screen page-fadein">

      {/* LEFT side (디자인 100% 유지) */}
      <div className="w-1/2 flex flex-col items-center justify-center relative bg-[#eef2ff]">

        {/* 퍼지는 빛 효과 */}
        <div className="absolute top-28 left-24 w-[260px] h-[260px] bg-indigo-300/40 rounded-full blur-[120px]"></div>

        {/* 로고 */}
        <div className="mb-10 scale-125 neon-pulse animate-float">
          <BrandLogo />
        </div>

        {/* 타이틀 */}
        <h1 className="text-gray-800 text-[44px] font-light tracking-[0.20em] text-center leading-tight">
          OPERATION <br /> LOG
        </h1>

        {/* 설명 */}
        <p className="text-indigo-700 font-medium text-lg mt-6 tracking-wide">
          Operation Log System
        </p>
      </div>

      {/* RIGHT side (디자인 그대로 + 기능 적용) */}
      <div className="w-1/2 flex flex-col justify-center items-center bg-white">
        <div className="w-80">

          {/* Tabs */}
          <div className="flex justify-center gap-4 mb-8">
            <button className="text-indigo-700 font-semibold border-b-2 border-indigo-700 pb-1">
              Password
            </button>
            <button className="text-gray-400 hover:text-indigo-600 transition">
              WebAuthn
            </button>
          </div>

          {/* Input Fields – 디자인 유지 + 기능 추가 + 글자색 수정 */}
          <div className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="username, Email or phone"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={handleKeyPress}
              className="border rounded-lg px-4 py-3 shadow-sm transition text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyPress}
              className="border rounded-lg px-4 py-3 shadow-sm transition text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
            />
          </div>

          {/* Options */}
          <div className="flex justify-between items-center mt-3 text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoSignIn}
                onChange={() => setAutoSignIn(!autoSignIn)}
              />
              <span className="text-gray-700">Auto sign in</span>
            </label>
            <button className="text-indigo-500 hover:underline">
              Forgot password?
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <p className="text-red-500 text-sm text-center mt-3">{error}</p>
          )}

          {/* Sign In Button */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className={`w-full mt-6 bg-indigo-600 text-white py-3 rounded-lg font-semibold shadow-md hover:bg-indigo-700 transition ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

          {/* Social Login */}
          <div className="flex justify-center mt-6 gap-6 text-gray-600">
            <FaGoogle className="cursor-pointer hover:text-indigo-600 transition" size={24} />
            <FaGithub className="cursor-pointer hover:text-indigo-600 transition" size={24} />
          </div>

          {/* Sign Up */}
          <p className="text-center mt-6 text-sm text-gray-500">
            No account?{" "}
            <a href="/register" className="text-indigo-600 font-medium hover:underline">
              Sign up now
            </a>
          </p>

        </div>
      </div>

    </div>
  );
}
