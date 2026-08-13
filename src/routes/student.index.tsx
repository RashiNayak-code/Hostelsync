import { createFileRoute } from "@tanstack/react-router";
import { StudentDashboard } from "@/components/hms/pages/dashboards";

export const Route = createFileRoute("/student/")({
  head: () => ({
    meta: [
      { title: "Student Dashboard — HMS" },
      { name: "description", content: "Your hostel overview: dues, room, attendance and open requests." },
      { property: "og:title", content: "Student Dashboard — HMS" },
      { property: "og:description", content: "Your hostel overview: dues, room, attendance and open requests." },
    ],
  }),
  component: () => <StudentDashboard />,
});
