import { createFileRoute } from "@tanstack/react-router";
import { LeavePage } from "@/components/hms/pages/records";

export const Route = createFileRoute("/student/leave")({
  head: () => ({
    meta: [
      { title: "Leave Applications — HMS Student" },
      { name: "description", content: "Apply for multi-day hostel leave and track approvals." },
      { property: "og:title", content: "Leave Applications — HMS Student" },
      { property: "og:description", content: "Apply for multi-day hostel leave and track approvals." },
    ],
  }),
  component: () => <LeavePage role="student" />,
});
