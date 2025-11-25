"use client";

import { useEffect } from "react";
import { embedDashboard } from "@superset-ui/embedded-sdk";

interface Props {
  role: string;
}

// .env.local 환경변수 기반으로 매핑
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
      if (!mountPoint) {
        console.error("❌ superset-container 찾기 실패");
        return;
      }

      // role에 맞는 Dashboard UUID 가져오기
      const dashboardId = ROLE_DASHBOARDS[role] || ROLE_DASHBOARDS["user"];

      try {
        await embedDashboard({
          id: dashboardId,
          supersetDomain: process.env.NEXT_PUBLIC_SUPERSET_URL!,
          mountPoint,

          fetchGuestToken: async () => {
            const res = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/embed/token`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  username: "admin",
                  role: role,
                }),
              }
            );

            const data = await res.json();
            if (!data.token) {
              console.error("❌ Guest Token 없음:", data);
              throw new Error("Superset Guest Token 에러");
            }

            return data.token;
          },

          iframeSandboxExtras: [
            "allow-forms",
            "allow-same-origin",
            "allow-scripts",
          ],

          dashboardUiConfig: {
            hideTitle: true,
            filters: { expanded: true },
          },
        });
      } catch (err) {
        console.error("❌ Superset 임베딩 실패:", err);
      }
    }, 80);

    return () => clearTimeout(timer);
  }, [role]);

  return (
    <div id="superset-container" style={{ width: "100%", height: "900px" }} />
  );
}
