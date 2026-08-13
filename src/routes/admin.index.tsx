import { createFileRoute } from "@tanstack/react-router";
import { AdminDashboard } from "@/components/hms/pages/dashboards";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — HMS" },
      { name: "description", content: "Hostel-wide stats: students, rooms, complaints and fee collection." },
      { property: "og:title", content: "Admin Dashboard — HMS" },
      { property: "og:description", content: "Hostel-wide stats: students, rooms, complaints and fee collection." },
    ],
  }),
  component: () => <AdminDashboard />,
});
