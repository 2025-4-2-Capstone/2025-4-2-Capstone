"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaGoogle, FaGithub } from "react-icons/fa";
import BrandLogo from "@/components/Logo/logo";

export default function LoginPage() {
  const router = useRouter();
  const [autoSignIn, setAutoSignIn] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ 로그인 요청 함수
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

      // ✅ 토큰과 사용자 정보 저장
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("username", data.username);
      localStorage.setItem("department_id", data.department_id);

      // ✅ 역할별 자동 라우팅
      if (data.role === "super_admin" || data.role === "admin") {
        router.push("/dashboard/admin"); // 관리자
      } else if (data.role === "manager") {
        router.push("/dashboard/manager"); // 부장
      } else if (data.role === "engineer") {
        router.push("/dashboard/engineer"); // 엔지니어
      } else if (data.role === "support") {
        router.push("/dashboard/support"); // 고객지원
      } else if (data.role === "auditor") {
        router.push("/dashboard/auditor"); // 감사자
      } else {
        router.push("/dashboard/user"); // 일반 사용자
      }
    } catch (err: any) {
      console.error(err);
      setError("로그인 실패. 아이디 또는 비밀번호를 확인하세요.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Enter 키로 로그인
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div className="flex min-h-screen page-fadein">

      {/* Left Side */}
      <div className="w-1/2 bg-indigo-100 flex flex-col items-center justify-center">
        <div className="mb-12 scale-125">
          <BrandLogo />
        </div>
        <p className="text-indigo-700 font-semibold text-xl mt-4 tracking-wide">
          Operation Log System
        </p>
      </div>

      {/* Right Side */}
      <div className="w-1/2 flex flex-col justify-center items-center bg-white">
        <div className="w-80">
          <h2 className="text-3xl font-bold text-center mb-8 text-indigo-700">
            Casdoor
          </h2>

          {/* Tabs */}
          <div className="flex justify-center gap-4 mb-6">
            <button className="text-indigo-700 font-semibold border-b-2 border-indigo-700">
              Password
            </button>
            <button className="text-gray-400 hover:text-indigo-600">
              WebAuthn
            </button>
          </div>

          {/* Input Fields */}
          <div className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="username, Email or phone"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={handleKeyPress}
              className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyPress}
              className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          {/* Options */}
          <div className="flex justify-between items-center mt-3 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={autoSignIn}
                onChange={() => setAutoSignIn(!autoSignIn)}
              />
              Auto sign in
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
            className={`w-full mt-5 text-white py-2 rounded-md transition ${
              loading ? "bg-indigo-400" : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

          {/* Social Login */}
          <div className="flex justify-center mt-5 gap-6 text-gray-600">
            <FaGoogle
              className="cursor-pointer hover:text-indigo-600"
              size={22}
            />
            <FaGithub
              className="cursor-pointer hover:text-indigo-600"
              size={22}
            />
          </div>

          {/* Sign Up */}
          <p className="text-center mt-6 text-sm text-gray-500">
            No account?{" "}
            <a href="/register" className="text-indigo-600 hover:underline">
              Sign up now
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
