import { createFileRoute } from "@tanstack/react-router";
import { LeavePage } from "@/components/hms/pages/records";

export const Route = createFileRoute("/admin/leave")({
  head: () => ({
    meta: [
      { title: "Leave Requests — HMS Admin" },
      { name: "description", content: "Review and action multi-day student leave applications." },
      { property: "og:title", content: "Leave Requests — HMS Admin" },
      { property: "og:description", content: "Review and action multi-day student leave applications." },
    ],
  }),
  component: () => <LeavePage role="admin" />,
});
