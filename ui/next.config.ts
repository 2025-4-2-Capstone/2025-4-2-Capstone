import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)", 
        headers: [
          {
            key: "X-Frame-Options",
            value: "ALLOWALL", // iframe 차단 해제
          },
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors *", // 외부 도메인 iframe 허용
          },
        ],
      },
    ];
  },
};

export default nextConfig;
