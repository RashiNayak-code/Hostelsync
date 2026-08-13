import { createFileRoute } from "@tanstack/react-router";
import { ComplaintsPage } from "@/components/hms/pages/records";

export const Route = createFileRoute("/student/complaints")({
  head: () => ({
    meta: [
      { title: "My Complaints — HMS Student" },
      { name: "description", content: "Raise hostel maintenance complaints and track resolution status." },
      { property: "og:title", content: "My Complaints — HMS Student" },
      { property: "og:description", content: "Raise hostel maintenance complaints and track resolution status." },
    ],
  }),
  component: () => <ComplaintsPage role="student" />,
});
