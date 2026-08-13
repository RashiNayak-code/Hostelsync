import { createFileRoute } from "@tanstack/react-router";
import { ReportsPage } from "@/components/hms/pages/misc";

export const Route = createFileRoute("/warden/reports")({
  head: () => ({
    meta: [
      { title: "Reports — HMS Warden" },
      { name: "description", content: "Attendance and complaint analytics for your blocks." },
      { property: "og:title", content: "Reports — HMS Warden" },
      { property: "og:description", content: "Attendance and complaint analytics for your blocks." },
    ],
  }),
  component: () => <ReportsPage role="warden" />,
});
