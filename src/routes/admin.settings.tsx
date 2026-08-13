import { createFileRoute } from "@tanstack/react-router";
import { SettingsPage } from "@/components/hms/pages/misc";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({
    meta: [
      { title: "Settings — HMS Admin" },
      { name: "description", content: "Panel preferences, notifications and account security." },
      { property: "og:title", content: "Settings — HMS Admin" },
      { property: "og:description", content: "Panel preferences, notifications and account security." },
    ],
  }),
  component: () => <SettingsPage role="admin" />,
});
