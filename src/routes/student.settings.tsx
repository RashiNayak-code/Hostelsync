import { createFileRoute } from "@tanstack/react-router";
import { SettingsPage } from "@/components/hms/pages/misc";

export const Route = createFileRoute("/student/settings")({
  head: () => ({
    meta: [
      { title: "Settings — HMS Student" },
      { name: "description", content: "Notification preferences and account security for your panel." },
      { property: "og:title", content: "Settings — HMS Student" },
      { property: "og:description", content: "Notification preferences and account security for your panel." },
    ],
  }),
  component: () => <SettingsPage role="student" />,
});
