"use client";

import { useUserStore } from "@/stores/userStore";

import AdminContent from "./roles/admin-content";
import EngineerContent from "./roles/engineer-content";
import SupportContent from "./roles/support-content";
import UserContent from "./roles/user-content";

export default function DashboardPage() {
  const { user } = useUserStore();

  if (!user) return <div>Loading...</div>;

  switch (user.role) {
    case "admin":
      return <AdminContent />;
    case "engineer":
      return <EngineerContent />;
    case "support":
      return <SupportContent />;
    default:
      return <UserContent />;
  }
}
