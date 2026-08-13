import { createFileRoute } from "@tanstack/react-router";
import { WardenDashboard } from "@/components/hms/pages/dashboards";

export const Route = createFileRoute("/warden/")({
  head: () => ({
    meta: [
      { title: "Warden Dashboard — HMS" },
      { name: "description", content: "Daily oversight: active outpasses, pending complaints and attendance." },
      { property: "og:title", content: "Warden Dashboard — HMS" },
      { property: "og:description", content: "Daily oversight: active outpasses, pending complaints and attendance." },
    ],
  }),
  component: () => <WardenDashboard />,
});
