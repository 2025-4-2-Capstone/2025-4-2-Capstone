"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import BrandLogo from "@/components/Logo/logo";

export default function RegisterPage() {
  const router = useRouter();

  const [autoSignIn, setAutoSignIn] = useState(false);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [showSuccess, setShowSuccess] = useState(false);

  // 회원가입 처리
  const handleRegister = async () => {
    setError("");

    if (!username || !email || !password || !confirmPassword) {
      setError("모든 입력값을 입력해주세요.");
      return;
    }

    if (password !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      setLoading(true);

      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/signup`, {
        username,
        email,
        password,
      });

      setShowSuccess(true);
    } catch {
      setError("회원가입 실패. 이미 존재하는 아이디 또는 이메일입니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessConfirm = () => {
    router.push("/auth/login");
  };

  return (
    <div className="flex min-h-screen page-fadein">

      {/* LEFT SIDE */}
      <div className="w-1/2 flex flex-col items-center justify-center relative bg-[#eef2ff]">

        {/* Glow */}
        <div className="absolute top-28 left-24 w-[260px] h-[260px] bg-indigo-300/40 rounded-full blur-[120px]" />

        {/* Logo */}
        <div className="mb-6 scale-125 neon-pulse animate-float">
          <BrandLogo />
        </div>

        {/* One-line Text */}
        <div className="text-center mt-4 select-none relative">
          <h1
            className="
              text-[54px] font-light
              tracking-[0.06em]
              bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500
              bg-clip-text text-transparent
              drop-shadow-[0_6px_18px_rgba(130,120,255,0.28)]
              relative z-10
            "
          >
            CREATE ACCOUNT
          </h1>

          {/* Soft floating shadow */}
          <div
            className="
              absolute left-1/2 -translate-x-1/2 mt-[-14px]
              w-[360px] h-[36px]
              bg-gradient-to-r from-indigo-400/20 via-purple-400/18 to-fuchsia-400/20
              blur-[30px] rounded-full opacity-80
            "
          ></div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="w-1/2 flex flex-col justify-center items-center bg-white">
        <div className="w-80">

          {/* Tabs */}
          <div className="flex justify-center gap-4 mb-8">
            <button className="text-indigo-700 font-semibold border-b-2 border-indigo-700 pb-1">
              Register
            </button>
            <button className="text-gray-400 hover:text-indigo-600 transition">
              WebAuthn
            </button>
          </div>

          {/* Inputs */}
          <div className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="border rounded-lg px-4 py-3 shadow-sm transition 
                         text-gray-800 focus:outline-none
                         focus:ring-2 focus:ring-indigo-400"
            />

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border rounded-lg px-4 py-3 shadow-sm transition 
                         text-gray-800 focus:outline-none
                         focus:ring-2 focus:ring-indigo-400"
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border rounded-lg px-4 py-3 shadow-sm transition 
                         text-gray-800 focus:outline-none
                         focus:ring-2 focus:ring-indigo-400"
            />

            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="border rounded-lg px-4 py-3 shadow-sm transition 
                         text-gray-800 focus:outline-none
                         focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          {/* Auto sign-in */}
          <div className="flex items-center gap-2 mt-3 text-sm">
            <input
              type="checkbox"
              checked={autoSignIn}
              onChange={() => setAutoSignIn(!autoSignIn)}
            />
            <span className="text-gray-700">Auto sign in after registration</span>
          </div>

          {/* Error message */}
          {error && (
            <p className="text-red-500 text-sm text-center mt-3">{error}</p>
          )}

          {/* Submit btn */}
          <button
            onClick={handleRegister}
            disabled={loading}
            className={`w-full mt-6 bg-indigo-600 text-white py-3 rounded-lg 
                        font-semibold shadow-md hover:bg-indigo-700 transition
                        ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>

          {/* Login link */}
          <p className="text-center mt-6 text-sm text-gray-500">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-indigo-600 font-medium hover:underline">
              Login here
            </Link>
          </p>
        </div>
      </div>

      {/* SUCCESS MODAL */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center animate-fadeIn">
          <div className="bg-white rounded-xl shadow-lg p-8 w-[360px] text-center animate-scaleIn">

            <h2 className="text-2xl font-semibold text-indigo-700 mb-3">
              회원가입 완료!
            </h2>

            <p className="text-gray-700 mb-6 leading-relaxed">
              관리자 승인 후 로그인 가능합니다.
            </p>

            <button
              onClick={handleSuccessConfirm}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
            >
              확인
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
