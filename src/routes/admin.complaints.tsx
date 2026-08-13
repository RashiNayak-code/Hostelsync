import { createFileRoute } from "@tanstack/react-router";
import { ComplaintsPage } from "@/components/hms/pages/records";

export const Route = createFileRoute("/admin/complaints")({
  head: () => ({
    meta: [
      { title: "Complaints — HMS Admin" },
      { name: "description", content: "Review and resolve every complaint reported across the hostel." },
      { property: "og:title", content: "Complaints — HMS Admin" },
      { property: "og:description", content: "Review and resolve every complaint reported across the hostel." },
    ],
  }),
  component: () => <ComplaintsPage role="admin" />,
});
