"use client";

import { useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
  const [autoSignIn, setAutoSignIn] = useState(true);

  return (
    <div className="flex min-h-screen">
      {/* Left Side - 이미지 / 로고 영역 */}
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

      {/* Right Side - 입력 폼 */}
      <div className="w-1/2 flex flex-col justify-center items-center bg-white">
        <div className="w-80">
          <h2 className="text-3xl font-bold text-center mb-8 text-indigo-700">
            Register
          </h2>

          {/* Input Fields */}
          <div className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="Username"
              className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />

            <input
              type="email"
              placeholder="Email"
              className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />

            <input
              type="password"
              placeholder="Password"
              className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />

            <input
              type="password"
              placeholder="Confirm Password"
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
          <button className="w-full mt-5 bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700">
            Sign Up
          </button>

          {/* Already have an account? */}
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
