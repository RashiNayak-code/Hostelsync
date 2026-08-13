import { createFileRoute } from "@tanstack/react-router";
import { ReportsPage } from "@/components/hms/pages/misc";

export const Route = createFileRoute("/admin/reports")({
  head: () => ({
    meta: [
      { title: "Reports — HMS Admin" },
      { name: "description", content: "Collection, attendance and complaint analytics with exports." },
      { property: "og:title", content: "Reports — HMS Admin" },
      { property: "og:description", content: "Collection, attendance and complaint analytics with exports." },
    ],
  }),
  component: () => <ReportsPage role="admin" />,
});
