import { createFileRoute } from "@tanstack/react-router";
import { SettingsPage } from "@/components/hms/pages/misc";

export const Route = createFileRoute("/warden/settings")({
  head: () => ({
    meta: [
      { title: "Settings — HMS Warden" },
      { name: "description", content: "Panel preferences, notifications and account security." },
      { property: "og:title", content: "Settings — HMS Warden" },
      { property: "og:description", content: "Panel preferences, notifications and account security." },
    ],
  }),
  component: () => <SettingsPage role="warden" />,
});
