// app/(auth)/login/page.tsx
"use client";

import { useState } from "react";
import { FaGoogle, FaGithub } from "react-icons/fa";
import BrandLogo from "@/components/Logo/logo";

export default function LoginPage() {
  const [autoSignIn, setAutoSignIn] = useState(true);

  return (
    <div className="flex min-h-screen page-fadein">

      {/* Left Side */}
      <div className="w-1/2 bg-indigo-100 flex flex-col items-center justify-center">

        {/* Brand Logo */}
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
              className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <input
              type="password"
              placeholder="Password"
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

          {/* Sign In Button */}
          <button className="w-full mt-5 bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700">
            Sign In
          </button>

          {/* Social Login */}
          <div className="flex justify-center mt-5 gap-6 text-gray-600">
            <FaGoogle className="cursor-pointer hover:text-indigo-600" size={22} />
            <FaGithub className="cursor-pointer hover:text-indigo-600" size={22} />
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
