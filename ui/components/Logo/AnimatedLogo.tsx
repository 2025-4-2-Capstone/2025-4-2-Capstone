"use client";

export default function AnimatedLogo() {
  return (
    <div className="relative flex items-center justify-center w-40 h-40">
      {/* Orbiting dot */}
      <div className="absolute w-3 h-3 bg-indigo-500 rounded-full animate-orbit"></div>

      {/* Logo text */}
      <h1
        className="
          text-3xl font-extrabold tracking-wide
          bg-gradient-to-r from-indigo-500 to-blue-400 
          text-transparent bg-clip-text
          animate-glow
        "
      >
        Operation Log
      </h1>
    </div>
  );
}
