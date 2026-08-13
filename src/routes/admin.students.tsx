import { createFileRoute } from "@tanstack/react-router";
import { StudentsPage } from "@/components/hms/pages/records";

export const Route = createFileRoute("/admin/students")({
  head: () => ({
    meta: [
      { title: "Students — HMS Admin" },
      { name: "description", content: "Manage the full resident directory with search and records." },
      { property: "og:title", content: "Students — HMS Admin" },
      { property: "og:description", content: "Manage the full resident directory with search and records." },
    ],
  }),
  component: () => <StudentsPage role="admin" />,
});
