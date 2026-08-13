import { createFileRoute } from "@tanstack/react-router";
import { FeesPage } from "@/components/hms/pages/records";

export const Route = createFileRoute("/student/fees")({
  head: () => ({
    meta: [
      { title: "My Fees — HMS Student" },
      { name: "description", content: "View hostel and mess invoices, payment history and pending dues." },
      { property: "og:title", content: "My Fees — HMS Student" },
      { property: "og:description", content: "View hostel and mess invoices, payment history and pending dues." },
    ],
  }),
  component: () => <FeesPage role="student" />,
});
