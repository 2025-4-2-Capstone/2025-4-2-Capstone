"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function RegisterPage() {
  const router = useRouter();

  const [autoSignIn, setAutoSignIn] = useState(true);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // ================================
  // 🔥 회원가입 함수
  // ================================
  const handleRegister = async () => {
    if (!username || !email || !password || !confirmPassword) {
      alert("❌ 모든 입력값을 채워주세요.");
      return;
    }

    if (password !== confirmPassword) {
      alert("❌ 비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      // 1) 회원가입 요청
      await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/register`, {
        username,
        email,
        password,
      });

      // 2) Auto Sign-In 체크 시 자동 로그인 실행
      if (autoSignIn) {
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/login`,
          {
            username,
            password,
          }
        );

        const token = res.data.access_token;
        const role = res.data.role;

        localStorage.setItem("token", token);
        localStorage.setItem("role", role);

        // 역할별 대시보드 이동
        switch (role) {
          case "super_admin":
            router.push("/dashboard/superadmin");
            break;
          case "admin":
            router.push("/dashboard/admin");
            break;
          case "manager":
            router.push("/dashboard/manager");
            break;
          case "engineer":
            router.push("/dashboard/engineer");
            break;
          case "staff":
            router.push("/dashboard/staff");
            break;
          case "auditor":
            router.push("/dashboard/auditor");
            break;
          default:
            router.push("/dashboard");
        }
      } else {
        // 3) Auto sign in OFF → 로그인 페이지로
        router.push("/login");
      }

    } catch (err) {
      alert("❌ 회원가입 실패. 동일한 아이디 또는 이메일이 존재합니다.");
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Side */}
      <div className="w-1/2 bg-indigo-100 flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold text-indigo-700 mb-4">Create Account</h1>

        <div className="bg-white rounded-full shadow-md p-8">
          <img
            src="/logo.png"
            alt="Mascot"
            className="w-40 h-40 object-contain"
          />
        </div>
      </div>

      {/* Right Side */}
      <div className="w-1/2 flex flex-col justify-center items-center bg-white">
        <div className="w-80">
          <h2 className="text-3xl font-bold text-center mb-8 text-indigo-700">
            Register
          </h2>

          {/* Inputs */}
          <div className="flex flex-col gap-3">

            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />

            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          {/* Option */}
          <div className="flex items-center gap-2 mt-3 text-sm">
            <input
              type="checkbox"
              checked={autoSignIn}
              onChange={() => setAutoSignIn(!autoSignIn)}
            />
            <span className="text-gray-600">Auto sign in after registration</span>
          </div>

          {/* Register Button */}
          <button
            onClick={handleRegister}
            className="w-full mt-5 bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition"
          >
            Sign Up
          </button>

          {/* Already have account */}
          <p className="text-center mt-6 text-sm text-gray-500">
            Already have an account?{" "}
            <Link href="/login" className="text-indigo-600 hover:underline">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
