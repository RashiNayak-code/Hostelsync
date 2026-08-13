import { createFileRoute } from "@tanstack/react-router";
import { LeavePage } from "@/components/hms/pages/records";

export const Route = createFileRoute("/warden/leave")({
  head: () => ({
    meta: [
      { title: "Leave Requests — HMS Warden" },
      { name: "description", content: "Review multi-day student leave applications." },
      { property: "og:title", content: "Leave Requests — HMS Warden" },
      { property: "og:description", content: "Review multi-day student leave applications." },
    ],
  }),
  component: () => <LeavePage role="warden" />,
});
