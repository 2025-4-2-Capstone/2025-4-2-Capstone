"use client";

export default function BrandLogo() {
  return (
    <div
      className="animate-float"
      style={{
        width: "150px",
        height: "150px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        filter: "drop-shadow(0 4px 8px rgba(120, 90, 255, 0.22))",
      }}
    >
      <svg
        viewBox="0 0 200 200"
        style={{ width: "100%", height: "100%" }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* 선명하면서 파스텔 톤 */}
          <linearGradient id="pastelSolid" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#AEC7FF" />   {/* 파스텔 블루 */}
            <stop offset="100%" stopColor="#C8A0FF" /> {/* 파스텔 라벤더 */}
          </linearGradient>
        </defs>

        {/* 뒤 효과 완전 제거 — 삼각형만 선명하게 */}
        <polygon
          points="100,25 175,175 25,175"
          fill="url(#pastelSolid)"
          style={{
            stroke: "rgba(100, 80, 200, 0.15)",   // 아주 약한 테두리 → 더 선명하게 보임
            strokeWidth: "2",
          }}
        />
      </svg>
    </div>
  );
}
