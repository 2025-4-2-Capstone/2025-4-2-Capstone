"use client";

export default function BrandLogo() {
  return (
    <div
      className="animate-float"
      style={{
        filter: "drop-shadow(0 8px 18px rgba(0,0,0,0.18))",
      }}
    >
      <svg
        width="140"
        height="140"
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
      >
        <polygon
          points="100,20 180,180 20,180"
          fill="url(#grad1)"
        />

        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#9DB5FF" />
            <stop offset="100%" stopColor="#6C82F8" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
