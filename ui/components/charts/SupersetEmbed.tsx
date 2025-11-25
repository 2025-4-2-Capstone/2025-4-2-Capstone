"use client";

import { useEffect } from "react";
import { embedDashboard } from "@superset-ui/embedded-sdk";

interface Props {
  role: string;
}

const ROLE_DASHBOARDS: Record<string, string> = {
  admin: process.env.NEXT_PUBLIC_DASHBOARD_ADMIN!,
  auditor: process.env.NEXT_PUBLIC_DASHBOARD_AUDITOR!,
  engineer: process.env.NEXT_PUBLIC_DASHBOARD_ENGINEER!,
  manager: process.env.NEXT_PUBLIC_DASHBOARD_MANAGER!,
  user: process.env.NEXT_PUBLIC_DASHBOARD_USER!,
  staff: process.env.NEXT_PUBLIC_DASHBOARD_STAFF!,
};

export default function SupersetEmbed({ role }: Props) {
  useEffect(() => {
    const timer = setTimeout(async () => {
      const mountPoint = document.getElementById("superset-container");
      if (!mountPoint) return;

      const dashboardId = ROLE_DASHBOARDS[role] || ROLE_DASHBOARDS["user"];

      try {
        await embedDashboard({
          id: dashboardId,
          supersetDomain: process.env.NEXT_PUBLIC_SUPERSET_URL!,
          mountPoint,

          fetchGuestToken: async () => {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/embed/token`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                username: "admin",
                role: role,
              }),
            });

            const data = await res.json();
            if (!data.token) throw new Error("Guest Token Error");
            return data.token;
          },

          iframeSandboxExtras: ["allow-forms", "allow-same-origin", "allow-scripts"],

          dashboardUiConfig: {
            hideTitle: true,
            hideChartControls: false,
            filters: { expanded: true },
          },
        });

        // 🔥 Superset이 생성한 iframe 강제 스타일링
        const iframe = mountPoint.querySelector("iframe") as HTMLIFrameElement;
        if (iframe) {
          iframe.style.width = "100%";
          iframe.style.height = "1200px";  // 🔥 여기서 높이 조절
          iframe.style.minHeight = "1000px";
        }
      } catch (err) {
        console.error("❌ Superset Embed Error:", err);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [role]);

  return (
    <div
      id="superset-container"
      className="w-full"
      style={{
        height: "auto",
        minHeight: "1200px",
      }}
    />
  );
}
